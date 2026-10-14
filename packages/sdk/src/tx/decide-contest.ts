/**
 * Purpose: `admin_decide_contest(decision, void_reason, note_hash)`, stage 2 of a contest (TP 3.4.7), built by the
 *          Codama client: before stage 2's deadline the admin confirms the stored result, or voids the campaign with
 *          a reason a team key may choose and the SHA-256 of the note published in content/void-log/. It never
 *          inverts: no decision writes YES or NO.
 * Version: 0.1.0
 * Sprint:  14 (lane L14B)
 *
 * The builder refuses what the program refuses from the arguments alone, in its order and by its error's name: a
 * confirm that names a void reason (`ConfirmWithVoidReason`), a void with a reason no team key may choose
 * (`VoidReasonNotForTeam`), a note hash that is not 32 bytes. On mainnet the admin is the 2-of-3 multisig, whose
 * proposal carries this instruction.
 */
import { type Address, type Instruction, type TransactionSigner } from "@solana/kit";

import { getAdminDecideContestInstruction } from "../idl/generated/instructions";
import { ContestDecision, VoidReason } from "../read/constants";
import { configAddress } from "../read/pdas";

/** The reasons a team key may choose (the program's `team_may_choose`), so the admin's void may name one. */
export const TEAM_VOID_REASONS: readonly VoidReason[] = [
  VoidReason.MissedWindow,
  VoidReason.StaleFeed,
  VoidReason.TeamHouseFailure,
  VoidReason.TeamOutsideCause,
];

/** Why the program refuses `decision` with `voidReason`, by its error's name, or `null` when it fits. */
export function contestDecisionProblem(
  decision: ContestDecision,
  voidReason: VoidReason,
): "ConfirmWithVoidReason" | "VoidReasonNotForTeam" | null {
  if (decision === ContestDecision.Confirm) return voidReason === VoidReason.None ? null : "ConfirmWithVoidReason";
  return TEAM_VOID_REASONS.includes(voidReason) ? null : "VoidReasonNotForTeam";
}

/** `admin_decide_contest`: `voidReason` only for a void (a confirm names none); `noteHash` is 32 bytes. */
export async function buildAdminDecideContest(a: {
  admin: TransactionSigner;
  campaign: Address;
  decision: ContestDecision;
  voidReason?: VoidReason;
  noteHash: Uint8Array;
}): Promise<Instruction> {
  const voidReason = a.voidReason ?? VoidReason.None;
  const problem = contestDecisionProblem(a.decision, voidReason);
  if (problem) throw new RangeError(`the program refuses this decision: ${problem}`);
  if (a.noteHash.length !== 32) throw new RangeError("noteHash must be 32 bytes");
  return getAdminDecideContestInstruction({
    admin: a.admin,
    config: await configAddress(),
    campaign: a.campaign,
    decision: a.decision,
    voidReason,
    noteHash: a.noteHash,
  });
}
