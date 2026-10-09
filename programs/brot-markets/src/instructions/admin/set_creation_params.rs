//! Purpose: `admin_set_creation_params`: the admin changes the creation parameters, each under its
//!          code ceiling, and raises `params_version` by one; campaigns already open keep the
//!          values they copied.
//! Version: 0.0.3
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B; 03 (`params_version`), lane F

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks,
    error::BrotError,
    events,
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
    // The terms an opening signs (Sprint 03): every successful call raises the version by one,
    // the same values included, so the version counts the `ConfigChanged` events of this kind
    // and an opening previewed before the call is refused (`CreationParamsChanged`). The
    // initialisation leaves it at 0.
    let version = state
        .params_version
        .get()
        .checked_add(1)
        .ok_or(BrotError::MathOverflow)?;
    // Future campaigns only: an open campaign keeps what it copied at opening, and the
    // `open_campaigns` counter is not a parameter, so it is left as it is.
    state.params = *params;
    state.params_version.set(version);
    let event = config_changed(ConfigChange::CreationParams, admin.address(), &state);
    drop(state);
    events::emit(&event, event_authority, program, program_id)
}
