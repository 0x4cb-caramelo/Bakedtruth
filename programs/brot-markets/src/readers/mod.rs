//! Purpose: the closed set of readers that turn an on-chain account into a YES/NO answer, and the
//!          interface each one exposes: `validate_at_creation`, `outcome_knowable`, `try_resolve`.
//! Version: 0.0.2
//! Sprint: 00 (setup); the price read arrived in 01; the interface in 02, signatures frozen at the
//!         sprint's opening. Only the price kind's `validate_at_creation` is real in 02 (lane D).
//!
//! One reader per file. Each checks the owner and the layout of its account before it reads a
//! single field, and returns an error, never a panic, when the bytes are not what it expects.
//! The four other kinds (`SupplyAtMost`, `DammV2LockedAtLeast`, `StakePoolTvlAtLeast`,
//! `StakeAtLeast`) are refused at opening with `ReaderKindNotOpen` until Sprint 03 ports them.

pub mod cursor;
pub mod price_touch;

use pinocchio::{error::ProgramError, AccountView};

use crate::state::{
    campaign::Campaign,
    enums::{Direction, ReaderKind, VoidReason},
};

/// What `user_open_campaign` hands a reader: the metric account and the campaign's parameters.
pub struct CreationContext<'a> {
    pub metric: &'a AccountView,
    /// Price kind only: the feed the campaign names.
    pub feed_id: &'a [u8; 32],
    pub direction: Direction,
    pub target: i128,
    /// The maximum price age the campaign will copy (`GlobalConfig.campaign_max_age`).
    pub max_age: u32,
    pub now: i64,
}

/// What a reader reports at opening, for the campaign to store.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct CreationReading {
    /// Price kind: the feed's exponent, so later reads compare in the same scale.
    pub price_exponent: i32,
}

/// What a join or a resolution hands a reader (Sprint 03).
pub struct ReadContext<'a> {
    pub metric: &'a AccountView,
    pub campaign: &'a Campaign,
    pub now: i64,
}

/// A reader's answer when asked to resolve (Sprint 03).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Resolution {
    NotYet,
    Yes { observed: i128 },
    No { observed: i128, met_late: bool },
    Void(VoidReason),
}

/// Rows 2 to 4 of TP section 3.4.10 for `kind`: the account fits the kind, and the target is not
/// met yet. Row 1 (the kind opens at all) is checked by the caller first.
pub fn validate_at_creation(
    kind: ReaderKind,
    ctx: &CreationContext,
) -> Result<CreationReading, ProgramError> {
    match kind {
        ReaderKind::PriceTouch => price_touch_validate_at_creation(ctx),
        ReaderKind::SupplyAtMost
        | ReaderKind::DammV2LockedAtLeast
        | ReaderKind::StakePoolTvlAtLeast
        | ReaderKind::StakeAtLeast => Err(crate::error::BrotError::ReaderKindNotOpen.into()),
    }
}

/// The join lock: true once the outcome can no longer change (Sprint 03).
pub fn outcome_knowable(kind: ReaderKind, ctx: &ReadContext) -> Result<bool, ProgramError> {
    let _ = (kind, ctx);
    Err(crate::error::BrotError::ReaderNotReady.into())
}

/// Resolution (Sprint 03).
pub fn try_resolve(kind: ReaderKind, ctx: &ReadContext) -> Result<Resolution, ProgramError> {
    let _ = (kind, ctx);
    Err(crate::error::BrotError::ReaderNotReady.into())
}

/// The price kind at opening: the metric account is the sponsored account of `feed_id`
/// (`MetricAccountMismatch`), reads as a Full update of that feed (the reader's errors), is fresh
/// within `max_age` (`PriceStale`), positive (`PriceNonPositive`), within 0.5% confidence
/// (`PriceConfidenceTooWide`), and price ± confidence has not reached the target in the
/// campaign's direction (`TargetAlreadyTouched`). Lane D implements it in `price_touch.rs` or
/// here.
fn price_touch_validate_at_creation(
    ctx: &CreationContext,
) -> Result<CreationReading, ProgramError> {
    let _ = ctx;
    todo!("Sprint 02 lane D")
}
