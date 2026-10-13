/**
 * Purpose: the phase-directed draw of the randomized test (Sprint 04, X0.1). A uniform draw over the kinds
 *          mostly names an operation the campaign's phase refuses, so the run never reaches settlement or
 *          close. This draw names the operation that moves a campaign on, most of the time.
 * Version: 0.0.2
 * Sprint:  04 (closure review); 15 (a stale feed's void and the team's void reasons, so a held sponsor fee meets
 *          each cause; every held fee settled before the close, which waits for them; lane INV15)
 */
import { type Harness, type Rng, clock } from "./invariant-harness";
import { PROOF_DELAY, shareDue } from "./invariant-model";
import { liveSealed, type SealedSettleOp } from "./invariant-sealed-model";
import { drawSealedSettle } from "./invariant-sealed-settle";
import type { AdvanceOp, SettleOp } from "./invariant-settle";

/** The next operation that moves campaign `index` along its lifecycle, or `null` when its phase has none. */
export function drawPhaseOp(h: Harness, r: Rng, index: number): SettleOp | AdvanceOp | null {
  const c = h.camps[index];
  const t = clock(h);
  const bakers = [...new Set(c.joins.map((j) => j.baker))];
  const unsettled = bakers.filter((b) => !c.settled.has(b));
  // An honest settlement of a live held fee (the random draws put a thief in the sponsor's slot).
  const sealedSettle = (): SealedSettleOp => ({ ...drawSealedSettle(h, r, index), thief: null });
  switch (c.phase) {
    case "Open":
      // Fewer early YES proofs than before Sprint 15, so more campaigns end NO or void: about a third of the expired
      // ones find their feed stale, a void by an outside cause that a team key may record as the house's failure.
      if (t < c.deadline && r.next() < 0.3) return { k: "resolveYes", c: index, back: r.big(0n, 50n) };
      if (t > c.deadline + PROOF_DELAY) return { k: r.next() < 0.35 ? "resolveStale" : "resolveNo", c: index };
      return null;
    case "InReview":
      if (t >= c.reviewEndsAt) return { k: "finalize", c: index };
      // A team key acts on most automatic voids, the house's failure more often than not; on a YES or NO it is refused.
      if (r.next() < (c.outcome === "Void" ? 0.8 : 0.15))
        return { k: "void", c: index, member: r.int(0, h.team.length - 1), reason: r.pick([1, 4, 4, 3, 5]) };
      return r.next() < 0.5 ? { k: "advance", seconds: c.reviewEndsAt - t + 1n } : null;
    case "Settling":
      if (unsettled.length > 0 && r.next() < 0.8) {
        const who = r.pick(unsettled);
        return { k: "settle", c: index, baker: h.bakers.findIndex((b) => b.address === who) };
      }
      if (liveSealed(c).length > 0 && r.next() < 0.5) return sealedSettle();
      return r.next() < 0.5 ? { k: "prize", c: index } : null;
    case "Settled":
      if (!c.feeMoved) return { k: "collect", c: index };
      if (!c.prizeSettled) return { k: "prize", c: index };
      if (shareDue(c) > 0n && !c.shareSettled) return { k: "share", c: index };
      // Close waits for every held fee (`SealedFeesOpen`): most draws settle one first, some try the close anyway.
      if (liveSealed(c).length > 0 && r.next() < 0.7) return sealedSettle();
      return { k: "close", c: index };
    default:
      return null;
  }
}
