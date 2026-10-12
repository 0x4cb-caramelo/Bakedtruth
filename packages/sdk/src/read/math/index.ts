/**
 * Purpose: the money and schedule math of the program as pure TypeScript, for previews, estimates and
 *          checks: the opening conversion and split, the fees, the creator share, the payouts, the
 *          finalize snapshot, the void returns, the entry close (TP 3.4.16); and, since Sprint 12, what a
 *          stored campaign owes (stored.ts: the pot rule, the opener's return, the creator share's status); and, since
 *          Sprint 13, the return a screen shows (shown.ts: the split only when the pot would split).
 * Version: 0.1.2
 * Sprint:  05 (SDK: the math mirror); 12 (stored.ts); 13 (shown.ts)
 *
 * Every function mirrors one Rust function of programs/brot-markets/src/math/ (or settlement/rules.rs),
 * with the same rounding and the same refusals, thrown as `BrotRefusal`. The data contract (TP 3.1):
 * the Rust pure functions generate the vectors in tests/vectors/, and tests/sdk/math-vectors.test.ts
 * replays every one of them here (X0.3). Amounts are bigint lamports; rates and exponents are numbers.
 */
export { houseFee, oneSidedFee } from "./fees";
export {
  MIN_PRICE_EXPONENT,
  MAX_PRICE_EXPONENT,
  openingPaidLamports,
  splitOpening,
  type OpeningSplit,
} from "./opening";
export {
  creatorShare,
  distributable,
  estimateReturnBps,
  oneSidedRefund,
  splitPayout,
  type CreatorShare,
  type JoinedPot,
  type OneSidedRefund,
} from "./payout";
export { BPS_DENOMINATOR, bpsCeil, bpsFloor, bpsFloorWide, divCeil, divFloor, mulDivFloor } from "./rounding";
export { checkDuration, DRILL_SCHEDULE, entriesCloseAt, REAL_SCHEDULE, type ScheduleConstants } from "./schedule";
export {
  claimable,
  entryPayout,
  planCredit,
  splitLate,
  type Credit,
  type EntryAmounts,
  type EntryPayout,
  type JoinTime,
  type PotRule,
} from "./settle";
export { snapshot, splitIsViable, type Snapshot, type SnapshotInput, type Verdict } from "./snapshot";
export { shownReturnBps, splitsIfWins } from "./shown";
export {
  AUTOMATIC_VOIDS,
  amountsOf,
  creatorShareStatus,
  entryIfFinalized,
  entryOwed,
  noEntryEver,
  potRuleOf,
  prizeReturnOf,
  snapshotOf,
  storedVerdict,
  type CreatorShareStatus,
} from "./stored";
export { keptOpeningReturn, voidClassOf, voidReturn, type OpenerReturn, type VoidClass } from "./void";
export { I128_MAX, I128_MIN, I64_MAX, I64_MIN, U128_MAX, U64_MAX } from "./integers";
