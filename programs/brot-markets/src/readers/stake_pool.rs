//! Purpose: `StakePoolTvlAtLeast`: YES if an SPL stake pool's total at the start of the measured
//!          epoch, the snapshot its first balance update of that epoch writes, reaches the target.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution); signatures frozen at the sprint's opening, bodies by lane B
//!
//! Ported from pred-provable's `resolver.rs`: Copyright (c) 2026 Ronaldo Pereira, MIT License
//! (LICENSE at the repository root).
//!
//! Owner SPL Stake Pool; the Borsh `StakePool` walked with the bounds-checked `Cursor` (options
//! move the snapshot's offset). A missed snapshot voids (`MissedWindow`) where the frozen program
//! recorded NO (TP section 3.4.6).
//!
//! The pool's first balance update of an epoch keeps the total it held before the update in
//! `last_epoch_total_lamports` and stamps `last_update_epoch`; deposits and withdrawals revert
//! until then. So the value is the pool's total at the epoch's start, out of reach of a flash
//! deposit into `total_lamports`, and it stays until the next epoch's first update overwrites it.
//! That is why a snapshot of the measured epoch counts whenever it is read, after the deadline
//! and after the epoch too: it cannot move, and a late read reads the same number. A snapshot of
//! another epoch never counts: overwritten, or never written once the epoch is over, the window
//! was missed. Entries lock when the epoch starts, from the clock alone.

use pinocchio::{error::ProgramError, AccountView};

use super::{
    after_deadline, cursor::Cursor, epoch, min_distance, CreationContext, CreationReading,
    Decision, ReadContext, Reading, Resolution,
};
use crate::{
    constants::{MIN_DISTANCE_BPS_STAKE_POOL, STAKE_POOL_PROGRAM_ID},
    error::BrotError,
    state::enums::VoidReason,
};

/// `AccountType::StakePool`. 0 is an uninitialized account, 2 a validator list.
const ACCOUNT_TYPE_STAKE_POOL: u8 = 1;
/// manager, staker, stake_deposit_authority (3 × 32), stake_withdraw_bump_seed (1),
/// validator_list, reserve_stake (2 × 32).
const BEFORE_POOL_MINT: usize = 161;
/// manager_fee_account, token_program_id (2 × 32).
const AFTER_POOL_MINT: usize = 64;
/// lockup (48: unix_timestamp, epoch, custodian) and epoch_fee (16).
const LOCKUP_AND_EPOCH_FEE: usize = 64;
/// A `Fee`: denominator and numerator, two u64.
const FEE: usize = 16;
/// A u64 the reader skips.
const U64: usize = 8;
/// The payload of an `Option<Pubkey>`.
const ADDRESS: usize = 32;

/// What the reader takes from a pool.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct StakePoolView {
    pub pool_mint: [u8; 32],
    pub total_lamports: u64,
    pub last_update_epoch: u64,
    pub last_epoch_total_lamports: u64,
}

/// SPL stake pool `StakePool` (Borsh): account_type u8 (= 1) | 161 bytes | pool_mint (162) |
/// 64 bytes | total_lamports (258), pool_token_supply, last_update_epoch (274) | lockup,
/// epoch_fee | next_epoch_fee: FutureEpoch<Fee> | the options and fees below |
/// last_epoch_pool_token_supply, last_epoch_total_lamports (427 when every option is unset, as
/// on JitoSOL and bSOL). Bytes past the walk are not read: the program allocates the largest
/// layout (611 bytes) and writes a shorter one when options are unset.
pub fn parse_stake_pool(data: &[u8]) -> Result<StakePoolView, BrotError> {
    let mut c = Cursor::new(data);
    if c.u8()? != ACCOUNT_TYPE_STAKE_POOL {
        return Err(BrotError::ReaderBadLayout);
    }
    c.skip(BEFORE_POOL_MINT)?;
    let pool_mint = c.address()?;
    c.skip(AFTER_POOL_MINT)?;
    let total_lamports = c.u64()?;
    c.skip(U64)?; // pool_token_supply
    let last_update_epoch = c.u64()?;
    c.skip(LOCKUP_AND_EPOCH_FEE)?;
    skip_future_fee(&mut c)?; // next_epoch_fee
    c.skip_option(ADDRESS)?; // preferred_deposit_validator_vote_address
    c.skip_option(ADDRESS)?; // preferred_withdraw_validator_vote_address
    c.skip(FEE)?; // stake_deposit_fee
    c.skip(FEE)?; // stake_withdrawal_fee
    skip_future_fee(&mut c)?; // next_stake_withdrawal_fee
    c.skip(1)?; // stake_referral_fee
    c.skip_option(ADDRESS)?; // sol_deposit_authority
    c.skip(FEE)?; // sol_deposit_fee
    c.skip(1)?; // sol_referral_fee
    c.skip_option(ADDRESS)?; // sol_withdraw_authority
    c.skip(FEE)?; // sol_withdrawal_fee
    skip_future_fee(&mut c)?; // next_sol_withdrawal_fee
    c.skip(U64)?; // last_epoch_pool_token_supply
    let last_epoch_total_lamports = c.u64()?;
    Ok(StakePoolView {
        pool_mint,
        total_lamports,
        last_update_epoch,
        last_epoch_total_lamports,
    })
}

