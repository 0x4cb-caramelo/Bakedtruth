/**
 * Purpose: the basis of one referee's entry on one opening (TP §3.4.11, §3.4.16; Sprint 14, lane L14R): the fee Brot
 *          actually kept on its winning entry, `(fee − from_fee) × entry ÷ V`, rounded down, where `entry` is the
 *          early part of its winning side (late joins come back whole and carry no fee). Only a `Split` pot has one:
 *          a one-sided pot's 1%, a void and a losing entry earn nothing. Nothing is payable before it is checked
 *          against the campaign's own snapshot (`CampaignFinalized`): the address has no gap; every baker's early
 *          winning and losing sums equal V and P; `from_fee` is within the fee; the referee's `EntrySettled` is what
 *          the snapshot pays it (the SDK's `entryPayout`, the program's mirror); and the `FeeCollected` moved
 *          exactly `fee − from_fee` beside the opening fee. Pure: the facts come from facts.ts.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 *
 * States: `open` until finalized; `no_fee` for any mode but `Split`, or with no early winning part; `held` when a
 * check fails (never paid; the routine lists it for the team); `unsettled` while the referee's payout or the fee
 * collection has not landed; then `payable`, from the later of the two slots.
 */
import { entryPayout, SettleMode, Side } from "@brot/sdk/read";

import type { Finalized, Join, OpeningFacts, Sides } from "./facts";

export type EntryState = "open" | "no_fee" | "unsettled" | "payable" | "held";

export type OpeningBasis = {
  state: EntryState;
  reason: string | null;
  snapshot: Finalized | null;
  /** The early part on the winning side of each of the referee's joins here, in their order; 0 for the others. */
  early: bigint[];
  /** `floor((fee − from_fee) × part ÷ V)` for `part` lamports of early winning entry; 0 unless payable. */
  kept: (part: bigint) => bigint;
  payableSlot: number | null;
};

const ZERO: Sides = { yes: 0n, no: 0n };
const nothing = () => 0n;

/** The early amount of a side given to the joins on that side in chain order: late joins are the last to land. */
function allocate(joins: readonly Join[], side: "Yes" | "No", early: bigint): bigint[] {
  let left = early;
  return joins.map((j) => {
    if (j.side !== side || left <= 0n) return 0n;
    const part = j.amount < left ? j.amount : left;
    left -= part;
    return part;
  });
}

/** Whether every baker's early sums equal the snapshot's V and P; the reason when not. */
function sumsDiffer(f: OpeningFacts, win: "yes" | "no", s: Finalized): string | null {
  const lose = win === "yes" ? "no" : "yes";
  let [winning, losing] = [0n, 0n];
  for (const baker of new Set([...f.totals.keys(), ...f.late.keys()])) {
    const [t, l] = [f.totals.get(baker) ?? ZERO, f.late.get(baker) ?? ZERO];
    if (t[win] < l[win] || t[lose] < l[lose]) return "late sums above a baker's entries";
    winning += t[win] - l[win];
    losing += t[lose] - l[lose];
  }
  if (winning !== s.winningTotal) return "the early winning entries do not add up to the snapshot's V";
  if (losing !== s.losingTotal) return "the early losing entries do not add up to the snapshot's P";
  if (s.winningTotal === 0n || s.fromFee > s.feeTotal) return "an impossible snapshot";
  return null;
}

/** The referee's entry on the opening of `f`, given its joins there in chain order. */
export function openingBasis(f: OpeningFacts, referee: string, joins: readonly Join[]): OpeningBasis {
  const s = f.finalized[0] ?? null;
  const none = (state: EntryState, reason: string | null, early = joins.map(() => 0n)): OpeningBasis => ({
    ...{ state, reason, snapshot: s, early, kept: nothing, payableSlot: null },
  });
  if (s === null) return none("open", null);
  if (f.finalized.length > 1) return none("held", "finalized twice");
  if (s.mode !== SettleMode.Split) return none("no_fee", null);
  const win = f.outcome === "Yes" ? "yes" : f.outcome === "No" ? "no" : null;
  if (win === null) return none("held", "a split pot without a YES or NO outcome");
  const [mine, myLate] = [f.totals.get(referee) ?? ZERO, f.late.get(referee) ?? ZERO];
  const earlyWin = mine[win] - myLate[win];
  if (earlyWin < 0n) return none("held", "late sums above the referee's entries");
  const early = allocate(joins, win === "yes" ? "Yes" : "No", earlyWin);
  if (earlyWin === 0n) return none("no_fee", null, early);
  if (f.gap) return none("held", "a gap in the campaign's events", early);
  const differ = sumsDiffer(f, win, s);
  if (differ) return none("held", differ, early);
  const settled = f.settled.get(referee);
  if (!settled || f.fees.length === 0) return none("unsettled", null, early);
  if (settled.amounts.length > 1 || f.fees.length > 1) return none("held", "settled or collected twice", early);
  if (settled.amounts[0] !== payout(s, win, mine, myLate))
    return none("held", "the payout is not the snapshot's", early);
  const houseKept = s.feeTotal - s.fromFee;
  if (f.fees[0].houseKept !== houseKept) return none("held", "the fee collected is not fee − from_fee", early);
  return {
    ...{ state: "payable", reason: null, snapshot: s, early },
    kept: (part) => (part * houseKept) / s.winningTotal,
    payableSlot: Math.max(settled.slot, f.fees[0].slot),
  };
}

/** What the program pays the referee's entry under the snapshot, or -1 when the math refuses it. */
function payout(s: Finalized, win: "yes" | "no", mine: Sides, late: Sides): bigint {
  try {
    const rule = {
      ...{ mode: SettleMode.Split, winning: win === "yes" ? Side.Yes : Side.No },
      ...{ winningTotal: s.winningTotal, distributable: s.distributable, oneSidedFeeBps: 0 },
    };
    return entryPayout(rule, { yes: mine.yes, no: mine.no, lateYes: late.yes, lateNo: late.no }, false).amount;
  } catch {
    return -1n;
  }
}
