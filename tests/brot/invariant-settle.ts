/**
 * Purpose: the randomized test's settlement operations: the payouts out of order and twice, the fee, the prize,
 *          the creator share (paid, or held in the vault for a wallet that could not take it, then claimed) and the
 *          close, each with its expected refusal, balance changes and events; and the dispatch of every lifecycle
 *          operation to its planner (review, window, contest, payout).
 * Version: 0.1.0 (Sprint 14: the contest dispatched, the share's reserve and claim, the events of each payout)
 * Sprint:  04 (contract freeze, lane E); 14 (lane INV14)
 */
import { type Address } from "@solana/kit";

import { booked, type ModelCampaign } from "./invariant-model";
import { collectDue, entryPayout, prizeDue, shareDue } from "./invariant-payouts";
import {
  closeCampaignIx,
  collectFeeIx,
  settleCreatorShareIx,
  settleEntryIx,
  settlePrizeIx,
} from "./instructions-settlement";
import type { BrotErrorName } from "./errors";
import { CONTEST_KINDS, planContest, type ContestOp } from "./invariant-contest";
import { entryOf, type Harness, type Plan } from "./invariant-harness";
import { planReview, REVIEW_KINDS, type ReviewOp } from "./invariant-review";
import { balance } from "./setup";

export const PAYOUT_KINDS = ["settle", "collect", "share", "prize", "close"] as const;
export const SETTLE_KINDS = [...REVIEW_KINDS, ...CONTEST_KINDS, ...PAYOUT_KINDS] as const;

export type PayoutOp =
  | { k: "settle"; c: number; baker: number }
  | { k: "collect"; c: number }
  | { k: "share"; c: number }
  | { k: "prize"; c: number }
  | { k: "close"; c: number };
export type SettleOp = ReviewOp | ContestOp | PayoutOp;

/** A payment that clears the reserve (Q2) frees a drained wallet; one below it stays reserved. */
function credit(h: Harness, address: string, amount: bigint) {
  if (amount > 0n && h.drained.has(address) && amount >= h.rent.wallet) h.drained.delete(address);
}

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
  }
}

/**
 * `settle_creator_share`, in the program's order: finalized; a share due (none for a team, a mode other than Split
 * or a zero share: `CreatorShareNotDue`); once settled, only a reserved share can be claimed (`AlreadySettled`
 * otherwise), when the wallet can take it (`ReserveNotClaimable`). A first credit that would leave the wallet below its
 * rent-exempt minimum is held in the vault (`creator_share_reserved`), with no event; close pays it to the rent payer.
 */
function planShare(h: Harness, c: ModelCampaign, campaign: Address, vault: Address, notFinal?: BrotErrorName): Plan {
  const due = shareDue(c);
  const wallet = balance(h.w, c.creator as Address);
  const claim = c.shareSettled && c.reserved > 0n;
  const error: BrotErrorName | undefined =
    notFinal ??
    (due === 0n ? "CreatorShareNotDue" : undefined) ??
    (!c.shareSettled
      ? undefined
      : c.reserved === 0n
        ? "AlreadySettled"
        : wallet + c.reserved < h.rent.wallet
          ? "ReserveNotClaimable"
          : undefined);
  const reserve = error === undefined && !c.shareSettled && wallet + due < h.rent.wallet;
  const paid = reserve ? 0n : claim ? c.reserved : due;
  return {
    ixs: [settleCreatorShareIx(campaign, vault, c.creator as Address)],
    error,
    deltas: new Map<string, bigint>([
      [vault, -paid],
      [c.creator, paid],
    ]),
    label: reserve ? "share-reserve" : claim ? "share-claim" : undefined,
    events: reserve ? [] : ["CreatorShareSettled"],
    apply: () => {
      c.shareSettled = true;
      c.reserved = reserve ? due : 0n;
      if (reserve) return;
      c.seq += 1n;
      c.ledger.push({ to: c.creator, amount: paid, kind: "share" });
      c.paidOut += paid;
      credit(h, c.creator, paid);
    },
  };
}

/**
 * `close_campaign`: once settled, the rent and any reserved creator share go to rent_payer (the creator, in this
 * run); the dust and any hand-sent SOL go to the fee vault.
 */
function planClose(h: Harness, c: ModelCampaign, campaign: Address, vault: Address): Plan {
  const reserved = c.reserved;
  const dust = booked(c) - reserved;
  const waiting = shareDue(c) > 0n && !c.shareSettled;
  const payer = c.creator;
  return {
    ixs: [closeCampaignIx(campaign, vault, payer as Address, h.feeVault)],
    error: c.phase !== "Settled" || !c.feeMoved || !c.prizeSettled || waiting ? "CampaignNotSettled" : undefined,
    deltas: new Map<string, bigint>([
      [vault, -(h.rent.vault + dust + reserved + c.handSent)],
      [campaign, -(h.rent.campaign + c.handSentCampaign)],
      [payer, h.rent.campaign + h.rent.vault + reserved],
      [h.feeVault, dust + c.handSent + c.handSentCampaign],
    ]),
    events: ["CampaignClosed"],
    apply: () => {
      const surplus = dust + c.handSent + c.handSentCampaign;
      c.seq += 1n;
      c.ledger.push({ to: "fee", amount: surplus, kind: "close" });
      if (reserved > 0n) c.ledger.push({ to: payer, amount: reserved, kind: "share" });
      c.paidOut += dust + reserved + c.handSent;
      h.feeVaultModel += surplus;
      c.reserved = 0n;
      c.closed = true;
      c.phase = "Closed";
      credit(h, payer, h.rent.campaign + reserved);
    },
  };
}
