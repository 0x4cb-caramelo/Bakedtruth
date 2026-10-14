/**
 * Purpose: the randomized test's contest (Sprint 14; TP section 3.4.7): a team key opens it inside the review window
 *          (stage 1, 24 hours, byte 1) and, until stage 1's deadline, may send it to stage 2 (byte 2: D2; the wrong
 *          byte for the campaign is refused, S1); any wallet
 *          re-reads the campaign (the same reading pays with the stored result from stage 1's deadline on, a different
 *          one opens stage 2 for 48 hours from the re-read or from stage 1's deadline if that passed, a proof the reader
 *          refuses refuses the re-read, and no re-read writes a result), and the admin confirms or voids before stage
 *          2's deadline, never inverting. Each with the program's order of refusals; none moves a lamport (I1, I15).
 *          The lapse of either stage is finalize's (invariant-window.ts).
 * Version: 0.3.0 (the act in its byte, the second review's S1; the founder's answer to D2; review fixes F3, F4)
 * Sprint:  14 (lane INV14)
 */
import { planDecide, type DecideOp } from "./invariant-decide";
import { inProofWindow, type Outcome } from "./invariant-model";
import { priceReading, proofRefusal, rereadAccount, type RereadVariant } from "./invariant-reader";
import { STAGE2_SECONDS, stage2EndsAt, takeSnapshot, tallyFirst } from "./invariant-window";
import { rereadCampaignIx } from "./instructions-14-15";
import { teamOpenContestIx } from "./instructions-settlement";
import type { BrotErrorName } from "./errors";
import { clock, expectFields, refreshBase, setBtc, type Harness, type Plan } from "./invariant-harness";
import * as P from "./program";

export const CONTEST_KINDS = ["contest", "reread", "decide"] as const;

export type ContestOp =
  /**
   * `stage`, the signed byte (the second review's S1): 1 opens, 2 sends a stage-1 contest to the admin, any other is
   * refused; `member` −1: the admin signs, who holds no team key; `tally`: the keeper's tallies go first, same transaction.
   */
  | { k: "contest"; c: number; stage: number; member: number; tally?: boolean }
  /** The account the re-read finds: as resolution read it, moved, or (`none`) no proof offered. */
  | { k: "reread"; c: number; variant: RereadVariant; back: bigint }
  /** The admin's decision at stage 2 (invariant-decide.ts). */
  | DecideOp;

/** Stage 1's 24 hours (constants.rs; D2): a matching re-read pays only after them, the team escalates until then. */
export const STAGE1_SECONDS = 86_400n;

/** Plans one contest step; the refusal follows the program's order of checks. */
export async function planContest(h: Harness, op: ContestOp): Promise<Plan> {
  const t = clock(h);
  const c = h.camps[op.c];
  const { campaign, vault } = h.addrs[op.c];
  const config = await P.configPda();
  // No contest step moves a lamport: the vault and the fee vault are listed so a move fails the run.
  const still = new Map<string, bigint>([
    [vault, 0n],
    [h.feeVault, 0n],
  ]);
  switch (op.k) {
    case "contest": {
      const signer = op.member < 0 ? h.admin : h.team[op.member];
      const deltas = new Map(still);
      const first = await tallyFirst(h, op.c, op.tally ?? false, deltas);
      // The act is the signed byte (S1), never the status: the byte, the team key, then the act against the campaign
      // (a retried opening is refused, never an escalation), then the act's own rules. Byte 2 is the escalation (D2).
      const escalate = op.stage === 2;
      const error: BrotErrorName | undefined =
        op.stage !== 1 && op.stage !== 2
          ? "BadInstructionData"
          : op.member < 0
            ? "NotTeamMember"
            : escalate !== (c.phase === "Contested")
              ? escalate
                ? "NotContested"
                : "ContestAlreadyOpen"
              : escalate
                ? c.stage !== 1
                  ? "WrongContestStage"
                  : t >= c.contestEndsAt
                    ? "ContestDeadlinePassed"
                    : undefined
                : c.phase !== "InReview"
                  ? "TeamKeyOutsideReview"
                  : t >= c.reviewEndsAt
                    ? "ContestOutsideReview"
                    : first.left > 0
                      ? "NotTallied"
                      : undefined;
      const stage = escalate ? 2 : 1;
      const ends = t + (escalate ? STAGE2_SECONDS : STAGE1_SECONDS);
      return {
        ixs: [...first.ixs, teamOpenContestIx(signer, config, campaign, op.stage)],
        error,
        deltas,
        label: escalate ? "escalate" : undefined,
        events: [...first.events, "ContestOpened"],
        verify: (events) =>
          expectFields(events[events.length - 1], {
            contest_stage: [stage, "contestStage"],
            contest_ends_at: [ends, "contestEndsAt"],
          }),
        apply: () => {
          first.tallied();
          c.seq += 1n;
          c.phase = "Contested";
          c.stage = stage;
          c.contestEndsAt = ends;
        },
      };
    }
    case "reread": {
      const account = rereadAccount(c, t, op);
      setBtc(h.w, account.price, account.publish);
      const offered = op.variant !== "none";
      // Review fix F4: a proof offered inside the window and refused by the reader refuses the re-read.
      const refused = offered && inProofWindow(c, t) ? proofRefusal(c, t, account) : null;
      const reading = priceReading(c, t, account, offered);
      const same =
        reading !== null &&
        reading.outcome === c.outcome &&
        reading.voidReason === c.voidReason &&
        reading.observed === c.observed;
      // Review fix F3: stage 2 counts from stage 1's deadline when the re-read comes after it.
      const ends = same ? c.contestEndsAt : stage2EndsAt(c, t);
      const OUTCOMES: Outcome[] = ["Unresolved", "Yes", "No", "Void"];
      return {
        ixs: [rereadCampaignIx(campaign, config, P.BTC_USD_ACCOUNT, offered ? P.BTC_USD_ACCOUNT : P.PROGRAM_ID)],
        // Last, the program's `reread_act`: a matching reading before stage 1's deadline is refused (D2).
        error:
          c.phase !== "Contested"
            ? "NotContested"
            : c.stage !== 1
              ? "WrongContestStage"
              : (refused ?? (same && t < c.contestEndsAt ? "RereadBeforeTimelock" : undefined)),
        deltas: still,
        label: same ? "reread-pay" : "reread-escalate",
        exit: same ? op.c : undefined,
        events: same ? ["CampaignReread", "CampaignFinalized"] : ["CampaignReread"],
        // The event reports the reading run now (nothing decided: Unresolved and zero) and the stage after it.
        verify: ([e]) =>
          expectFields(e, {
            same: [same ? 1 : 0],
            outcome: [OUTCOMES.indexOf(reading?.outcome ?? "Unresolved")],
            void_reason: [reading?.voidReason ?? 0, "voidReason"],
            observed_value: [reading?.observed ?? 0n, "observedValue"],
            contest_stage: [same ? 1 : 2, "contestStage"],
            contest_ends_at: [ends, "contestEndsAt"],
          }),
        after: () => refreshBase(h.w),
        apply: () => {
          if (same) {
            c.seq += 2n;
            takeSnapshot(c);
            return;
          }
          c.seq += 1n;
          c.stage = 2;
          c.contestEndsAt = ends;
        },
      };
    }
    case "decide":
      return planDecide(h, op, c, t, still);
  }
}
