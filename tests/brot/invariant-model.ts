/**
 * Purpose: the reference model of one campaign's money, the state the randomized test expects the
 *          program to hold (TP sections 3.4.7, 3.4.13, 3.4.16): the money, the result resolution stored, the
 *          contest's stage, the tallies and the event count. It sits on money-model.ts, written in
 *          whole-number steps, and never reads the program's Rust or its layouts.
 * Version: 0.1.0 (Sprint 14: the contest, the stored result, the tallies, seq; the no-entry refund)
 * Sprint:  04 (contract freeze, lane E); 14 (the second read and the referral, lane INV14)
 *
 * Reading (decided here, and the test fails when the program reads it otherwise): a join at or after
 * the YES proof's `publish_time` is late; late amounts leave V and P, come back whole to their baker, and
 * pay no fee. The mode is set by the early totals: both sides above zero is `Split`, anything else
 * `OneSided`; a void, or a pot nobody joined, is `Refund` (founder answer 8: then Brot keeps the 10%).
 */
import { oneSidedFee, settleSplit, splitIsViable } from "./money-model";

export type Phase = "Open" | "InReview" | "Contested" | "Settling" | "Settled" | "Closed";
export type Outcome = "Unresolved" | "Yes" | "No" | "Void";
export type Mode = "Split" | "OneSided" | "Refund";
/** One join; `address` is its `Join` account (the harness keeps it for the tally). */
export type Join = { baker: string; side: 0 | 1; amount: bigint; at: bigint; address?: string };

export type Snapshot = {
  mode: Mode;
  winning: bigint;
  losing: bigint;
  late: bigint;
  fee: bigint;
  fromPot: bigint;
  fromFee: bigint;
  distributable: bigint;
  firstBaker: string | null;
  oneSidedFees: bigint;
  winners: number;
};

export type Ledger = { to: string; amount: bigint; kind: "entry" | "share" | "prize" | "fee" | "close" | "sweep" };

export type ModelCampaign = {
  label: string;
  team: boolean;
  creator: string;
  prize: bigint;
  openingFee: bigint;
  deadline: bigint;
  opensAt: bigint;
  entriesCloseAt: bigint;
  reviewEndsAt: bigint;
  phase: Phase;
  outcome: Outcome;
  voidReason: number;
  /** The YES proof's publish time, the late cut-off (null for any other outcome). */
  publish: bigint | null;
  /** What resolution stored: the value read and the publish time (a NO's too), which a re-read compares. */
  observed: bigint;
  storedPublish: bigint;
  /** The contest (Sprint 14): its stage (0 none, 1, 2) and that stage's deadline, kept after it ends. */
  stage: 0 | 1 | 2;
  contestEndsAt: bigint;
  /** Bakers whose joins are all tallied (`tally_late_joins`); the harness tallies a baker whole. */
  tallied: Set<string>;
  /** The campaign's events so far, so the next event's `seq` (X0.4). */
  seq: bigint;
  /** The fill byte of the stored note hash: 0 none, the team's or the admin's note. */
  note: number;
  /** A creator share held in the vault for a wallet that could not take it (`creator_share_reserved`). */
  reserved: bigint;
  joins: Join[];
  snapshot: Snapshot | null;
  settled: Set<string>;
  feeMoved: boolean;
  prizeSettled: boolean;
  shareSettled: boolean;
  handSent: bigint;
  handSentCampaign: bigint;
  paidOut: bigint;
  ledger: Ledger[];
  counted: boolean;
  closed: boolean;
};

export const DAY = 86_400n;
export const SIX_HOURS = 6n * 3_600n;
export const PROOF_DELAY = 60n;
export const CREATOR_BPS = 100n;
export const FEE_BPS = 1_000n;
export const ONE_SIDED_BPS = 100n;

/** Void reasons (P.VoidReason): the house's own failures refund the 10%; the others keep it. */
export const HOUSE_REASONS = new Set([1, 4]);
/** The reasons a team key (and the admin's void) may choose: `team_may_choose`, not None or UnreadableAccount. */
const TEAM_REASONS = new Set([1, 3, 4, 5]);

export type CampaignSetup = Pick<
  ModelCampaign,
  "label" | "team" | "creator" | "prize" | "openingFee" | "deadline" | "opensAt" | "entriesCloseAt"
>;

export function newCampaign(p: CampaignSetup): ModelCampaign {
  return {
    ...p,
    reviewEndsAt: 0n,
    phase: "Open",
    outcome: "Unresolved",
    voidReason: 0,
    publish: null,
    observed: 0n,
    storedPublish: 0n,
    stage: 0,
    contestEndsAt: 0n,
    tallied: new Set(),
    // `CampaignOpened` took seq 0.
    seq: 1n,
    note: 0,
    reserved: 0n,
    joins: [],
    snapshot: null,
    settled: new Set(),
    feeMoved: false,
    prizeSettled: false,
    shareSettled: false,
    handSent: 0n,
    handSentCampaign: 0n,
    paidOut: 0n,
    ledger: [],
    counted: !p.team,
    closed: false,
  };
}

