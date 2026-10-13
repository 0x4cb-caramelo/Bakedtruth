/**
 * Purpose: the randomized test's stage 2 of a contest (Sprint 14; TP section 3.4.7): the admin confirms or voids before
 *          stage 2's deadline, never inverting, with the program's order of refusals (the arguments, the admin, the
 *          stage, its deadline); it moves no lamport (I1, I15). Split out of invariant-contest.ts for D2.
 * Version: 0.1.0
 * Sprint:  14 (lane INV14; lane L14B, D2: the split)
 */
import { adminDecideContestIx } from "./instructions-14-15";
import type { BrotErrorName } from "./errors";
import { expectFields, type Harness, type Plan } from "./invariant-harness";
import { isTeamReason, type ModelCampaign } from "./invariant-model";
import { takeSnapshot } from "./invariant-window";
import * as P from "./program";

/** Raw bytes, so the refusals of the arguments are drawn too (a decision of 2, a reason of 6). */
export type DecideOp = { k: "decide"; c: number; decision: number; reason: number; signer: "admin" | "team" };

const ADMIN_NOTE = 9;

/** `admin_decide_contest`: the arguments, the admin, then the stage and its deadline; Confirm keeps the result. */
export async function planDecide(
  h: Harness,
  op: DecideOp,
  c: ModelCampaign,
  t: bigint,
  still: Map<string, bigint>,
): Promise<Plan> {
  const { decision, reason } = op;
  const error: BrotErrorName | undefined =
    decision > 1
      ? "InvalidContestDecision"
      : reason > 5
        ? "BadInstructionData"
        : decision === 0 && reason !== 0
          ? "ConfirmWithVoidReason"
          : decision === 1 && !isTeamReason(reason)
            ? "VoidReasonNotForTeam"
            : op.signer !== "admin"
              ? "NotAdmin"
              : c.phase !== "Contested"
                ? "NotContested"
                : c.stage !== 2
                  ? "WrongContestStage"
                  : t >= c.contestEndsAt
                    ? "ContestDeadlinePassed"
                    : undefined;
  const signer = op.signer === "admin" ? h.admin : h.team[0];
  const noteHash = new Uint8Array(32).fill(ADMIN_NOTE);
  const args = { decision, voidReason: reason, noteHash };
  return {
    ixs: [adminDecideContestIx(signer, await P.configPda(), h.addrs[op.c].campaign, args)],
    error,
    deltas: still,
    label: decision === 1 ? "decide-void" : "decide-confirm",
    exit: op.c,
    events: ["ContestClosed", "CampaignFinalized"],
    verify: ([e]) => expectFields(e, { decision: [decision], void_reason: [reason, "voidReason"] }),
    apply: () => {
      c.seq += 2n;
      // Never inverted: Confirm keeps the stored outcome; Void records Void with the admin's reason and note.
      if (decision === 1) {
        c.outcome = "Void";
        c.voidReason = reason;
        c.note = ADMIN_NOTE;
      }
      takeSnapshot(c);
    },
  };
}
