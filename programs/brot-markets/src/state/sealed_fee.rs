//! Purpose: `SealedFee` (`["sealed", campaign, sponsor]`): the fee a sponsor's sealed entries hold on
//!          one campaign until `settle_sealed_fee` sends it to the sponsor or to the fee vault, with the
//!          totals of those entries.
//! Version: 0.0.1
//! Sprint: 15 (scaffold of Sprints 14–15, 2026-10-13: the layout; `sponsor_join_campaign` and
//!         `settle_sealed_fee` write it in lane L15)

use shank::ShankAccount;

use crate::{
    layout::{LeU32, LeU64, Pubkey},
    state::{AccountState, AccountTag},
    zero_copy,
};

#[derive(ShankAccount)]
#[repr(C)]
pub struct SealedFee {
    pub tag: u8,
    pub version: u8,
    pub bump: u8,
    pub campaign: Pubkey,
    pub sponsor: Pubkey,
    /// The fee held in this account: bookkept, never read from its lamports (I15).
    #[idl_type("u64")]
    pub fee_lamports: LeU64,
    /// The 90% of the sealed entries that went into the pot, summed.
    #[idl_type("u64")]
    pub entry_lamports: LeU64,
    /// The US$ of the sealed entries, summed.
    #[idl_type("u64")]
    pub usd_total: LeU64,
    /// How many sealed entries the sponsor made on this campaign.
    #[idl_type("u32")]
    pub sealed_count: LeU32,
    #[padding]
    pub _reserved: [u8; 17],
}

zero_copy!(SealedFee = 112);

impl AccountState for SealedFee {
    const TAG: AccountTag = AccountTag::SealedFee;

    fn bump(&self) -> u8 {
        self.bump
    }
}
