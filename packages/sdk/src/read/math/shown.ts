/**
 * Purpose: the return a screen shows for an entry (Sprint 13, the legal and adversarial reviews): what `amount` gets
 *          back if its side wins and entries closed now, the way finalize would pay it. A pot splits only when its
 *          losing side is larger than Brot's fee plus the creator's share (the Economic Viability Rule, 2026-10-09,
 *          `splitIsViable`); otherwise every entry is refunded as a one-sided pot. `estimateReturnBps`, which the
 *          program checks `min_return_bps` against, applies the split formula whenever the other side holds anything,
 *          so in a lopsided pot it can show several times what finalize would refund. Display only: a join's floor stays
 *          on `estimateReturnBps`, as the program computes it.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { houseFee, oneSidedFee } from "./fees";
import { toU64, u128 } from "./integers";
import { estimateReturnBps, type JoinedPot } from "./payout";
import { BPS_DENOMINATOR, bpsFloorWide, mulDivFloor } from "./rounding";

/** Whether the pot, with this entry in it, would split if this entry's side won and entries closed now. */
export function splitsIfWins(pot: JoinedPot): boolean {
  if (pot.other === 0n) return false;
  const fee = houseFee(pot.other, pot.feeBps);
  const share = bpsFloorWide(u128(pot.sideAfter + pot.other), pot.creatorShareBps);
  return pot.other > u128(fee + share);
}

/** What `amount` returns if its side wins and entries closed now, in bps of `amount`, rounded down. */
export function shownReturnBps(pot: JoinedPot): bigint {
  if (pot.other === 0n || splitsIfWins(pot)) return estimateReturnBps(pot);
  const back = toU64(pot.amount - oneSidedFee(pot.amount, pot.oneSidedFeeBps, pot.isFirst));
  return mulDivFloor(back, BPS_DENOMINATOR, pot.amount);
}
