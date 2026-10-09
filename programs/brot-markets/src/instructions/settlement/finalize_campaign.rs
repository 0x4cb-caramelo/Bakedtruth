//! Purpose: `finalize_campaign`: the snapshot of a reviewed campaign once its window has ended. Any wallet,
//!          permissionless; it chooses nothing. It runs `finalize_snapshot`, then emits `CampaignFinalized`
//!          with the next seq (TP 3.4.3, I7).
//! Version: 0.0.2
//! Sprint: 04 (lane C); accounts frozen at the sprint's opening
//!
//! Accounts: 0 campaign (writable), 1 config (writable, the open count), 2 event authority, 3 program.
//! Refusals: `CampaignNotInReview` (the status), `ReviewNotEnded` (the clock), then the snapshot's own.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use super::{bookkeeping::take_seq, snapshot::finalize_snapshot};
use crate::{
    checks,
    error::BrotError,
    events::{self, CampaignFinalized},
    instructions::no_args,
    layout::LeU64,
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

    let from_fee = stored.creator_share_from_fee.get();
    let from_pot = stored
        .creator_share
        .get()
        .checked_sub(from_fee)
        .ok_or(BrotError::InvariantViolated)?;
    let refunded_late = stored
        .late_yes
        .get()
        .checked_add(stored.late_no.get())
        .ok_or(BrotError::MathOverflow)?;
    let seq = take_seq(&mut stored)?;
    let event = CampaignFinalized {
        campaign: campaign_key,
        seq: LeU64::new(seq),
        settle_mode: stored.settle_mode,
        winning_total: stored.winning_total,
        losing_total: stored.losing_total,
        refunded_late: LeU64::new(refunded_late),
        fee_total: stored.fee_total,
        from_pot: LeU64::new(from_pot),
        from_fee: stored.creator_share_from_fee,
        distributable: stored.distributable,
    };
    drop(settings);
    drop(stored);
    events::emit(&event, event_authority, program, program_id)
}
