//! Purpose: `reread_campaign`: in stage 1 of a contest, any wallet runs the campaign's reading again,
//!          at the top level only, and compares it with the stored result: the same result finalizes
//!          the campaign, any difference opens stage 2. SCAFFOLD STUB of Sprint 14: it decodes its
//!          (empty) arguments and refuses every call with `UnknownInstruction` until lane L14B fills it.
//! Version: 0.0.1
//! Sprint: 14 (scaffold of Sprints 14–15, 2026-10-13; the body by lane L14B). Accounts: 0 campaign
//!         (writable; Contested, stage 1), 1 config (writable: the open count), 2 metric account,
//!         3 proof account (price kind: a proof, any Full account of the feed; other kinds: not read),
//!         4 event authority, 5 program. No arguments.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::{error::BrotError, instructions::no_args};

/// Decodes the (empty) arguments (`BadInstructionData` otherwise), then refuses with
/// `UnknownInstruction`, whatever the accounts.
pub fn reread_campaign(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    Err(BrotError::UnknownInstruction.into())
}
