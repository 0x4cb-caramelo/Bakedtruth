//! Purpose: `admin_set_team`: the admin sets up to five team keys (Q12), one per person.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{instructions::args, layout::Pubkey, zero_copy};

#[derive(ShankType)]
#[repr(C)]
pub struct SetTeamArgs {
    /// How many of `team` are used: at most five, none zero, no key twice; the rest all zero.
    pub team_len: u8,
    pub team: [Pubkey; 5],
}

zero_copy!(SetTeamArgs = 161);

pub fn admin_set_team(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<SetTeamArgs>(data)?;
    let _ = args;
    let [admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let _ = (program_id, admin, config, event_authority, program);
    todo!("Sprint 02 lane B")
}
