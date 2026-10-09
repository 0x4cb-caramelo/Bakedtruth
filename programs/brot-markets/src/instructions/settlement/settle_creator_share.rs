//! Purpose: `settle_creator_share`: pays the creator's share once, to the stored creator only (TP 3.4.16, I13).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze: the accounts and arguments; the body is lane C)
//!
//! Accounts: 0 campaign (writable), 1 vault (writable), 2 creator (writable; must be the stored creator), 3 event authority, 4 program.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::error::BrotError;

/// Stub: refused with `UnknownInstruction` until the lane lands the body.
pub fn settle_creator_share(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    _data: &[u8],
) -> ProgramResult {
    Err(BrotError::UnknownInstruction.into())
}
