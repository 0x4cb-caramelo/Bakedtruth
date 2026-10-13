/**
 * Purpose: the randomized test's settlement operations: the payouts out of order and twice, the fee, the prize,
 *          the creator share and the close, each with its expected refusal and balance changes; the draw of
 *          every settlement operation. The review operations are in invariant-review.ts, the creator share and
 *          the close in invariant-close.ts.
 * Version: 0.0.2
 * Sprint:  04 (contract freeze, lane E); 15 (the creator share's reserve, moved to invariant-close.ts; lane INV15)
 */
import { type Address } from "@solana/kit";

import { collectDue, entryPayout, prizeDue, type ModelCampaign } from "./invariant-model";
import { collectFeeIx, settleEntryIx, settlePrizeIx } from "./instructions-settlement";
import type { BrotErrorName } from "./errors";
import { credit, planClose, planShare } from "./invariant-close";
import { clock, type Harness, type Plan, type Rng } from "./invariant-harness";
import { planReview, REVIEW_KINDS, type ReviewOp } from "./invariant-review";
import * as P from "./program";

export const PAYOUT_KINDS = ["settle", "collect", "share", "prize", "close"] as const;
export const SETTLE_KINDS = [...REVIEW_KINDS, ...PAYOUT_KINDS] as const;

export type PayoutOp =
  | { k: "settle"; c: number; baker: number }
  | { k: "collect"; c: number }
  | { k: "share"; c: number }
  | { k: "prize"; c: number }
  | { k: "close"; c: number };
export type SettleOp = ReviewOp | PayoutOp;

/** Plans one settlement operation: a review step, or a payment. The refusals follow the program's order of checks. */
export async function planSettle(h: Harness, op: SettleOp): Promise<Plan> {
  if ((REVIEW_KINDS as readonly string[]).includes(op.k)) return planReview(h, op as ReviewOp);
  const c = h.camps[op.c];
  const { campaign, vault } = h.addrs[op.c];
  return planPayout(h, op as PayoutOp, c, campaign, vault);
}

/** The money operations. Each pays a stored destination and runs under the pause too (I10′). */
async function planPayout(
  h: Harness,
  op: Exclude<
    SettleOp,
    { k: "resolveYes" | "resolveNo" | "resolveStale" | "confirm" | "void" | "contest" | "finalize" }
  >,
  c: ModelCampaign,
  campaign: Address,
  vault: Address,
): Promise<Plan> {
  const feeVault = h.feeVault;
  const settling = c.snapshot !== null && (c.phase === "Settling" || c.phase === "Settled");
  const notFinal: BrotErrorName | undefined = settling ? undefined : "NotFinalized";
  switch (op.k) {
    case "settle": {
      const baker = h.bakers[op.baker].address;
      const payout = c.snapshot ? entryPayout(c, baker) : 0n;
      const entry = await P.entryPda(campaign, baker);
      return {
        ixs: [settleEntryIx(entry, campaign, vault, baker)],
        error: notFinal ?? (c.settled.has(baker) ? "AlreadySettled" : undefined),
        deltas: new Map<string, bigint>([
          [vault, -payout],
          [baker, payout + h.rent.entry + BigInt(c.joins.filter((j) => j.baker === baker).length) * h.rent.join],
        ]),
        apply: () => {
          c.ledger.push({ to: baker, amount: payout, kind: "entry" });
          c.paidOut += payout;
          c.settled.add(baker);
          if (c.settled.size === new Set(c.joins.map((j) => j.baker)).size) c.phase = "Settled";
        },
      };
    }
    case "collect": {
      const amount = collectDue(c);
      return {
        ixs: [collectFeeIx(campaign, vault, feeVault)],
        // Before every entry is settled the fee is not yet known: `CampaignNotSettled` (lane D).
        error:
          notFinal ?? (c.phase !== "Settled" ? "CampaignNotSettled" : c.feeMoved ? "FeeAlreadyCollected" : undefined),
        deltas: new Map<string, bigint>([
          [vault, -amount],
          [feeVault, amount],
        ]),
        apply: () => {
          c.feeMoved = true;
          c.ledger.push({ to: "fee", amount, kind: "fee" });
          c.paidOut += amount;
          h.feeVaultModel += amount;
        },
      };
    }
    case "share":
      return planShare(h, c, campaign, vault, notFinal);
    case "prize": {
      const amount = prizeDue(c);
      return {
        ixs: [settlePrizeIx(campaign, vault, c.creator as Address)],
        error: notFinal ?? (c.prizeSettled ? "PrizeAlreadySettled" : undefined),
        deltas: new Map<string, bigint>([
          [vault, -amount],
          [c.creator, amount],
        ]),
        apply: () => {
          c.prizeSettled = true;
          c.ledger.push({ to: c.creator, amount, kind: "prize" });
          c.paidOut += amount;
          credit(h, c.creator, amount);
        },
      };
    }
    case "close":
      return planClose(h, c, campaign, vault);
  }
}

export type AdvanceOp = { k: "advance"; seconds: bigint };

/** The draw of one settlement operation against campaign `index`; a moot draw becomes a clock advance. */
export function drawSettleOp(h: Harness, r: Rng, index: number): SettleOp | AdvanceOp {
  const camp = h.camps[index];
  const t = clock(h);
  const member = r.int(0, h.team.length - 1);
  const advance: AdvanceOp = { k: "advance", seconds: 3_600n };
  const roll = r.int(0, SETTLE_KINDS.length - 1);
  switch (SETTLE_KINDS[roll]) {
    case "resolveYes":
      return t >= camp.deadline ? advance : { k: "resolveYes", c: index, back: r.big(0n, 50n) };
    case "resolveNo":
      return { k: "resolveNo", c: index };
    case "resolveStale":
      return { k: "resolveStale", c: index };
    case "confirm":
      return { k: "confirm", c: index, member };
    case "void": {
      const inside = camp.phase === "InReview" && t < camp.reviewEndsAt;
      const reason = inside && r.next() < 0.3 ? r.pick([1, 2, 3]) : r.pick([4, 5]);
      return { k: "void", c: index, member, reason };
    }
    case "contest":
      return { k: "contest", c: index, member };
    case "finalize":
      return { k: "finalize", c: index };
    case "settle": {
      const bakers = [...new Set(camp.joins.map((j) => j.baker))];
      if (bakers.length === 0) return advance;
      const who = r.pick(bakers);
      return { k: "settle", c: index, baker: h.bakers.findIndex((b) => b.address === who) };
    }
    case "collect":
      return { k: "collect", c: index };
    case "share":
      return { k: "share", c: index };
    case "prize":
      return { k: "prize", c: index };
    case "close":
      return { k: "close", c: index };
    default:
      return advance;
  }
}
