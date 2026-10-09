//! Purpose: `SupplyAtMost`, the burn kind: YES once a classic SPL Token mint's supply is at or
//!          below the target. An irreversible fact while the mint authority stays revoked.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution); signatures frozen at the sprint's opening, bodies by lane A
//!
//! Ported from pred-provable's `resolver.rs`: Copyright (c) 2026 Ronaldo Pereira, MIT License
//! (LICENSE at the repository root).
//!
//! Owner classic SPL Token (a Token-2022 mint fails it), 82 bytes, initialized, mint authority
//! revoked at opening (`MintAuthorityLive`); target below the supply by at least
//! `MIN_DISTANCE_BPS_SUPPLY` (row 3). Resolution through `fact_resolution`.

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
