//! Purpose: `admin_set_creation_params`: the admin changes the creation parameters, each under its
//!          code ceiling; campaigns already open keep the values they copied.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{instructions::args, state::config::CreationParams};

pub fn admin_set_creation_params(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let params = args::<CreationParams>(data)?;
    let _ = params;
    let [admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let _ = (program_id, admin, config, event_authority, program);
    todo!("Sprint 02 lane B")
}
