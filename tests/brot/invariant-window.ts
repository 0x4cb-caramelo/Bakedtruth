/**
 * Purpose: the randomized test's review window and its exits: the late-join tally, the team's confirm and void, and
 *          finalize, after the window or once a contest has lapsed (TP sections 3.4.3, 3.4.7, 3.4.16); the
 *          snapshot every exit takes. Split out of invariant-review.ts, which resolves and dispatches here.
 * Version: 0.1.1 (review fix F3: an unread stage 1 lapses too; stage 2 counts from stage 1's deadline at the latest)
 * Sprint:  04 (contract freeze, lane E); 14 (lane INV14: the tally, NotTallied, the lapse; lane L14B: F3)
 */
import { type Address } from "@solana/kit";

import { bakersOf, isTeamReason, snapshotOf, untallied, type ModelCampaign } from "./invariant-model";
import { shareDue } from "./invariant-payouts";
import {
  finalizeCampaignIx,
  tallyLateJoinsIx,
  teamConfirmResultIx,
  teamVoidCampaignIx,
} from "./instructions-settlement";
import type { BrotErrorName } from "./errors";
import { clock, entryOf, type Harness, type Plan } from "./invariant-harness";
import type { ReviewOp } from "./invariant-review";
import * as P from "./program";

const TEAM_NOTE = 7;

/** The snapshot of a reviewed or contested campaign, by any of its exits (confirm, void, finalize, re-read, decide). */
export function takeSnapshot(c: ModelCampaign) {
  c.snapshot = snapshotOf(c);
  // Finalize marks the creator share settled when none is due (closure fix): close never waits for it.
  c.shareSettled = shareDue(c) === 0n;
  // A campaign with no entry has nothing to settle: it goes straight to Settled (decision of 2026-10-09).
  c.phase = bakersOf(c).length === 0 ? "Settled" : "Settling";
  c.counted = false;
  // The prize step sets the flag, also for a Split (it pays nothing then): close waits for it (settle_prize).
  c.prizeSettled = false;
}

export const inWindow = (c: ModelCampaign, t: bigint) => t < c.reviewEndsAt;

/** Stage 2's 48 hours (constants.rs): from `min(re-read, stage 1's deadline)` (review fix F3, the 78-hour bound). */
export const STAGE2_SECONDS = 48n * 3_600n;
export const stage2EndsAt = (c: ModelCampaign, t: bigint) =>
  (t < c.contestEndsAt ? t : c.contestEndsAt) + STAGE2_SECONDS;
/** When a contest lapses with its stored result: stage 2 at its deadline, an unread stage 1 48 hours after its own. */
export const lapsesAt = (c: ModelCampaign) =>
  c.stage === 2 ? c.contestEndsAt : c.stage === 1 ? c.contestEndsAt + STAGE2_SECONDS : null;

/** The Join accounts a tally of `baker` closes, and the balance changes: their rent moves into the Entry. */
export async function tallyOf(h: Harness, index: number, baker: string, deltas: Map<string, bigint>) {
  const c = h.camps[index];
  const { campaign } = h.addrs[index];
  const joins = c.joins.filter((j) => j.baker === baker).map((j) => j.address as Address);
  const entry = await entryOf(h, campaign, baker);
  deltas.set(entry, (deltas.get(entry) ?? 0n) + BigInt(joins.length) * h.rent.join);
  for (const join of joins) deltas.set(join, -h.rent.join);
  return tallyLateJoinsIx(baker as Address, campaign, entry, joins);
}

/**
 * The tallies a step sends first in its own transaction when asked (`wanted`), as the keeper does before a confirm,
 * a void or a contest: every baker not yet tallied, and only in review (elsewhere the tally itself would refuse).
 * `left` is how many stay untallied, for the step's `NotTallied`.
 */
export async function tallyFirst(h: Harness, index: number, wanted: boolean, deltas: Map<string, bigint>) {
  const c = h.camps[index];
  const pending = wanted && c.phase === "InReview" ? untallied(c) : [];
  const ixs = [];
  for (const baker of pending) ixs.push(await tallyOf(h, index, baker, deltas));
  const tallied = () => {
    c.seq += BigInt(pending.length);
    for (const baker of pending) c.tallied.add(baker);
  };
  return { ixs, left: untallied(c).length - pending.length, events: pending.map(() => "LateTallied"), tallied };
}

