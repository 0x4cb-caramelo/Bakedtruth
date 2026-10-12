//! Purpose: `DbcGraduated`: YES once a Meteora Dynamic Bonding Curve (DBC) launch completes its
//!          curve by the deadline, at the second the pool itself records. Its stage only moves
//!          forward, so the fact is irreversible, and the pool says when it happened.
//! Version: 0.0.1
//! Sprint: after 05 (the sixth kind; docs/technical/meteora-readers-plan.md section 4)
//!
//! Owner DBC, 424 bytes, the `VirtualPool` discriminator; a `TransferHookPool`, the same layout
//! under another discriminator, is refused with its own error (M-3). Read at pinned offsets:
//! `config` (an address) at 72, `quote_reserve` (u64) at 240, `migration_progress` (u8: 0 on the
//! curve, 1 post-curve, 2 locked vesting, 3 pool created) at 308 and `finish_curve_timestamp` (u64,
//! Unix seconds) at 344, which the swap that completes the curve stamps from the clock (DBC's
//! `process_swap.rs`). The opening also reads the pool's own `PoolConfig`, passed after the nine
//! slots (`config.rs`); the target is its threshold, in lamports, so the reading (`quote_reserve`)
//! and the target share a unit. Resolution reads the stamp, never the time of the resolution
//! (`stamped_resolution`). YES can be bought: whoever pays the rest of the curve completes it (M-6).

mod config;

use pinocchio::{error::ProgramError, AccountView, Address};

use super::{
    cursor::Cursor, min_distance, stamped_resolution, CreationContext, CreationReading,
    ReadContext, Resolution, Stamped,
};
use crate::{
    constants::{DBC_PROGRAM_ID, MIN_DISTANCE_BPS_DBC},
    error::BrotError,
};

pub use config::{
    opening_threshold, read_config, CurveConfig, CONFIG_DISCRIMINATOR, CONFIG_LEN, QUOTE_MINT_AT,
    THRESHOLD_AT,
};

/// DBC allocates every pool, `VirtualPool` or `TransferHookPool`, at this size.
pub const POOL_LEN: usize = 424;
/// First 8 bytes of sha256("account:VirtualPool"). Anchor discriminators are derived from the
/// name and collide across programs, which is why the owner is checked first.
pub const POOL_DISCRIMINATOR: [u8; 8] = [0xd5, 0xe0, 0x05, 0xd1, 0x62, 0x45, 0x77, 0x5c];
/// First 8 bytes of sha256("account:TransferHookPool"): the same pool state, refused.
pub const TRANSFER_HOOK_POOL_DISCRIMINATOR: [u8; 8] =
    [0xed, 0xdb, 0xb8, 0x17, 0x2a, 0xbd, 0xa9, 0x23];
/// Offsets of the four fields the reader takes, the discriminator counted.
pub const CONFIG_AT: usize = 72;
pub const QUOTE_RESERVE_AT: usize = 240;
pub const MIGRATION_PROGRESS_AT: usize = 308;
pub const FINISH_CURVE_TIMESTAMP_AT: usize = 344;
/// The last stage DBC defines (`CreatedPool`); a larger byte is a layout this reader does not know.
pub const LAST_STAGE: u8 = 3;
/// The bytes the cursor skips between those fields.
const BEFORE_CONFIG: usize = CONFIG_AT - POOL_DISCRIMINATOR.len();
const BEFORE_RESERVE: usize = QUOTE_RESERVE_AT - CONFIG_AT - 32;
const BEFORE_STAGE: usize = MIGRATION_PROGRESS_AT - QUOTE_RESERVE_AT - 8;
const BEFORE_STAMP: usize = FINISH_CURVE_TIMESTAMP_AT - MIGRATION_PROGRESS_AT - 1;

/// What the reader takes from a pool.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct CurvePool {
    /// The pool's `PoolConfig`, which holds its threshold.
    pub config: Address,
    /// The quote raised so far: lamports, on a curve priced in SOL.
    pub quote_reserve: u64,
    /// `migration_progress`: 0 on the curve, 1 to 3 once the curve has completed.
    pub stage: u8,
    /// When the curve completed, in Unix seconds; 0 while it has not.
    pub finish_curve_timestamp: u64,
}

impl CurvePool {
    /// The curve has completed: its stage left 0, and no later move brings it back.
    pub fn graduated(&self) -> bool {
        self.stage >= 1
    }

