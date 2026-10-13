//! Purpose: `ReferralLink` (`["referral", referee]`): who referred a wallet, signed by the referee once
//!          and never changed. The indexer compares `linked_slot` and `linked_at` with the referee's
//!          first entry.
//! Version: 0.0.1
//! Sprint: 14 (scaffold of Sprints 14–15, 2026-10-13: the layout; `user_link_referrer` writes it in
//!         lane L14A)

use shank::ShankAccount;

use crate::{
    layout::{LeI64, LeU64, Pubkey},
    state::{AccountState, AccountTag},
    zero_copy,
};

#[derive(ShankAccount)]
#[repr(C)]
pub struct ReferralLink {
    pub tag: u8,
    pub version: u8,
    pub bump: u8,
    /// The wallet that signed the link, once; the account's seed.
    pub referee: Pubkey,
    /// The wallet the referee named: never the zero address, never the referee itself.
    pub referrer: Pubkey,
    /// The Unix time and the slot of the link, compared by the indexer with the referee's first entry.
    #[idl_type("i64")]
    pub linked_at: LeI64,
    #[idl_type("u64")]
    pub linked_slot: LeU64,
    #[padding]
    pub _reserved: [u8; 13],
}

zero_copy!(ReferralLink = 96);

impl AccountState for ReferralLink {
    const TAG: AccountTag = AccountTag::ReferralLink;

    fn bump(&self) -> u8 {
        self.bump
    }
}
