/**
 * Purpose: what the summary says for a contest's opening or escalation, its re-read and the admin's stage-2 decision
 *          (Sprint 14), from the bytes signed and, when the screen read it, the campaign: which of the team's two acts
 *          the call is (D2), when a matching re-read may pay, the decision, its reason, and where the 10% opening fee
 *          goes. A house-failure void refunds the fee only once an entry landed (with no entry, founder answer 8 keeps
 *          it): the summary states the branch the program will take when it knows the campaign, and the rule when it
 *          does not (review fix F6). A re-read names a proof only when one is offered (review fix F9).
 * Version: 0.2.0 (the founder's answer to D2: stage 1's 24 hours and the team's escalation)
 * Sprint:  14 (lane L14B, review fixes F6 and F9; D2)
 */
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
 * `team_open_contest`, in words (D2): on a result in review it opens a contest; on a contest still at stage 1, before
 * stage 1's deadline, it sends the contest to stage 2. The branch is named when the screen read the campaign, and
 * both are when it did not.
 */
export function contestOpenText(campaign: string | undefined, stored?: Campaign): string {
  if (stored?.status === Status.Contested) {
    if (stored.contestStage !== ContestStage.Stage1) {
      return `Send the contest of campaign ${campaign} to stage 2, which the program refuses: it is at stage 2 already (WrongContestStage)`;
    }
    return `Send the contest of campaign ${campaign} to stage 2 before stage 1's deadline${stage1Deadline(stored)}, from which the program refuses it (ContestDeadlinePassed): ${TO_THE_ADMIN}`;
  }
  const open = `Contest the result of campaign ${campaign}: its payout pauses until the reading is run again (the same reading pays out as stored, but only after stage 1's 24 hours, during which a team key may send the contest to stage 2; a different one gives the admin 48 hours to confirm or void, never to invert)`;
  if (stored !== undefined) return open;
  return `${open}; on a contest still at stage 1, before its deadline, the same call sends it to stage 2: ${TO_THE_ADMIN}`;
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
