//! Purpose: the instruction dispatcher: the first byte of the instruction data picks the handler,
//!          the rest is that handler's arguments.
//! Version: 0.0.4
//! Sprint: 02 (pot core on Pinocchio); `resolve_campaign` in 03; the five stubs of the scaffold of
//!         Sprints 14–15 (2026-10-13)

use pinocchio::{AccountView, Address, ProgramResult};

use crate::{
    error::BrotError,
    events,
    instructions::{admin, campaigns, entries, ix, referral, resolution, settlement},
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
        ix::RESOLVE_CAMPAIGN => {
            resolution::resolve_campaign::resolve_campaign(program_id, accounts, args)
        }
        ix::TEAM_CONFIRM_RESULT => {
            resolution::team_confirm_result::team_confirm_result(program_id, accounts, args)
        }
        ix::TEAM_VOID_CAMPAIGN => {
            resolution::team_void_campaign::team_void_campaign(program_id, accounts, args)
        }
        ix::TEAM_OPEN_CONTEST => {
            resolution::team_open_contest::team_open_contest(program_id, accounts, args)
        }
        ix::FINALIZE_CAMPAIGN => {
            settlement::finalize_campaign::finalize_campaign(program_id, accounts, args)
        }
        ix::SETTLE_ENTRY => settlement::settle_entry::settle_entry(program_id, accounts, args),
        ix::SETTLE_CREATOR_SHARE => {
            settlement::settle_creator_share::settle_creator_share(program_id, accounts, args)
        }
        ix::COLLECT_FEE => settlement::collect_fee::collect_fee(program_id, accounts, args),
        ix::SETTLE_PRIZE => settlement::settle_prize::settle_prize(program_id, accounts, args),
        ix::CLOSE_CAMPAIGN => {
            settlement::close_campaign::close_campaign(program_id, accounts, args)
        }
        ix::SWEEP_FEES => settlement::sweep_fees::sweep_fees(program_id, accounts, args),
        ix::TALLY_LATE_JOINS => {
            settlement::tally_late_joins::tally_late_joins(program_id, accounts, args)
        }
        ix::USER_LINK_REFERRER => {
            referral::link_referrer::user_link_referrer(program_id, accounts, args)
        }
        ix::REREAD_CAMPAIGN => {
            resolution::reread_campaign::reread_campaign(program_id, accounts, args)
        }
        ix::ADMIN_DECIDE_CONTEST => {
            resolution::admin_decide_contest::admin_decide_contest(program_id, accounts, args)
        }
        ix::SPONSOR_JOIN_CAMPAIGN => {
            entries::sponsor_join_campaign::sponsor_join_campaign(program_id, accounts, args)
        }
        ix::SETTLE_SEALED_FEE => {
            settlement::settle_sealed_fee::settle_sealed_fee(program_id, accounts, args)
        }
        ix::EMIT_EVENT => events::process_event_instruction(accounts),
        _ => Err(BrotError::UnknownInstruction.into()),
    }
}
