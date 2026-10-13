/**
 * Purpose: the randomized test's operations: the dispatch of every operation to its planner and the draw of the
 *          next one. Openings and joins are in invariant-open.ts, the money moved by hand and by the wallets in
 *          invariant-wallets.ts, the lifecycle in invariant-settle.ts and the files it dispatches to, the referral links
 *          in invariant-referral.ts, the sealed entry and its held fee in invariant-sealed*.ts; invariant-run.ts runs one.
 * Version: 0.1.1 (Sprint 14: the referral links; the run moved to invariant-run.ts, the lifecycle draw to -phase.ts;
 *          Sprint 15: the sealed entry, SOL sent by hand to a SealedFee, a held fee settled at any phase)
 * Sprint:  04 (contract freeze, lane E); 14 (lane INV14); 15 (lane INV15, with Sprint 14 in one branch)
 */
import { type Harness, type Plan, type Rng, clock } from "./invariant-harness";
import { planJoin, planOpenPaid, planOpenTeam, planPause, type JoinOp } from "./invariant-open";
import { drawPhaseOp, drawSettleOp } from "./invariant-phase";
import { drawLinkOp, planLink, type LinkOp } from "./invariant-referral";
import { drawHandSealed, drawSealed, planHandSealed, planSealed } from "./invariant-sealed";
import { liveSealed, type HandSealedOp, type SealedOp } from "./invariant-sealed-model";
import { drawSealedSettle } from "./invariant-sealed-settle";
import { planSettle, type SettleOp } from "./invariant-settle";
import { planDrain, planFund, planHand, planSweep } from "./invariant-wallets";
import * as P from "./program";
import { balance, setTime } from "./setup";

export type BaseOp =
  | { k: "openPaid"; creator: number; days: number }
  | { k: "openTeam"; member: number }
  | JoinOp
  | SealedOp
  | { k: "pause" }
  | { k: "resume" }
  | { k: "hand"; c: number; to: "vault" | "campaign"; amount: bigint }
  | HandSealedOp
  | { k: "advance"; seconds: bigint }
  | { k: "drain"; creator: number }
  | { k: "fund"; creator: number }
  | { k: "sweep" };
export type Op = BaseOp | LinkOp | SettleOp;

const LINK_KINDS = new Set(["link", "linkOther", "fundLink"]);

/** Plans one operation against the model: the transaction, the expected refusal and balance changes. */
export async function planOp(h: Harness, op: Op): Promise<Plan> {
  if (LINK_KINDS.has(op.k)) return planLink(h, op as LinkOp);
  switch (op.k) {
    case "openPaid":
      return planOpenPaid(h, op.creator, op.days);
    case "openTeam":
      return planOpenTeam(h, op.member);
    case "join":
      return planJoin(h, op);
    case "sealed":
      return planSealed(h, op);
    case "handSealed":
      return planHandSealed(h, op);
    case "pause":
      return planPause(h, true);
    case "resume":
      return planPause(h, false);
    case "hand":
      return planHand(h, op.c, op.to, op.amount);
    case "advance":
      return { ixs: [], deltas: new Map(), apply: () => setTime(h.w.client, clock(h) + op.seconds) };
    case "drain":
      return planDrain(h, op.creator);
    case "fund":
      return planFund(h, op.creator);
    case "sweep":
      return planSweep(h);
    default:
      return planSettle(h, op as SettleOp);
  }
}

/** The draw of the next operation: its kind by weight, then the campaign or wallet it names (seeded). */
export function drawOp(h: Harness, r: Rng): Op {
  const open = h.camps.map((_, i) => i).filter((i) => !h.camps[i].closed);
  const roll = r.next();
  const baker = r.int(0, h.bakers.length - 1);
  if (roll < 0.1)
    return { k: "advance", seconds: BigInt(r.pick([60, 90, 120, 3_600, 6 * 3_600, 2 * 86_400, 8 * 86_400])) };
  // A creator whose wallet cannot pay an opening (about 4.6 SOL; drained, or not refilled since) is funded first.
  const live = h.creators.map((_, i) => i).filter((i) => !h.drained.has(h.creators[i].address));
  const payers = h.creators.map((_, i) => i).filter((i) => balance(h.w, h.creators[i].address) >= 5n * P.SOL);
  const anyCreator = r.int(0, h.creators.length - 1);
  if (roll < 0.16 && payers.length === 0) return { k: "fund", creator: anyCreator };
  if (roll < 0.16) return { k: "openPaid", creator: r.pick(payers), days: r.int(3, 10) };
  if (roll < 0.2) return { k: "openTeam", member: r.int(0, h.team.length - 1) };
  // Most joins go to campaigns still taking entries; the rest name any open campaign, so refusals still run.
  const taking = open.filter((i) => h.camps[i].phase === "Open");
  const joinPool = taking.length > 0 && r.next() < 0.8 ? taking : open;
  if (roll < 0.4 && joinPool.length > 0)
    return {
      k: "join",
      c: r.pick(joinPool),
      baker,
      side: r.next() < 0.5 ? 0 : 1,
      amount: r.big(10_000_000n, 3_000_000_000n),
    };
  // Sprint 15: a sealed entry, by any baker (a sponsor may also join plainly: one Entry holds both).
  const sealed = roll >= 0.4 && roll < 0.47 ? drawSealed(h, r, open) : null;
  if (sealed) return sealed;
  // Sprint 14: a referral link, at any phase of any campaign and paused or not.
  if (roll < 0.5) return drawLinkOp(h, r);
  if (roll < 0.53) return { k: "pause" };
  if (roll < 0.56) return { k: "resume" };
  if (roll < 0.6 && open.length > 0) {
    if (r.next() < 0.3) return drawHandSealed(h, r, open);
    return { k: "hand", c: r.pick(open), to: r.next() < 0.6 ? "vault" : "campaign", amount: r.big(1n, 500_000_000n) };
  }
  if (roll < 0.62 && live.length > 0) return { k: "drain", creator: r.pick(live) };
  if (roll < 0.64) return { k: "fund", creator: anyCreator };
  if (roll < 0.66) return { k: "sweep" };
  // Sprint 15: a held fee settled at any phase (refused before the snapshot), sometimes by a thief in the sponsor's slot.
  const holding = open.filter((i) => liveSealed(h.camps[i]).length > 0);
  if (roll < 0.68 && holding.length > 0) return drawSealedSettle(h, r, r.pick(holding));
  if (open.length === 0) {
    return payers.length > 0 ? { k: "openPaid", creator: r.pick(payers), days: 3 } : { k: "fund", creator: 0 };
  }
  // Some draws pick a campaign in review or contested, so a contest's later stages come before the clock passes them.
  const reviewing = open.filter((i) => h.camps[i].phase === "InReview" || h.camps[i].phase === "Contested");
  const target = reviewing.length > 0 && r.next() < 0.35 ? r.pick(reviewing) : r.pick(open);
  // Most lifecycle draws name the step the phase allows (invariant-phase.ts); the rest stay random, so refusals still run.
  if (r.next() < 0.7) {
    const phased = drawPhaseOp(h, r, target);
    if (phased) return phased;
  }
  return drawSettleOp(h, r, target);
}
