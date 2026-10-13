/**
 * Purpose: the team's acts inside a campaign's review window, built by the Codama client: confirm the
 *          result, void it with a reason and the hash of its public note, open a contest or send it to stage 2
 *          (enabled in Sprint 14 with its exits: `../reread.ts` and `../decide-contest.ts`).
 * Version: 0.2.0 (the contest's act in its byte, the second review's S1; the escalation, D2; the contest enabled)
 * Sprint:  05 (SDK); 14 (lane L14B)
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
import { ContestStage, VoidReason } from "../../read/constants";
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

/**
 * `team_open_contest(stage)`, the act in its signed byte (the second review's S1), stated by the caller, never
 * defaulted. `ContestStage.Stage1`: inside the window, once every entry is tallied (`NotTallied` before), payout
 * pauses and stage 1 starts for 24 hours, the reading run again (`buildRereadCampaign`); on a campaign already
 * contested it is refused (`ContestAlreadyOpen`), so a retried opening never escalates. `ContestStage.Stage2`: a
 * contest still at stage 1, before its deadline, goes to the admin for 48 hours (D2; `NotContested` on a campaign not
 * contested, `WrongContestStage` at stage 2, `ContestDeadlinePassed` from stage 1's deadline on).
 */
export async function buildTeamOpenContest(a: {
  teamMember: TransactionSigner;
  campaign: Address;
  stage: ContestStage.Stage1 | ContestStage.Stage2;
}) {
  if (a.stage !== ContestStage.Stage1 && a.stage !== ContestStage.Stage2) {
    throw new RangeError("stage must be ContestStage.Stage1 (open) or ContestStage.Stage2 (send to the admin)");
  }
  return getTeamOpenContestInstruction({
    teamMember: a.teamMember,
    config: await configAddress(),
    campaign: a.campaign,
    stage: a.stage,
  });
}
