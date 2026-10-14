//! Purpose: `reread_campaign` on the program's SBF binary in Mollusk (Sprint 14, lane L14B): the same reading pays with
//!          the stored outcome once stage 1's 24 hours are over (a Split, a one-sided pot and a stored void each reach
//!          Settling in their mode) and is refused before (D2); a different reading or a reader that refuses opens
//!          stage 2 for 48 hours with the result untouched; the refusals each with their own error; the pause never
//!          blocks it. The CPI refusal runs in LiteSVM.
//! Version: 0.0.2 (the founder's answer to D2: the matching re-read's 24-hour wait)
//! Sprint: 14 (lane L14B). Runs after the SBF build (`BROT_MARKETS_SO`, else `target/deploy/brot_markets.so`).

#[allow(unused_imports)]
#[path = "checks_support/mollusk.rs"]
mod world;

#[path = "contest_support/mod.rs"]
mod contest;

use brot_markets::{
    constants::CONTEST_STAGE2_SECONDS,
    error::BrotError,
    layout::{LeI64, LeU64, ZeroCopy},
    state::{
        campaign::Campaign,
        enums::{ContestStage, OperatingLevel, Outcome, SettleMode, Status, VoidReason},
    },
};
use contest::*;
use solana_instruction::AccountMeta;
use world::{assert_ok, assert_refused, key, World, SOL};

/// The stage-1 campaign, its 24 hours still running at `NOW` (they end at `NOW + 3_590`); then `edit`.
fn stage_one(edit: impl FnOnce(&mut Campaign)) -> Vec<u8> {
    contested_data(ContestStage::Stage1, NOW + 3_590, edit)
}

/// The stage-1 campaign whose 24 hours ended ten seconds before `NOW`: a matching re-read pays (D2); then `edit`.
fn waited(edit: impl FnOnce(&mut Campaign)) -> Vec<u8> {
    contested_data(ContestStage::Stage1, NOW - 10, edit)
}

/// Re-reads `campaign` with `metric` at `NOW`: the result, the stored campaign and the config's open count.
fn reread_now(
    campaign: Vec<u8>,
    metric: impl FnOnce(&World) -> solana_account::Account,
) -> (Vec<u8>, u32) {
    let mut w = World::new();
    let account = metric(&w);
    let result = reread(&w, campaign, account).at(&mut w, NOW);
    assert_ok(&result);
    (stored(&result), open_count(&result, &w))
}

#[test]
fn contest_same_reading_pays_a_split_with_the_stored_outcome() {
    let (bytes, open) = reread_now(waited(|_| {}), |w| mint(w, SUPPLY));
    let c = Campaign::from_bytes(&bytes).unwrap();
    assert_eq!(
        (c.status, c.outcome),
        (Status::Settling as u8, Outcome::No as u8)
    );
    assert_eq!(c.settle_mode, SettleMode::Split as u8);
    // NO won: the 1 SOL on NO is the winning side, the 2 SOL on YES the losing one.
    assert_eq!(
        (c.winning_total.get(), c.losing_total.get()),
        (SOL, 2 * SOL)
    );
    assert_eq!((c.event_seq.get(), open), (EVENT_SEQ + 2, 0));
    // The contest stays on record at stage 1, where it closed.
    assert_eq!(
        (c.contest_stage, c.contest_ends_at.get()),
        (ContestStage::Stage1 as u8, NOW - 10)
    );
}

#[test]
fn reread_timelock_refuses_a_matching_reread_before_stage_one_ends() {
    // D2 (2026-10-13): the same reading pays only from stage 1's deadline on; before it nothing is written.
    let mut w = World::new();
    let early = reread(&w, stage_one(|_| {}), mint(&w, SUPPLY)).at(&mut w, NOW + 3_589);
    assert_refused(&early, BrotError::RereadBeforeTimelock);
    let on_time = reread(&w, stage_one(|_| {}), mint(&w, SUPPLY)).at(&mut w, NOW + 3_590);
    assert_ok(&on_time);
    let c = Campaign::from_bytes(&stored(&on_time)).map(|c| c.status);
    assert_eq!(c, Some(Status::Settling as u8));
}

#[test]
fn contest_same_reading_pays_a_one_sided_pot() {
    // Every entry on YES and the outcome NO: one side only.
    let campaign = waited(|c| (c.pool_yes, c.pool_no) = (LeU64::new(3 * SOL), LeU64::new(0)));
    let (bytes, _) = reread_now(campaign, |w| mint(w, SUPPLY));
    let c = Campaign::from_bytes(&bytes).unwrap();
    assert_eq!(
        (c.status, c.settle_mode),
        (Status::Settling as u8, SettleMode::OneSided as u8)
    );
}

