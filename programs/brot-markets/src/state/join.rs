//! Purpose: `Join` (`["join", campaign, baker, index]`): one join of one baker in one campaign. One account
//!          per join, so the late-entry refund is exact with no cap on joins (founder decision, 2026-10-09:
//!          "as many times as they want"). `user_join_campaign` creates it; `settle_entry` closes it with its
//!          rent back to the baker.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze: the layout; the join writes it in lane G)

use shank::ShankAccount;

use crate::{
    layout::{LeI64, LeU32, LeU64, Pubkey},
    state::AccountTag,
    zero_copy,
};

#[derive(ShankAccount)]
#[repr(C)]
pub struct Join {
    pub tag: u8,
    pub version: u8,
    pub bump: u8,
    /// `Side` of this join: 0 for YES, 1 for NO (as `Side` in `enums.rs`).
    #[idl_type("Side")]
    pub side: u8,
    pub campaign: Pubkey,
    pub baker: Pubkey,
    /// This join's position in its baker's joins in this campaign, from 0 (`Entry.join_count` before it).
    #[idl_type("u32")]
    pub index: LeU32,
    /// The Unix time of the join: the refund compares it with the YES proof's `publish_time` (question 7).
    #[idl_type("i64")]
    pub joined_at: LeI64,
    /// Lamports this join added to the vault.
    #[idl_type("u64")]
    pub amount: LeU64,
    #[padding]
    pub _reserved: [u8; 8],
}

zero_copy!(Join = 96);

impl Join {
    /// The tag this account is written with.
    pub const TAG: AccountTag = AccountTag::Join;
}
