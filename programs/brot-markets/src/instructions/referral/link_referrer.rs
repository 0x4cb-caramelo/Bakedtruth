//! Purpose: `user_link_referrer(referrer)`: a referee names the wallet that referred it, once, in a
//!          `ReferralLink` (`["referral", referee]`) it signs and pays the rent of. SCAFFOLD STUB of
//!          Sprint 14: it decodes its arguments and refuses every call with `UnknownInstruction` until
//!          lane L14A fills it.
//! Version: 0.0.1
//! Sprint: 14 (scaffold of Sprints 14–15, 2026-10-13; the body by lane L14A). Accounts: 0 referee
//!         (writable, signer; pays the rent), 1 referral link (writable; PDA ["referral", referee],
//!         created), 2 System Program, 3 event authority, 4 program. Arguments: `referrer`, 32 bytes.

use pinocchio::{AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{error::BrotError, instructions::args, layout::Pubkey, zero_copy};

#[derive(ShankType)]
#[repr(C)]
pub struct LinkReferrerArgs {
    /// The wallet that referred the signer: never the zero address, never the signer itself.
    pub referrer: Pubkey,
}

zero_copy!(LinkReferrerArgs = 32);

/// Decodes the arguments (`BadInstructionData` otherwise), then refuses with `UnknownInstruction`,
/// whatever the accounts.
pub fn user_link_referrer(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    args::<LinkReferrerArgs>(data)?;
    Err(BrotError::UnknownInstruction.into())
}
