//! Purpose: `admin_transfer_admin`: the admin names the pending admin, the first step of the two-
//!          step change; zero cancels a pending change.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{
    checks, events,
    instructions::{
        admin::shared::{config_changed, require_admin},
        args,
    },
    layout::Pubkey,
    state::{config::GlobalConfig, enums::ConfigChange},
    zero_copy,
};

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
    let [admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(admin)?;
    checks::writable(config)?;
    checks::event_accounts(event_authority, program, program_id)?;
    let mut state = GlobalConfig::load_mut(config, program_id)?;
    require_admin(&state, admin.address())?;
    // Only names the key; the admin changes when that key signs `admin_accept_admin`. A new
    // transfer replaces a pending one, and zero cancels it.
    state.pending_admin = args.new_admin;
    let event = config_changed(ConfigChange::PendingAdmin, admin.address(), &state);
    drop(state);
    events::emit(&event, event_authority, program, program_id)
}
