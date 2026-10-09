//! Purpose: `close_campaign`: moves dust and surplus to the fee vault, returns the rent to rent_payer, zeroes the data and gives both accounts back to the System Program (TP 3.4.4, I14).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze: the accounts and arguments; the body is lane D)
//!
//! Accounts: 0 campaign (writable), 1 vault (writable), 2 rent payer (writable; must be the stored rent_payer), 3 fee vault (writable), 4 event authority, 5 program.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::error::BrotError;

/// Stub: refused with `UnknownInstruction` until the lane lands the body.
pub fn close_campaign(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    _data: &[u8],
) -> ProgramResult {
    Err(BrotError::UnknownInstruction.into())
}
