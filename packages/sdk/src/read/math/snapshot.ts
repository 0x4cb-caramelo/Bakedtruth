/**
 * Purpose: the settlement snapshot: a campaign's totals and verdict turned into what finalize stores
 *          (the mode, the house fee, the creator share, `distributable`, what Brot keeps and what goes
 *          back to the opener), with the Economic Viability Rule. Mirrors
 *          programs/brot-markets/src/math/snapshot.rs (TP 3.4.16, 3.4.18; P-1, P-2, P-4, I12).
 * Version: 0.1.0
 * Sprint:  05 (SDK: the math mirror)
 *
 * Mode: a void, or a pot with no entry at all, is `Refund`; a pot with entries on one side only, or
 * whose losing side cannot pay the fees taken from it, is `OneSided`; otherwise `Split`. The totals
 * exclude the late entries, which come back whole.
 */
import { SettleMode } from "../../idl/generated/types";
import { houseFee } from "./fees";
import { argU16, argU64, toU64, u128 } from "./integers";
import { creatorShare, distributable } from "./payout";
import { bpsFloorWide, checkedBps } from "./rounding";
import { keptOpeningReturn, voidReturn, type OpenerReturn, type VoidClass } from "./void";

/** The verdict the snapshot is taken on; a void carries the class that decides the opening fee. */
export type Verdict = { kind: "Yes" } | { kind: "No" } | { kind: "Void"; voidClass: VoidClass };

/** Everything the snapshot needs (`SnapshotInput`). Amounts are lamports; rates are basis points. */
export type SnapshotInput = {
  verdict: Verdict;
  /** Each side's total, without its late entries. */
  yesTotal: bigint;
  noTotal: bigint;
  /** Each side's late entries, refunded whole. */
  lateYes: bigint;
  lateNo: bigint;
  prize: bigint;
  openingFee: bigint;
  feeBps: number;
  oneSidedFeeBps: number;
  creatorShareBps: number;
  /** A team campaign has no creator share (I12). */
  creatorIsTeam: boolean;
};

/** What finalize stores (`Snapshot`). The totals are zero for a void, which refunds from the entries. */
export type Snapshot = {
  mode: SettleMode;
  winningTotal: bigint;
  losingTotal: bigint;
  refundedLate: bigint;
  /** Brot's house fee on the losing side (`Split` only). */
  feeTotal: bigint;
  /** `fromPot + creatorShareFromFee`: what the creator is owed. */
  creatorShare: bigint;
  creatorShareFromFee: bigint;
  fromPot: bigint;
  /** What the winners split (`Split` only; the prize is inside it). */
  distributable: bigint;
  /** What Brot keeps outright. */
  brotKeeps: bigint;
  /** What the opener gets back: the prize, and the opening fee on a house failure. */
  toOpener: bigint;
};

function refundWith(mode: SettleMode, refundedLate: bigint, ret: OpenerReturn): Snapshot {
  return {
    mode,
    winningTotal: 0n,
    losingTotal: 0n,
    refundedLate,
    feeTotal: 0n,
    creatorShare: 0n,
    creatorShareFromFee: 0n,
    fromPot: 0n,
    distributable: 0n,
    brotKeeps: ret.brotKeeps,
    toOpener: ret.toOpener,
  };
}

/**
 * The Economic Viability Rule (decision of 2026-10-09): a pot splits only when the losing side is
 * larger than Brot's fee on it plus the creator's share on the whole pot (zero for a team campaign)
 * (`split_is_viable`).
 */
export function splitIsViable(input: SnapshotInput, winning: bigint, losing: bigint): boolean {
  const fee = houseFee(losing, input.feeBps);
  const share = input.creatorIsTeam ? 0n : bpsFloorWide(u128(winning + losing), input.creatorShareBps);
  return losing > u128(fee + share);
}

/** The P-2 `Split`: the fee, the creator share and what the winners split. */
function split(input: SnapshotInput, late: bigint, winning: bigint, losing: bigint): Snapshot {
  const fee = houseFee(losing, input.feeBps);
  const share = input.creatorIsTeam
    ? { fromPot: 0n, fromFee: 0n }
    : creatorShare(winning, losing, input.prize, fee, input.creatorShareBps);
  const pool = distributable(winning, losing, input.prize, fee, share.fromPot);
  const brotKeeps = toU64(toU64(fee - share.fromFee) + input.openingFee);
  return {
    mode: SettleMode.Split,
    winningTotal: winning,
    losingTotal: losing,
    refundedLate: late,
    feeTotal: fee,
    creatorShare: toU64(share.fromPot + share.fromFee),
    creatorShareFromFee: share.fromFee,
    fromPot: share.fromPot,
    distributable: pool,
    brotKeeps,
    toOpener: 0n,
  };
}

/**
 * The snapshot of one campaign at finalize (`snapshot`). `MathOverflow` for a rate above 100% or an
 * amount that does not fit; the totals themselves are never refused.
 */
export function snapshot(input: SnapshotInput): Snapshot {
  const { yesTotal, noTotal, lateYes, lateNo, prize, openingFee } = input;
  [yesTotal, noTotal, lateYes, lateNo, prize, openingFee].forEach((value) => argU64(value, "amount"));
  checkedBps(argU16(input.feeBps, "feeBps"));
  checkedBps(argU16(input.oneSidedFeeBps, "oneSidedFeeBps"));
  checkedBps(argU16(input.creatorShareBps, "creatorShareBps"));
  const late = toU64(lateYes + lateNo);
  const entries = toU64(yesTotal + noTotal);
  // The no-entry rule (answer 8) is for a campaign with no entry at all; a late-only pot follows its verdict.
  if (entries === 0n && late === 0n) return refundWith(SettleMode.Refund, late, keptOpeningReturn(prize, openingFee));
  const { verdict } = input;
  if (verdict.kind === "Void") {
    return refundWith(SettleMode.Refund, late, voidReturn(verdict.voidClass, prize, openingFee));
  }
  const [winning, losing] = verdict.kind === "Yes" ? [yesTotal, noTotal] : [noTotal, yesTotal];
  if (winning === 0n || losing === 0n || !splitIsViable(input, winning, losing)) {
    const oneSided = refundWith(SettleMode.OneSided, late, keptOpeningReturn(prize, openingFee));
    return { ...oneSided, winningTotal: winning, losingTotal: losing };
  }
  return split(input, late, winning, losing);
}
