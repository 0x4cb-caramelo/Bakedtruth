/**
 * Purpose: the randomized test's last two settlements of a campaign: the creator share (paid, or reserved for a
 *          wallet it would leave below rent and claimed later: TP 3.4.5) and `close_campaign` (after every held
 *          sponsor fee is settled, Sprint 15), each with its expected refusal and balance changes.
 * Version: 0.0.1
 * Sprint:  15 (moved out of invariant-settle.ts with the reserve path and `SealedFeesOpen`; lane INV15)
 */
import { type Address } from "@solana/kit";

import type { BrotErrorName } from "./errors";
import { closeCampaignIx, settleCreatorShareIx } from "./instructions-settlement";
import type { Harness, Plan } from "./invariant-harness";
import { booked, shareDue, type ModelCampaign } from "./invariant-model";
import { liveSealed } from "./invariant-sealed-model";
import { balance } from "./setup";

/** A payment that clears the reserve (Q2) frees a drained wallet; one below it stays reserved and is refused. */
export function credit(h: Harness, address: string, amount: bigint) {
  if (amount > 0n && h.drained.has(address) && amount >= h.rent.wallet) h.drained.delete(address);
}

/**
 * settle_creator_share.rs: none due first (a team opening, a mode other than Split, a zero share); then a settled share
 * is `AlreadySettled`, unless it was reserved: the reserve is paid once the wallet, with it, reaches rent
 * (`ReserveNotClaimable` before). A first settlement that would leave the wallet below rent keeps the share in the
 * vault, reserved, and succeeds moving nothing.
 */
export function planShare(
  h: Harness,
  c: ModelCampaign,
  campaign: Address,
  vault: Address,
  notFinal: BrotErrorName | undefined,
): Plan {
  const due = shareDue(c);
  const wallet = balance(h.w, c.creator as Address);
  const claim = c.shareSettled && c.reserved > 0n;
  const error: BrotErrorName | undefined =
    notFinal ??
    (due === 0n ? "CreatorShareNotDue" : undefined) ??
    (c.shareSettled && !claim ? "AlreadySettled" : undefined) ??
    (claim && wallet + c.reserved < h.rent.wallet ? "ReserveNotClaimable" : undefined);
  const reserve = !c.shareSettled && wallet + due < h.rent.wallet;
  const amount = claim ? c.reserved : reserve ? 0n : due;
  return {
    ixs: [settleCreatorShareIx(campaign, vault, c.creator as Address)],
    error,
    deltas: new Map<string, bigint>([
      [vault, -amount],
      [c.creator, amount],
    ]),
    tag: reserve ? "reserved" : claim ? "claimed" : undefined,
    apply: () => {
      c.shareSettled = true;
      c.reserved = reserve ? due : 0n;
      if (reserve) return;
      c.ledger.push({ to: c.creator, amount, kind: "share" });
      c.paidOut += amount;
      credit(h, c.creator, amount);
    },
  };
}

/**
 * `close_campaign`: once settled and every sponsor's held fee settled (`SealedFeesOpen`, Sprint 15), the rent and a
 * reserved creator share go to rent_payer (the creator here); the dust and any hand-sent SOL go to the fee vault.
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
    apply: () => {
      if (reserved > 0n) c.ledger.push({ to: c.creator, amount: reserved, kind: "share" });
      c.paidOut += reserved;
      c.reserved = 0n;
      const surplus = dust + c.handSent + c.handSentCampaign;
      c.ledger.push({ to: "fee", amount: surplus, kind: "close" });
      c.paidOut += dust + c.handSent;
      h.feeVaultModel += surplus;
      c.closed = true;
      c.phase = "Closed";
      credit(h, payer, h.rent.campaign);
    },
  };
}