/** Plans a step of the window (tally, confirm, void) or finalize; the refusal follows the program's order of checks. */
export async function planWindow(
  h: Harness,
  op: Extract<ReviewOp, { k: "tally" | "confirm" | "void" | "finalize" }>,
): Promise<Plan> {
  const t = clock(h);
  const c = h.camps[op.c];
  const { campaign } = h.addrs[op.c];
  const config = await P.configPda();
  switch (op.k) {
    case "tally": {
      // Any wallet, in review only, every outcome; the harness tallies a baker's joins all at once.
      const baker = h.bakers[op.baker].address;
      const deltas = new Map<string, bigint>();
      const ix = await tallyOf(h, op.c, baker, deltas);
      return {
        ixs: [ix],
        error: c.phase !== "InReview" ? "TallyNotReady" : c.tallied.has(baker) ? "EntryAlreadyTallied" : undefined,
        deltas,
        events: ["LateTallied"],
        apply: () => {
          c.seq += 1n;
          c.tallied.add(baker);
        },
      };
    }
    case "confirm": {
      const deltas = new Map<string, bigint>();
      const first = await tallyFirst(h, op.c, op.tally ?? false, deltas);
      return {
        ixs: [...first.ixs, teamConfirmResultIx(h.team[op.member], config, campaign)],
        // The window's rules, then the snapshot's: every entry tallied.
        error:
          c.phase !== "InReview"
            ? "TeamKeyOutsideReview"
            : !inWindow(c, t)
              ? "OutsideReviewWindow"
              : first.left > 0
                ? "NotTallied"
                : undefined,
        deltas,
        exit: op.c,
        events: [...first.events, "ResultConfirmed", "CampaignFinalized"],
        apply: () => {
          first.tallied();
          c.seq += 2n;
          takeSnapshot(c);
        },
      };
    }
    case "void": {
      const deltas = new Map<string, bigint>();
      const first = await tallyFirst(h, op.c, op.tally ?? false, deltas);
      const noteHash = new Uint8Array(32).fill(TEAM_NOTE);
      return {
        ixs: [...first.ixs, teamVoidCampaignIx(h.team[op.member], config, campaign, { reason: op.reason, noteHash })],
        // The program's order: the reason, the team key, the window, then the outcome (decision of 2026-10-09:
        // a team key voids only an automatic void, so a YES or NO is refused), then the snapshot's tally rule.
        error: !isTeamReason(op.reason)
          ? "VoidReasonNotForTeam"
          : c.phase !== "InReview"
            ? "TeamKeyOutsideReview"
            : !inWindow(c, t)
              ? "OutsideReviewWindow"
              : c.outcome !== "Void"
                ? "TeamVoidNotAutomatic"
                : first.left > 0
                  ? "NotTallied"
                  : undefined,
        deltas,
        exit: op.c,
        events: [...first.events, "CampaignVoided", "CampaignFinalized"],
        apply: () => {
          first.tallied();
          c.seq += 2n;
          c.voidReason = op.reason;
          c.note = TEAM_NOTE;
          takeSnapshot(c);
        },
      };
    }
    case "finalize":
      return planFinalize(h, op.c, t);
  }
}

/**
 * `finalize_campaign`: after the review window, or once a contest has lapsed (the stored result stands): stage 2 at its
 * deadline, an unread stage 1 48 hours after its own. In review, when it will succeed, the same transaction first
 * tallies every baker not yet tallied (amendment 2026-10-09); a contest opened only once every entry was tallied.
 */
async function planFinalize(h: Harness, index: number, t: bigint): Promise<Plan> {
  const c = h.camps[index];
  const contested = c.phase === "Contested";
  const lapse = lapsesAt(c);
  const error: BrotErrorName | undefined = contested
    ? lapse === null
      ? "CampaignNotInReview"
      : t < lapse
        ? "ContestNotLapsed"
        : undefined
    : c.phase !== "InReview"
      ? "CampaignNotInReview"
      : t < c.reviewEndsAt
        ? "ReviewNotEnded"
        : undefined;
  const pending = error === undefined && !contested ? untallied(c) : [];
  const deltas = new Map<string, bigint>();
  const tallies = [];
  for (const baker of pending) tallies.push(await tallyOf(h, index, baker, deltas));
  return {
    ixs: [...tallies, finalizeCampaignIx(h.addrs[index].campaign, await P.configPda())],
    error,
    deltas,
    label: contested ? (c.stage === 1 ? "lapse-stage1" : "lapse") : undefined,
    exit: index,
    events: [...pending.map(() => "LateTallied"), "CampaignFinalized"],
    apply: () => {
      c.seq += BigInt(pending.length) + 1n;
      for (const baker of pending) c.tallied.add(baker);
      takeSnapshot(c);
    },
  };
}
