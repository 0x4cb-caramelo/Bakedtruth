//! Purpose: `admin_resume_entries`: the admin resumes entries, `EntriesHalted` to `Normal` only.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::instructions::no_args;

pub fn admin_resume_entries(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let _ = (program_id, admin, config, event_authority, program);
    todo!("Sprint 02 lane B")
}
