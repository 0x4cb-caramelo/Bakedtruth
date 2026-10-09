//! Purpose: `DammV2LockedAtLeast`: YES once a Meteora DAMM v2 pool's permanently locked
//!          liquidity reaches the target. Locking is one-way, so the fact is irreversible.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution); signatures frozen at the sprint's opening, bodies by lane A
//!
//! Ported from pred-provable's `resolver.rs`: Copyright (c) 2026 Ronaldo Pereira, MIT License
//! (LICENSE at the repository root).
//!
//! Owner DAMM v2, 1,112 bytes, the `Pool` discriminator; `permanent_lock_liquidity` (u128) at
//! offset 552. The target is in liquidity units, held whole by the i128 `target`. Resolution
//! through `fact_resolution`.
//!
//! Where the port departs from `parse_damm_pool`, `damm_goal` and the `DammV2LockedAtLeast` arms:
//! the frozen program's `shift` (a u64 threshold scaled by `2^shift`, at most 64) is not ported,
//! because the i128 `target` holds any goal a shift could express; TP section 3.4.8 still writes
//! the kind as `DammV2LockedAtLeast { shift }`, and the zod sketch in TP Appendix B has no shift.
//! The campaign names the pool alone (`pool` in that sketch), so the original's check that a
//! target mint is one of the pool's two mints has nothing to compare. A target at or below zero
//! is `TargetUnreachable` (the original refused a zero threshold as `MetricAlreadyMet`); row 3's
//! minimum distance is new (C45); after the deadline the pool is read again, so a late lock sets
//! `met_late` and an unreadable pool voids, where the original recorded NO (TP section 3.4.6).

use pinocchio::{error::ProgramError, AccountView, Address};

use super::{
    cursor::Cursor, fact_resolution, min_distance, CreationContext, CreationReading, ReadContext,
    Resolution,
};
use crate::{
    constants::{DAMM_V2_PROGRAM_ID, MIN_DISTANCE_BPS_DAMM},
    error::BrotError,
};

/// DAMM v2 allocates every `Pool` (zero-copy) at this size, its discriminator included.
pub const POOL_LEN: usize = 1_112;
/// First 8 bytes of sha256("account:Pool"). Anchor discriminators are derived from the name and
/// collide across programs, which is why the owner is checked first.
pub const POOL_DISCRIMINATOR: [u8; 8] = [0xf1, 0x9a, 0x6d, 0x04, 0x11, 0xb1, 0x6d, 0xbc];
/// Offset of `permanent_lock_liquidity`, a u128. Its one writer adds the liquidity a position
/// owner locks forever, so it only grows.
pub const PERMANENT_LOCK_LIQUIDITY_AT: usize = 552;
/// The bytes between the discriminator and `permanent_lock_liquidity`, which this reader skips.
const BEFORE_LOCKED_LIQUIDITY: usize = PERMANENT_LOCK_LIQUIDITY_AT - POOL_DISCRIMINATOR.len();

/// Reads a pool's permanently locked liquidity from its owner and its bytes. The owner comes
/// first, before a byte is read (`ReaderWrongOwner`); then exactly `POOL_LEN` bytes starting with
/// `POOL_DISCRIMINATOR` (`ReaderBadLayout`).
pub fn read_locked_liquidity(owner: &Address, data: &[u8]) -> Result<u128, BrotError> {
    if *owner != DAMM_V2_PROGRAM_ID {
        return Err(BrotError::ReaderWrongOwner);
    }
    if data.len() != POOL_LEN {
        return Err(BrotError::ReaderBadLayout);
    }
    let mut cursor = Cursor::new(data);
    if cursor.take::<8>()? != POOL_DISCRIMINATOR {
        return Err(BrotError::ReaderBadLayout);
    }
    cursor.skip(BEFORE_LOCKED_LIQUIDITY)?;
    cursor.u128()
}

/// The same read taken from the account itself, in the campaign's units: a value above
/// `i128::MAX` saturates there, where it still meets every target, since none is larger.
pub fn locked_liquidity(account: &AccountView) -> Result<i128, ProgramError> {
    let data = account.try_borrow()?;
    let locked = read_locked_liquidity(account.owner(), &data)?;
    Ok(i128::try_from(locked).unwrap_or(i128::MAX))
}

/// Rows 2 and 3 for this kind, checked in this order, each with its own error:
/// 1. the account is a DAMM v2 pool (`ReaderWrongOwner`, then `ReaderBadLayout`);
/// 2. the target is above zero (`TargetUnreachable`): every pool has locked at least nothing;
/// 3. the locked liquidity is still below the target (`TargetAlreadyTouched`);
/// 4. the target is at least `min_distance(locked, MIN_DISTANCE_BPS_DAMM)` above it
///    (`TargetTooClose`): with 1,000,000 locked, a target of 1,010,000 opens and 1,009,999 does
///    not. Above about 1.7e36 locked (`(i128::MAX − 9,999) / 100`) that distance overflows and the
///    opening is refused with `MathOverflow`; the largest captured pool locks 3.6e28.
pub fn validate_at_creation(ctx: &CreationContext) -> Result<CreationReading, ProgramError> {
    let locked = locked_liquidity(ctx.metric)?;
    if ctx.target <= 0 {
        return Err(BrotError::TargetUnreachable.into());
    }
    if locked >= ctx.target {
        return Err(BrotError::TargetAlreadyTouched.into());
    }
    let lowest_target = locked
        .checked_add(min_distance(locked, MIN_DISTANCE_BPS_DAMM)?)
        .ok_or(BrotError::MathOverflow)?;
    if ctx.target < lowest_target {
        return Err(BrotError::TargetTooClose.into());
    }
    Ok(CreationReading::default())
}

/// The join lock for this kind: true once the locked liquidity reaches the target, which no
/// later move can undo. An unreadable pool is an error, so the join is refused.
pub fn outcome_knowable(ctx: &ReadContext) -> Result<bool, ProgramError> {
    Ok(locked_liquidity(ctx.metric)? >= ctx.campaign.target.get())
}

/// Resolution for this kind (TP section 3.4.6): the irreversible-fact table of `fact_resolution`,
/// met when the locked liquidity is at or above the target.
pub fn try_resolve(ctx: &ReadContext) -> Result<Resolution, ProgramError> {
    let target = ctx.campaign.target.get();
    fact_resolution(locked_liquidity(ctx.metric), |locked| locked >= target, ctx)
}
