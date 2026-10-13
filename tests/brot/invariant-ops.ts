/**
 * Purpose: the randomized test's operations: the dispatch of every operation to its planner, the money moved by
 *          hand and by the wallets (drain, fund, sweep), and the draw of the next one. Openings and joins are in
 *          invariant-open.ts, the lifecycle in invariant-settle.ts and the files it dispatches to, the referral links
 *          in invariant-referral.ts; invariant-run.ts runs one operation.
 * Version: 0.1.0 (Sprint 14: the referral links; the run moved to invariant-run.ts, the lifecycle draw to -phase.ts)
 * Sprint:  04 (contract freeze, lane E); 14 (lane INV14)
 */
import { type Address } from "@solana/kit";

import { readConfig } from "./flows";
import { type Harness, type Plan, type Rng, clock } from "./invariant-harness";
import { planJoin, planOpenPaid, planOpenTeam, planPause, type JoinOp } from "./invariant-open";
import { drawPhaseOp, drawSettleOp } from "./invariant-phase";
import { drawLinkOp, planLink, type LinkOp } from "./invariant-referral";
import { planSettle, type SettleOp } from "./invariant-settle";
import { sweepFeesIx } from "./instructions-settlement";
import * as P from "./program";
import { systemTransferIx } from "./join-campaign-support";
import { balance, setTime } from "./setup";

export type BaseOp =
  | { k: "openPaid"; creator: number; days: number }
  | { k: "openTeam"; member: number }
  | JoinOp
  | { k: "pause" }
  | { k: "resume" }
  | { k: "hand"; c: number; to: "vault" | "campaign"; amount: bigint }
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

function planHand(h: Harness, index: number, to: "vault" | "campaign", amount: bigint): Plan {
  const { campaign, vault } = h.addrs[index];
  const target = to === "vault" ? vault : campaign;
  return {
    ixs: [systemTransferIx(h.bank, target, amount)],
    deltas: new Map<string, bigint>([
      [target, amount],
      [h.bank.address, -amount],
    ]),
    apply: () => {
      const c = h.camps[index];
      if (to === "vault") c.handSent += amount;
      else c.handSentCampaign += amount;
    },
  };
}

/** Empties a creator's wallet: a credit below the reserve then has nowhere to land (Q2). */
function planDrain(h: Harness, creatorIndex: number): Plan {
  const creator = h.creators[creatorIndex];
  const amount = balance(h.w, creator.address);
  return {
    ixs: [systemTransferIx(creator, h.sink, amount)],
    deltas: new Map<string, bigint>([
      [creator.address, -amount],
      [h.sink, amount],
    ]),
    apply: () => {
      h.drained.add(creator.address);
    },
  };
}

/** Funds a creator with enough for about twenty paid openings, so a wallet once drained opens again. */
function planFund(h: Harness, creatorIndex: number): Plan {
  const creator = h.creators[creatorIndex];
  const amount = 100n * P.SOL;
  return {
    ixs: [systemTransferIx(h.bank, creator.address, amount)],
    deltas: new Map<string, bigint>([
      [creator.address, amount],
      [h.bank.address, -amount],
    ]),
    apply: () => {
      h.drained.delete(creator.address);
    },
  };
}

async function planSweep(h: Harness): Promise<Plan> {
  const config = await readConfig(h.w);
  const recipient = config.fee_recipient as Address;
  const surplus = h.feeVaultModel - h.rent.vault;
  return {
    ixs: [sweepFeesIx(await P.configPda(), h.feeVault, recipient)],
    error: surplus > 0n ? undefined : "NothingToSweep",
    deltas: new Map<string, bigint>([
      [h.feeVault, -surplus],
      [recipient, surplus],
    ]),
    events: ["FeesSwept"],
    apply: () => {
      h.feeVaultModel -= surplus;
    },
  };
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
  if (roll < 0.47 && joinPool.length > 0)
    return {
      k: "join",
      c: r.pick(joinPool),
      baker,
      side: r.next() < 0.5 ? 0 : 1,
      amount: r.big(10_000_000n, 3_000_000_000n),
    };
  // Sprint 14: a referral link, at any phase of any campaign and paused or not.
  if (roll < 0.5) return drawLinkOp(h, r);
  if (roll < 0.53) return { k: "pause" };
  if (roll < 0.56) return { k: "resume" };
  if (roll < 0.6 && open.length > 0)
    return { k: "hand", c: r.pick(open), to: r.next() < 0.6 ? "vault" : "campaign", amount: r.big(1n, 500_000_000n) };
  if (roll < 0.62 && live.length > 0) return { k: "drain", creator: r.pick(live) };
  if (roll < 0.64) return { k: "fund", creator: anyCreator };
  if (roll < 0.66) return { k: "sweep" };
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
