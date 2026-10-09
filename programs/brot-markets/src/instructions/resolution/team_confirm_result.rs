//! Purpose: `team_confirm_result` (the team ends the review window and the snapshot runs at once (TP 3.4.3)).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze: the accounts and arguments; the body is lane A)
//!
//! Accounts: 0 team key (signer, `GlobalConfig.team`), 1 config (`GlobalConfig`, read, or written for
//!           the open count), 2 campaign (writable), 3 event authority, 4 program.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::error::BrotError;

/// Stub: refused with `UnknownInstruction` until the lane lands the body.
pub fn team_confirm_result(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    _data: &[u8],
) -> ProgramResult {
    Err(BrotError::UnknownInstruction.into())
}
