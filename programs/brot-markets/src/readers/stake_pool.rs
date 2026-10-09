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
