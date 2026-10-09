//! Purpose: `team_void_campaign(reason, note_hash)` (TP sections 3.4.3, 3.4.7): a team key voids a
//!          campaign inside the window with a reason it may choose and the hash of its note.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze: the accounts and arguments; the body is lane A's)
//!
//! Accounts: 0 team key (signer), 1 config (written for the open count), 2 campaign (writable),
//! 3 event authority, 4 program. Arguments: `reason` (a `VoidReason`) and `note_hash`, 33 bytes.

use pinocchio::{AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{error::BrotError, zero_copy};

#[derive(ShankType)]
#[repr(C)]
pub struct TeamVoidCampaignArgs {
    /// The reason; lane A refuses the reasons a team key may not choose (`VoidReasonNotForTeam`).
    #[idl_type("VoidReason")]
    pub reason: u8,
    /// The hash of the team's note, kept in the campaign and the event.
    pub note_hash: [u8; 32],
}

zero_copy!(TeamVoidCampaignArgs = 33);

/// Stub: refused with `UnknownInstruction` until the lane lands the body.
pub fn team_void_campaign(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    _data: &[u8],
) -> ProgramResult {
    Err(BrotError::UnknownInstruction.into())
}
