//! Purpose: `admin_resume_entries`: the admin resumes entries, `EntriesHalted` to `Normal` only.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks,
    error::BrotError,
    events::{self, EntriesResumed},
    instructions::{admin::shared::require_admin, no_args},
    state::{config::GlobalConfig, enums::OperatingLevel},
};

pub fn admin_resume_entries(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(admin)?;
    checks::writable(config)?;
    checks::event_accounts(event_authority, program, program_id)?;
    let mut state = GlobalConfig::load_mut(config, program_id)?;
    require_admin(&state, admin.address())?;
    match OperatingLevel::try_from(state.operating_level)? {
        OperatingLevel::EntriesHalted => state.operating_level = OperatingLevel::Normal as u8,
        OperatingLevel::Normal => return Err(BrotError::NotPaused.into()),
    }
    drop(state);
    let event = EntriesResumed {
        signer: *admin.address(),
    };
    events::emit(&event, event_authority, program, program_id)
}
