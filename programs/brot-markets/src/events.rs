//! Purpose: the events, one per instruction, and how they leave the program: a self-CPI signed by
//!          the event-authority PDA, so they survive log truncation (T4).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); structs frozen at the sprint's opening, `emit` by lane F
//!
//! Wire format of an event: an inner instruction to this program whose data is
//! `[EVENT_IX_TAG, discriminator, payload]`, the payload being the event's bytes as laid out
//! below, and whose only account is the event authority, signing. Nobody else can sign for that
//! PDA, so a top-level call of the event instruction fails (decoder rule 2, TP section 3.4.14).
//! Every campaign-scoped event carries the campaign and a contiguous `seq` (X0.4).

use shank::ShankType;

use crate::{
    layout::{LeI128, LeI32, LeI64, LeU16, LeU32, LeU64, Pubkey, ZeroCopy},
    state::config::CreationParams,
    zero_copy,
};

/// First byte of an event's instruction data; no instruction uses it.
pub const EVENT_IX_TAG: u8 = 0xFF;

/// An event payload with its discriminator. Discriminators are positional: append, never reuse.
pub trait Event: ZeroCopy {
    const DISCRIMINATOR: u8;
}

/// `admin_initialize_config` created the config and the fee vault.
#[derive(ShankType)]
#[repr(C)]
pub struct ConfigInitialized {
    /// The upgrade authority that initialised.
    pub signer: Pubkey,
    pub admin: Pubkey,
    pub fee_recipient: Pubkey,
    pub params: CreationParams,
}

/// An admin instruction changed the config; the new values of everything it can change.
#[derive(ShankType)]
#[repr(C)]
pub struct ConfigChanged {
    #[idl_type("ConfigChange")]
    pub change: u8,
    pub signer: Pubkey,
    pub admin: Pubkey,
    pub pending_admin: Pubkey,
    pub fee_recipient: Pubkey,
    pub team_len: u8,
    pub team: [Pubkey; 5],
    pub params: CreationParams,
}

/// `team_pause_entries`.
#[derive(ShankType)]
#[repr(C)]
pub struct EntriesPaused {
    pub signer: Pubkey,
}

/// `admin_resume_entries`.
#[derive(ShankType)]
#[repr(C)]
pub struct EntriesResumed {
    pub signer: Pubkey,
}

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

zero_copy!(
    ConfigInitialized = 166,
    ConfigChanged = 360,
    EntriesPaused = 32,
    EntriesResumed = 32,
    CampaignOpened = 255,
    EntryAdded = 114,
);

impl Event for ConfigInitialized {
    const DISCRIMINATOR: u8 = 0;
}
impl Event for ConfigChanged {
    const DISCRIMINATOR: u8 = 1;
}
impl Event for EntriesPaused {
    const DISCRIMINATOR: u8 = 2;
}
impl Event for EntriesResumed {
    const DISCRIMINATOR: u8 = 3;
}
impl Event for CampaignOpened {
    const DISCRIMINATOR: u8 = 4;
}
impl Event for EntryAdded {
    const DISCRIMINATOR: u8 = 5;
}

// `emit` (the self-CPI, signed by the event authority) and the handler of `EVENT_IX_TAG` live in
// `events/self_cpi.rs`, to keep this file to the event layouts.
mod self_cpi;
pub use self_cpi::{emit, event_data, process_event_instruction, EVENT_BUFFER_LEN};
