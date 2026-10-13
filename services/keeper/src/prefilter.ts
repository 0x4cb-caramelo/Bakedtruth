/**
 * Purpose: which open campaigns are worth a `resolve_campaign` simulation this cycle, from the batched read and the
 *          SDK's mirror of the join lock (`outcomeKnowable`), so a cycle over many campaigns simulates only those the
 *          program may resolve. Past the deadline every campaign is simulated (a NO or a void can be recorded). Before
 *          it, a campaign is skipped only when the mirror reads its metric account and says the outcome is not yet
 *          knowable; an account the mirror cannot read is simulated, and the program decides.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: batched reads)
 *
 * Why a skip loses nothing: before the deadline only a YES can be recorded. For a price campaign the YES rule (the
 * whole confidence band across the target, `band_crosses_target`) is stricter than the lock's (the band reaching it,
 * `band_reaches_target`), and the keeper offers the same sponsored account the mirror read; the other kinds' YES is
 * the lock's own condition (supply at the target, locked liquidity at it, a completed curve, the measured epoch).
 */
import { outcomeKnowable, type Campaign, type ChainTime, type FetchedAccount } from "@brot/sdk/read";

export type Verdict = { simulate: boolean; why: string };

export function worthSimulating(campaign: Campaign, metric: FetchedAccount | null, chain: ChainTime): Verdict {
  if (chain.unixTimestamp >= campaign.deadlineAt) return { simulate: true, why: "past the deadline" };
  if (!metric) return { simulate: true, why: "metric account missing: the program decides" };
  try {
    return outcomeKnowable(campaign, metric, chain)
      ? { simulate: true, why: "the outcome is knowable" }
      : { simulate: false, why: "not knowable yet" };
  } catch (error) {
    return { simulate: true, why: `unread by the mirror (${error instanceof Error ? error.message : error})` };
  }
}
