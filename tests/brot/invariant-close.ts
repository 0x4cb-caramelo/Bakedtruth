/**
 * Purpose: the randomized test's last two settlements of a campaign: the creator share (paid, or held in the vault
 *          for a wallet that could not take it, then claimed: TP 3.4.5) and `close_campaign` (after every held sponsor
 *          fee is settled, Sprint 15), each with its expected refusal, balance changes and events.
 * Version: 0.1.0
 * Sprint:  14 (lane INV14: the share's reserve and claim, the events); 15 (moved out of invariant-settle.ts with
 *          `SealedFeesOpen`; lane INV15, with Sprint 14 in one branch)
 */
import { type Address } from "@solana/kit";

import type { BrotErrorName } from "./errors";
import { closeCampaignIx, settleCreatorShareIx } from "./instructions-settlement";
import type { Harness, Plan } from "./invariant-harness";
import { booked, type ModelCampaign } from "./invariant-model";
import { shareDue } from "./invariant-payouts";
import { liveSealed } from "./invariant-sealed-model";
import { balance } from "./setup";

/** A payment that clears the reserve (Q2) frees a drained wallet; one below it stays reserved. */
export function credit(h: Harness, address: string, amount: bigint) {
  if (amount > 0n && h.drained.has(address) && amount >= h.rent.wallet) h.drained.delete(address);
}

/**
 * `settle_creator_share`, in the program's order: finalized; a share due (none for a team, a mode other than Split
 * or a zero share: `CreatorShareNotDue`); once settled, only a reserved share can be claimed (`AlreadySettled`
 * otherwise), when the wallet can take it (`ReserveNotClaimable`). A first credit that would leave the wallet below its
 * rent-exempt minimum is held in the vault (`creator_share_reserved`), with no event; close pays it to the rent payer.
 */
export function planShare(
  h: Harness,
  c: ModelCampaign,
  campaign: Address,
  vault: Address,
  notFinal?: BrotErrorName,
): Plan {
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
 * `close_campaign`: once settled, and every sponsor's held fee settled (`SealedFeesOpen`, Sprint 15), the rent and any
 * reserved creator share go to rent_payer (the creator, in this run); the dust and any hand-sent SOL go to the fee vault.
 */
export function planClose(h: Harness, c: ModelCampaign, campaign: Address, vault: Address): Plan {
  const reserved = c.reserved;
  const dust = booked(c) - reserved;
  const waiting = shareDue(c) > 0n && !c.shareSettled;
  const payer = c.creator;
  const error: BrotErrorName | undefined =
    c.phase !== "Settled" || !c.feeMoved || !c.prizeSettled || waiting
      ? "CampaignNotSettled"
      : liveSealed(c).length > 0
        ? "SealedFeesOpen"
        : undefined;
  return {
    ixs: [closeCampaignIx(campaign, vault, payer as Address, h.feeVault)],
    error,
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
