//! Purpose: `settle_prize`: returns the prize to whoever opened in OneSided and Refund, and the opening fee on a house-failure void (P-4).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze: the accounts and arguments; the body is lane C)
//!
//! Accounts: 0 campaign (writable), 1 vault (writable), 2 recipient (writable; must be the stored creator, who opened), 3 event authority, 4 program.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::error::BrotError;

/// Stub: refused with `UnknownInstruction` until the lane lands the body.
pub fn settle_prize(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    _data: &[u8],
) -> ProgramResult {
    Err(BrotError::UnknownInstruction.into())
}
