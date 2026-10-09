//! Purpose: the events of the review window and the team's acts (TP section 3.4.14): the result
//!          confirmed, the campaign voided, a contest opened. Each carries the campaign and `seq`.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze; emitted by lane A)

use shank::ShankType;

use super::Event;
use crate::{
    layout::{LeI64, LeU64, Pubkey},
    zero_copy,
};

/// `team_confirm_result`: the window ends and the outcome stands (the snapshot follows at once).
#[derive(ShankType)]
#[repr(C)]
pub struct ResultConfirmed {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    pub signer: Pubkey,
    #[idl_type("Outcome")]
    pub outcome: u8,
}

/// `team_void_campaign`: the campaign is voided with its reason and the hash of the team's note.
#[derive(ShankType)]
#[repr(C)]
pub struct CampaignVoided {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    pub signer: Pubkey,
    #[idl_type("VoidReason")]
    pub void_reason: u8,
    pub note_hash: [u8; 32],
}

/// `team_open_contest`: the campaign enters `Contested`, payout paused, stage 1 clock started.
#[derive(ShankType)]
#[repr(C)]
pub struct ContestOpened {
    pub campaign: Pubkey,
    #[idl_type("u64")]
    pub seq: LeU64,
    pub signer: Pubkey,
    #[idl_type("ContestStage")]
    pub contest_stage: u8,
    #[idl_type("i64")]
    pub contest_ends_at: LeI64,
}

zero_copy!(
    ResultConfirmed = 73,
    CampaignVoided = 105,
    ContestOpened = 81,
);

impl Event for ResultConfirmed {
    const DISCRIMINATOR: u8 = 7;
}
impl Event for CampaignVoided {
    const DISCRIMINATOR: u8 = 8;
}
impl Event for ContestOpened {
    const DISCRIMINATOR: u8 = 9;
}
