//! Purpose: `settle_entry`: pays one entry from the vault to its stored baker and closes the Entry, its rent back to the baker (TP 3.4.5).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze: the accounts and arguments; the body is lane C)
//!
//! Accounts: 0 entry (writable), 1 campaign (writable), 2 vault (writable), 3 baker (writable; must be the Entry's stored baker), 4 event authority, 5 program.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::error::BrotError;

/// Stub: refused with `UnknownInstruction` until the lane lands the body.
pub fn settle_entry(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    _data: &[u8],
) -> ProgramResult {
    Err(BrotError::UnknownInstruction.into())
}
