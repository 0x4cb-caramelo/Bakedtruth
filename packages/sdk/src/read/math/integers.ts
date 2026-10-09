/**
 * Purpose: the Rust integer types the program's math uses, as bigint bounds, and the checks that
 *          make bigint arithmetic fail where the program's checked arithmetic fails.
 * Version: 0.1.0
 * Sprint:  05 (SDK: the math mirror)
 *
 * A bigint never overflows, so every step the program writes with `checked_*` is followed here by
 * a bound check that refuses with `MathOverflow`, as the program does. An argument outside its Rust
 * type (a negative amount, a basis point above 65,535) is not a program refusal: no instruction can
 * carry it. It is a bug of the caller and throws `RangeError`.
 */
import { refuse } from "../errors";

export const U16_MAX = 0xffff;
export const U32_MAX = 0xffff_ffff;
export const U64_MAX = (1n << 64n) - 1n;
export const U128_MAX = (1n << 128n) - 1n;
export const I32_MIN = -(2 ** 31);
export const I32_MAX = 2 ** 31 - 1;
export const I64_MIN = -(1n << 63n);
export const I64_MAX = (1n << 63n) - 1n;
export const I128_MIN = -(1n << 127n);
export const I128_MAX = (1n << 127n) - 1n;

/** An argument of Rust type u64. */
export function argU64(value: bigint, what: string): bigint {
  if (typeof value !== "bigint" || value < 0n || value > U64_MAX) throw new RangeError(`${what} is not a u64`);
  return value;
}

/** An argument of Rust type i64. */
export function argI64(value: bigint, what: string): bigint {
  if (typeof value !== "bigint" || value < I64_MIN || value > I64_MAX) throw new RangeError(`${what} is not an i64`);
  return value;
}

/** An argument of Rust type i128. */
export function argI128(value: bigint, what: string): bigint {
  if (typeof value !== "bigint" || value < I128_MIN || value > I128_MAX) {
    throw new RangeError(`${what} is not an i128`);
  }
  return value;
}

/** An argument of Rust type u16 (basis points). */
export function argU16(value: number, what: string): number {
  if (!Number.isInteger(value) || value < 0 || value > U16_MAX) throw new RangeError(`${what} is not a u16`);
  return value;
}

/** An argument of Rust type u32. */
export function argU32(value: number, what: string): number {
  if (!Number.isInteger(value) || value < 0 || value > U32_MAX) throw new RangeError(`${what} is not a u32`);
  return value;
}

/** An argument of Rust type i32. */
export function argI32(value: number, what: string): number {
  if (!Number.isInteger(value) || value < I32_MIN || value > I32_MAX) throw new RangeError(`${what} is not an i32`);
  return value;
}

/** A u128 intermediate: `MathOverflow` outside `0..=u128::MAX`, as `checked_*` on u128. */
export function u128(value: bigint): bigint {
  return value < 0n || value > U128_MAX ? refuse("MathOverflow") : value;
}

/** An i128 intermediate: `MathOverflow` outside the i128 range, as `checked_*` on i128. */
export function i128(value: bigint): bigint {
  return value < I128_MIN || value > I128_MAX ? refuse("MathOverflow") : value;
}

/** A u64 result: `MathOverflow` outside `0..=u64::MAX` (`to_u64`, `checked_*` on u64). */
export function toU64(value: bigint): bigint {
  return value < 0n || value > U64_MAX ? refuse("MathOverflow") : value;
}

/** An i64 result: `MathOverflow` outside the i64 range (`i64::try_from`). */
export function toI64(value: bigint): bigint {
  return value < I64_MIN || value > I64_MAX ? refuse("MathOverflow") : value;
}

/** The smaller of two bigints (`Ord::min`). */
export const minBig = (a: bigint, b: bigint): bigint => (a < b ? a : b);
/** The larger of two bigints (`Ord::max`). */
export const maxBig = (a: bigint, b: bigint): bigint => (a > b ? a : b);
