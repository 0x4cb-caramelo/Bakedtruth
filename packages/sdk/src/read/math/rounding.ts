/**
 * Purpose: the multiply-divide and basis-point shares every money formula uses, rounded down or up,
 *          with the program's refusals: the one place a rounding direction is written. Mirrors
 *          programs/brot-markets/src/math/rounding.rs.
 * Version: 0.1.0
 * Sprint:  05 (SDK: the math mirror)
 *
 * A share above 100% (`bps > 10,000`) and a zero divisor are `MathOverflow`, like every other
 * failure of the math. Inputs are non-negative, so bigint division truncates as the floor.
 */
import { refuse } from "../errors";
import { u128, toU64 } from "./integers";

/** Basis points in 100% (`BPS_DENOMINATOR`). */
export const BPS_DENOMINATOR = 10_000n;

/** `bps` as a factor; above 10,000 (100%) it is refused (`checked_bps`). */
export function checkedBps(bps: number): bigint {
  const factor = BigInt(bps);
  return factor > BPS_DENOMINATOR ? refuse("MathOverflow") : factor;
}

/** `floor(numerator ÷ divisor)`; a zero divisor is `MathOverflow` (`div_floor`). */
export function divFloor(numerator: bigint, divisor: bigint): bigint {
  return divisor === 0n ? refuse("MathOverflow") : numerator / divisor;
}

/** `ceil(numerator ÷ divisor)`, from the quotient and the remainder (`div_ceil`). */
export function divCeil(numerator: bigint, divisor: bigint): bigint {
  const quotient = divFloor(numerator, divisor);
  return numerator % divisor === 0n ? quotient : u128(quotient + 1n);
}

/** `floor(a × b ÷ divisor)` for u64 `a`, `b` and `divisor`: a payout, rounded down (`mul_div_floor`). */
export function mulDivFloor(a: bigint, b: bigint, divisor: bigint): bigint {
  return toU64(divFloor(u128(a * b), divisor));
}

/** `floor(amount × bps ÷ 10,000)` on a u128 base (`bps_floor_wide`). */
export function bpsFloorWide(amount: bigint, bps: number): bigint {
  return divFloor(u128(amount * checkedBps(bps)), BPS_DENOMINATOR);
}

/** `floor(amount × bps ÷ 10,000)`: a share that is paid out, rounded down (`bps_floor`). */
export function bpsFloor(amount: bigint, bps: number): bigint {
  return toU64(bpsFloorWide(amount, bps));
}

/** `ceil(amount × bps ÷ 10,000)`: a fee, rounded up (`bps_ceil`). */
export function bpsCeil(amount: bigint, bps: number): bigint {
  return toU64(divCeil(u128(amount * checkedBps(bps)), BPS_DENOMINATOR));
}
