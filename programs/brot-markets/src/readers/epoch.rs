//! Purpose: the epoch kinds' shared rules: when the measured epoch starts, against the deadline
//!          (row 5 for `StakePoolTvlAtLeast` and `StakeAtLeast`), from the EpochSchedule sysvar.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution); the module is declared at the sprint's opening, its
//!         contents are lane B's
//!
//! TP section 3.4.8's working reading [INF], built in Sprint 03: the creator passes `epoch` and
//! `deadline_at`; the epoch must start before the deadline; entries close at the earlier of
//! `entries_close_at` and the epoch's start (the join lock); a missed epoch voids as
//! `MissedWindow`.
//!
//! A slot has no fixed length, so the opening assumes the slowest average it accepts,
//! `EPOCH_START_SLOW_SLOT_MS` [AC]: the epoch's latest plausible start is
//! `now + (first_slot − slot) × EPOCH_START_SLOW_SLOT_MS / 1,000` seconds (rounded down, as the
//! rule is written), and it must not pass the deadline. The first slot follows
//! `solana-epoch-schedule` 3.4.0's `get_first_slot_in_epoch`, with checked math where it
//! saturates: warmup epochs double from 32 slots, `(2^epoch − 1) × 32` up to
//! `first_normal_epoch`, then `slots_per_epoch` each from `first_normal_slot`.
//!
//! On-chain the schedule is the sysvar's: `sol_get_sysvar` of its 33 bincode bytes, through
//! Pinocchio's `get_sysvar`, a nonzero return being an error. A host build has no sysvar, so it
//! uses mainnet's unless a test sets another with `set_host_schedule`, a function the program
//! build does not have. Mainnet and devnet both answered `getEpochSchedule` on 2026-10-09 with
//! 432,000 slots, no warmup, first normal epoch and slot 0 [F].

use pinocchio::error::ProgramError;

use super::{cursor::Cursor, ChainTime, CreationContext};
use crate::{constants::EPOCH_START_SLOW_SLOT_MS, error::BrotError};

/// The sysvar's size: `slots_per_epoch`, `leader_schedule_slot_offset` (u64 each), `warmup`
/// (bool), `first_normal_epoch`, `first_normal_slot` (u64 each), bincode, little-endian.
pub const EPOCH_SCHEDULE_LEN: usize = 33;
/// The first warmup epoch's length, `MINIMUM_SLOTS_PER_EPOCH` in `solana-epoch-schedule`.
const MINIMUM_SLOTS_PER_EPOCH: u64 = 32;
const MILLIS_PER_SECOND: u128 = 1_000;

/// The cluster's epoch schedule, field for field as the EpochSchedule sysvar holds it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct EpochSchedule {
    pub slots_per_epoch: u64,
    pub leader_schedule_slot_offset: u64,
    pub warmup: bool,
    pub first_normal_epoch: u64,
    pub first_normal_slot: u64,
}

impl EpochSchedule {
    /// Mainnet's schedule, which devnet runs too: 432,000 slots an epoch, no warmup. The host's.
    pub const MAINNET: Self = Self {
        slots_per_epoch: 432_000,
        leader_schedule_slot_offset: 432_000,
        warmup: false,
        first_normal_epoch: 0,
        first_normal_slot: 0,
    };

    /// The sysvar's bytes, decoded. A `warmup` byte other than 0 or 1 is `ReaderBadLayout`.
    pub fn from_bytes(data: &[u8; EPOCH_SCHEDULE_LEN]) -> Result<Self, BrotError> {
        let mut cursor = Cursor::new(data);
        Ok(Self {
            slots_per_epoch: cursor.u64()?,
            leader_schedule_slot_offset: cursor.u64()?,
            warmup: cursor.flag()?,
            first_normal_epoch: cursor.u64()?,
            first_normal_slot: cursor.u64()?,
        })
    }

