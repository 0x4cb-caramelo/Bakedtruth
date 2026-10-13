/**
 * Purpose: the randomized test's contest (Sprint 14; TP section 3.4.7): a team key opens it inside the review window
 *          (stage 1), any wallet re-reads the campaign (the same reading pays with the stored result, a different one
 *          opens stage 2 for 48 hours from the re-read or from stage 1's deadline if that passed, a proof the reader
 *          refuses refuses the re-read, and no re-read writes a result), and the admin confirms or voids before stage
 *          2's deadline, never inverting. Each with the program's order of refusals; none moves a lamport (I1, I15).
 *          The lapse of either stage is finalize's (invariant-window.ts).
 * Version: 0.1.1 (review fixes F3 and F4, lane L14B)
 * Sprint:  14 (lane INV14)
 */
import { inProofWindow, isTeamReason, type ModelCampaign, type Outcome } from "./invariant-model";
import { priceReading, proofRefusal, rereadAccount, type RereadVariant } from "./invariant-reader";
import { stage2EndsAt, takeSnapshot, tallyFirst } from "./invariant-window";
import { adminDecideContestIx, rereadCampaignIx } from "./instructions-14-15";
import { teamOpenContestIx } from "./instructions-settlement";
import type { BrotErrorName } from "./errors";
import { clock, refreshBase, setBtc, type Harness, type Plan } from "./invariant-harness";
import * as P from "./program";
import type { Event } from "./setup";

export const CONTEST_KINDS = ["contest", "reread", "decide"] as const;

export type ContestOp =
  /** `member` −1: the admin signs, who holds no team key; `tally`: the keeper's tallies go first, same transaction. */
  | { k: "contest"; c: number; member: number; tally?: boolean }
  /** The account the re-read finds: as resolution read it, moved, or (`none`) no proof offered. */
  | { k: "reread"; c: number; variant: RereadVariant; back: bigint }
  /** Raw bytes, so the refusals of the arguments are drawn too (a decision of 2, a reason of 6). */
  | { k: "decide"; c: number; decision: number; reason: number; signer: "admin" | "team" };

export const STAGE1_SECONDS = 3_600n;
const ADMIN_NOTE = 9;

/** The event field `snake` (the kit's layout) or `camel` (the SDK's decoder), whichever the event carries. */
export const field = (e: Event, snake: string, camel = snake) => e.data[snake] ?? e.data[camel];

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
      const error: BrotErrorName | undefined =
        op.member < 0
          ? "NotTeamMember"
          : c.phase !== "InReview"
            ? "TeamKeyOutsideReview"
            : t >= c.reviewEndsAt
              ? "ContestOutsideReview"
              : first.left > 0
                ? "NotTallied"
                : undefined;
      return {
        ixs: [...first.ixs, teamOpenContestIx(signer, config, campaign)],
        error,
        deltas,
        events: [...first.events, "ContestOpened"],
        verify: (events) =>
          expectFields(events[events.length - 1], {
            contest_stage: [1, "contestStage"],
            contest_ends_at: [t + STAGE1_SECONDS, "contestEndsAt"],
          }),
        apply: () => {
          first.tallied();
          c.seq += 1n;
          c.phase = "Contested";
          c.stage = 1;
          c.contestEndsAt = t + STAGE1_SECONDS;
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
        error: c.phase !== "Contested" ? "NotContested" : c.stage !== 1 ? "WrongContestStage" : (refused ?? undefined),
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

/** `admin_decide_contest`: the arguments, the admin, then the stage and its deadline; Confirm keeps the result. */
async function planDecide(
  h: Harness,
  op: Extract<ContestOp, { k: "decide" }>,
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

/** Throws unless each field of the event holds its expected value (`[value, camelCase name]`). */
function expectFields(e: Event, want: Record<string, [unknown, string?]>) {
  for (const [snake, [value, camel]] of Object.entries(want)) {
    const have = field(e, snake, camel);
    const equal = typeof have === "boolean" ? Number(have) === value : have === value;
    if (!equal) throw new Error(`${e.name}.${snake} is ${have}, the model expects ${value}`);
  }
}
