//! Purpose: `collect_fee`: moves what Brot keeps to the fee vault: the house fee net of from_fee, the one-sided fees, the opening fee unless refunded (TP 3.4.16).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze: the accounts and arguments; the body is lane D)
//!
//! Accounts: 0 campaign (writable), 1 vault (writable), 2 fee vault (writable), 3 event authority, 4 program.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::error::BrotError;

/// Stub: refused with `UnknownInstruction` until the lane lands the body.
pub fn collect_fee(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    _data: &[u8],
) -> ProgramResult {
    Err(BrotError::UnknownInstruction.into())
}
