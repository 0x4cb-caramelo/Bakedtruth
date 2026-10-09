//! Purpose: `tally_late_joins` (amendment of 2026-10-09, founder decisions 1 and 2): reads a baker's Join
//!          accounts, adds the late amounts (joined at or after the YES proof's publish time) to the campaign
//!          and to the entry, closes each Join with its rent back to the baker, and marks the entry tallied
//!          when its last join is closed. Lets the snapshot know the late totals before finalize.
//! Version: 0.0.1
//! Sprint: 04 (contract amendment; the body is lane G's)
//!
//! Accounts: 0 campaign (writable), 1 entry (writable), 2 baker (writable), 3 event authority, 4 program,
//! then the Join accounts to close, in index order, at least one. Stub: refused until lane G lands the body.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::error::BrotError;

/// Stub: refused with `UnknownInstruction` until the lane lands the body.
pub fn tally_late_joins(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    _data: &[u8],
) -> ProgramResult {
    Err(BrotError::UnknownInstruction.into())
}
