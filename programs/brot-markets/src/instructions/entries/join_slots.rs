//! Purpose: the slots of a join and what the client signs with it, shared by `user_join_campaign` and
//!          `sponsor_join_campaign`, and the slot checks both run before the join's rules (`join_core.rs`).
//! Version: 0.0.1
//! Sprint: 15 (lane L15): moved out of `join_campaign.rs` 0.0.5, the checks and their order unchanged

use pinocchio::{AccountView, Address, ProgramResult};

use super::join_record::check_join_slot;
use crate::{checks, state::enums::Side};

/// The ten slots of a join, in `user_join_campaign`'s order; a sealed entry passes its own ten.
pub struct JoinAccounts<'a> {
    pub baker: &'a AccountView,
    pub config: &'a AccountView,
    pub campaign: &'a mut AccountView,
    pub vault: &'a AccountView,
    pub entry: &'a mut AccountView,
    pub metric_account: &'a AccountView,
    pub join: &'a mut AccountView,
    pub system_program: &'a AccountView,
    pub event_authority: &'a AccountView,
    pub program: &'a AccountView,
}

/// What the client signed besides the amount: the side, the least return in bps of the amount
/// (0 accepts any) and the baker's whole entry before this join (T10).
#[derive(Clone, Copy, Debug)]
pub struct JoinTerms {
    pub side: Side,
    pub min_return_bps: u32,
    pub expected_entry_total: u64,
}

/// The slot checks of a join, in the order of `checks.rs`: the flags, the pairs that must differ,
/// the Join slot, the System Program and the event slots.
pub fn check_slots(a: &JoinAccounts, program_id: &Address) -> ProgramResult {
    checks::signer(a.baker)?;
    checks::writable(a.baker)?;
    checks::writable(a.campaign)?;
    checks::writable(a.vault)?;
    checks::writable(a.entry)?;
    checks::distinct(a.campaign, a.vault)?;
    checks::distinct(a.entry, a.vault)?;
    checks::distinct(a.entry, a.campaign)?;
    check_join_slot(a.join, &[a.baker, a.vault, &*a.entry, &*a.campaign])?;
    checks::system_program(a.system_program)?;
    checks::event_accounts(a.event_authority, a.program, program_id)
}
