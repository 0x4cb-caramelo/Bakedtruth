//! Purpose: the events of a campaign's life, each carrying the campaign and its contiguous `seq`
//!          (X0.4): opened, an entry added, resolved.
//! Version: 0.0.3
//! Sprint: 02 (opened, entry added); 03 adds `CampaignResolved` and the opening's `epoch`

use shank::ShankType;

use super::Event;
use crate::{
    layout::{LeI128, LeI32, LeI64, LeU16, LeU32, LeU64, Pubkey},
    zero_copy,
};

/// `user_open_campaign`: the campaign as opened, with what it cost.
#[derive(ShankType)]
#[repr(C)]
pub struct CampaignOpened {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    #[idl_type("u64")]
    pub id: LeU64,
    pub creator: Pubkey,
    #[idl_type("bool")]
    pub creator_is_team: u8,
    #[idl_type("ReaderKind")]
    pub kind: u8,
    #[idl_type("Direction")]
    pub direction: u8,
    pub feed_id: [u8; 32],
    pub metric_account: Pubkey,
    #[idl_type("i128")]
    pub target: LeI128,
    #[idl_type("i32")]
    pub price_exponent: LeI32,
    #[idl_type("u32")]
    pub max_age: LeU32,
    #[idl_type("u16")]
    pub template_version: LeU16,
    #[idl_type("i64")]
    pub opens_at: LeI64,
    #[idl_type("i64")]
    pub entries_close_at: LeI64,
    #[idl_type("i64")]
    pub deadline_at: LeI64,
    #[idl_type("u16")]
    pub fee_bps: LeU16,
    #[idl_type("u16")]
    pub one_sided_fee_bps: LeU16,
    #[idl_type("u16")]
    pub creator_share_bps: LeU16,
    #[idl_type("u64")]
    pub opening_usd: LeU64,
    #[idl_type("u64")]
    pub opening_paid_lamports: LeU64,
    #[idl_type("i64")]
    pub opening_price: LeI64,
    #[idl_type("i32")]
    pub opening_price_exponent: LeI32,
    #[idl_type("i64")]
    pub opening_price_publish_time: LeI64,
    #[idl_type("u64")]
    pub prize_lamports: LeU64,
    #[idl_type("u64")]
    pub opening_fee_lamports: LeU64,
    /// Epoch kinds: the measured epoch (Sprint 03); zero otherwise.
    #[idl_type("u64")]
    pub epoch: LeU64,
}

/// `user_join_campaign`: one entry, with both pool totals and the baker's totals after it.
#[derive(ShankType)]
#[repr(C)]
pub struct EntryAdded {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    pub baker: Pubkey,
    #[idl_type("Side")]
    pub side: u8,
    #[idl_type("bool")]
    pub is_first: u8,
    #[idl_type("u64")]
    pub amount: LeU64,
    #[idl_type("u64")]
    pub pool_yes: LeU64,
    #[idl_type("u64")]
    pub pool_no: LeU64,
    #[idl_type("u64")]
    pub entry_yes: LeU64,
    #[idl_type("u64")]
    pub entry_no: LeU64,
}

/// `resolve_campaign`: the outcome recorded and the reading behind it, so anyone can re-check it
/// (TP section 3.4.6). For a price campaign, `read_account`, `publish_time` and `posted_slot` name
/// the update that decided it (the YES proof, or the sponsored account read for NO or a void).
#[derive(ShankType)]
#[repr(C)]
pub struct CampaignResolved {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    #[idl_type("ReaderKind")]
    pub kind: u8,
    #[idl_type("Outcome")]
    pub outcome: u8,
    #[idl_type("VoidReason")]
    pub void_reason: u8,
    #[idl_type("bool")]
    pub met_late: u8,
    /// The value read, in the metric account's own units (price, supply, liquidity, lamports).
    #[idl_type("i128")]
    pub observed_value: LeI128,
    /// The account the value was read from.
    pub read_account: Pubkey,
    /// Price kind: the reading's publish time and the slot it was posted in; zero otherwise.
    #[idl_type("i64")]
    pub publish_time: LeI64,
    #[idl_type("u64")]
    pub posted_slot: LeU64,
    #[idl_type("i64")]
    pub resolved_at: LeI64,
    #[idl_type("i64")]
    pub review_ends_at: LeI64,
    /// The cluster's slot and epoch when it was read.
    #[idl_type("u64")]
    pub slot: LeU64,
    #[idl_type("u64")]
    pub epoch: LeU64,
}

zero_copy!(
    CampaignOpened = 263,
    EntryAdded = 114,
    CampaignResolved = 140
);

impl Event for CampaignOpened {
    const DISCRIMINATOR: u8 = 4;
}
impl Event for EntryAdded {
    const DISCRIMINATOR: u8 = 5;
}
impl Event for CampaignResolved {
    const DISCRIMINATOR: u8 = 6;
}
