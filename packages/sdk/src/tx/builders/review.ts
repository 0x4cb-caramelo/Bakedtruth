/**
 * Purpose: the team's acts inside a campaign's review window, built by the Codama client: confirm the
 *          result, void it with a reason and the hash of its public note, open a contest (disabled in
 *          the program until Sprint 14: it refuses with `ContestExitDisabled`).
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * A team key voids only an automatic void (`TeamVoidNotAutomatic` for a YES or NO, decision of
 * 2026-10-09). The note's text lives in content/void-log/ and only its hash goes on-chain (TP 3.4.7).
 */
import { type Address, type Instruction, type TransactionSigner } from "@solana/kit";

import {
  getTeamConfirmResultInstruction,
  getTeamOpenContestInstruction,
  getTeamVoidCampaignInstruction,
} from "../../idl/generated/instructions";
import { VoidReason } from "../../read/constants";
import { configAddress } from "../../read/pdas";

/** `team_confirm_result`: ends the window now; the snapshot runs at once. */
export async function buildTeamConfirmResult(a: { teamMember: TransactionSigner; campaign: Address }) {
  return getTeamConfirmResultInstruction({
    teamMember: a.teamMember,
    config: await configAddress(),
    campaign: a.campaign,
  });
}

/** `team_void_campaign(reason, note_hash)`: `noteHash` is the SHA-256 of the note in content/void-log/. */
export async function buildTeamVoidCampaign(a: {
  teamMember: TransactionSigner;
  campaign: Address;
  reason: VoidReason;
  noteHash: Uint8Array;
}): Promise<Instruction> {
  if (a.noteHash.length !== 32) throw new RangeError("noteHash must be 32 bytes");
  return getTeamVoidCampaignInstruction({
    teamMember: a.teamMember,
    config: await configAddress(),
    campaign: a.campaign,
    reason: a.reason,
    noteHash: a.noteHash,
  });
}

/** `team_open_contest`: refused by the program until Sprint 14 (`ContestExitDisabled`). */
export async function buildTeamOpenContest(a: { teamMember: TransactionSigner; campaign: Address }) {
  return getTeamOpenContestInstruction({
    teamMember: a.teamMember,
    config: await configAddress(),
    campaign: a.campaign,
  });
}
