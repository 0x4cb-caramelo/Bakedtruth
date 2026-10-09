//! Purpose: the events, one per instruction, and how they leave the program: a self-CPI signed by
//!          the event-authority PDA, so they survive log truncation (T4).
//! Version: 0.0.3
//! Sprint: 02 (pot core on Pinocchio); structs frozen at the sprint's opening, `emit` by lane F;
//!         Sprint 03 moves the campaign events to `events/campaign.rs`
//!
//! Wire format of an event: an inner instruction to this program whose data is
//! `[EVENT_IX_TAG, discriminator, payload]`, the payload being the event's bytes as laid out
//! below, and whose only account is the event authority, signing. Nobody else can sign for that
//! PDA, so a top-level call of the event instruction fails (decoder rule 2, TP section 3.4.14).
//! Every campaign-scoped event carries the campaign and a contiguous `seq` (X0.4).

use shank::ShankType;

use crate::{
    layout::{Pubkey, ZeroCopy},
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

zero_copy!(
    ConfigInitialized = 166,
    ConfigChanged = 360,
    EntriesPaused = 32,
    EntriesResumed = 32,
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

// The campaign events (discriminators 4 to 6) live in `events/campaign.rs`; `emit` (the self-CPI,
// signed by the event authority) and the handler of `EVENT_IX_TAG` in `events/self_cpi.rs`.
mod campaign;
pub use campaign::{CampaignOpened, CampaignResolved, EntryAdded};
mod finalize;
pub use finalize::{CampaignClosed, CampaignFinalized};
mod payout;
pub use payout::{CreatorShareSettled, EntrySettled, FeeCollected, FeesSwept, PrizeSettled};
mod review;
pub use review::{CampaignVoided, ContestOpened, ResultConfirmed};
mod self_cpi;
pub use self_cpi::{emit, event_data, process_event_instruction, EVENT_BUFFER_LEN};
