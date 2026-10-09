//! Purpose: the events of the money leaving the program (TP section 3.4.14): an entry paid, the
//!          creator share, the fee collected, the prize returned, and the fee vault swept.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze; emitted by lanes C and D)
//!
//! Every amount is in lamports, and every destination is a stored key (the baker, the creator,
//! whoever opened, the fee recipient): the event names it, so the indexer can check it.

use shank::ShankType;

use super::Event;
use crate::{
    layout::{LeU64, Pubkey},
    zero_copy,
};

/// `settle_entry`: lamports credited to the entry's baker, and the entry closed.
#[derive(ShankType)]
#[repr(C)]
pub struct EntrySettled {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    pub baker: Pubkey,
    #[idl_type("u64")]
    pub amount: LeU64,
    #[idl_type("SettleMode")]
    pub settle_mode: u8,
}

/// `settle_creator_share`: the creator's share, once; `from_pot` and `from_fee` say where it came from.
#[derive(ShankType)]
#[repr(C)]
pub struct CreatorShareSettled {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    pub creator: Pubkey,
    #[idl_type("u64")]
    pub amount: LeU64,
    #[idl_type("u64")]
    pub from_pot: LeU64,
    #[idl_type("u64")]
    pub from_fee: LeU64,
}

/// `collect_fee`: what Brot keeps moved to the fee vault; `opening_fee_kept` is the held 10% (P-4).
#[derive(ShankType)]
#[repr(C)]
pub struct FeeCollected {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    #[idl_type("u64")]
    pub amount: LeU64,
    #[idl_type("u64")]
    pub opening_fee_kept: LeU64,
}

/// `settle_prize`: the prize back to whoever opened; the opening fee too on a house-failure void.
#[derive(ShankType)]
#[repr(C)]
pub struct PrizeSettled {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    pub recipient: Pubkey,
    #[idl_type("u64")]
    pub prize_returned: LeU64,
    #[idl_type("u64")]
    pub opening_fee_returned: LeU64,
}

/// `sweep_fees`: the fee vault's surplus sent to `fee_recipient`. Admin-level, so no campaign or `seq`.
#[derive(ShankType)]
#[repr(C)]
pub struct FeesSwept {
    pub signer: Pubkey,
    pub fee_recipient: Pubkey,
    #[idl_type("u64")]
    pub amount: LeU64,
}

zero_copy!(
    EntrySettled = 81,
    CreatorShareSettled = 96,
    FeeCollected = 56,
    PrizeSettled = 88,
    FeesSwept = 72,
);

impl Event for EntrySettled {
    const DISCRIMINATOR: u8 = 11;
}
impl Event for CreatorShareSettled {
    const DISCRIMINATOR: u8 = 12;
}
impl Event for FeeCollected {
    const DISCRIMINATOR: u8 = 13;
}
impl Event for PrizeSettled {
    const DISCRIMINATOR: u8 = 14;
}
impl Event for FeesSwept {
    const DISCRIMINATOR: u8 = 16;
}
