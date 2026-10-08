//! Purpose: `admin_set_creation_params`: the admin changes the creation parameters, each under its
//!          code ceiling; campaigns already open keep the values they copied.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks, events,
    instructions::{
        admin::shared::{config_changed, require_admin},
        args,
    },
    state::{
        config::{CreationParams, GlobalConfig},
        enums::ConfigChange,
    },
};

pub fn admin_set_creation_params(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let params = args::<CreationParams>(data)?;
    let [admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(admin)?;
    checks::writable(config)?;
    checks::event_accounts(event_authority, program, program_id)?;
    let mut state = GlobalConfig::load_mut(config, program_id)?;
    require_admin(&state, admin.address())?;
    params.validate()?;
    // Future campaigns only: an open campaign keeps what it copied at opening, and the
    // `open_campaigns` counter is not a parameter, so it is left as it is.
    state.params = *params;
    let event = config_changed(ConfigChange::CreationParams, admin.address(), &state);
    drop(state);
    events::emit(&event, event_authority, program, program_id)
}
