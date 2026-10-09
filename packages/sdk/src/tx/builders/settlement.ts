/**
 * Purpose: the permissionless settlement instructions, built by the Codama client with every program
 *          address derived here: finalize, the late-join tally, an entry's payout, the creator share, the
 *          fee, the prize, the close and the sweep (TP 3.4.3, 3.4.5). Any wallet may send each one; the
 *          program chooses every amount and destination.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { AccountRole, type Address, type Instruction } from "@solana/kit";

import {
  getCloseCampaignInstruction,
  getCollectFeeInstruction,
  getFinalizeCampaignInstruction,
  getSettleCreatorShareInstruction,
  getSettleEntryInstruction,
  getSettlePrizeInstruction,
  getSweepFeesInstruction,
  getTallyLateJoinsInstruction,
} from "../../idl/generated/instructions";
import { configAddress, entryAddress, feeVaultAddress, joinAddress, vaultAddress } from "../../read/pdas";

/** `finalize_campaign`: the snapshot, once the review window has ended. */
export async function buildFinalizeCampaign(a: { campaign: Address }): Promise<Instruction> {
  return getFinalizeCampaignInstruction({ campaign: a.campaign, config: await configAddress() });
}

/**
 * `tally_late_joins`: closes a baker's `Join` accounts `from..to` (index order, the entry's
 * `joins_tallied..join_count`), passed after the five listed slots.
 */
export async function buildTallyLateJoins(a: {
  campaign: Address;
  baker: Address;
  from: number;
  to: number;
}): Promise<Instruction> {
  if (!(a.from < a.to)) throw new RangeError("at least one join per tally");
  const ix = getTallyLateJoinsInstruction({
    campaign: a.campaign,
    entry: await entryAddress(a.campaign, a.baker),
    baker: a.baker,
  });
  const joins = [];
  for (let index = a.from; index < a.to; index++) joins.push(await joinAddress(a.campaign, a.baker, index));
  return { ...ix, accounts: [...ix.accounts, ...joins.map((join) => ({ address: join, role: AccountRole.WRITABLE }))] };
}

/** `settle_entry`: pays one entry to its stored baker and closes it, rent back to the baker. */
export async function buildSettleEntry(a: { campaign: Address; baker: Address }): Promise<Instruction> {
  return getSettleEntryInstruction({
    entry: await entryAddress(a.campaign, a.baker),
    campaign: a.campaign,
    vault: await vaultAddress(a.campaign),
    baker: a.baker,
  });
}

/** `settle_creator_share`: the creator's share, once, to the stored creator. */
export async function buildSettleCreatorShare(a: { campaign: Address; creator: Address }): Promise<Instruction> {
  return getSettleCreatorShareInstruction({
    campaign: a.campaign,
    vault: await vaultAddress(a.campaign),
    creator: a.creator,
  });
}

/** `collect_fee`: what Brot keeps, to the fee vault. */
export async function buildCollectFee(a: { campaign: Address }): Promise<Instruction> {
  return getCollectFeeInstruction({
    campaign: a.campaign,
    vault: await vaultAddress(a.campaign),
    feeVault: await feeVaultAddress(),
  });
}

/** `settle_prize`: the prize back to whoever opened, in `OneSided` and `Refund` (the flag only in `Split`). */
export async function buildSettlePrize(a: { campaign: Address; recipient: Address }): Promise<Instruction> {
  return getSettlePrizeInstruction({
    campaign: a.campaign,
    vault: await vaultAddress(a.campaign),
    recipient: a.recipient,
  });
}

/** `close_campaign`: the rent back to the stored rent payer, dust and surplus to the fee vault. */
export async function buildCloseCampaign(a: { campaign: Address; rentPayer: Address }): Promise<Instruction> {
  return getCloseCampaignInstruction({
    campaign: a.campaign,
    vault: await vaultAddress(a.campaign),
    rentPayer: a.rentPayer,
    feeVault: await feeVaultAddress(),
  });
}

/** `sweep_fees`: the fee vault above its rent minimum, to `GlobalConfig.fee_recipient` only. */
export async function buildSweepFees(a: { feeRecipient: Address }): Promise<Instruction> {
  return getSweepFeesInstruction({
    config: await configAddress(),
    feeVault: await feeVaultAddress(),
    feeRecipient: a.feeRecipient,
  });
}
