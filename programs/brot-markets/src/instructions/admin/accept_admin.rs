//! Purpose: `admin_accept_admin`: the pending admin signs and becomes the admin; the pending slot
//!          is cleared (second step of the two-step change).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::instructions::no_args;

pub fn admin_accept_admin(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [new_admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let _ = (program_id, new_admin, config, event_authority, program);
    todo!("Sprint 02 lane B")
}
