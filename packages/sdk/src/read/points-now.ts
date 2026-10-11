/**
 * Purpose: what a live campaign account says now for the points rule (`CampaignNow`, points.ts): its result is final
 *          once no key can change it and nothing is left to count, and its pot splits or is refunded as one-sided.
 *          Written for the read API's leaderboard in Sprint 13 and moved here in Sprint 08, so the read API and the
 *          indexer judge a live account the same way and their points agree.
 * Version: 0.1.0 (Sprint 08: moved from services/api/src/leaderboard.ts unchanged)
 * Sprint:  08 (indexer, API, relay and points); 13 (the rule)
 */
import type { Campaign } from "./accounts";
import { Outcome, ReaderKind, SettleMode } from "./constants";
import { snapshotOf, storedVerdict } from "./math";
import type { CampaignNow } from "./points";
import type { PublicView } from "./view";

/**
 * A live account's result is final once no key can change it and nothing is left to count: settling or settled, or
 * its window ended without a contest. A YES on a price campaign waits for settling: its late joins (at or after the
 * YES proof) are known only once every baker is tallied, which finalize requires, and on devnet nobody tallies until
 * someone settles. Whether the pot splits is the mode finalize stored, or the one it would store: entries close at
 * resolution, so a final result's totals are final too.
 */
export function campaignNow(c: Campaign, v: PublicView): CampaignNow {
  const outcome = c.outcome as Outcome;
  const lateJoinsPossible = c.kind === ReaderKind.PriceTouch && outcome === Outcome.Yes;
  const windowFinal = v.state === "InReview" && v.windowEnded && !v.contested && !lateJoinsPossible;
  const final = v.state === "Paid" || v.state === "Void" || windowFinal;
  const mode = final ? settleModeOf(c) : SettleMode.Unset;
  return {
    outcome,
    final: final && mode !== SettleMode.Unset,
    oneSided: mode === SettleMode.OneSided,
    creator: c.creator,
    kind: c.kind,
  };
}

/** The mode finalize stored, or the one it would store now, through the SDK's mirror of its math. */
function settleModeOf(c: Campaign): SettleMode {
  if (c.settleMode !== SettleMode.Unset) return c.settleMode;
  const verdict = storedVerdict(c);
  try {
    return verdict ? snapshotOf(c, verdict).mode : SettleMode.Unset;
  } catch {
    return SettleMode.Unset; // finalize would refuse these totals too: not final, so nothing scores yet
  }
}
