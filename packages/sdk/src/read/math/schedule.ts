/**
 * Purpose: when entries close and which durations a campaign may have, for the real build and for
 *          the devnet drill build. Mirrors programs/brot-markets/src/math/schedule.rs and the time
 *          constants of constants.rs (D-k; P1 section 3.6; T12).
 * Version: 0.1.0
 * Sprint:  05 (SDK: the math mirror)
 *
 * `entries_close_at = deadline_at − clamp(5% × (deadline_at − opens_at), floor, 7 d)`: a 3-day campaign
 * closes at day 2.0, a 30-day one at day 28.5, a 90-day one at day 85.5. The floor, the minimum
 * duration and the review window are shorter in a `drill` build; the SDK must know which build a
 * cluster runs, so each function takes the build's constants (`REAL_SCHEDULE` by default).
 */
import { refuse } from "../errors";
import { argI64, i128, maxBig, minBig, toI64 } from "./integers";

const HOUR = 3_600n;
const DAY = 86_400n;

/** The time constants a build compiles in. */
export type ScheduleConstants = {
  readonly minDurationSeconds: bigint;
  readonly maxDurationSeconds: bigint;
  readonly entryCloseBps: bigint;
  readonly entryCloseMinSeconds: bigint;
  readonly entryCloseMaxSeconds: bigint;
  readonly reviewWindowSeconds: bigint;
};

/** The real values, compiled into every build without `drill` (mainnet included). */
export const REAL_SCHEDULE: ScheduleConstants = Object.freeze({
  minDurationSeconds: 3n * DAY,
  maxDurationSeconds: 90n * DAY,
  entryCloseBps: 500n,
  entryCloseMinSeconds: 24n * HOUR,
  entryCloseMaxSeconds: 7n * DAY,
  reviewWindowSeconds: 6n * HOUR,
});

/** The devnet drill values (`--features drill`): a cycle that fits a session. Never on mainnet. */
export const DRILL_SCHEDULE: ScheduleConstants = Object.freeze({
  ...REAL_SCHEDULE,
  minDurationSeconds: 15n * 60n,
  entryCloseMinSeconds: 5n * 60n,
  reviewWindowSeconds: 10n * 60n,
});

/**
 * The duration `deadline_at − opens_at` is between the build's minimum and maximum, both inclusive
 * (`DurationTooShort`, `DurationTooLong`; a deadline in the past is too short) (`check_duration`).
 */
export function checkDuration(opensAt: bigint, deadlineAt: bigint, constants = REAL_SCHEDULE): void {
  const duration = argI64(deadlineAt, "deadlineAt") - argI64(opensAt, "opensAt");
  if (duration < constants.minDurationSeconds) refuse("DurationTooShort");
  if (duration > constants.maxDurationSeconds) refuse("DurationTooLong");
}

/**
 * The moment entries close, the 5% rounded down to whole seconds before the clamp
 * (`entries_close_at`). A duration `checkDuration` refuses is `MathOverflow` here, as in the program,
 * where reaching this with one is a bug of the caller.
 */
export function entriesCloseAt(opensAt: bigint, deadlineAt: bigint, constants = REAL_SCHEDULE): bigint {
  try {
    checkDuration(opensAt, deadlineAt, constants);
  } catch (error) {
    if (error instanceof RangeError) throw error;
    refuse("MathOverflow");
  }
  const duration = deadlineAt - opensAt;
  const fivePercent = i128(duration * constants.entryCloseBps) / 10_000n;
  const lead = minBig(maxBig(fivePercent, constants.entryCloseMinSeconds), constants.entryCloseMaxSeconds);
  return toI64(i128(deadlineAt - lead));
}
