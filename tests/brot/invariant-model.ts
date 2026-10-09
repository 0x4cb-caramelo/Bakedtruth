/**
 * Purpose: the reference model of one campaign's money, the state the randomized test expects the
 *          program to hold (TP sections 3.4.7, 3.4.13, 3.4.16). It sits on money-model.ts, written in
 *          whole-number steps, and never reads the program's Rust or its layouts.
 * Version: 0.0.1
 * Sprint:  04 (contract freeze, lane E)
 *
 * Reading (decided here, and the test fails when the program reads it otherwise): a join at or after
 * the YES proof's `publish_time` is late; late amounts leave V and P, come back whole to their baker, and
 * pay no fee. The mode is set by the early totals: both sides above zero is `Split`, anything else
 * `OneSided`; a void is `Refund`.
 */
import { oneSidedFee, payoutOf, settleSplit } from "./money-model";

export type Phase = "Open" | "InReview" | "Contested" | "Settling" | "Settled" | "Closed";
export type Outcome = "Unresolved" | "Yes" | "No" | "Void";
export type Mode = "Split" | "OneSided" | "Refund";
export type Join = { baker: string; side: 0 | 1; amount: bigint; at: bigint };

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
  publish: bigint | null;
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
const TEAM_REASONS = new Set([4, 5]);

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

export const isLate = (c: ModelCampaign, at: bigint) => c.publish !== null && at >= c.publish;
export const earlyJoins = (c: ModelCampaign) => c.joins.filter((j) => !isLate(c, j.at));
export const lateJoins = (c: ModelCampaign) => c.joins.filter((j) => isLate(c, j.at));
export const sumOf = (joins: Join[]) => joins.reduce((n, j) => n + j.amount, 0n);
export const sideTotal = (joins: Join[], side: 0 | 1) => sumOf(joins.filter((j) => j.side === side));
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
  if (c.outcome === "Void") {
    return blank("Refund", late, firstBaker);
  }
  const early = earlyJoins(c);
  const yes = sideTotal(early, 0);
  const no = sideTotal(early, 1);
  if (yes === 0n || no === 0n) {
    const oneSidedFees = early.reduce((n, j) => {
      const isFirst = j.baker === firstBaker;
      return n + oneSidedFee(j.amount, ONE_SIDED_BPS, isFirst);
    }, 0n);
    return { ...blank("OneSided", late, firstBaker), winning: yes + no, oneSidedFees };
  }
  const side = winningSide(c);
  const winning = side === 0 ? yes : no;
  const losing = side === 0 ? no : yes;
  const r = settleSplit({
    winning,
    losing,
    prize: c.prize,
    feeBps: FEE_BPS,
    creatorBps: c.team ? 0n : CREATOR_BPS,
  });
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
  return {
    mode,
    winning: 0n,
    losing: 0n,
    late,
    fee: 0n,
    fromPot: 0n,
    fromFee: 0n,
    distributable: 0n,
    firstBaker,
    oneSidedFees: 0n,
    winners: 0,
  };
}

/** What `settle_entry` pays one baker: its early share (per mode) plus its late refund. */
export function entryPayout(c: ModelCampaign, baker: string): bigint {
  const s = c.snapshot;
  if (!s) throw new Error("entryPayout before the snapshot");
  const mine = c.joins.filter((j) => j.baker === baker);
  const late = sumOf(mine.filter((j) => isLate(c, j.at)));
  const early = mine.filter((j) => !isLate(c, j.at));
  if (s.mode === "Refund") return late + sumOf(early);
  if (s.mode === "OneSided") {
    const amount = sumOf(early);
    return amount - oneSidedFee(amount, ONE_SIDED_BPS, baker === s.firstBaker) + late;
  }
  const won = sideTotal(early, winningSide(c));
  return payoutOf(won, s.distributable, s.winning) + late;
}

/** What `collect_fee` moves to the fee vault. */
export function collectDue(c: ModelCampaign): bigint {
  const s = c.snapshot;
  if (!s) return 0n;
  if (s.mode === "Split") return s.fee - s.fromFee + c.openingFee;
  if (s.mode === "OneSided") return s.oneSidedFees + c.openingFee;
  return HOUSE_REASONS.has(c.voidReason) ? 0n : c.openingFee;
}

/** What `settle_prize` pays the opener (Split: none, the prize is in the distributable). */
export function prizeDue(c: ModelCampaign): bigint {
  const s = c.snapshot;
  if (!s || s.mode === "Split") return 0n;
  if (s.mode === "OneSided") return c.prize;
  return c.prize + (HOUSE_REASONS.has(c.voidReason) ? c.openingFee : 0n);
}

/** The creator's share (P-1: none on a void, a one-sided pot or a team opening). */
export const shareDue = (c: ModelCampaign) =>
  c.snapshot?.mode === "Split" ? c.snapshot.fromPot + c.snapshot.fromFee : 0n;

/** `Split` with a prize, or nothing to return: the prize is settled when the snapshot is taken. */
export const prizeSettledAtSnapshot = (c: ModelCampaign) => c.snapshot?.mode === "Split" || c.prize === 0n;

export const isTeamReason = (reason: number) => TEAM_REASONS.has(reason);
export const winnersOf = (c: ModelCampaign) => c.snapshot?.winners ?? 0;
