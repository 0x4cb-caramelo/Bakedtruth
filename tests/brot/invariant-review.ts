/**
 * Purpose: the randomized test's review operations: the price touch and the price-proof resolution (YES, NO, the
 *          stale-feed void) with the result each stores, and the dispatch of the window's steps and finalize
 *          (invariant-window.ts) (TP sections 3.4.6, 3.4.7). The contest's own steps are in invariant-contest.ts.
 * Version: 0.1.0 (Sprint 14: the stored result, the tally-started rule, the proof window is `t <= D + 60`)
 * Sprint:  04 (contract freeze, lane E); 14 (lane INV14)
 */
import { BTC_PRICE } from "./flows";
import { inProofWindow, SIX_HOURS } from "./invariant-model";
import * as I from "./instructions";
import type { BrotErrorName } from "./errors";
import { clock, refreshBase, setBtc, type Harness, type Plan } from "./invariant-harness";
import { planWindow } from "./invariant-window";
import * as P from "./program";

export const REVIEW_KINDS = [
  "resolveYes",
  "resolveNo",
  "resolveStale",
  "tally",
  "confirm",
  "void",
  "finalize",
] as const;

export type ReviewOp =
  | { k: "resolveYes"; c: number; back: bigint }
  | { k: "resolveNo"; c: number }
  | { k: "resolveStale"; c: number }
  | { k: "tally"; c: number; baker: number }
  /** `tally`: the keeper's tallies of every baker not yet tallied go first, in the same transaction. */
  | { k: "confirm"; c: number; member: number; tally?: boolean }
  | { k: "void"; c: number; member: number; reason: number; tally?: boolean }
  | { k: "finalize"; c: number };

/** The YES price: the target crossed by 1%, with no confidence band. */
export const TOUCH = (BTC_PRICE * 11n * 101n) / (10n * 100n);
/** A stale feed: its last update this long before the deadline, past `max(max_age, 600 s)` (StaleFeed). */
export const STALE_BEFORE = 700n;
/** A proof's age bound and the clock lead a publish time may have (readers/price_touch/rules.rs). */
export const PROOF_AGE = 60n;
const BLANK = new Map<string, bigint>();

/** Plans one review operation: a resolution here, any other step in invariant-window.ts. */
export async function planReview(h: Harness, op: ReviewOp): Promise<Plan> {
  const t = clock(h);
  const c = h.camps[op.c];
  const { campaign } = h.addrs[op.c];
  // In review, the cut-off moves only for a YES price result before any tally starts (2026-10-09); else it is
  // refused before the reader runs.
  const movable = c.outcome === "Yes" && c.tallied.size === 0;
  switch (op.k) {
    case "resolveYes": {
      const back = op.back < t - c.opensAt ? op.back : t - c.opensAt;
      const publish = t - back;
      setBtc(h.w, TOUCH, publish);
      // In review, only an earlier YES proof moves the cut-off back (decision of 2026-10-09); the window stays.
      const moves = c.phase === "InReview" && movable && c.publish !== null && publish < c.publish;
      const error: BrotErrorName | undefined =
        c.phase === "Open" || moves ? undefined : c.phase === "InReview" ? "CutoffNotMovable" : "CampaignNotOpen";
      return {
        ixs: [I.resolveCampaignIx(campaign, P.BTC_USD_ACCOUNT, P.BTC_USD_ACCOUNT)],
        error,
        deltas: BLANK,
        events: ["CampaignResolved"],
        after: () => refreshBase(h.w),
        apply: () => {
          c.seq += 1n;
          c.publish = publish;
          c.storedPublish = publish;
          if (c.phase === "InReview") return;
          c.phase = "InReview";
          c.outcome = "Yes";
          c.observed = TOUCH;
          c.reviewEndsAt = t + SIX_HOURS;
        },
      };
    }
    case "resolveNo":
    case "resolveStale": {
      const stale = op.k === "resolveStale";
      const staleAt = c.deadline - STALE_BEFORE;
      if (stale) setBtc(h.w, BTC_PRICE, staleAt);
      else refreshBase(h.w);
      // Inside the proof window a NO offers no proof (it waits); the stale account offered is read as a YES proof:
      // too old or too far ahead, `ProofStale`; fresh, below the target, `ProofDoesNotTouch`.
      const fresh = t - staleAt <= PROOF_AGE && staleAt - t <= PROOF_AGE;
      const reader: BrotErrorName | undefined = !inProofWindow(c, t)
        ? undefined
        : !stale
          ? "NotResolvableYet"
          : fresh
            ? "ProofDoesNotTouch"
            : "ProofStale";
      // In review the reader runs only for a movable YES, and a NO or a void it reads is then refused as a re-proof.
      const error: BrotErrorName | undefined =
        c.phase === "Open"
          ? reader
          : c.phase === "InReview"
            ? movable
              ? (reader ?? "CutoffNotMovable")
              : "CutoffNotMovable"
            : "CampaignNotOpen";
      return {
        // A NO offers no proof: the program's own address in the proof slot. A stale case offers the stale account.
        ixs: [I.resolveCampaignIx(campaign, P.BTC_USD_ACCOUNT, stale ? P.BTC_USD_ACCOUNT : P.PROGRAM_ID)],
        error,
        deltas: BLANK,
        events: ["CampaignResolved"],
        after: () => refreshBase(h.w),
        apply: () => {
          c.seq += 1n;
          c.phase = "InReview";
          c.outcome = stale ? "Void" : "No";
          c.voidReason = stale ? 3 : 0;
          c.observed = BTC_PRICE;
          c.storedPublish = stale ? staleAt : t - 5n;
          c.reviewEndsAt = t + SIX_HOURS;
        },
      };
    }
    default:
      return planWindow(h, op);
  }
}
