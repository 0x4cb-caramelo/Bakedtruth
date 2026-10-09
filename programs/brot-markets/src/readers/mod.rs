//! Purpose: the closed set of readers that turn an on-chain account into a YES/NO answer, and the
//!          interface each one exposes: `validate_at_creation`, `outcome_knowable`, `try_resolve`.
//! Version: 0.0.3
//! Sprint: 00 (setup); the price read in 01; the interface in 02; Sprint 03 ports the four other
//!         kinds, the join lock and resolution, with these signatures frozen at its opening.
//!
//! One reader per file. Each checks the owner and the layout of its account before it reads a
//! single field, and returns an error, never a panic, when the bytes are not what it expects.
//! `ReaderKind` is closed at five (TP section 3.4.8): there is no generic reader.

pub mod cursor;
pub mod damm_v2;
pub mod epoch;
pub mod price_touch;
pub mod price_update;
mod shared;
pub mod spl_mint;
pub mod stake_pool;
pub mod vote_stake;

use pinocchio::{
    error::ProgramError,
    sysvars::{clock::Clock, Sysvar},
    AccountView,
};

use crate::state::{
    campaign::Campaign,
    enums::{Direction, ReaderKind},
};

pub use shared::{after_deadline, fact_resolution, min_distance, Decision, Reading, Resolution};

/// The cluster's clock, as the readers need it. Built from `Clock` on-chain; a host test builds
/// it by hand.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ChainTime {
    pub unix_timestamp: i64,
    pub slot: u64,
    pub epoch: u64,
}

impl ChainTime {
    pub fn now() -> Result<Self, ProgramError> {
        let clock = Clock::get()?;
        Ok(Self {
            unix_timestamp: clock.unix_timestamp,
            slot: clock.slot,
            epoch: clock.epoch,
        })
    }
}

/// What `user_open_campaign` hands a reader: the metric account and the campaign's parameters.
pub struct CreationContext<'a> {
    pub metric: &'a AccountView,
    /// Price kind only: the feed the campaign names, and the direction of the touch.
    pub feed_id: &'a [u8; 32],
    pub direction: Direction,
    pub target: i128,
    /// Price kind only: the maximum price age the campaign will copy (`campaign_max_age`).
    pub max_age: u32,
    /// Epoch kinds only: the measured epoch; zero for the other kinds.
    pub epoch: u64,
    /// The deadline the creator passed, already within 3 to 90 days (row 5).
    pub deadline_at: i64,
    pub time: ChainTime,
}

/// What a reader reports at opening, for the campaign to store.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct CreationReading {
    /// Price kind: the feed's exponent, so later reads compare in the same scale; zero otherwise.
    pub price_exponent: i32,
}

/// What a join (`proof: None`) or a resolution hands a reader.
pub struct ReadContext<'a> {
    /// The campaign's `metric_account`; the caller has compared the address.
    pub metric: &'a AccountView,
    pub campaign: &'a Campaign,
    pub time: ChainTime,
    /// Price kind, at resolution: the account offered as the YES proof (any account; the reader
    /// checks it). The other kinds never read it.
    pub proof: Option<&'a AccountView>,
}

/// Rows 2 and 3 of TP section 3.4.10 for `kind` (and, for the epoch kinds, the epoch's part of
/// row 5): the account fits the kind, and the target is not met and far enough. Row 1 (the kind
/// opens at all) and the unused arguments are checked by the caller first.
pub fn validate_at_creation(
    kind: ReaderKind,
    ctx: &CreationContext,
) -> Result<CreationReading, ProgramError> {
    match kind {
        ReaderKind::PriceTouch => price_touch::validate_at_creation(ctx),
        ReaderKind::SupplyAtMost => spl_mint::validate_at_creation(ctx),
        ReaderKind::DammV2LockedAtLeast => damm_v2::validate_at_creation(ctx),
        ReaderKind::StakePoolTvlAtLeast => stake_pool::validate_at_creation(ctx),
        ReaderKind::StakeAtLeast => vote_stake::validate_at_creation(ctx),
    }
}

/// The join lock (BR-06): true once the outcome can no longer change, or is already decided. An
/// unreadable account is an error, so the join is refused.
pub fn outcome_knowable(kind: ReaderKind, ctx: &ReadContext) -> Result<bool, ProgramError> {
    match kind {
        ReaderKind::PriceTouch => price_touch::outcome_knowable(ctx),
        ReaderKind::SupplyAtMost => spl_mint::outcome_knowable(ctx),
        ReaderKind::DammV2LockedAtLeast => damm_v2::outcome_knowable(ctx),
        ReaderKind::StakePoolTvlAtLeast => stake_pool::outcome_knowable(ctx),
        ReaderKind::StakeAtLeast => vote_stake::outcome_knowable(ctx),
    }
}

/// Resolution: the table of TP section 3.4.6, per kind.
pub fn try_resolve(kind: ReaderKind, ctx: &ReadContext) -> Result<Resolution, ProgramError> {
    match kind {
        ReaderKind::PriceTouch => price_touch::try_resolve(ctx),
        ReaderKind::SupplyAtMost => spl_mint::try_resolve(ctx),
        ReaderKind::DammV2LockedAtLeast => damm_v2::try_resolve(ctx),
        ReaderKind::StakePoolTvlAtLeast => stake_pool::try_resolve(ctx),
        ReaderKind::StakeAtLeast => vote_stake::try_resolve(ctx),
    }
}
