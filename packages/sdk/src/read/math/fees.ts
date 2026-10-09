/**
 * Purpose: Brot's fee on the losing side and the one-sided fee per entry, both rounded up.
 *          Mirrors programs/brot-markets/src/math/fees.rs (P1 sections 3.3 and 3.5; TP 3.4.16).
 * Version: 0.1.0
 * Sprint:  05 (SDK: the math mirror)
 *
 * A fee rate above 10,000 bps (100%) is `MathOverflow`: no fee may exceed what it is taken from.
 */
import { argU16, argU64 } from "./integers";
import { bpsCeil, checkedBps } from "./rounding";

/** `ceil(losing_total × fee_bps ÷ 10,000)` (`house_fee`). */
export function houseFee(losingTotal: bigint, feeBps: number): bigint {
  return bpsCeil(argU64(losingTotal, "losingTotal"), argU16(feeBps, "feeBps"));
}

/**
 * `ceil(entry × one_sided_fee_bps ÷ 10,000)`, or 0 when the entry is the first baker's (Q3). The rate
 * is checked for the first baker too (`one_sided_fee`).
 */
export function oneSidedFee(entry: bigint, oneSidedFeeBps: number, isFirst: boolean): bigint {
  argU64(entry, "entry");
  checkedBps(argU16(oneSidedFeeBps, "oneSidedFeeBps"));
  return isFirst ? 0n : bpsCeil(entry, oneSidedFeeBps);
}
