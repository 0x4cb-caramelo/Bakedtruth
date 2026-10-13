/**
 * Purpose: the phase-directed draw of the randomized test (Sprint 04, X0.1). A uniform draw over the kinds
 *          mostly names an operation the campaign's phase refuses, so the run never reaches settlement or
 *          close. This draw names the operation that moves a campaign on, most of the time.
 * Version: 0.0.1
 * Sprint:  04 (closure review)
 */
import { type Harness, type Rng, clock } from "./invariant-harness";
import { PROOF_DELAY, shareDue } from "./invariant-model";
import type { AdvanceOp, SettleOp } from "./invariant-settle";

/** The next operation that moves campaign `index` along its lifecycle, or `null` when its phase has none. */
export function drawPhaseOp(h: Harness, r: Rng, index: number): SettleOp | AdvanceOp | null {
  const c = h.camps[index];
  const t = clock(h);
  const bakers = [...new Set(c.joins.map((j) => j.baker))];
  const unsettled = bakers.filter((b) => !c.settled.has(b));
  switch (c.phase) {
    case "Open":
      if (t < c.deadline && r.next() < 0.5) return { k: "resolveYes", c: index, back: r.big(0n, 50n) };
      if (t > c.deadline + PROOF_DELAY) return { k: "resolveNo", c: index };
      return null;
    case "InReview":
      if (t >= c.reviewEndsAt) return { k: "finalize", c: index };
      if (r.next() < 0.3) return { k: "void", c: index, member: r.int(0, h.team.length - 1), reason: r.pick([4, 5]) };
      return r.next() < 0.5 ? { k: "advance", seconds: c.reviewEndsAt - t + 1n } : null;
    case "Settling":
      if (unsettled.length > 0 && r.next() < 0.8) {
        const who = r.pick(unsettled);
        return { k: "settle", c: index, baker: h.bakers.findIndex((b) => b.address === who) };
      }
      return r.next() < 0.5 ? { k: "prize", c: index } : null;
    case "Settled":
      if (!c.feeMoved) return { k: "collect", c: index };
      if (!c.prizeSettled) return { k: "prize", c: index };
      if (shareDue(c) > 0n && !c.shareSettled) return { k: "share", c: index };
      return { k: "close", c: index };
    default:
      return null;
  }
}
