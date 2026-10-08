//! Purpose: the instruction dispatcher: the first byte of the instruction data picks the handler,
//!          the rest is that handler's arguments.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio)

use pinocchio::{AccountView, Address, ProgramResult};

use crate::{
    error::BrotError,
    events,
    instructions::{admin, campaigns, entries, ix},
};

pub fn process_instruction(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let (discriminator, args) = data.split_first().ok_or(BrotError::UnknownInstruction)?;
    match *discriminator {
        ix::ADMIN_INITIALIZE_CONFIG => {
            admin::initialize_config::admin_initialize_config(program_id, accounts, args)
        }
        ix::ADMIN_SET_TEAM => admin::set_team::admin_set_team(program_id, accounts, args),
        ix::ADMIN_SET_CREATION_PARAMS => {
            admin::set_creation_params::admin_set_creation_params(program_id, accounts, args)
        }
        ix::ADMIN_SET_FEE_RECIPIENT => {
            admin::set_fee_recipient::admin_set_fee_recipient(program_id, accounts, args)
        }
        ix::ADMIN_TRANSFER_ADMIN => {
            admin::transfer_admin::admin_transfer_admin(program_id, accounts, args)
        }
        ix::ADMIN_ACCEPT_ADMIN => {
            admin::accept_admin::admin_accept_admin(program_id, accounts, args)
        }
        ix::TEAM_PAUSE_ENTRIES => {
            admin::pause_entries::team_pause_entries(program_id, accounts, args)
        }
        ix::ADMIN_RESUME_ENTRIES => {
            admin::resume_entries::admin_resume_entries(program_id, accounts, args)
        }
        ix::USER_OPEN_CAMPAIGN => {
            campaigns::open_campaign::user_open_campaign(program_id, accounts, args)
        }
        ix::USER_JOIN_CAMPAIGN => {
            entries::join_campaign::user_join_campaign(program_id, accounts, args)
        }
        ix::EMIT_EVENT => events::process_event_instruction(accounts),
        _ => Err(BrotError::UnknownInstruction.into()),
    }
}
