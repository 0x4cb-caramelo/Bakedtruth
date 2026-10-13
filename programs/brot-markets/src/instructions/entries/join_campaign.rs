//! Purpose: `user_join_campaign`: a baker joins YES or NO with at least `min_entry_lamports` while
//!          the outcome is not knowable; the entry moves from the baker's wallet into the vault
//!          by System Program transfer, and the pot is bookkept, never read from the vault.
//! Version: 0.0.6
//! Sprint: 02 (pot core on Pinocchio), accounts and arguments frozen at its opening, body by
//!         lane E; 03 (readers and resolution) adds the join lock (BR-06), lane E; 04 (lane G)
//!         reads the campaign's own minimum (question 5) and the proximity buffer (question 7).
//!         The `Join` record (`join_record.rs`) is created at slot 6 with the entry's join count as its index.
//!         15 (lane L15): the slot checks move to `join_slots.rs` and the rules and effects to
//!         `join_core.rs`, shared with the sealed entry, in the same order with the same errors.
//!
//! Order: the arguments, the slots and the side byte; then the slot checks (`join_slots.rs`); then the
//! join's rules, its effects and its event (`join_core.rs`, whose module note gives their order), with
//! the signed `amount` as the amount the join enters. Every refusal has its own error. There is no
//! cap of any kind (D-h), and no instruction moves an entry out (A-1).

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use super::{
    join_core,
    join_slots::{check_slots, JoinAccounts, JoinTerms},
};
use crate::{
    instructions::args,
    layout::{LeU32, LeU64},
    state::enums::Side,
    zero_copy,
};

#[derive(ShankType)]
#[repr(C)]
pub struct JoinCampaignArgs {
    #[idl_type("Side")]
    pub side: u8,
    /// Lamports; at least `min_entry_lamports`. No cap (D-h).
    #[idl_type("u64")]
    pub amount: LeU64,
    /// The least the entry must return if its side wins, in bps of `amount`, on the pot as it
    /// stands after the entry; 0 accepts any.
    #[idl_type("u32")]
    pub min_return_bps: LeU32,
    /// The baker's whole entry, both sides, before this join, as the client read it (T10): a
    /// retried transaction finds another total and fails instead of entering twice.
    #[idl_type("u64")]
    pub expected_entry_total: LeU64,
}

zero_copy!(JoinCampaignArgs = 21);

pub fn user_join_campaign(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<JoinCampaignArgs>(data)?;
    // The Join account sits at slot 6 (amendment 2026-10-09): one record per join, created here.
    let [baker, config, campaign, vault, entry, metric_account, join, system_program, event_authority, program, ..] =
        accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let side = Side::try_from(args.side)?;
    let amount = args.amount.get();
    let slots = JoinAccounts {
        baker,
        config,
        campaign,
        vault,
        entry,
        metric_account,
        join,
        system_program,
        event_authority,
        program,
    };
    check_slots(&slots, program_id)?;
    let terms = JoinTerms {
        side,
        min_return_bps: args.min_return_bps.get(),
        expected_entry_total: args.expected_entry_total.get(),
    };
    join_core::join(slots, terms, program_id, |_, _| Ok((amount, ())))
}