    /// The first slot of `epoch`: `get_first_slot_in_epoch`, where a result that would saturate
    /// there (no real schedule reaches one) is `MathOverflow` here.
    pub fn first_slot(&self, epoch: u64) -> Result<u64, BrotError> {
        let slot = if epoch <= self.first_normal_epoch {
            u32::try_from(epoch)
                .ok()
                .and_then(|exponent| 2u64.checked_pow(exponent))
                .and_then(|epochs| epochs.checked_sub(1))
                .and_then(|epochs| epochs.checked_mul(MINIMUM_SLOTS_PER_EPOCH))
        } else {
            epoch
                .checked_sub(self.first_normal_epoch)
                .and_then(|epochs| epochs.checked_mul(self.slots_per_epoch))
                .and_then(|slots| slots.checked_add(self.first_normal_slot))
        };
        slot.ok_or(BrotError::MathOverflow)
    }
}

/// The cluster's schedule: the sysvar on-chain.
#[cfg(target_os = "solana")]
pub fn schedule() -> Result<EpochSchedule, ProgramError> {
    let mut data = [0u8; EPOCH_SCHEDULE_LEN];
    pinocchio::sysvars::get_sysvar(&mut data, &crate::constants::EPOCH_SCHEDULE_SYSVAR_ID, 0)?;
    Ok(EpochSchedule::from_bytes(&data)?)
}

/// The cluster's schedule: on a host build, the one a test set on this thread, else mainnet's.
#[cfg(not(target_os = "solana"))]
pub fn schedule() -> Result<EpochSchedule, ProgramError> {
    Ok(HOST_SCHEDULE
        .with(core::cell::Cell::get)
        .unwrap_or(EpochSchedule::MAINNET))
}

#[cfg(not(target_os = "solana"))]
std::thread_local! {
    static HOST_SCHEDULE: core::cell::Cell<Option<EpochSchedule>> =
        const { core::cell::Cell::new(None) };
}

/// Host builds only, for tests: the schedule `schedule` returns on this thread (`None`: mainnet's).
#[cfg(not(target_os = "solana"))]
pub fn set_host_schedule(schedule: Option<EpochSchedule>) {
    HOST_SCHEDULE.with(|cell| cell.set(schedule));
}

/// Row 5's part for the epoch kinds, after the 3-to-90-day check: the measured epoch has not
/// started (`EpochAlreadyStarted`), and its latest plausible start is at or before the deadline
/// (`EpochAfterDeadline`).
pub fn check_epoch_for_opening(ctx: &CreationContext) -> Result<(), ProgramError> {
    if ctx.epoch <= ctx.time.epoch {
        return Err(BrotError::EpochAlreadyStarted.into());
    }
    let first_slot = schedule()?.first_slot(ctx.epoch)?;
    if latest_start(first_slot, &ctx.time)? > i128::from(ctx.deadline_at) {
        return Err(BrotError::EpochAfterDeadline.into());
    }
    Ok(())
}

/// The latest plausible start, in Unix seconds, of the epoch whose first slot is `first_slot`:
/// `now + (first_slot − slot) × EPOCH_START_SLOW_SLOT_MS / 1,000`, in i128. A first slot at or
/// behind the clock's slot means the schedule has the epoch running already, whatever the
/// clock's epoch says (no cluster writes such a clock): `EpochAlreadyStarted`.
pub fn latest_start(first_slot: u64, time: &ChainTime) -> Result<i128, BrotError> {
    let slots = first_slot
        .checked_sub(time.slot)
        .filter(|slots| *slots > 0)
        .ok_or(BrotError::EpochAlreadyStarted)?;
    let seconds = u128::from(slots)
        .checked_mul(u128::from(EPOCH_START_SLOW_SLOT_MS))
        .and_then(|millis| millis.checked_div(MILLIS_PER_SECOND))
        .and_then(|seconds| i128::try_from(seconds).ok())
        .ok_or(BrotError::MathOverflow)?;
    i128::from(time.unix_timestamp)
        .checked_add(seconds)
        .ok_or(BrotError::MathOverflow)
}
