//! Purpose: the effects of `resolve_campaign`: the result group the reader's decision writes into
//!          the `Campaign`, and the `CampaignResolved` event built from what was stored, so the
//!          event and the account can never disagree (TP sections 3.4.6, 3.4.7, 3.4.14).
//! Version: 0.0.4
//! Sprint: 03 (readers and resolution), lane D; `publish_time` written in 04 (lane D)
//!
//! Every new value is computed with checked math before the first field is written, so a refusal
//! leaves the campaign as it was. The result group, `publish_time` (the YES proof's, for a price
//! campaign; zero for the other kinds) and `event_seq` change: the pot, the fees, `contest_ends_at`
//! and the settlement snapshot are left alone.

use pinocchio::{error::ProgramError, Address};

use crate::{
    constants::REVIEW_WINDOW_SECONDS,
    error::BrotError,
    events::CampaignResolved,
    layout::{LeI128, LeI64, LeU64},
    readers::{ChainTime, Decision},
    state::{
        campaign::Campaign,
        enums::{Outcome, ReaderKind, Status},
    },
};

/// Records `decision`, read at `time`, in `campaign` (the account at `key`) and returns the event
/// to emit: `InReview`; the outcome, the void reason and `met_late` as the reader decided them;
/// the value read; `resolved_at = now`; `review_ends_at = now + REVIEW_WINDOW_SECONDS`; the next
/// event number. A decision that decides nothing (`Unresolved`, which no `Decision` constructor
/// gives) records nothing: `NotResolvableYet`, so `InReview` always holds `Yes`, `No` or `Void`.
pub fn write(
    key: &Address,
    campaign: &mut Campaign,
    decision: &Decision,
    time: &ChainTime,
) -> Result<CampaignResolved, ProgramError> {
    if decision.outcome == Outcome::Unresolved {
        return Err(BrotError::NotResolvableYet.into());
    }
    let now = time.unix_timestamp;
    let review_ends_at = now
        .checked_add(REVIEW_WINDOW_SECONDS)
        .ok_or(BrotError::MathOverflow)?;
    let seq = campaign.event_seq.get();
    let next_seq = seq.checked_add(1).ok_or(BrotError::MathOverflow)?;

    campaign.status = Status::InReview as u8;
    campaign.outcome = decision.outcome as u8;
    campaign.void_reason = decision.void_reason as u8;
    campaign.met_late = u8::from(decision.met_late);
    campaign.observed_value = LeI128::new(decision.reading.observed);
    campaign.resolved_at = LeI64::new(now);
    campaign.review_ends_at = LeI64::new(review_ends_at);
    campaign.publish_time = LeI64::new(stored_publish_time(campaign.kind, decision));
    campaign.event_seq = LeU64::new(next_seq);
    Ok(resolved_event(key, campaign, decision, time, seq))
}

/// The publish time stored at resolution: the YES proof's for a price campaign, zero for the others
/// (the late refund compares each join with it; `tally_late_joins` reads it).
pub fn stored_publish_time(kind: u8, decision: &Decision) -> i64 {
    if kind == ReaderKind::PriceTouch as u8 {
        decision.reading.publish_time
    } else {
        0
    }
}

/// `CampaignResolved` read back from the stored result, with `seq` the number this event takes
/// (`event_seq` before the write), the reading's account and publish data, and the clock's slot
/// and epoch.
fn resolved_event(
    key: &Address,
    c: &Campaign,
    decision: &Decision,
    time: &ChainTime,
    seq: u64,
) -> CampaignResolved {
    CampaignResolved {
        campaign: *key,
        seq: LeU64::new(seq),
        kind: c.kind,
        outcome: c.outcome,
        void_reason: c.void_reason,
        met_late: c.met_late,
        observed_value: c.observed_value,
        read_account: decision.reading.account,
        publish_time: LeI64::new(decision.reading.publish_time),
        posted_slot: LeU64::new(decision.reading.posted_slot),
        resolved_at: c.resolved_at,
        review_ends_at: c.review_ends_at,
        slot: LeU64::new(time.slot),
        epoch: LeU64::new(time.epoch),
    }
}

/// Moves the cut-off back to an earlier valid YES proof (decision of 2026-10-09, closure review): only the publish
/// time changes; the outcome and the review window stay as resolved. The caller checks that the proof is an earlier
/// YES price result and that no tally has started. Returns the event the move leaves (the next `seq`).
pub fn move_cutoff(
    key: &Address,
    campaign: &mut Campaign,
    decision: &Decision,
    time: &ChainTime,
) -> Result<CampaignResolved, ProgramError> {
    let seq = campaign.event_seq.get();
    let next_seq = seq.checked_add(1).ok_or(BrotError::MathOverflow)?;
    campaign.publish_time = LeI64::new(decision.reading.publish_time);
    campaign.event_seq = LeU64::new(next_seq);
    Ok(resolved_event(key, campaign, decision, time, seq))
}
