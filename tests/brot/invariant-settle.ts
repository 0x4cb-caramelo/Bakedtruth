/**
 * Purpose: the randomized test's settlement operations: the payouts out of order and twice, the fee, the prize,
 *          each with its expected refusal, balance changes and events; and the dispatch of every lifecycle operation
 *          to its planner (review, window, contest, payout). The creator share and the close are in invariant-close.ts,
 *          a sponsor's held fee (Sprint 15) in invariant-sealed-settle.ts.
 * Version: 0.1.1 (Sprint 14: the contest dispatched, the share's reserve and claim, the events of each payout;
 *          Sprint 15: the held fee's settlement, the share and the close moved to invariant-close.ts)
 * Sprint:  04 (contract freeze, lane E); 14 (lane INV14); 15 (lane INV15, with Sprint 14 in one branch)
 */
import { type Address } from "@solana/kit";

import type { ModelCampaign } from "./invariant-model";
import { collectDue, entryPayout, prizeDue } from "./invariant-payouts";
import { collectFeeIx, settleEntryIx, settlePrizeIx } from "./instructions-settlement";
import type { BrotErrorName } from "./errors";
import { credit, planClose, planShare } from "./invariant-close";
import { CONTEST_KINDS, planContest, type ContestOp } from "./invariant-contest";
import { entryOf, type Harness, type Plan } from "./invariant-harness";
import { planReview, REVIEW_KINDS, type ReviewOp } from "./invariant-review";
import type { SealedSettleOp } from "./invariant-sealed-model";
import { planSealedSettle } from "./invariant-sealed-settle";

export const PAYOUT_KINDS = ["settle", "collect", "share", "prize", "close", "sealedSettle"] as const;
export const SETTLE_KINDS = [...REVIEW_KINDS, ...CONTEST_KINDS, ...PAYOUT_KINDS] as const;

export type PayoutOp =
  | { k: "settle"; c: number; baker: number }
  | { k: "collect"; c: number }
  | { k: "share"; c: number }
  | { k: "prize"; c: number }
  | { k: "close"; c: number }
  | SealedSettleOp;
export type SettleOp = ReviewOp | ContestOp | PayoutOp;

/** Plans one lifecycle operation: a review step, a contest step, or a payment. */
export async function planSettle(h: Harness, op: SettleOp): Promise<Plan> {
  if ((REVIEW_KINDS as readonly string[]).includes(op.k)) return planReview(h, op as ReviewOp);
  if ((CONTEST_KINDS as readonly string[]).includes(op.k)) return planContest(h, op as ContestOp);
  const { campaign, vault } = h.addrs[op.c];
  return planPayout(h, op as PayoutOp, h.camps[op.c], campaign, vault);
}

/** The money operations. Each pays a stored destination and runs under the pause too (I10′). */
async function planPayout(h: Harness, op: PayoutOp, c: ModelCampaign, campaign: Address, vault: Address) {
  const feeVault = h.feeVault;
  const settling = c.snapshot !== null && (c.phase === "Settling" || c.phase === "Settled");
  const notFinal: BrotErrorName | undefined = settling ? undefined : "NotFinalized";
  switch (op.k) {
    case "settle": {
      const baker = h.bakers[op.baker].address;
      const payout = c.snapshot ? entryPayout(c, baker) : 0n;
      // The Entry returns its own rent and the rent of every Join the tally closed into it.
      const rents = h.rent.entry + BigInt(c.joins.filter((j) => j.baker === baker).length) * h.rent.join;
      return {
        ixs: [settleEntryIx(await entryOf(h, campaign, baker), campaign, vault, baker as Address)],
        error: notFinal ?? (c.settled.has(baker) ? "AlreadySettled" : undefined),
        deltas: new Map<string, bigint>([
          [vault, -payout],
          [baker, payout + rents],
        ]),
        events: ["EntrySettled"],
        apply: () => {
          c.seq += 1n;
          c.ledger.push({ to: baker, amount: payout, kind: "entry" });
          c.paidOut += payout;
          c.settled.add(baker);
          if (c.settled.size === new Set(c.joins.map((j) => j.baker)).size) c.phase = "Settled";
        },
      } satisfies Plan;
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
        events: ["FeeCollected"],
        apply: () => {
          c.seq += 1n;
          c.feeMoved = true;
          c.ledger.push({ to: "fee", amount, kind: "fee" });
          c.paidOut += amount;
          h.feeVaultModel += amount;
        },
      } satisfies Plan;
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
        events: ["PrizeSettled"],
        apply: () => {
          c.seq += 1n;
          c.prizeSettled = true;
          c.ledger.push({ to: c.creator, amount, kind: "prize" });
          c.paidOut += amount;
          credit(h, c.creator, amount);
        },
      } satisfies Plan;
    }
    case "close":
      return planClose(h, c, campaign, vault);
    case "sealedSettle":
      return planSealedSettle(h, op);
  }
}