#[test]
fn contest_same_reading_confirms_a_stored_void() {
    // Resolved as an unreadable account after the deadline: the same void, nothing read, refunds.
    let campaign = waited(|c| {
        (c.outcome, c.void_reason) = (Outcome::Void as u8, VoidReason::UnreadableAccount as u8);
        c.observed_value = Default::default();
    });
    let (bytes, _) = reread_now(campaign, |_| unreadable());
    let c = Campaign::from_bytes(&bytes).unwrap();
    assert_eq!(
        (c.status, c.settle_mode),
        (Status::Settling as u8, SettleMode::Refund as u8)
    );
    assert_eq!(
        (c.outcome, c.void_reason),
        (Outcome::Void as u8, VoidReason::UnreadableAccount as u8)
    );
}

/// The campaign as a different reading at `NOW` leaves it: stage 2 for 48 hours, the next event number.
fn escalated(edit: impl Fn(&mut Campaign)) -> Vec<u8> {
    contested_data(ContestStage::Stage2, NOW + CONTEST_STAGE2_SECONDS, |c| {
        edit(c);
        c.event_seq = LeU64::new(EVENT_SEQ + 1);
    })
}

#[test]
fn contest_different_reading_opens_stage_two_and_keeps_the_result() {
    // One token burned since the resolution: the observed value moved.
    let (bytes, open) = reread_now(stage_one(|_| {}), |w| mint(w, SUPPLY - 1));
    assert_eq!((bytes, open), (escalated(|_| {}), 1));
    // Burned to the target after the deadline: NO again, but met late.
    let (bytes, _) = reread_now(stage_one(|_| {}), |w| mint(w, 1_000_000));
    assert_eq!(bytes, escalated(|_| {}));
}

#[test]
fn contest_reader_that_refuses_or_cannot_decide_opens_stage_two() {
    // A YES resolved before the deadline, which is still a day away.
    let early = |c: &mut Campaign| {
        c.outcome = Outcome::Yes as u8;
        c.deadline_at = LeI64::new(NOW + 24 * HOUR);
    };
    // The mint unreadable before the deadline: the reader refuses.
    let (bytes, _) = reread_now(stage_one(early), |_| unreadable());
    assert_eq!(bytes, escalated(early));
    // The supply above the target before the deadline: not decidable now.
    let (bytes, _) = reread_now(stage_one(early), |w| mint(w, SUPPLY));
    assert_eq!(bytes, escalated(early));
}

#[test]
fn contest_reread_runs_while_entries_are_paused() {
    let mut w = World::new();
    let paused = config_data(&w, OperatingLevel::EntriesHalted);
    let call = reread(&w, waited(|_| {}), mint(&w, SUPPLY)).with_config(&w, paused);
    let result = call.at(&mut w, NOW);
    assert_ok(&result);
    assert_eq!(
        Campaign::from_bytes(&stored(&result)).unwrap().status,
        Status::Settling as u8
    );
}

#[test]
fn contest_status_refuses_a_campaign_not_contested() {
    let mut w = World::new();
    for status in [
        Status::Open,
        Status::InReview,
        Status::Settling,
        Status::Settled,
    ] {
        let campaign = stage_one(|c| c.status = status as u8);
        let result = reread(&w, campaign, mint(&w, SUPPLY)).at(&mut w, NOW);
        assert_refused(&result, BrotError::NotContested);
    }
}

#[test]
fn contest_stage_refuses_a_reread_at_stage_two() {
    let mut w = World::new();
    let campaign = contested_data(ContestStage::Stage2, NOW + CONTEST_STAGE2_SECONDS, |_| {});
    let result = reread(&w, campaign, mint(&w, SUPPLY)).at(&mut w, NOW);
    assert_refused(&result, BrotError::WrongContestStage);
}

#[test]
fn contest_reread_metric_refuses_another_account() {
    let mut w = World::new();
    let other = key(0x32);
    let call = reread(&w, stage_one(|_| {}), mint(&w, SUPPLY));
    let call = call.with_slot(2, AccountMeta::new_readonly(other, false), mint(&w, SUPPLY));
    let result = call.at(&mut w, NOW);
    assert_refused(&result, BrotError::MetricAccountMismatch);
}
