//! Purpose: `team_pause_entries`: a team key pauses entries and openings, `Normal` to
//!          `EntriesHalted` only. Payouts never pause (P4 section 4.5).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::instructions::no_args;

pub fn team_pause_entries(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [team_member, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let _ = (program_id, team_member, config, event_authority, program);
    todo!("Sprint 02 lane B")
}
