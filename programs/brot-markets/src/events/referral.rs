//! Purpose: the event of a referral link (Sprint 14): a referee named its referrer, once. Not
//!          campaign-scoped, so it carries no campaign and no `seq`.
//! Version: 0.0.1
//! Sprint: 14 (scaffold of Sprints 14–15, 2026-10-13; emitted by `user_link_referrer`, lane L14A)

use shank::ShankType;

use super::Event;
use crate::{
    layout::{LeI64, LeU64, Pubkey},
    zero_copy,
};

/// `user_link_referrer`: the link as stored in the `ReferralLink`, written once.
#[derive(ShankType)]
#[repr(C)]
pub struct ReferralLinked {
    pub referee: Pubkey,
    pub referrer: Pubkey,
    #[idl_type("i64")]
    pub linked_at: LeI64,
    #[idl_type("u64")]
    pub linked_slot: LeU64,
}

zero_copy!(ReferralLinked = 80);

impl Event for ReferralLinked {
    const DISCRIMINATOR: u8 = 18;
}
