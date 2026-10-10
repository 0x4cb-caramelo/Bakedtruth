/**
 * Purpose: the price rules the opening, the join lock and the proof share: freshness by time and by
 *          slot, the confidence bound, the two touch tests, row 3's minimum distance, and the price
 *          target's near and far bounds. Mirrors programs/brot-markets/src/readers/price_touch/rules.rs,
 *          price_touch/target.rs and readers/shared.rs `min_distance`.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * `price` (i64, may be negative) and `conf` (u64) combine in i128 with the program's checks, so no
 * reading can overflow a rule here that does not overflow there.
 */
import { refuse } from "../errors";
import { Direction, PRICE_RULES } from "../constants";
import { i128 } from "../math/integers";
import type { PriceReading } from "./price-update";

/** Why `checkFreshAndTight` refused a reading; the caller maps it to its own row's error. */
export type PriceRefusal = "Stale" | "NonPositive" | "ConfidenceTooWide";

/** Published at most `maxAge` s before `now` and at most 60 s after it (`published_within`). */
export function publishedWithin(reading: PriceReading, now: bigint, maxAge: number): boolean {
  const age = now - reading.publishTime;
  const lead = reading.publishTime - now;
  return age <= BigInt(maxAge) && lead <= PRICE_RULES.maxClockLeadSeconds;
}

/** Posted at most `ceil(age × 1,000 / MIN_SLOT_MS)` slots before `slot`; a slot ahead counts as now (`posted_within`). */
export function postedWithin(reading: PriceReading, slot: bigint, ageSeconds: number): boolean {
  const lag = slot > reading.postedSlot ? slot - reading.postedSlot : 0n;
  const millis = BigInt(ageSeconds) * 1_000n;
  const bound = (millis + PRICE_RULES.minSlotMs - 1n) / PRICE_RULES.minSlotMs;
  return lag <= bound;
}

/** Fresh, positive and tight, in that order, or the first refusal (`check_fresh_and_tight`). */
export function checkFreshAndTight(
  reading: PriceReading,
  now: bigint,
  maxAge: number,
  maxConfBps: number,
): PriceRefusal | null {
  if (!publishedWithin(reading, now, maxAge)) return "Stale";
  if (reading.price <= 0n) return "NonPositive";
  return reading.conf * 10_000n > reading.price * BigInt(maxConfBps) ? "ConfidenceTooWide" : null;
}

/** The band reaches the target: `price + conf ≥ target` (Above), `price − conf ≤ target` (Below). */
export function bandReachesTarget(reading: PriceReading, direction: Direction, target: bigint): boolean {
  return direction === Direction.Above
    ? i128(reading.price + reading.conf) >= target
    : i128(reading.price - reading.conf) <= target;
}

/** The whole band is past the target: `price − conf ≥ target` (Above), `price + conf ≤ target` (Below). */
export function bandCrossesTarget(reading: PriceReading, direction: Direction, target: bigint): boolean {
  return direction === Direction.Above
    ? i128(reading.price - reading.conf) >= target
    : i128(reading.price + reading.conf) <= target;
}

/** Row 3's minimum distance: `|value| × bps / 10,000` rounded up, at least 1 (`min_distance`). */
export function minDistance(value: bigint, bps: number): bigint {
  const size = value < 0n ? i128(-value) : value;
  const whole = (size / 10_000n) * BigInt(bps);
  const part = ((size % 10_000n) * BigInt(bps) + 9_999n) / 10_000n;
  const distance = whole + part;
  return distance > 1n ? distance : 1n;
}

/** `ceil(value / divisor)` for a positive divisor, as `target.rs` writes it. */
function ceilDiv(value: bigint, divisor: bigint): bigint {
  const quotient = value / divisor; // truncates toward zero, already the ceiling of a negative quotient
  return value % divisor > 0n ? quotient + 1n : quotient;
}

/** Row 3 for a price campaign at both ends, in the program's order (`check_target`). */
export function checkPriceTarget(reading: PriceReading, direction: Direction, target: bigint, distanceBps: number) {
  const distance = minDistance(reading.price, distanceBps);
  const touched = bandReachesTarget(reading, direction, target);
  if (direction === Direction.Above) {
    if (touched) refuse("TargetAlreadyTouched");
    if (target < i128(i128(reading.price + reading.conf) + distance)) refuse("TargetTooClose");
    if (target > i128(reading.price * PRICE_RULES.targetMaxRatio)) refuse("TargetUnreachable");
  } else {
    if (target <= 0n) refuse("TargetUnreachable");
    if (target < ceilDiv(reading.price, PRICE_RULES.targetMaxRatio)) refuse("TargetUnreachable");
    if (touched) refuse("TargetAlreadyTouched");
    if (target > i128(i128(reading.price - reading.conf) - distance)) refuse("TargetTooClose");
  }
}
