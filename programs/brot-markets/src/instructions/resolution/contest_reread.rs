//! Purpose: what `reread_campaign` compares and does (TP section 3.4.7): the stored result against the reading run
//!          now, exactly (outcome, void reason, `met_late`, observed value); `reread_act`, the ONE function that turns
//!          the comparison into an act (D2, answered: the matching re-read's 24-hour wait); stage 2's opening; and the
//!          `CampaignReread` event.
//! Version: 0.0.3 (the founder's answer to D2: a matching re-read pays only after stage 1's 24 hours)
//! Sprint: 14 (lane L14B, the two-stage dispute). What "the same reading" means per kind is in `reread_campaign.rs`.
//!
//! The re-read never writes a result: the reading run now goes to the comparison and to the event, never into the
//! campaign. A different reading changes only the contest's stage, its deadline and the event number.

use crate::{
    constants::CONTEST_STAGE2_SECONDS,
    error::BrotError,
    events::CampaignReread,
    instructions::resolution::{contest_rules::require_timelock_over, team_shared::take_seq},
    layout::{LeI128, LeI64, LeU64, Pubkey},
    readers::Decision,
    state::{
        campaign::Campaign,
        enums::{ContestStage, Outcome, Status, VoidReason},
        transitions::transition,
    },
};

/// The result `resolve_campaign` stored, as a re-read compares it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct StoredResult {
    pub outcome: u8,
    pub void_reason: u8,
    pub met_late: u8,
    pub observed_value: i128,
}

impl StoredResult {
    pub fn of(campaign: &Campaign) -> Self {
        Self {
            outcome: campaign.outcome,
            void_reason: campaign.void_reason,
            met_late: campaign.met_late,
            observed_value: campaign.observed_value.get(),
        }
    }
}

/// True when the reading run now decides exactly the stored result: the same outcome, void reason, `met_late` and
/// observed value. A reader that refuses or cannot decide now (`None`) is a different reading. The publish time and
/// the account read are evidence, not part of the result, so they are not compared.
pub fn same_reading(stored: &StoredResult, now: Option<&Decision>) -> bool {
    now.is_some_and(|read| {
        read.outcome as u8 == stored.outcome
            && read.void_reason as u8 == stored.void_reason
            && u8::from(read.met_late) == stored.met_late
            && read.reading.observed == stored.observed_value
    })
}

/// What a re-read does with its comparison.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RereadAct {
    /// The snapshot runs now with the STORED outcome (`finalize_snapshot`, as `team_confirm_result` runs it).
    Pay,
    /// Stage 2 opens: the admin has `CONTEST_STAGE2_SECONDS` to confirm or void, then the stored result stands.
    Escalate,
}

/// The one place a re-read's comparison becomes an act, as the founder answered D2 on 2026-10-13 (option a): any
/// difference escalates at once; the same reading pays only from stage 1's deadline on, 24 hours after the contest
/// opened (`RereadBeforeTimelock` before it, nothing written). A re-read runs the readers' own code, so it cannot catch
/// a reader's bug: the wait gives a team key the time to send the contest to the admin (`team_open_contest` on a
/// contest at stage 1).
pub fn reread_act(same: bool, now: i64, stage1_ends_at: i64) -> Result<RereadAct, BrotError> {
    if !same {
        return Ok(RereadAct::Escalate);
    }
    require_timelock_over(now, stage1_ends_at)?;
    Ok(RereadAct::Pay)
}

/// A different reading: the campaign stays `Contested`, at stage 2, its deadline `CONTEST_STAGE2_SECONDS` from the
/// re-read, or from stage 1's deadline when the re-read comes after it (review fix F3: a late keeper adds no time,
/// so the payout is never more than 78 hours after the resolution), and takes the event's number, which is returned.
/// The deadline is computed before any field is written; it may already have passed, and then only the lapse remains.
pub fn open_stage2(campaign: &mut Campaign, now: i64) -> Result<u64, BrotError> {
    let from = now.min(campaign.contest_ends_at.get());
    let ends_at = from
        .checked_add(CONTEST_STAGE2_SECONDS)
        .ok_or(BrotError::MathOverflow)?;
    transition(Status::Contested, Status::Contested)?;
    let seq = take_seq(campaign)?;
    campaign.contest_stage = ContestStage::Stage2 as u8;
    campaign.contest_ends_at = LeI64::new(ends_at);
    Ok(seq)
}

/// `CampaignReread` numbered `seq`: whether the reading was the same, what it read now (`Unresolved`, no reason and
/// nothing read when the reader refused or could not decide), and the contest's stage and deadline as the campaign
/// holds them after the re-read (stage 1's when it paid, stage 2's when it escalated).
pub fn reread_event(
    key: Pubkey,
    campaign: &Campaign,
    reading: Option<&Decision>,
    same: bool,
    seq: u64,
) -> CampaignReread {
    let (outcome, void_reason, met_late, observed, publish_time) = match reading {
        Some(read) => (
            read.outcome as u8,
            read.void_reason as u8,
            u8::from(read.met_late),
            read.reading.observed,
            read.reading.publish_time,
        ),
        None => (Outcome::Unresolved as u8, VoidReason::None as u8, 0, 0, 0),
    };
    CampaignReread {
        campaign: key,
        seq: LeU64::new(seq),
        same: u8::from(same),
        outcome,
        void_reason,
        met_late,
        observed_value: LeI128::new(observed),
        publish_time: LeI64::new(publish_time),
        contest_stage: campaign.contest_stage,
        contest_ends_at: campaign.contest_ends_at,
    }
}
