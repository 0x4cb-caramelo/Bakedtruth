//! Purpose: `admin_decide_contest(decision, void_reason, note_hash)`: in stage 2 of a contest, before
//!          its deadline, the admin confirms the stored result or voids the campaign with a team reason
//!          and the hash of a note; the snapshot follows. It never inverts the outcome. SCAFFOLD STUB of
//!          Sprint 14: it decodes its arguments and refuses every call with `UnknownInstruction` until
//!          lane L14B fills it.
//! Version: 0.0.1
//! Sprint: 14 (scaffold of Sprints 14–15, 2026-10-13; the body by lane L14B). Accounts: 0 admin
//!         (signer; GlobalConfig.admin), 1 config (writable: the open count), 2 campaign (writable;
//!         Contested, stage 2), 3 event authority, 4 program. Arguments: `decision` (a
//!         `ContestDecision`), `void_reason` (a `VoidReason`) and `note_hash`, 34 bytes.

use pinocchio::{AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{error::BrotError, instructions::args, zero_copy};

#[derive(ShankType)]
#[repr(C)]
pub struct DecideContestArgs {
    /// `Confirm` keeps the stored result; `Void` voids the campaign.
    #[idl_type("ContestDecision")]
    pub decision: u8,
    /// The reason of a `Void` decision, one a team key may choose.
    #[idl_type("VoidReason")]
    pub void_reason: u8,
    /// The hash of the admin's note.
    pub note_hash: [u8; 32],
}

zero_copy!(DecideContestArgs = 34);

/// Decodes the arguments (`BadInstructionData` otherwise), then refuses with `UnknownInstruction`,
/// whatever the accounts.
pub fn admin_decide_contest(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    args::<DecideContestArgs>(data)?;
    Err(BrotError::UnknownInstruction.into())
}
