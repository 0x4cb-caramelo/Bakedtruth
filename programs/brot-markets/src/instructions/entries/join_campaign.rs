//! Purpose: `user_join_campaign`: a baker joins YES or NO with at least `min_entry_lamports`; the
//!          entry moves from the baker's wallet into the vault by System Program transfer, and
//!          the pot is bookkept, never read from the vault.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane E

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{
    instructions::args,
    layout::{LeU32, LeU64},
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
    let [baker, config, campaign, vault, entry, metric_account, system_program, event_authority, program, ..] =
        accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let _ = (
        program_id,
        args,
        baker,
        config,
        campaign,
        vault,
        entry,
        metric_account,
        system_program,
        event_authority,
        program,
    );
    todo!("Sprint 02 lane E")
}
