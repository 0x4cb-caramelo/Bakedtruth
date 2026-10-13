//! Purpose: `sponsor_join_campaign(side, entry_usd, max_lamports, min_return_bps, expected_entry_total)`:
//!          a sealed entry. A sponsor joins with at least the config's `opening_fee_usd`, charged at the
//!          SOL/USD price as a paid opening is; the entry part joins the pot as a join does, and the fee
//!          part is held in the sponsor's `SealedFee` until the campaign is finalized. SCAFFOLD STUB of
//!          Sprint 15: it decodes its arguments and refuses every call with `UnknownInstruction` until
//!          lane L15 fills it.
//! Version: 0.0.1
//! Sprint: 15 (scaffold of Sprints 14–15, 2026-10-13; the body by lane L15). Accounts: 0 sponsor
//!         (writable, signer; pays the entry, the fee and the rents), 1 config, 2 campaign (writable),
//!         3 vault (writable), 4 entry (writable; PDA ["entry", campaign, sponsor], created on the
//!         first join), 5 metric account (the join lock), 6 join (writable; PDA ["join", campaign,
//!         sponsor, index], created), 7 SOL/USD price (the sponsored account of `SOL_USD_FEED_ID`),
//!         8 sealed fee (writable; PDA ["sealed", campaign, sponsor], created on the first sealed
//!         entry, then topped up), 9 System Program, 10 event authority, 11 program. Arguments:
//!         29 bytes.

use pinocchio::{AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{
    error::BrotError,
    instructions::args,
    layout::{LeU32, LeU64},
    zero_copy,
};

#[derive(ShankType)]
#[repr(C)]
pub struct SponsorJoinArgs {
    #[idl_type("Side")]
    pub side: u8,
    /// Whole US$; at least the config's `opening_fee_usd`.
    #[idl_type("u64")]
    pub entry_usd: LeU64,
    /// The most lamports the sealed entry may cost at the SOL/USD price.
    #[idl_type("u64")]
    pub max_lamports: LeU64,
    /// As in `user_join_campaign`; 0 accepts any.
    #[idl_type("u32")]
    pub min_return_bps: LeU32,
    /// As in `user_join_campaign`: the sponsor's whole entry before this one, as the client read it (T10).
    #[idl_type("u64")]
    pub expected_entry_total: LeU64,
}

zero_copy!(SponsorJoinArgs = 29);

/// Decodes the arguments (`BadInstructionData` otherwise), then refuses with `UnknownInstruction`,
/// whatever the accounts.
pub fn sponsor_join_campaign(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    args::<SponsorJoinArgs>(data)?;
    Err(BrotError::UnknownInstruction.into())
}
