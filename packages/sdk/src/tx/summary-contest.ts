/**
 * Purpose: what the summary says for a contest's opening or escalation, its re-read and the admin's stage-2 decision
 *          (Sprint 14), from the bytes signed and, when the screen read it, the campaign: which of the team's two acts
 *          the call's byte names (S1, D2), when a matching re-read may pay, the decision, its reason, and where the
 *          10% opening fee goes. A house-failure void refunds the fee only once an entry landed (with no entry,
 *          founder answer 8 keeps it): the summary states the branch the program will take when it knows the campaign,
 *          and the rule when it does not (review fix F6). A re-read names a proof only when one is offered (F9).
 * Version: 0.3.0 (the act from the signed byte, the second review's S1; D2: stage 1's 24 hours and the escalation)
 * Sprint:  14 (lane L14B, review fixes F6 and F9; D2; the second review's S1)
 */
import type { Instruction } from "@solana/kit";

import { TEAM_OPEN_CONTEST_DISCRIMINATOR } from "../idl/generated/instructions";
import type { Campaign } from "../read/accounts";
import { bytesToHex } from "../read/bytes";
import { ContestDecision, ContestStage, PROGRAM_ID, Status, SYSTEM_PROGRAM_ID, VoidReason } from "../read/constants";
import { formatUtc } from "../read/format";
import { TEAM_VOID_REASONS } from "./decide-contest";

type Slots = Record<string, { address: string }>;

/** A void reason's class decides the 10% opening fee (the program's `void_reason.rs`). */
const HOUSE_FAILURES: readonly VoidReason[] = [VoidReason.MissedWindow, VoidReason.TeamHouseFailure];

/**
 * What a void with `reason` returns, as the program's `opener_return` decides it: an outside cause keeps the fee; a
 * house failure refunds it when an entry landed (`firstBaker` set) and keeps it when none did.
 */
function voidReturns(reason: VoidReason, stored: Campaign | undefined): string {
  const all = "every entry and the prize go back";
  if (!HOUSE_FAILURES.includes(reason)) return `${all}, and the 10% opening fee stays with Brot`;
  if (stored === undefined) {
    return `${all}, and the 10% opening fee goes back to whoever opened if any entry landed (with no entry, Brot keeps it)`;
  }
  if (stored.firstBaker === SYSTEM_PROGRAM_ID)
    return "the prize goes back, and with no entry in the pot Brot keeps the 10% opening fee";
  return `${all}, and the 10% opening fee goes back to whoever opened`;
}

/** The admin's decision at stage 2 of a contest, in words, from the bytes signed and the campaign as read. */
export function decisionText(campaign: string | undefined, d: Record<string, any>, stored?: Campaign): string {
  const note = `note hash ${bytesToHex(d.noteHash)}`;
  if (d.decision === ContestDecision.Confirm) {
    const refused =
      d.voidReason === VoidReason.None
        ? ""
        : ` with void reason ${VoidReason[d.voidReason]}, which the program refuses (ConfirmWithVoidReason)`;
    return `As the admin, confirm the stored result of contested campaign ${campaign}${refused}: it pays out as stored; ${note}`;
  }
  const reason = VoidReason[d.voidReason];
  if (!TEAM_VOID_REASONS.includes(d.voidReason)) {
    return `As the admin, void contested campaign ${campaign} (${reason}), which the program refuses (VoidReasonNotForTeam); ${note}`;
  }
  return `As the admin, void contested campaign ${campaign} (${reason}): ${voidReturns(d.voidReason, stored)}; ${note}`;
}

/** Stage 1's deadline as a date, when the screen read the campaign at stage 1; nothing otherwise. */
function stage1Deadline(stored: Campaign | undefined): string {
  const atStage1 = stored?.status === Status.Contested && stored.contestStage === ContestStage.Stage1;
  return atStage1 ? ` (${formatUtc(stored.contestEndsAt)})` : "";
}

const TO_THE_ADMIN =
  "the re-read closes and the admin has 48 hours to confirm or void the stored result, never to invert it (with no decision by then, it pays out as stored)";

