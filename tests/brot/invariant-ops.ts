/**
 * Purpose: the randomized test's operations: the dispatch of every operation to its planner, the run of one
 *          operation against the program, and the draw of the next one. Openings and joins are in invariant-open.ts,
 *          the money moved by hand and by the wallets in invariant-wallets.ts, settlements in invariant-settle.ts,
 *          the sealed entry and its held fee (Sprint 15) in invariant-sealed.ts and invariant-sealed-settle.ts.
 * Version: 0.0.2
 * Sprint:  04 (contract freeze, lane E); 15 (the sealed entry, its events checked; lane INV15)
 */
import { type Address } from "@solana/kit";

import { type Harness, type Plan, type Rng, clock } from "./invariant-harness";
import { planJoin, planOpenPaid, planOpenTeam, planPause, type JoinOp } from "./invariant-open";
import { drawPhaseOp } from "./invariant-phase";
import { drawHandSealed, drawSealed, planHandSealed, planSealed } from "./invariant-sealed";
import { liveSealed, type HandSealedOp, type SealedOp } from "./invariant-sealed-model";
import { drawSealedSettle } from "./invariant-sealed-settle";
import { drawSettleOp, planSettle, type SettleOp } from "./invariant-settle";
import { planDrain, planFund, planHand, planSweep } from "./invariant-wallets";
import { balance, expectError, expectOk, send, setTime } from "./setup";

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
export type Op = BaseOp | SettleOp;

/** Plans one operation against the model: the transaction, the expected refusal and balance changes. */
export async function planOp(h: Harness, op: Op): Promise<Plan> {
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
      return planSettle(h, op);
  }
}

/** Runs one operation: sends it, checks the refusal or the balance changes, then moves the model on. */
export async function runOp(h: Harness, op: Op): Promise<void> {
  const plan = await planOp(h, op);
  const addrs = [...plan.deltas.keys()] as Address[];
  const before = addrs.map((a) => balance(h.w, a));
  if (plan.ixs.length === 0) {
    plan.apply();
    h.trace.push(`${op.k} ${plan.tag ?? "ok"}`);
    return;
  }
  const sent = await send(h.w, plan.ixs);
  if (plan.error) {
    expectError(sent, plan.error);
    addrs.forEach((a, i) => {
      if (balance(h.w, a) !== before[i]) throw new Error(`${op.k}: ${a} moved on a refused ${plan.error}`);
    });
  } else {
    const ok = expectOk(sent);
    addrs.forEach((a, i) => {
      const moved = balance(h.w, a) - before[i];
      const want = plan.deltas.get(a) ?? 0n;
      if (moved !== want) throw new Error(`${op.k}: ${a} moved ${moved}, the model expects ${want}`);
    });
    plan.check?.(ok);
    plan.apply();
  }
  plan.after?.();
  h.trace.push(`${op.k} ${plan.error ?? "ok"}${!plan.error && plan.tag ? ` ${plan.tag}` : ""}`);
}

/** The draw of the next operation: its kind by weight, then the campaign or wallet it names (seeded). */
export function drawOp(h: Harness, r: Rng): Op {
  const open = h.camps.map((_, i) => i).filter((i) => !h.camps[i].closed);
  const roll = r.next();
  const baker = r.int(0, h.bakers.length - 1);
  if (roll < 0.1)
    return { k: "advance", seconds: BigInt(r.pick([60, 90, 120, 3_600, 6 * 3_600, 2 * 86_400, 8 * 86_400])) };
  // A creator whose wallet is drained cannot pay an opening: it is funded first.
  const live = h.creators.map((_, i) => i).filter((i) => !h.drained.has(h.creators[i].address));
  const anyCreator = r.int(0, h.creators.length - 1);
  if (roll < 0.16 && live.length === 0) return { k: "fund", creator: anyCreator };
  if (roll < 0.16) return { k: "openPaid", creator: r.pick(live), days: r.int(3, 10) };
  if (roll < 0.2) return { k: "openTeam", member: r.int(0, h.team.length - 1) };
  // Most joins go to campaigns still taking entries; the rest name any open campaign, so refusals still run.
  const taking = open.filter((i) => h.camps[i].phase === "Open");
  const joinPool = taking.length > 0 && r.next() < 0.8 ? taking : open;
  if (roll < 0.41 && joinPool.length > 0)
    return {
      k: "join",
      c: r.pick(joinPool),
      baker,
      side: r.next() < 0.5 ? 0 : 1,
      amount: r.big(10_000_000n, 3_000_000_000n),
    };
  // Sprint 15: a sealed entry, by any baker (a sponsor may also join plainly: one Entry holds both).
  const sealed = roll >= 0.41 && roll < 0.5 ? drawSealed(h, r, open) : null;
  if (sealed) return sealed;
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
  if (open.length === 0) return { k: "openPaid", creator: 0, days: 3 };
  // Half the lifecycle draws go to a campaign inside its review window, so the team's confirm and void happen.
  const reviewing = open.filter((i) => h.camps[i].phase === "InReview" && clock(h) < h.camps[i].reviewEndsAt);
  const target = reviewing.length > 0 && r.next() < 0.5 ? r.pick(reviewing) : r.pick(open);
  // Most lifecycle draws name the step the phase allows (invariant-phase.ts); the rest stay random, so refusals still run.
  if (r.next() < 0.7) {
    const phased = drawPhaseOp(h, r, target);
    if (phased) return phased;
  }
  return drawSettleOp(h, r, target);
}