/** `entries_close_at = deadline − clamp(5% × duration, 24 h, 7 d)` (TP section 3.4.10). */
export function entriesCloseFor(opensAt: bigint, deadline: bigint): bigint {
  const fivePercent = ((deadline - opensAt) * 5n) / 100n;
  const clamped = fivePercent < DAY ? DAY : fivePercent > 7n * DAY ? 7n * DAY : fivePercent;
  return deadline - clamped;
}

/** The proof window is open up to and including `deadline + 60 s`: only a YES proof decides inside it (Q4). */
export const inProofWindow = (c: ModelCampaign, t: bigint) => t <= c.deadline + PROOF_DELAY;
export const isLate = (c: ModelCampaign, at: bigint) => c.publish !== null && at >= c.publish;
export const earlyJoins = (c: ModelCampaign) => c.joins.filter((j) => !isLate(c, j.at));
export const lateJoins = (c: ModelCampaign) => c.joins.filter((j) => isLate(c, j.at));
export const sumOf = (joins: Join[]) => joins.reduce((n, j) => n + j.amount, 0n);
export const sideTotal = (joins: Join[], side: 0 | 1) => sumOf(joins.filter((j) => j.side === side));
export const bakersOf = (c: ModelCampaign) => [...new Set(c.joins.map((j) => j.baker))];
export const untallied = (c: ModelCampaign) => bakersOf(c).filter((b) => !c.tallied.has(b));
/** The side that wins for a `Yes` or `No` outcome. */
export const winningSide = (c: ModelCampaign): 0 | 1 => (c.outcome === "Yes" ? 0 : 1);

/** Every lamport the campaign's joins put into the vault (early and late). */
export const joinedTotal = (c: ModelCampaign) => sumOf(c.joins);

/** What the vault should hold beyond rent and hand-sent SOL: entries + prize + opening fee − paid out (I1). */
export const booked = (c: ModelCampaign) => joinedTotal(c) + c.prize + c.openingFee - c.paidOut;

/** The snapshot of a reviewed campaign: the mode, the totals and the creator share (TP section 3.4.16). */
export function snapshotOf(c: ModelCampaign): Snapshot {
  const late = sumOf(lateJoins(c));
  const firstBaker = c.joins[0]?.baker ?? null;
  // A void, or a pot nobody joined whatever the outcome (founder answer 8), refunds.
  if (c.outcome === "Void" || c.joins.length === 0) return blank("Refund", late, firstBaker);
  const early = earlyJoins(c);
  const yes = sideTotal(early, 0);
  const no = sideTotal(early, 1);
  const side = winningSide(c);
  const winning = side === 0 ? yes : no;
  const losing = side === 0 ? no : yes;
  const split = { winning, losing, prize: c.prize, feeBps: FEE_BPS, creatorBps: c.team ? 0n : CREATOR_BPS };
  // One side empty, or a losing side too small to pay its fees (the Economic Viability Rule): one-sided.
  if (yes === 0n || no === 0n || !splitIsViable(split)) {
    // Each entry pays its fee once, on its whole early amount (settlement/rules.rs `entry_payout`), not per join.
    const byBaker = new Map<string, bigint>();
    for (const j of early) byBaker.set(j.baker, (byBaker.get(j.baker) ?? 0n) + j.amount);
    let oneSidedFees = 0n;
    for (const [baker, amount] of byBaker) oneSidedFees += oneSidedFee(amount, ONE_SIDED_BPS, baker === firstBaker);
    const totals = yes === 0n || no === 0n ? { winning: yes + no, losing: 0n } : { winning, losing };
    return { ...blank("OneSided", late, firstBaker), ...totals, oneSidedFees };
  }
  const r = settleSplit(split);
  return {
    mode: "Split",
    winning,
    losing,
    late,
    fee: r.fee,
    fromPot: r.creatorFromPot,
    fromFee: r.creatorFromFee,
    distributable: r.distributable,
    firstBaker,
    oneSidedFees: 0n,
    winners: new Set(early.filter((j) => j.side === side).map((j) => j.baker)).size,
  };
}

function blank(mode: Mode, late: bigint, firstBaker: string | null): Snapshot {
  const zero = { winning: 0n, losing: 0n, fee: 0n, fromPot: 0n, fromFee: 0n, distributable: 0n, oneSidedFees: 0n };
  return { mode, late, firstBaker, winners: 0, ...zero };
}

export const isTeamReason = (reason: number) => TEAM_REASONS.has(reason);
