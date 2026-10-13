/**
 * Purpose: what the summary says for a sealed entry (`sponsor_join_campaign`, Sprint 15), from its own bytes: the
 *          campaign, the side, the sponsor, the creation rules' version it binds, the US$ and the most it can take
 *          from the sponsor's wallet, the SOL price below which that bound refuses it, Brot's fee share in numbers
 *          (exact when the screen read the config of that version, its ceiling otherwise) and where each part goes,
 *          the guards it signs (the return estimate, in bps of the entry part; the entry total) and the rents. Kept
 *          apart from summary-brot.ts, which it would push past 200 lines.
 * Version: 0.1.1 (red team L2 and L3: the version, the fee's share, what the estimate measures)
 * Sprint:  15 (lane L15)
 */
import { LIMITS, Side } from "../read/constants";
import { formatBps, formatSol, formatUsdCents } from "../read/format";

/** The config's terms as the screen read them (`SummaryContext.terms`): their version and the opening's split. */
export type SealedTerms = { version: number; openingPrizeBps: number };

/** Brot's share of what a sealed entry pays: exact for the version read, else the most the config can set. */
function feeShare(version: number, terms: SealedTerms | undefined): string {
  if (terms && terms.version === version) return `${formatBps(10_000 - terms.openingPrizeBps)} of it is Brot's fee`;
  return `at most ${formatBps(10_000 - LIMITS.minOpeningPrizeBps)} of it is Brot's fee`;
}

/**
 * The sealed entry in words; `about` is the campaign as the screen read it (summary-brot.ts), or nothing. The most it
 * takes from the sponsor is `max_lamports`, entry and fee together; the rents are apart and come back at settlement.
 */
export function describeSealedEntry(
  d: Record<string, any>,
  a: Record<string, { address: string }>,
  about: string,
  terms?: SealedTerms,
): { text: string; lamports: bigint } {
  const usd: bigint = d.entryUsd;
  const most: bigint = d.maxLamports;
  const version: number = d.expectedParamsVersion;
  const price =
    most === 0n
      ? ""
      : ` (refused if Pyth's SOL/USD price less its confidence is below ${formatUsdCents((usd * 100_000_000_000n) / most)} when it lands)`;
  const rents =
    d.expectedEntryTotal === 0n
      ? "the rents of the entry, of the join's record and of the sponsor's SealedFee"
      : "the rent of the join's record, and of the sponsor's SealedFee on its first sealed entry here";
  return {
    text: `Sealed entry in campaign ${a.campaign.address}${about} on ${Side[d.side].toUpperCase()} from ${a.sponsor.address} under creation rules version ${version}: US$${usd}, at most ${formatSol(most)} SOL in all${price}; ${feeShare(version, terms)}, held in the sponsor's SealedFee until the outcome and back to the sponsor only on a void the house caused; the rest is the entry, which joins the pot; refused if the return estimate, in bps of the entry part (not of what is paid), is below ${formatBps(d.minReturnBps)}, or if the entry total is not ${formatSol(d.expectedEntryTotal)} SOL; plus ${rents} (returned to the sponsor when the campaign settles)`,
    lamports: most,
  };
}