    /// What `stamped_resolution` reads: the quote raised, and the stamp once the curve completed.
    pub fn stamped(&self) -> Stamped {
        Stamped {
            observed: i128::from(self.quote_reserve),
            met_at: self.graduated().then_some(self.finish_curve_timestamp),
        }
    }
}

/// Reads a pool from its owner and its bytes: the owner first, before a byte is read
/// (`ReaderWrongOwner`), then exactly `POOL_LEN` bytes (`ReaderBadLayout`); a `TransferHookPool`
/// is `CurveHasTransferHook`, and any other discriminator or a stage past `LAST_STAGE` is
/// `ReaderBadLayout`.
pub fn read_pool(owner: &Address, data: &[u8]) -> Result<CurvePool, BrotError> {
    if *owner != DBC_PROGRAM_ID {
        return Err(BrotError::ReaderWrongOwner);
    }
    if data.len() != POOL_LEN {
        return Err(BrotError::ReaderBadLayout);
    }
    let mut cursor = Cursor::new(data);
    match cursor.take::<8>()? {
        POOL_DISCRIMINATOR => {}
        TRANSFER_HOOK_POOL_DISCRIMINATOR => return Err(BrotError::CurveHasTransferHook),
        _ => return Err(BrotError::ReaderBadLayout),
    }
    cursor.skip(BEFORE_CONFIG)?;
    let config = Address::new_from_array(cursor.address()?);
    cursor.skip(BEFORE_RESERVE)?;
    let quote_reserve = cursor.u64()?;
    cursor.skip(BEFORE_STAGE)?;
    let stage = cursor.u8()?;
    if stage > LAST_STAGE {
        return Err(BrotError::ReaderBadLayout);
    }
    cursor.skip(BEFORE_STAMP)?;
    let finish_curve_timestamp = cursor.u64()?;
    Ok(CurvePool {
        config,
        quote_reserve,
        stage,
        finish_curve_timestamp,
    })
}

/// The same read taken from the account itself.
pub fn curve_pool(account: &AccountView) -> Result<CurvePool, ProgramError> {
    let data = account.try_borrow()?;
    Ok(read_pool(account.owner(), &data)?)
}

/// Rows 2 and 3 for this kind, checked in this order, each with its own error:
/// 1. the metric account is a DBC `VirtualPool` (`read_pool`'s errors);
/// 2. the account after the nine slots is the pool's own `PoolConfig`, priced in SOL, with a
///    threshold of at least `DBC_MIN_GRADUATION_LAMPORTS` (`opening_threshold`'s errors; with no
///    such account, `NotEnoughAccountKeys`);
/// 3. the target is that threshold (`TargetNotThreshold`);
/// 4. the curve has not completed (`TargetAlreadyTouched`);
/// 5. at least `min_distance(threshold, MIN_DISTANCE_BPS_DBC)` of it is still missing
///    (`TargetTooClose`): on an 85 SOL curve, 76.5 SOL raised opens and one lamport more does not.
pub fn validate_at_creation(ctx: &CreationContext) -> Result<CreationReading, ProgramError> {
    let pool = curve_pool(ctx.metric)?;
    let config = ctx.curve_config.ok_or(ProgramError::NotEnoughAccountKeys)?;
    let threshold = i128::from(opening_threshold(config, &pool)?);
    if ctx.target != threshold {
        return Err(BrotError::TargetNotThreshold.into());
    }
    if pool.graduated() {
        return Err(BrotError::TargetAlreadyTouched.into());
    }
    let missing = threshold
        .checked_sub(i128::from(pool.quote_reserve))
        .ok_or(BrotError::MathOverflow)?;
    if missing < min_distance(threshold, MIN_DISTANCE_BPS_DBC)? {
        return Err(BrotError::TargetTooClose.into());
    }
    Ok(CreationReading::default())
}

/// The join lock for this kind: true once the curve has completed (stage 1 or later), which no
/// later move undoes. Nothing else locks entries: the curve may fill to its end (M-6). An
/// unreadable pool is an error, so the join is refused.
pub fn outcome_knowable(ctx: &ReadContext) -> Result<bool, ProgramError> {
    Ok(curve_pool(ctx.metric)?.graduated())
}

/// Resolution for this kind (TP section 3.4.6, the stamped row): the completion judged by the
/// second the pool stamped, with `quote_reserve` recorded as the value read.
pub fn try_resolve(ctx: &ReadContext) -> Result<Resolution, ProgramError> {
    stamped_resolution(curve_pool(ctx.metric).map(|pool| pool.stamped()), ctx)
}