/// Stake pool `FutureEpoch<Fee>`: tag 0 (none), or 1 and 2 (a pending fee follows).
fn skip_future_fee(c: &mut Cursor) -> Result<(), BrotError> {
    match c.u8()? {
        0 => Ok(()),
        1 | 2 => c.skip(FEE),
        _ => Err(BrotError::ReaderBadLayout),
    }
}

/// The pool, owner first: no byte of an account the stake pool program does not own is read.
pub fn read_stake_pool(account: &AccountView) -> Result<StakePoolView, ProgramError> {
    if !account.owned_by(&STAKE_POOL_PROGRAM_ID) {
        return Err(BrotError::ReaderWrongOwner.into());
    }
    let data = account.try_borrow()?;
    Ok(parse_stake_pool(&data)?)
}

/// Rows 2 and 3 for this kind, and row 5's epoch rule: a pool (`ReaderWrongOwner`,
/// `ReaderBadLayout`) that still updates, the measured epoch ahead and starting before the
/// deadline, and a target above both of the pool's totals by at least
/// `MIN_DISTANCE_BPS_STAKE_POOL` of the higher one.
pub fn validate_at_creation(ctx: &CreationContext) -> Result<CreationReading, ProgramError> {
    let pool = read_stake_pool(ctx.metric)?;
    epoch::check_epoch_for_opening(ctx)?;
    // A pool whose balance updates stopped can never write the measured epoch's snapshot. One
    // epoch behind is fine: its update for this epoch may still come. Saturation at u64::MAX
    // cannot turn the comparison.
    if pool.last_update_epoch.saturating_add(1) < ctx.time.epoch {
        return Err(BrotError::StakePoolNotUpdating.into());
    }
    // A target between the two totals is met by the higher one, which is what the snapshot
    // holds if no deposit or withdrawal lands before the epoch.
    let current = i128::from(pool.total_lamports.max(pool.last_epoch_total_lamports));
    if ctx.target <= current {
        return Err(BrotError::TargetAlreadyTouched.into());
    }
    let nearest = current
        .checked_add(min_distance(current, MIN_DISTANCE_BPS_STAKE_POOL)?)
        .ok_or(BrotError::MathOverflow)?;
    if ctx.target < nearest {
        return Err(BrotError::TargetTooClose.into());
    }
    Ok(CreationReading::default())
}

/// The join lock: the measured epoch has started. Nothing is read: from that moment the
/// snapshot is fixed (deposits revert until the first update writes it), so the outcome can no
/// longer change, even if the pool has not written it yet.
pub fn outcome_knowable(ctx: &ReadContext) -> Result<bool, ProgramError> {
    Ok(ctx.time.epoch >= ctx.campaign.epoch.get())
}

/// Resolution for this kind (TP section 3.4.6), the measured epoch E: before E, `NotYet`, or
/// `MissedWindow` once the deadline has passed; from E, the pool is read (unreadable: refused
/// in E before the deadline, `UnreadableAccount` after either); a snapshot of E is YES or NO
/// whenever it is read; a snapshot of a later epoch is `MissedWindow`; none yet is `NotYet` in
/// E and `MissedWindow` after it.
pub fn try_resolve(ctx: &ReadContext) -> Result<Resolution, ProgramError> {
    let measured = ctx.campaign.epoch.get();
    let after = after_deadline(ctx.campaign, &ctx.time);
    if ctx.time.epoch < measured {
        return Ok(if after {
            void(ctx, VoidReason::MissedWindow)
        } else {
            Resolution::NotYet
        });
    }
    let pool = match read_stake_pool(ctx.metric) {
        Ok(pool) => pool,
        Err(_) if after || ctx.time.epoch > measured => {
            return Ok(void(ctx, VoidReason::UnreadableAccount))
        }
        Err(error) => return Err(error),
    };
    if pool.last_update_epoch == measured {
        let snapshot = i128::from(pool.last_epoch_total_lamports);
        let reading = Reading::of(ctx.metric, snapshot);
        return Ok(Resolution::Decided(
            if snapshot >= ctx.campaign.target.get() {
                Decision::yes(reading)
            } else {
                Decision::no(reading, false)
            },
        ));
    }
    if pool.last_update_epoch > measured || ctx.time.epoch > measured {
        return Ok(void(ctx, VoidReason::MissedWindow));
    }
    Ok(Resolution::NotYet)
}

/// A void with nothing read for the epoch: `observed` is zero.
fn void(ctx: &ReadContext, reason: VoidReason) -> Resolution {
    Resolution::Decided(Decision::void(reason, Reading::of(ctx.metric, 0)))
}
