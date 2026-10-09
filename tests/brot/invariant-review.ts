/**
 * Purpose: the randomized test's review operations: the price touch and the price-proof resolution, the
 *          window (confirm, void, contest) and the snapshot that ends it (TP sections 3.4.6, 3.4.7, 3.4.16).
 * Version: 0.0.1
 * Sprint:  04 (contract freeze, lane E)
 */
import { BTC_PRICE } from "./flows";
import {
  isTeamReason,
  PROOF_DELAY,
  prizeSettledAtSnapshot,
  SIX_HOURS,
  snapshotOf,
  type ModelCampaign,
} from "./invariant-model";
import * as I from "./instructions";
import {
  finalizeCampaignIx,
  teamConfirmResultIx,
  teamOpenContestIx,
  teamVoidCampaignIx,
} from "./instructions-settlement";
import type { BrotErrorName } from "./errors";
import { clock, refreshBase, setBtc, type Harness, type Plan } from "./invariant-harness";
import * as P from "./program";

export const REVIEW_KINDS = [
  "resolveYes",
  "resolveNo",
  "resolveStale",
  "confirm",
  "void",
  "contest",
  "finalize",
] as const;

export type ReviewOp =
  | { k: "resolveYes"; c: number; back: bigint }
  | { k: "resolveNo"; c: number }
  | { k: "resolveStale"; c: number }
  | { k: "confirm"; c: number; member: number }
  | { k: "void"; c: number; member: number; reason: number }
  | { k: "contest"; c: number; member: number }
  | { k: "finalize"; c: number };

/** The YES price: the target crossed by 1%, with no confidence band. */
const TOUCH = (BTC_PRICE * 11n * 101n) / (10n * 100n);
const NOTE_HASH = new Uint8Array(32).fill(7);
const BLANK = new Map<string, bigint>();

/** The snapshot of a reviewed campaign: taken by `team_confirm_result`, `team_void_campaign` and `finalize`. */
function takeSnapshot(c: ModelCampaign) {
  c.snapshot = snapshotOf(c);
  c.phase = "Settling";
  c.counted = false;
  c.prizeSettled = prizeSettledAtSnapshot(c);
}

export const inWindow = (c: ModelCampaign, t: bigint) => t < c.reviewEndsAt;

/** Plans one settlement operation; the refusal follows the program's order of checks. */
export async function planReview(h: Harness, op: ReviewOp): Promise<Plan> {
  const t = clock(h);
  const c = h.camps[op.c];
  const { campaign } = h.addrs[op.c];
  const config = await P.configPda();
  switch (op.k) {
    case "resolveYes": {
      const back = op.back < t - c.opensAt ? op.back : t - c.opensAt;
      const publish = t - back;
      setBtc(h.w, TOUCH, publish);
      return {
        ixs: [I.resolveCampaignIx(campaign, P.BTC_USD_ACCOUNT, P.BTC_USD_ACCOUNT)],
        error: c.phase === "Open" ? undefined : "IllegalTransition",
        deltas: BLANK,
        after: () => refreshBase(h.w),
        apply: () => {
          c.phase = "InReview";
          c.outcome = "Yes";
          c.publish = publish;
          c.reviewEndsAt = t + SIX_HOURS;
        },
      };
    }
    case "resolveNo":
    case "resolveStale": {
      const stale = op.k === "resolveStale";
      if (stale) setBtc(h.w, BTC_PRICE, c.deadline - 700n);
      else refreshBase(h.w);
      const error: BrotErrorName | undefined =
        c.phase !== "Open" ? "IllegalTransition" : t < c.deadline + PROOF_DELAY ? "NotResolvableYet" : undefined;
      return {
        ixs: [I.resolveCampaignIx(campaign, P.BTC_USD_ACCOUNT, P.BTC_USD_ACCOUNT)],
        error,
        deltas: BLANK,
        after: () => refreshBase(h.w),
        apply: () => {
          c.phase = "InReview";
          c.outcome = stale ? "Void" : "No";
          c.voidReason = stale ? 3 : 0;
          c.reviewEndsAt = t + SIX_HOURS;
        },
      };
    }
    case "confirm":
      return {
        ixs: [teamConfirmResultIx(h.team[op.member], config, campaign)],
        error: c.phase !== "InReview" ? "TeamKeyOutsideReview" : !inWindow(c, t) ? "OutsideReviewWindow" : undefined,
        deltas: BLANK,
        apply: () => takeSnapshot(c),
      };
    case "void":
      return {
        ixs: [teamVoidCampaignIx(h.team[op.member], config, campaign, { reason: op.reason, noteHash: NOTE_HASH })],
        error:
          c.phase !== "InReview"
            ? "TeamKeyOutsideReview"
            : !inWindow(c, t)
              ? "OutsideReviewWindow"
              : !isTeamReason(op.reason)
                ? "VoidReasonNotForTeam"
                : undefined,
        deltas: BLANK,
        apply: () => {
          c.outcome = "Void";
          c.voidReason = op.reason;
          takeSnapshot(c);
        },
      };
    case "contest":
      return {
        ixs: [teamOpenContestIx(h.team[op.member], config, campaign)],
        error: c.phase !== "InReview" ? "TeamKeyOutsideReview" : !inWindow(c, t) ? "OutsideReviewWindow" : undefined,
        deltas: BLANK,
        apply: () => {
          c.phase = "Contested";
        },
      };
    case "finalize":
      return {
        ixs: [finalizeCampaignIx(campaign, config)],
        error: c.phase !== "InReview" ? "IllegalTransition" : inWindow(c, t) ? "OutsideReviewWindow" : undefined,
        deltas: BLANK,
        apply: () => takeSnapshot(c),
      };
  }
}
