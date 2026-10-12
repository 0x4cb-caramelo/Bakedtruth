/**
 * Purpose: the opening quote the creation box shows (TP §3.4.16; proposal §2.4.5; T25): the SDK's mirror of
 *          programs/brot-markets/src/math/opening.rs at Pyth's SOL/USD price minus its confidence band, read from the
 *          same sponsored account the program reads, `opening_paid_lamports = ceil(opening_usd × 10^(9 − e) ÷ p)`, the
 *          prize `floor(paid × 9,000 ÷ 10,000)` and the opening fee the rest; `max_lamports` the quote plus 1% (the
 *          margin of the approved Sprint -1 design, recorded in Sprint 19); the US$ split of the opening's own terms;
 *          and the whole debit, with the two rents and the network fee on top. A team key's opening is free.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import {
  formatSol,
  formatUsdCents,
  isRefusal,
  openingDebit,
  openingQuote,
  type BrotErrorName,
  type ChainTime,
  type FetchedAccount,
  type GlobalConfig,
  type OpeningDebit,
  type OpeningQuote,
} from "@brot/sdk/read";

/** `max_lamports` is the quote plus this much (T25): 1%, the approved design's "quote + 1%". */
export const MARGIN_BPS = 100;
/** One signature's base fee; the box sets no priority fee. */
export const NETWORK_FEE = 5_000n;

export type QuoteResult = { ok: true; quote: OpeningQuote } | { ok: false; refusal: BrotErrorName };

/** The quote at the SOL/USD account as read, or the program's refusal of it (row 7: a stale or wide price, say). */
export function quoteNow(a: {
  config: GlobalConfig;
  openingUsd: bigint;
  solUsd: FetchedAccount | null;
  clock: ChainTime;
}): QuoteResult {
  if (!a.solUsd) return { ok: false, refusal: "SolUsdAccountMismatch" };
  try {
    const quote = openingQuote({
      params: { ...a.config.params, openingFeeUsd: BigInt(a.config.params.openingFeeUsd) },
      openingUsd: a.openingUsd,
      solUsd: a.solUsd,
      clock: a.clock,
      marginBps: MARGIN_BPS,
    });
    return { ok: true, quote };
  } catch (error) {
    if (isRefusal(error)) return { ok: false, refusal: error.errorName };
    throw error;
  }
}

/** The opening's US$ terms, split 90/10 in cents (display: the program converts at the Pyth price, in lamports). */
export function usdSplit(openingUsd: bigint, prizeBps: number) {
  const cents = openingUsd * 100n;
  const prize = (cents * BigInt(prizeBps)) / 10_000n;
  return { total: formatUsdCents(cents), prize: formatUsdCents(prize), fee: formatUsdCents(cents - prize) };
}

/** Pyth's price as a plain number of US$ with two decimals, from its raw value and exponent (display only). */
export function usdText(price: bigint, exponent: number): string {
  if (exponent > 0) return formatUsdCents(price * 10n ** BigInt(exponent) * 100n);
  const scale = 10n ** BigInt(-exponent);
  return formatUsdCents((price * 100n) / scale);
}

/** What leaves the wallet now and at most: the payment (zero for a team key), the rents and the network fee. */
export function debitOf(a: { quote: OpeningQuote | null; rents: { campaign: bigint; vault: bigint } }): OpeningDebit {
  return openingDebit({
    payment: a.quote?.paid ?? 0n,
    maxPayment: a.quote?.maxLamports ?? 0n,
    campaignRent: a.rents.campaign,
    vaultRent: a.rents.vault,
    networkFee: NETWORK_FEE,
  });
}

/** Lamports as SOL, all nine decimals with the trailing zeros dropped: "4.575821360" → "4.57582136". */
export const exactSol = (lamports: bigint) => formatSol(lamports).replace(/\.?0+$/, "");
