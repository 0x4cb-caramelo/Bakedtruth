//! Purpose: `team_pause_entries`: a team key pauses entries and openings, `Normal` to
//!          `EntriesHalted` only. Payouts never pause (P4 section 4.5).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks,
    error::BrotError,
    events::{self, EntriesPaused},
    instructions::no_args,
    state::{config::GlobalConfig, enums::OperatingLevel},
};

pub fn team_pause_entries(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [team_member, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(team_member)?;
    checks::writable(config)?;
    checks::event_accounts(event_authority, program, program_id)?;
    let mut state = GlobalConfig::load_mut(config, program_id)?;
    // One team key is enough, to be fast (TP section 3.4.9); the admin is not one unless named.
    if !state.is_team(team_member.address()) {
        return Err(BrotError::NotTeamMember.into());
    }
    // Only `user_open_campaign` and `user_join_campaign` read the level (I10′).
    match OperatingLevel::try_from(state.operating_level)? {
        OperatingLevel::Normal => state.operating_level = OperatingLevel::EntriesHalted as u8,
        OperatingLevel::EntriesHalted => return Err(BrotError::AlreadyPaused.into()),
    }
    drop(state);
    let event = EntriesPaused {
        signer: *team_member.address(),
    };
    events::emit(&event, event_authority, program, program_id)
}
