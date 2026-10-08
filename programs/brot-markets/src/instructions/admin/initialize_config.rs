//! Purpose: `admin_initialize_config`: creates `GlobalConfig` and the data-less fee vault, once.
//!          Only the program's upgrade authority, read from its ProgramData account, can run it (TP
//!          section 7).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{instructions::args, layout::Pubkey, state::config::CreationParams, zero_copy};

#[derive(ShankType)]
#[repr(C)]
pub struct InitializeConfigArgs {
    /// The first admin (not zero). The upgrade authority chooses it.
    pub admin: Pubkey,
    /// Where `sweep_fees` will send the fee vault (not zero).
    pub fee_recipient: Pubkey,
    /// Checked like `admin_set_creation_params` checks them.
    pub params: CreationParams,
}

zero_copy!(InitializeConfigArgs = 134);

pub fn admin_initialize_config(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<InitializeConfigArgs>(data)?;
    let _ = args;
    let [authority, config, fee_vault, program_data, system_program, event_authority, program, ..] =
        accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let _ = (
        program_id,
        authority,
        config,
        fee_vault,
        program_data,
        system_program,
        event_authority,
        program,
    );
    todo!("Sprint 02 lane B")
}
