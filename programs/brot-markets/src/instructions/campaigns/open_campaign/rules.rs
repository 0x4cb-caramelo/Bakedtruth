//! Purpose: the rules of `user_open_campaign` that read no account: row 1 of TP section 3.4.10
//!          (the kind opens in this build), the canonical arguments (D-j: a field the kind does
//!          not use is zero) and the terms the creator saw (`expected_params_version`).
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane F
//!
//! Pure functions over the argument bytes and one config field, so the host test
//! (tests/open_campaign_rules.rs) runs every branch without a cluster. The handler calls them in
//! the order its header lists: row 1, the canonical arguments, then, after the pause and the
//! valve (row 8), the terms.

use crate::{
    error::BrotError,
    state::enums::{Direction, ReaderKind},
};

/// Whether this build opens `StakeAtLeast` (Sprint 03 [AC]): only with the `stake-at-least`
/// feature, which the default build and every CI build leave off until a devnet YES is recorded
/// (Sprint 05), and which `mainnet` refuses at compile time. Resolution never reads it, so a
/// campaign opened by a build with the feature still resolves under one without it.
pub const STAKE_AT_LEAST_OPENS: bool = cfg!(feature = "stake-at-least");

/// Row 1: the kind byte names one of the five readers (`UnknownReaderKind`), and that kind opens
/// in this build: `StakeAtLeast` only with [`STAKE_AT_LEAST_OPENS`] (`ReaderKindNotOpen`). The
/// four other kinds open.
pub fn opening_kind(byte: u8) -> Result<ReaderKind, BrotError> {
    let kind = ReaderKind::try_from(byte)?;
    if kind == ReaderKind::StakeAtLeast && !STAKE_AT_LEAST_OPENS {
        return Err(BrotError::ReaderKindNotOpen);
    }
    Ok(kind)
}

/// The canonical arguments (D-j: no field may carry hidden data). For every kind the direction
/// byte names a direction (`InvalidDirection`). A kind other than `PriceTouch` passes a zero
/// `feed_id` and `Above` (0), and a kind not measured by epoch passes `epoch` 0
/// (`UnusedArgumentNotZero`), so every byte the campaign stores or the event carries is either
/// read by its kind or zero. The epoch kinds' `epoch` itself is their reader's to check (row 5:
/// `EpochAlreadyStarted`, `EpochAfterDeadline`). Returns the direction.
pub fn canonical_direction(
    kind: ReaderKind,
    direction: u8,
    feed_id: &[u8; 32],
    epoch: u64,
) -> Result<Direction, BrotError> {
    let direction = Direction::try_from(direction)?;
    let is_price = kind == ReaderKind::PriceTouch;
    let price_fields_set = *feed_id != [0; 32] || direction != Direction::Above;
    if !is_price && price_fields_set {
        return Err(BrotError::UnusedArgumentNotZero);
    }
    if !kind.measured_by_epoch() && epoch != 0 {
        return Err(BrotError::UnusedArgumentNotZero);
    }
    Ok(direction)
}

/// The terms the creator saw (Sprint 03): the fee, the one-sided fee, the creator share, the
/// prize split, the opening fee and the join-time price age all change only through
/// `admin_set_creation_params`, which raises `GlobalConfig.params_version` by one each time. An
/// opening signed against any other version, older or newer, is refused
/// (`CreationParamsChanged`): the client reads the config again and shows the new terms.
pub fn terms_unchanged(expected: u32, current: u32) -> Result<(), BrotError> {
    if expected == current {
        Ok(())
    } else {
        Err(BrotError::CreationParamsChanged)
    }
}
