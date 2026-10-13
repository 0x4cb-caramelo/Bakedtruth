//! Purpose: `finalize_campaign`: the snapshot of a reviewed campaign once its window has ended, or of a contested
//!          one once its contest has lapsed with no decision (Sprint 14). Any wallet, permissionless; it chooses
//!          nothing. It runs `finalize_snapshot`, then emits `CampaignFinalized` with the next seq (TP 3.4.3, I7).
//! Version: 0.0.5 (review fix F3: an unread stage 1 lapses too, so the payout is due 55 hours after resolution)
//! Sprint: 04 (lane C); accounts frozen at the sprint's opening; 14 (lane L14B) adds the lapse
//!
//! Accounts: 0 campaign (writable), 1 config (writable, the open count), 2 event authority, 3 program.
//! Refusals: `CampaignNotInReview` (the status), `ReviewNotEnded` (the clock), then the snapshot's own. A `Contested`
//! campaign lapses with its stored result at stage 2's `contest_ends_at`, or 48 hours after stage 1's when nobody ran
//! its re-read (`contest_rules::require_lapsed`): `ContestNotLapsed` before, `CampaignNotInReview` with no stage; the
//! tally rule (`NotTallied`) is the snapshot's, as for every path.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use super::{
    bookkeeping::take_seq,
    snapshot::{finalize_snapshot, finalized_event},
};
use crate::{
    checks,
    error::BrotError,
    events,
    instructions::{no_args, resolution::contest_rules::require_lapsed},
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
    let now = ChainTime::now()?.unix_timestamp;
    if stored.status == Status::Contested as u8 {
        // Sprint 14: the contest lapsed with no decision (stage 2, or an unread stage 1), so the stored result stands.
        require_lapsed(stored.contest_stage, now, stored.contest_ends_at.get())?;
    } else {
        if stored.status != Status::InReview as u8 {
            return Err(BrotError::CampaignNotInReview.into());
        }
        if now < stored.review_ends_at.get() {
            return Err(BrotError::ReviewNotEnded.into());
        }
    }
    finalize_snapshot(&mut stored, &mut settings)?;
    let seq = take_seq(&mut stored)?;
    let event = finalized_event(campaign_key, &stored, seq)?;
    drop(settings);
    drop(stored);
    events::emit(&event, event_authority, program, program_id)
}
