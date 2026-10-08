//! Purpose: `admin_transfer_admin`: the admin names the pending admin, the first step of the two-
//!          step change; zero cancels a pending change.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{instructions::args, layout::Pubkey, zero_copy};

#[derive(ShankType)]
#[repr(C)]
pub struct TransferAdminArgs {
    /// The key that must sign `admin_accept_admin`; zero cancels.
    pub new_admin: Pubkey,
}

zero_copy!(TransferAdminArgs = 32);

pub fn admin_transfer_admin(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<TransferAdminArgs>(data)?;
    let _ = args;
    let [admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let _ = (program_id, admin, config, event_authority, program);
    todo!("Sprint 02 lane B")
}
