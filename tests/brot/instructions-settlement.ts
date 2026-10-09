/**
 * Purpose: builders for the ten instructions of Sprint 04, with the accounts in the frozen order of
 *          programs/brot-markets/src/instructions/interface.rs. The bodies are lanes A, C and D's; the
 *          builders exist now so the freeze can be checked against the IDL.
 * Version: 0.0.1
 * Sprint:  04 (contract freeze)
 */
import type { Address, Instruction, TransactionSigner } from "@solana/kit";

import { encode } from "./layouts";
import * as P from "./program";
import * as S from "./structs";
import { data, eventSlots, ix, ro, rw, signer } from "./instructions";

/** Lane A: a team key ends the window at once (the snapshot runs with it). */
export function teamConfirmResultIx(team: TransactionSigner, config: Address, campaign: Address): Instruction {
  return ix([signer(team), rw(config), rw(campaign), ...eventSlots()], data(P.IX.TEAM_CONFIRM_RESULT));
}

/** Lane A: a team key voids the campaign with a reason and the hash of its note. */
export function teamVoidCampaignIx(
  team: TransactionSigner,
  config: Address,
  campaign: Address,
  args: { reason: number; noteHash: Uint8Array },
): Instruction {
  const bytes = encode(S.TEAM_VOID_CAMPAIGN_ARGS, { reason: args.reason, note_hash: args.noteHash });
  return ix([signer(team), rw(config), rw(campaign), ...eventSlots()], data(P.IX.TEAM_VOID_CAMPAIGN, bytes));
}

/** Lane A: a team key enters Contested; the config is read only. */
export function teamOpenContestIx(team: TransactionSigner, config: Address, campaign: Address): Instruction {
  return ix([signer(team), ro(config), rw(campaign), ...eventSlots()], data(P.IX.TEAM_OPEN_CONTEST));
}

/** Lane C: the snapshot of a reviewed campaign, by any wallet, once the window has closed. */
export function finalizeCampaignIx(campaign: Address, config: Address): Instruction {
  return ix([rw(campaign), rw(config), ...eventSlots()], data(P.IX.FINALIZE_CAMPAIGN));
}

/** Lane C: one entry paid to its stored baker, the Entry closed with its rent back to the baker. */
export function settleEntryIx(entry: Address, campaign: Address, vault: Address, baker: Address): Instruction {
  return ix([rw(entry), rw(campaign), rw(vault), rw(baker), ...eventSlots()], data(P.IX.SETTLE_ENTRY));
}

/** Lane C: the creator's share, once, to the stored creator. */
export function settleCreatorShareIx(campaign: Address, vault: Address, creator: Address): Instruction {
  return ix([rw(campaign), rw(vault), rw(creator), ...eventSlots()], data(P.IX.SETTLE_CREATOR_SHARE));
}

/** Lane D: what Brot keeps moves to the fee vault. */
export function collectFeeIx(campaign: Address, vault: Address, feeVault: Address): Instruction {
  return ix([rw(campaign), rw(vault), rw(feeVault), ...eventSlots()], data(P.IX.COLLECT_FEE));
}

/** Lane C: the prize back to whoever opened, and the opening fee on a house-failure void. */
export function settlePrizeIx(campaign: Address, vault: Address, recipient: Address): Instruction {
  return ix([rw(campaign), rw(vault), rw(recipient), ...eventSlots()], data(P.IX.SETTLE_PRIZE));
}

/** Lane D: the campaign closed; dust and surplus to the fee vault, the rent to the rent payer. */
export function closeCampaignIx(campaign: Address, vault: Address, rentPayer: Address, feeVault: Address): Instruction {
  return ix([rw(campaign), rw(vault), rw(rentPayer), rw(feeVault), ...eventSlots()], data(P.IX.CLOSE_CAMPAIGN));
}

/** Lane D: the fee vault's surplus to the fee recipient; the config is read only. */
export function sweepFeesIx(config: Address, feeVault: Address, feeRecipient: Address): Instruction {
  return ix([ro(config), rw(feeVault), rw(feeRecipient), ...eventSlots()], data(P.IX.SWEEP_FEES));
}
