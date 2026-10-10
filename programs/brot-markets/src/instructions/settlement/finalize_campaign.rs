//! Purpose: `finalize_campaign`: the snapshot of a reviewed campaign once its window has ended. Any wallet,
//!          permissionless; it chooses nothing. It runs `finalize_snapshot`, then emits `CampaignFinalized`
//!          with the next seq (TP 3.4.3, I7).
//! Version: 0.0.3 (the event built by `snapshot::finalized_event`, shared with the team's confirm and void)
//! Sprint: 04 (lane C); accounts frozen at the sprint's opening
//!
//! Accounts: 0 campaign (writable), 1 config (writable, the open count), 2 event authority, 3 program.
//! Refusals: `CampaignNotInReview` (the status), `ReviewNotEnded` (the clock), then the snapshot's own.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use super::{
    bookkeeping::take_seq,
    snapshot::{finalize_snapshot, finalized_event},
};
use crate::{
    checks,
    error::BrotError,
    events,
    instructions::no_args,
    readers::ChainTime,
    state::{campaign::Campaign, config::GlobalConfig, enums::Status},
};

pub fn finalize_campaign(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [campaign, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::writable(campaign)?;
    checks::writable(config)?;
    checks::event_accounts(event_authority, program, program_id)?;

    checks::distinct(campaign, config)?;
    let campaign_key = *campaign.address();
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    let mut settings = GlobalConfig::load_mut(config, program_id)?;
    if stored.status != Status::InReview as u8 {
        return Err(BrotError::CampaignNotInReview.into());
    }
    let now = ChainTime::now()?.unix_timestamp;
    if now < stored.review_ends_at.get() {
        return Err(BrotError::ReviewNotEnded.into());
    }
    finalize_snapshot(&mut stored, &mut settings)?;
    let seq = take_seq(&mut stored)?;
    let event = finalized_event(campaign_key, &stored, seq)?;
    drop(settings);
    drop(stored);
    events::emit(&event, event_authority, program, program_id)
}
