/**
 * Purpose: the epoch kinds' opening rule (row 5's part for `StakePoolTvlAtLeast` and `StakeAtLeast`):
 *          the measured epoch has not started, and its latest plausible start is at or before the
 *          deadline, from the cluster's epoch schedule. Mirrors programs/brot-markets/src/readers/epoch.rs.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * The program reads the EpochSchedule sysvar; a client reads the same account (or `getEpochSchedule`).
 * Mainnet and devnet both ran 432,000 slots an epoch with no warmup on 2026-10-09.
 */
import { refuse } from "../errors";
import { EPOCH_START_SLOW_SLOT_MS } from "../constants";
import { i128, toU64 } from "../math/integers";
import { Cursor } from "./cursor";

/** The cluster's epoch schedule, field for field as the sysvar holds it. */
export type EpochSchedule = {
  slotsPerEpoch: bigint;
  leaderScheduleSlotOffset: bigint;
  warmup: boolean;
  firstNormalEpoch: bigint;
  firstNormalSlot: bigint;
};

/** Mainnet's schedule, which devnet runs too. */
export const MAINNET_EPOCH_SCHEDULE: EpochSchedule = Object.freeze({
  slotsPerEpoch: 432_000n,
  leaderScheduleSlotOffset: 432_000n,
  warmup: false,
  firstNormalEpoch: 0n,
  firstNormalSlot: 0n,
});

/** The sysvar's 33 bincode bytes; a `warmup` byte other than 0 or 1 is `ReaderBadLayout`. */
export function epochScheduleFromBytes(data: Uint8Array): EpochSchedule {
  const c = new Cursor(data);
  return {
    slotsPerEpoch: c.u64(),
    leaderScheduleSlotOffset: c.u64(),
    warmup: c.flag(),
    firstNormalEpoch: c.u64(),
    firstNormalSlot: c.u64(),
  };
}

/** The first slot of `epoch` (`get_first_slot_in_epoch`, checked where it would saturate). */
export function firstSlotOfEpoch(schedule: EpochSchedule, epoch: bigint): bigint {
  if (epoch <= schedule.firstNormalEpoch) {
    if (epoch >= 64n) refuse("MathOverflow");
    return toU64(toU64((1n << epoch) - 1n) * 32n);
  }
  return toU64(toU64((epoch - schedule.firstNormalEpoch) * schedule.slotsPerEpoch) + schedule.firstNormalSlot);
}

/** The latest plausible start of the epoch whose first slot is `firstSlot`, in Unix seconds (`latest_start`). */
export function latestEpochStart(firstSlot: bigint, clock: { unixTimestamp: bigint; slot: bigint }): bigint {
  const slots = firstSlot - clock.slot;
  if (slots <= 0n) refuse("EpochAlreadyStarted");
  return i128(clock.unixTimestamp + (slots * EPOCH_START_SLOW_SLOT_MS) / 1_000n);
}

/** Row 5's part for the epoch kinds (`check_epoch_for_opening`). */
export function checkEpochForOpening(
  epoch: bigint,
  deadlineAt: bigint,
  clock: { unixTimestamp: bigint; slot: bigint; epoch: bigint },
  schedule: EpochSchedule = MAINNET_EPOCH_SCHEDULE,
): void {
  if (epoch <= clock.epoch) refuse("EpochAlreadyStarted");
  if (latestEpochStart(firstSlotOfEpoch(schedule, epoch), clock) > deadlineAt) refuse("EpochAfterDeadline");
}
