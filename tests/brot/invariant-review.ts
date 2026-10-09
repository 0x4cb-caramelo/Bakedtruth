/**
 * Purpose: the randomized test's review operations: the price touch and the price-proof resolution, the
 *          window (confirm, void, contest) and the snapshot that ends it (TP sections 3.4.6, 3.4.7, 3.4.16).
 * Version: 0.0.1
 * Sprint:  04 (contract freeze, lane E)
 */
import { BTC_PRICE } from "./flows";
import { isTeamReason, PROOF_DELAY, shareDue, SIX_HOURS, snapshotOf, type ModelCampaign } from "./invariant-model";
import * as I from "./instructions";
import {
  finalizeCampaignIx,
  tallyLateJoinsIx,
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
  // Finalize marks the creator share settled when none is due (closure fix): close never waits for it.
  c.shareSettled = shareDue(c) === 0n;
  // A campaign with no entry has nothing to settle: finalize moves it straight to Settled (decision of 2026-10-09).
  c.phase = new Set(c.joins.map((j) => j.baker)).size === 0 ? "Settled" : "Settling";
  c.counted = false;
  // The prize step sets the flag, also for a Split (it pays nothing then): close waits for it (settle_prize).
  c.prizeSettled = false;
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
      // In review, only an earlier YES proof moves the cut-off back (decision of 2026-10-09); the window stays.
      const moves = c.phase === "InReview" && c.outcome === "Yes" && c.publish !== null && publish < c.publish;
      const error: BrotErrorName | undefined =
        c.phase === "Open" || moves ? undefined : c.phase === "InReview" ? "CutoffNotMovable" : "CampaignNotOpen";
      return {
        ixs: [I.resolveCampaignIx(campaign, P.BTC_USD_ACCOUNT, P.BTC_USD_ACCOUNT)],
        error,
        deltas: BLANK,
        after: () => refreshBase(h.w),
        apply: () => {
          if (c.phase === "InReview") {
            c.publish = publish;
            return;
          }
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
      // An offered proof that is too old is refused as stale; with no proof the window is simply not over.
      const reader: BrotErrorName | undefined =
        t < c.deadline + PROOF_DELAY ? (stale ? "ProofStale" : "NotResolvableYet") : undefined;
      // In review, a NO (or a void) is decided by the reader first, then refused as a re-proof, unless the outcome is
      // not a YES: the program's order (decision of 2026-10-09). A campaign in review with a YES reads the same way.
      const error: BrotErrorName | undefined =
        c.phase === "Open"
          ? reader
          : c.phase === "InReview"
            ? c.outcome === "Yes"
              ? (reader ?? "CutoffNotMovable")
              : "CutoffNotMovable"
            : "CampaignNotOpen";
      return {
        // A NO offers no proof: the program's own address in the proof slot. A stale case offers the stale account.
        ixs: [I.resolveCampaignIx(campaign, P.BTC_USD_ACCOUNT, stale ? P.BTC_USD_ACCOUNT : P.PROGRAM_ID)],
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
        // The program's order: the reason, the team key, the window, then the outcome (decision of 2026-10-09:
        // a team key voids only an automatic void, so a YES or NO is refused).
        error: !isTeamReason(op.reason)
          ? "VoidReasonNotForTeam"
          : c.phase !== "InReview"
            ? "TeamKeyOutsideReview"
            : !inWindow(c, t)
              ? "OutsideReviewWindow"
              : c.outcome !== "Void"
                ? "TeamVoidNotAutomatic"
                : undefined,
        deltas: BLANK,
        apply: () => {
          c.voidReason = op.reason;
          takeSnapshot(c);
        },
      };
    case "contest":
      return {
        ixs: [teamOpenContestIx(h.team[op.member], config, campaign)],
        // Disabled until Sprint 14 (decision of 2026-10-09): every contest is refused and changes nothing.
        error: "ContestExitDisabled",
        deltas: BLANK,
        apply: () => undefined,
      };
    case "finalize": {
      const error: BrotErrorName | undefined =
        c.phase !== "InReview" ? "CampaignNotInReview" : t < c.reviewEndsAt ? "ReviewNotEnded" : undefined;
      // Finalize needs every join tallied (amendment 2026-10-09): when it will succeed, the same transaction
      // tallies each baker's joins first. Each closed Join returns its rent to its baker.
      const ixs = [];
      const deltas = new Map<string, bigint>();
      if (error === undefined) {
        for (const baker of h.bakers) {
          const mine = c.joins.filter((j) => j.baker === baker.address);
          if (mine.length === 0) continue;
          const entry = await P.entryPda(campaign, baker.address);
          const joins = await Promise.all(mine.map((_, index) => P.joinPda(campaign, baker.address, index)));
          ixs.push(tallyLateJoinsIx(baker.address, campaign, entry, joins));
          // The tally moves each Join's rent into the Entry (decision of 2026-10-09): no wallet is paid here.
        }
      }
      return {
        ixs: [...ixs, finalizeCampaignIx(campaign, config)],
        error,
        deltas,
        apply: () => takeSnapshot(c),
      };
    }
  }
}
