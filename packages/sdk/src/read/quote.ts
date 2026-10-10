/**
 * Purpose: what an opening pays (row 7 of TP 3.4.10): US$ at the sponsored Pyth SOL/USD price charged
 *          at `price − conf`, the 90/10 split, the `max_lamports` the creator signs (T25), and the
 *          preview of the whole debit, where the two rents and the network fee come on top of what
 *          moves into the vault. Mirrors programs/brot-markets/src/instructions/campaigns/open_campaign/
 *          payment.rs.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * `chargeOpening` returns what the program would charge, or throws its refusal, in its order.
 * `openingQuote` is the preview: the same charge with `max_lamports` set a margin above it, so a price
 * that moves between preview and signature cannot charge more than the creator saw plus the margin.
 */
import { refuse, isRefusal, type BrotErrorName } from "./errors";
import { SOL_USD_ACCOUNT, SOL_USD_FEED_HEX } from "./constants";
import { I64_MAX, I64_MIN, toU64 } from "./math/integers";
import { openingPaidLamports, splitOpening } from "./math/opening";
import { checkFreshAndTight, postedWithin, type PriceRefusal } from "./chain/price-rules";
import { readPriceUpdate, SOL_USD_READ_ERRORS, type PriceReading } from "./chain/price-update";

/** An account as fetched: its address, owner and bytes. */
export type FetchedAccount = { readonly address: string; readonly owner: string; readonly data: Uint8Array };
/** The cluster's clock: Unix time and slot, from the Clock sysvar, never the device (A-7). */
export type ChainClock = { readonly unixTimestamp: bigint; readonly slot: bigint; readonly epoch?: bigint };
/** The creation parameters an opening reads (`GlobalConfig.params`). */
export type OpeningParams = {
  readonly openingFeeUsd: bigint;
  readonly openingPrizeBps: number;
  readonly maxPriceAge: number;
  readonly maxPriceConfBps: number;
};

/** What an opening moves into the vault and the price it was charged at (`Payment`); zero for a free one. */
export type Payment = {
  paid: bigint;
  prize: bigint;
  fee: bigint;
  price: bigint;
  exponent: number;
  publishTime: bigint;
};

const FREE: Payment = { paid: 0n, prize: 0n, fee: 0n, price: 0n, exponent: 0, publishTime: 0n };
const ROW7_FRESHNESS: Record<PriceRefusal, BrotErrorName> = {
  Stale: "SolUsdStale",
  NonPositive: "SolUsdPriceNonPositive",
  ConfidenceTooWide: "SolUsdConfidenceTooWide",
};

/** The price a paid opening is charged at, the low end of the band (`charged_price`). */
export function chargedPrice(reading: PriceReading): bigint {
  if (reading.conf > I64_MAX) refuse("MathOverflow");
  const low = reading.price - reading.conf;
  if (low < I64_MIN) refuse("MathOverflow");
  if (low <= 0n) refuse("SolUsdPriceNonPositive");
  return low;
}

/** The SOL/USD account read and checked with row 7's own errors, the slot bound included. */
export function readSolUsd(account: FetchedAccount, clock: ChainClock, params: OpeningParams): PriceReading {
  if (account.address !== SOL_USD_ACCOUNT) refuse("SolUsdAccountMismatch");
  let reading: PriceReading;
  try {
    reading = readPriceUpdate(account.owner, account.data, SOL_USD_FEED_HEX);
  } catch (error) {
    const renamed = isRefusal(error) ? SOL_USD_READ_ERRORS[error.errorName] : undefined;
    if (renamed) refuse(renamed);
    throw error;
  }
  const refusal = checkFreshAndTight(reading, clock.unixTimestamp, params.maxPriceAge, params.maxPriceConfBps);
  if (refusal) refuse(ROW7_FRESHNESS[refusal]);
  if (!postedWithin(reading, clock.slot, params.maxPriceAge)) refuse("SolUsdStale");
  return reading;
}

/**
 * Row 7 (`payment::charge`): nothing for a team key passing 0; otherwise at least `opening_fee_usd`
 * (`OpeningUsdBelowFee`), priced at the sponsored SOL/USD account, at most `maxLamports`
 * (`OpeningAboveMaxLamports`), split 90/10.
 */
export function chargeOpening(a: {
  params: OpeningParams;
  isTeam: boolean;
  openingUsd: bigint;
  maxLamports: bigint;
  solUsd: FetchedAccount;
  clock: ChainClock;
}): Payment {
  if (a.openingUsd === 0n) return a.isTeam ? FREE : refuse("OpeningUsdBelowFee");
  if (a.openingUsd < a.params.openingFeeUsd) refuse("OpeningUsdBelowFee");
  const reading = readSolUsd(a.solUsd, a.clock, a.params);
  const price = chargedPrice(reading);
  const paid = openingPaidLamports(a.openingUsd, price, reading.exponent);
  if (paid > a.maxLamports) refuse("OpeningAboveMaxLamports");
  const split = splitOpening(paid, a.params.openingPrizeBps);
  return { ...split, price, exponent: reading.exponent, publishTime: reading.publishTime };
}

/** The preview of a paid opening: the charge now, and the `max_lamports` to sign. */
export type OpeningQuote = Payment & { openingUsd: bigint; maxLamports: bigint; marginBps: number };

/**
 * The quote a creator previews: the charge at the current SOL/USD account, and `maxLamports` that
 * charge plus `marginBps` (100 by default, 1%), rounded up, so the price may move that much before the
 * program refuses with `OpeningAboveMaxLamports` instead of charging more.
 */
export function openingQuote(a: {
  params: OpeningParams;
  openingUsd: bigint;
  solUsd: FetchedAccount;
  clock: ChainClock;
  marginBps?: number;
}): OpeningQuote {
  const marginBps = a.marginBps ?? 100;
  if (!Number.isInteger(marginBps) || marginBps < 0 || marginBps > 10_000) throw new RangeError("marginBps");
  const payment = chargeOpening({ ...a, isTeam: false, maxLamports: (1n << 64n) - 1n });
  const maxLamports = toU64(payment.paid + (payment.paid * BigInt(marginBps) + 9_999n) / 10_000n);
  return { ...payment, openingUsd: a.openingUsd, maxLamports, marginBps };
}

/** The whole debit of an opening, as the creator's wallet will see it (Sprint 02 review). */
export type OpeningDebit = {
  /** What moves into the vault now, and the most it may be (`max_lamports`). */
  payment: bigint;
  maxPayment: bigint;
  /** The rents of the `Campaign` and its vault, returned to the creator at close. */
  campaignRent: bigint;
  vaultRent: bigint;
  networkFee: bigint;
  /** Everything that leaves the wallet now, and at most. */
  total: bigint;
  maxTotal: bigint;
};

/** The debit preview: `max_lamports` covers only the payment; rents and the network fee come on top. */
export function openingDebit(a: {
  payment: bigint;
  maxPayment: bigint;
  campaignRent: bigint;
  vaultRent: bigint;
  networkFee: bigint;
}): OpeningDebit {
  const extra = a.campaignRent + a.vaultRent + a.networkFee;
  return { ...a, total: a.payment + extra, maxTotal: a.maxPayment + extra };
}