/**
 * The campaigns `earlier` opens a contest on (`team_open_contest` with byte 1), so the instructions after them in the
 * same transaction meet a contested campaign (the "reader in doubt" pair: open, then send to the admin).
 */
export function contestsOpened(earlier: readonly Instruction[]): Set<string> {
  const opens = (ix: Instruction) =>
    ix.programAddress === PROGRAM_ID && ix.data?.length === 2 && ix.data[0] === TEAM_OPEN_CONTEST_DISCRIMINATOR;
  const opened = earlier.filter((ix) => opens(ix) && ix.data![1] === ContestStage.Stage1);
  return new Set(opened.flatMap((ix) => (ix.accounts?.[2] ? [ix.accounts[2].address] : [])));
}

/** Why the program refuses `stage` on the campaign as the screen read it, or "" when it fits or was not read. */
function contestRefusal(stage: number, stored: Campaign | undefined, openedEarlier: boolean): string {
  if (openedEarlier) {
    const why = "an opening earlier in this transaction contests it (ContestAlreadyOpen)";
    return stage === ContestStage.Stage1 ? `, which the program refuses: ${why}` : "";
  }
  if (stored === undefined) return "";
  const contested = stored.status === Status.Contested;
  if (stage === ContestStage.Stage1) {
    return contested ? ", which the program refuses: the campaign is contested already (ContestAlreadyOpen)" : "";
  }
  if (!contested) return ", which the program refuses: the campaign is not contested (NotContested)";
  if (stored.contestStage !== ContestStage.Stage1) {
    return ", which the program refuses: it is at stage 2 already (WrongContestStage)";
  }
  return "";
}

/**
 * `team_open_contest(stage)`, in words, the act named from the signed byte (the second review's S1), never from the
 * screen's read of the campaign: byte 1 opens a contest (stage 1, 24 hours), byte 2 sends one to the admin (stage 2,
 * 48 hours), any other byte is refused. The read only adds the refusal the program will give, and stage 1's deadline;
 * an opening earlier in the same transaction (`openedEarlier`) stands for the read.
 */
export function contestOpenText(
  campaign: string | undefined,
  stage: number,
  stored?: Campaign,
  openedEarlier = false,
): string {
  const refused = contestRefusal(stage, stored, openedEarlier);
  const deadline = openedEarlier ? ", 24 hours after the opening earlier in this transaction" : stage1Deadline(stored);
  if (stage === ContestStage.Stage1) {
    return `Contest the result of campaign ${campaign} (stage 1, 24 hours)${refused}: its payout pauses until the reading is run again (the same reading pays out as stored, but only after stage 1's 24 hours, during which a team key may send the contest to the admin; a different one gives the admin 48 hours to confirm or void, never to invert)`;
  }
  if (stage === ContestStage.Stage2) {
    return `Send the contest of campaign ${campaign} to the admin (stage 2, 48 hours)${refused}: only a contest at stage 1, before stage 1's deadline${deadline}, from which the program refuses it (ContestDeadlinePassed); ${TO_THE_ADMIN}`;
  }
  return `Contest campaign ${campaign} with stage byte ${stage}, which the program refuses (BadInstructionData): the byte is 1 (open) or 2 (send to the admin)`;
}

/**
 * A contest's re-read, in words: a matching reading pays only from stage 1's deadline on (D2), dated when the screen
 * read the campaign; a proof is named only when one is offered (the program's own address offers none).
 */
export function rereadText(campaign: string | undefined, a: Slots, stored?: Campaign): string {
  const proof =
    a.proofAccount.address === PROGRAM_ID
      ? ""
      : `, with ${a.proofAccount.address} offered as proof (a proof the reader refuses refuses the re-read)`;
  return `Run the reading of contested campaign ${campaign} again from ${a.metricAccount.address}${proof}: the same result pays out as stored, but only from stage 1's deadline on${stage1Deadline(stored)}, 24 hours after the contest opened (before it the program refuses the re-read, RereadBeforeTimelock); a different one opens stage 2, where the admin may confirm or void for 48 hours (counted from stage 1's deadline once that has passed)`;
}
