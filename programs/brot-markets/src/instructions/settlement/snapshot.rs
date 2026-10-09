//! Purpose: `finalize_snapshot`, the one snapshot path that `finalize_campaign` and `team_confirm_result` both
//!          call: it takes the campaign's totals and verdict through lane B's pure `math::snapshot`, stores the
//!          mode and the sums, moves the status to `Settling` through the transition table, and decrements the
//!          open count for a paid campaign only (I7).
//! Version: 0.0.1
//! Sprint: 04 (lane C). The late totals come from `tally_late_joins` (amendment 2026-10-09): they leave V and P.
//!
//! Refusals, in order: `NotTallied` while an entry is untallied; `NoProofTime` for a YES on a price campaign without
//! a publish time (only a YES proof is measured against late joins); the transition (`IllegalTransition`); the
//! snapshot's own checks. The status is not read here as `InReview`: `team_void_campaign` sets the outcome
//! and calls this before it writes `Settling`, and the transition table is the only gate.

use crate::{
    error::BrotError,
    math::{
        invariant::check_snapshot,
        snapshot::{snapshot, SnapshotInput, Verdict},
        void::VoidClass,
    },
    state::{
        campaign::Campaign,
        config::GlobalConfig,
        enums::{Outcome, ReaderKind, Status},
        transitions::transition,
    },
};

/// The verdict the stored outcome and void reason give the snapshot.
fn verdict(campaign: &Campaign) -> Result<Verdict, BrotError> {
    match Outcome::try_from(campaign.outcome)? {
        Outcome::Yes => Ok(Verdict::Yes),
        Outcome::No => Ok(Verdict::No),
        Outcome::Void => {
            let reason = crate::state::enums::VoidReason::try_from(campaign.void_reason)?;
            let class = VoidClass::of(reason).ok_or(BrotError::SnapshotInconsistent)?;
            Ok(Verdict::Void(class))
        }
        Outcome::Unresolved => Err(BrotError::SnapshotInconsistent),
    }
}

/// The snapshot's input, read from the campaign: the pools without their late parts (amendment: late
/// amounts leave V and P), the prize, the opening fee and the rates copied at opening.
fn input_of(campaign: &Campaign) -> Result<SnapshotInput, BrotError> {
    let verdict = verdict(campaign)?;
    let late_yes = campaign.late_yes.get();
    let late_no = campaign.late_no.get();
    let yes_total = campaign
        .pool_yes
        .get()
        .checked_sub(late_yes)
        .ok_or(BrotError::SnapshotInconsistent)?;
    let no_total = campaign
        .pool_no
        .get()
        .checked_sub(late_no)
        .ok_or(BrotError::SnapshotInconsistent)?;
    Ok(SnapshotInput {
        verdict,
        yes_total,
        no_total,
        late_yes,
        late_no,
        prize: campaign.prize_lamports.get(),
        opening_fee: campaign.opening_fee_lamports.get(),
        fee_bps: campaign.fee_bps.get(),
        one_sided_fee_bps: campaign.one_sided_fee_bps.get(),
        creator_share_bps: campaign.creator_share_bps.get(),
        creator_is_team: campaign.creator_is_team != 0,
    })
}

pub fn finalize_snapshot(
    campaign: &mut Campaign,
    config: &mut GlobalConfig,
) -> Result<(), BrotError> {
    if campaign.entries_untallied.get() != 0 {
        return Err(BrotError::NotTallied);
    }
    // Late joins are measured only against a YES price proof (2026-10-09): nothing else needs a publish time.
    let price_yes = campaign.kind == ReaderKind::PriceTouch as u8
        && Outcome::try_from(campaign.outcome)? == Outcome::Yes;
    if price_yes && campaign.publish_time.get() == 0 {
        return Err(BrotError::NoProofTime);
    }
    // With no entry at all nothing will ever be settled, so the campaign goes straight to Settled.
    let target = if campaign.entries_open.get() == 0 {
        Status::Settled
    } else {
        Status::Settling
    };
    let from = Status::try_from(campaign.status)?;
    transition(from, target)?;

    let input = input_of(campaign)?;
    let snap = snapshot(input)?;
    check_snapshot(&input, &snap)?;

    if campaign.creator_is_team == 0 {
        let open = config.open_campaigns.get();
        let next = open.checked_sub(1).ok_or(BrotError::InvariantViolated)?;
        config.open_campaigns.set(next);
    }
    campaign.settle_mode = snap.mode as u8;
    campaign.winning_total.set(snap.winning_total);
    campaign.losing_total.set(snap.losing_total);
    campaign.distributable.set(snap.distributable);
    campaign.fee_total.set(snap.fee_total);
    campaign.creator_share.set(snap.creator_share);
    campaign
        .creator_share_from_fee
        .set(snap.creator_share_from_fee);
    campaign.status = target as u8;
    Ok(())
}
