/**
 * Purpose: what the summary says for a sealed entry (`sponsor_join_campaign`, Sprint 15), from its own bytes: the
 *          campaign, the side, the sponsor, the US$ and the most it can take from the sponsor's wallet, the SOL price
 *          below which that bound refuses it, where the entry part and the fee part go, the guards it signs (the
 *          return estimate, the entry total) and the rents. Kept apart from summary-brot.ts, which it would push past
 *          200 lines.
 * Version: 0.1.0
 * Sprint:  15 (lane L15)
 */
import { Side } from "../read/constants";
import { formatBps, formatSol, formatUsdCents } from "../read/format";

/**
 * The sealed entry in words; `about` is the campaign as the screen read it (summary-brot.ts), or nothing. The most it
 * takes from the sponsor is `max_lamports`, entry and fee together; the rents are apart and come back at settlement.
 */
export function describeSealedEntry(
  d: Record<string, any>,
  a: Record<string, { address: string }>,
  about: string,
): { text: string; lamports: bigint } {
  const usd: bigint = d.entryUsd;
  const most: bigint = d.maxLamports;
  const price =
    most === 0n
      ? ""
      : ` (refused if Pyth's SOL/USD price less its confidence is below ${formatUsdCents((usd * 100_000_000_000n) / most)} when it lands)`;
  const rents =
    d.expectedEntryTotal === 0n
      ? "the rents of the entry, of the join's record and of the sponsor's SealedFee"
      : "the rent of the join's record, and of the sponsor's SealedFee on its first sealed entry here";
  return {
    text: `Sealed entry in campaign ${a.campaign.address}${about} on ${Side[d.side].toUpperCase()} from ${a.sponsor.address}: US$${usd}, at most ${formatSol(most)} SOL in all${price}; the entry part joins the pot, and Brot's fee part (the opening's split) waits in the sponsor's SealedFee until the outcome, back to the sponsor only on a void the house caused; refused if the return estimate is below ${formatBps(d.minReturnBps)} or the entry total is not ${formatSol(d.expectedEntryTotal)} SOL; plus ${rents} (returned to the sponsor when the campaign settles)`,
    lamports: most,
  };
}
