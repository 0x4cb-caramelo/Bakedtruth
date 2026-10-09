//! Purpose: `DammV2LockedAtLeast`: YES once a Meteora DAMM v2 pool's permanently locked
//!          liquidity reaches the target. Locking is one-way, so the fact is irreversible.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution); signatures frozen at the sprint's opening, bodies by lane A
//!
//! Ported from pred-provable's `resolver.rs`: Copyright (c) 2026 Ronaldo Pereira, MIT License
//! (LICENSE at the repository root).
//!
//! Owner DAMM v2, 1,112 bytes, the `Pool` discriminator; `permanent_lock_liquidity` (u128) at
//! offset 552. The target is in liquidity units, held whole by the i128 `target` (the frozen
//! program's `shift` is not needed). Resolution through `fact_resolution`.

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
