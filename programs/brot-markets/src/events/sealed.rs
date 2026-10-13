//! Purpose: the events of a sealed entry (Sprint 15): the fee held in the sponsor's `SealedFee` at each
//!          sealed entry, and the fee settled once the campaign is finalized. Both carry the campaign
//!          and `seq`.
//! Version: 0.0.1
//! Sprint: 15 (scaffold of Sprints 14–15, 2026-10-13; emitted by `sponsor_join_campaign` and
//!         `settle_sealed_fee`, lane L15)

use shank::ShankType;

use super::Event;
use crate::{
    layout::{LeI32, LeI64, LeU64, Pubkey},
    zero_copy,
};

/// `sponsor_join_campaign`, after its `EntryAdded`: what the sealed entry cost at the SOL/USD price,
/// its split into the entry (into the pot) and the fee (held), and the fee the account now holds.
#[derive(ShankType)]
#[repr(C)]
pub struct SealedFeeHeld {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    pub sponsor: Pubkey,
    #[idl_type("u64")]
    pub entry_usd: LeU64,
    /// Lamports charged at `price` (at most `max_lamports`), split into the two below.
    #[idl_type("u64")]
    pub paid: LeU64,
    #[idl_type("u64")]
    pub entry_lamports: LeU64,
    #[idl_type("u64")]
    pub fee_lamports: LeU64,
    /// The fee the `SealedFee` holds after this entry.
    #[idl_type("u64")]
    pub fee_total: LeU64,
    /// The SOL/USD price the entry was charged at: price, exponent, publish time.
    #[idl_type("i64")]
    pub price: LeI64,
    #[idl_type("i32")]
    pub exponent: LeI32,
    #[idl_type("i64")]
    pub publish_time: LeI64,
}

/// `settle_sealed_fee`: the held fee sent back to the sponsor (`refunded`) or to the fee vault, and
/// the account closed.
#[derive(ShankType)]
#[repr(C)]
pub struct SealedFeeSettled {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    pub sponsor: Pubkey,
    #[idl_type("u64")]
    pub fee_lamports: LeU64,
    #[idl_type("bool")]
    pub refunded: u8,
}

zero_copy!(SealedFeeHeld = 132, SealedFeeSettled = 81);

impl Event for SealedFeeHeld {
    const DISCRIMINATOR: u8 = 21;
}
impl Event for SealedFeeSettled {
    const DISCRIMINATOR: u8 = 22;
}
