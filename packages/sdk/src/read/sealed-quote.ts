/**
 * Purpose: what a sealed entry costs (Sprint 15, founder answer of 2026-10-13). Mirrors
 *          programs/brot-markets/src/instructions/entries/sealed_charge.rs: row 7's charge (`chargeOpening`,
 *          ./quote.ts) for a wallet that is not a team key, so a US$ of zero is refused too, at least the config's
 *          `opening_fee_usd` and at most the signed `maxLamports`, split by `opening_prize_bps`: the entry part joins
 *          the pot, the fee part is held in the sponsor's `SealedFee`.
 * Version: 0.1.0
 * Sprint:  15 (lane L15)
 *
 * The opening's two refusals get the sealed entry's codes (`OpeningUsdBelowFee` → `SealedEntryBelowFloor`,
 * `OpeningAboveMaxLamports` → `SealedEntryAboveMaxLamports`); a refusal of the SOL/USD account keeps its row 7 code.
 */
import { isRefusal, refuse, type BrotErrorName } from "./errors";
import {
  chargeOpening,
  openingQuote,
  type ChainClock,
  type FetchedAccount,
  type OpeningParams,
  type Payment,
} from "./quote";

const RENAMED: Partial<Record<BrotErrorName, BrotErrorName>> = {
  OpeningUsdBelowFee: "SealedEntryBelowFloor",
  OpeningAboveMaxLamports: "SealedEntryAboveMaxLamports",
};

/** Runs row 7's `charge`, with the opening's two refusals renamed as the sealed entry names them. */
function sealed<T>(charge: () => T): T {
  try {
    return charge();
  } catch (error) {
    const renamed = isRefusal(error) ? RENAMED[error.errorName] : undefined;
    if (renamed) refuse(renamed);
    throw error;
  }
}

/** A sealed entry's charge: `paid` (at most `maxLamports`), of which `entry` joins the pot and `fee` is held. */
export type SealedCharge = Payment & { entry: bigint };

/** What the program charges a sealed entry of `entryUsd`, or its refusal, in its order (`sealed_charge`). */
export function chargeSealedEntry(a: {
  params: OpeningParams;
  entryUsd: bigint;
  maxLamports: bigint;
  solUsd: FetchedAccount;
  clock: ChainClock;
}): SealedCharge {
  const payment = sealed(() =>
    chargeOpening({
      params: a.params,
      isTeam: false,
      openingUsd: a.entryUsd,
      maxLamports: a.maxLamports,
      solUsd: a.solUsd,
      clock: a.clock,
    }),
  );
  return { ...payment, entry: payment.prize };
}

/** The preview of a sealed entry: the charge now, its split, and the `maxLamports` to sign, `marginBps` above it. */
export type SealedEntryQuote = SealedCharge & { entryUsd: bigint; maxLamports: bigint; marginBps: number };

/**
 * The quote a sponsor previews: the charge at the current SOL/USD account and `maxLamports` that charge plus
 * `marginBps` (100 by default, 1%), rounded up, as an opening's quote (`openingQuote`), so the price may move that
 * much before the program refuses with `SealedEntryAboveMaxLamports` instead of charging more.
 */
export function sealedEntryQuote(a: {
  params: OpeningParams;
  entryUsd: bigint;
  solUsd: FetchedAccount;
  clock: ChainClock;
  marginBps?: number;
}): SealedEntryQuote {
  const quote = sealed(() =>
    openingQuote({
      params: a.params,
      openingUsd: a.entryUsd,
      solUsd: a.solUsd,
      clock: a.clock,
      marginBps: a.marginBps,
    }),
  );
  const { openingUsd, ...charge } = quote;
  return { ...charge, entry: quote.prize, entryUsd: openingUsd };
}
