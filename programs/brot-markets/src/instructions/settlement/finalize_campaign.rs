//! Purpose: `finalize_campaign`: the snapshot of a reviewed campaign: the totals, the mode, the creator share; open_campaigns down for a paid campaign (TP 3.4.3, I7).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze: the accounts and arguments; the body is lane C)
//!
//! Accounts: 0 campaign (writable), 1 config (writable, the open count), 2 event authority, 3 program. Any wallet, after `review_ends_at`.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::error::BrotError;

/// Stub: refused with `UnknownInstruction` until the lane lands the body.
pub fn finalize_campaign(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    _data: &[u8],
) -> ProgramResult {
    Err(BrotError::UnknownInstruction.into())
}
