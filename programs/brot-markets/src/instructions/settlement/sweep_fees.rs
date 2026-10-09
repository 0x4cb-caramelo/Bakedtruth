//! Purpose: `sweep_fees`: sends the fee vault's lamports above its rent-exempt minimum to GlobalConfig.fee_recipient, and nowhere else (TP 3.4.4).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze: the accounts and arguments; the body is lane D)
//!
//! Accounts: 0 config (read), 1 fee vault (writable), 2 fee recipient (writable; must be the stored fee_recipient), 3 event authority, 4 program. Any wallet; it chooses nothing.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::error::BrotError;

/// Stub: refused with `UnknownInstruction` until the lane lands the body.
pub fn sweep_fees(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    _data: &[u8],
) -> ProgramResult {
    Err(BrotError::UnknownInstruction.into())
}
