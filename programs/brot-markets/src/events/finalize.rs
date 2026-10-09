//! Purpose: the events that fix the money and end the campaign: the snapshot (`CampaignFinalized`)
//!          and the close (`CampaignClosed`). Both carry the campaign and `seq`.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze; emitted by lanes C and D)

use shank::ShankType;

use super::Event;
use crate::{
    layout::{LeU64, Pubkey},
    zero_copy,
};

/// `finalize_campaign` (and the paths that finalize without it): the snapshot and the mode.
/// `V` is the winning side's total, `P` the losing side's, `R` the late entries refunded whole
/// (TP section 3.4.16), `distributable` what the winners share.
#[derive(ShankType)]
#[repr(C)]
pub struct CampaignFinalized {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    #[idl_type("SettleMode")]
    pub settle_mode: u8,
    #[idl_type("u64")]
    pub winning_total: LeU64,
    #[idl_type("u64")]
    pub losing_total: LeU64,
    #[idl_type("u64")]
    pub refunded_late: LeU64,
    #[idl_type("u64")]
    pub fee_total: LeU64,
    #[idl_type("u64")]
    pub from_pot: LeU64,
    #[idl_type("u64")]
    pub from_fee: LeU64,
    #[idl_type("u64")]
    pub distributable: LeU64,
}

/// `close_campaign`: rent back to `rent_payer`, dust and surplus to the fee vault.
#[derive(ShankType)]
#[repr(C)]
pub struct CampaignClosed {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    pub rent_payer: Pubkey,
    #[idl_type("u64")]
    pub rent_returned: LeU64,
    #[idl_type("u64")]
    pub surplus_swept: LeU64,
}

zero_copy!(CampaignFinalized = 97, CampaignClosed = 88,);

impl Event for CampaignFinalized {
    const DISCRIMINATOR: u8 = 10;
}
impl Event for CampaignClosed {
    const DISCRIMINATOR: u8 = 15;
}
