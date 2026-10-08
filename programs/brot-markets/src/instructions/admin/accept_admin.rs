//! Purpose: `admin_accept_admin`: the pending admin signs and becomes the admin; the pending slot
//!          is cleared (second step of the two-step change).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks,
    error::BrotError,
    events,
    instructions::{
        admin::shared::{config_changed, is_zero, ZERO_ADDRESS},
        no_args,
    },
    state::{config::GlobalConfig, enums::ConfigChange},
};

pub fn admin_accept_admin(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [new_admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(new_admin)?;
    checks::writable(config)?;
    checks::event_accounts(event_authority, program, program_id)?;
    let mut state = GlobalConfig::load_mut(config, program_id)?;
    if is_zero(&state.pending_admin) {
        return Err(BrotError::NoPendingAdmin.into());
    }
    if state.pending_admin != *new_admin.address() {
        return Err(BrotError::NotPendingAdmin.into());
    }
    state.admin = *new_admin.address();
    state.pending_admin = ZERO_ADDRESS;
    let event = config_changed(ConfigChange::Admin, new_admin.address(), &state);
    drop(state);
    events::emit(&event, event_authority, program, program_id)
}
