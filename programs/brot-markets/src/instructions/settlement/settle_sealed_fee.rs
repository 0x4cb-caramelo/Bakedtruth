//! Purpose: `settle_sealed_fee`: once the campaign is finalized, any wallet sends a sponsor's held fee
//!          to the sponsor (a refund for a house failure) or else to the fee vault, and closes the
//!          `SealedFee` with its rent to the sponsor. SCAFFOLD STUB of Sprint 15: it decodes its (empty)
//!          arguments and refuses every call with `UnknownInstruction` until lane L15 fills it.
//! Version: 0.0.1
//! Sprint: 15 (scaffold of Sprints 14–15, 2026-10-13; the body by lane L15). Accounts: 0 sealed fee
//!         (writable; closed), 1 campaign (writable; Settling or Settled, its `sealed_fees_open`
//!         decremented), 2 sponsor (writable; SealedFee.sponsor: the refund and the rent), 3 fee vault
//!         (writable; PDA ["fee_vault"]), 4 event authority, 5 program. No arguments.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::{error::BrotError, instructions::no_args};

/// Decodes the (empty) arguments (`BadInstructionData` otherwise), then refuses with
/// `UnknownInstruction`, whatever the accounts.
pub fn settle_sealed_fee(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    Err(BrotError::UnknownInstruction.into())
}
