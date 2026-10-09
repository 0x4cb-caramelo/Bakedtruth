//! Purpose: `StakeAtLeast`: YES if a vote account's stake in the measured epoch, read by
//!          `sol_get_epoch_stake`, reaches the target. Closed at opening until a devnet YES.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution); signatures frozen at the sprint's opening, bodies by lane B
//!
//! Ported from pred-provable's `resolver.rs`: Copyright (c) 2026 Ronaldo Pereira, MIT License
//! (LICENSE at the repository root).
//!
//! Owner the Vote program and a vote account's layout; the stake comes from the syscall, which
//! answers for the current epoch only, so the reading is taken while the clock is in the
//! measured epoch, and a missed epoch voids (`MissedWindow`).

use pinocchio::error::ProgramError;

use super::{CreationContext, CreationReading, ReadContext, Resolution};
use crate::error::BrotError;

/// Rows 2 and 3 for this kind.
pub fn validate_at_creation(ctx: &CreationContext) -> Result<CreationReading, ProgramError> {
    let _ = ctx;
    Err(BrotError::ReaderKindNotOpen.into())
}

/// The join lock for this kind.
pub fn outcome_knowable(ctx: &ReadContext) -> Result<bool, ProgramError> {
    let _ = ctx;
    Err(BrotError::ReaderNotReady.into())
}

/// Resolution for this kind (TP section 3.4.6).
pub fn try_resolve(ctx: &ReadContext) -> Result<Resolution, ProgramError> {
    let _ = ctx;
    Err(BrotError::ReaderNotReady.into())
}
