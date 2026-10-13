//! Purpose: stage 2 of a contest on the program's SBF binary in Mollusk (Sprint 14, lane L14B): the admin confirms
//!          (the stored outcome is snapshotted) or voids with a team reason (the reason and the note's hash stored,
//!          `Refund`); every refusal with its own error, a team key and a stranger included; and the lapse through
//!          `finalize_campaign`, from stage 2's deadline on, or 48 hours after an unread stage 1's (review fix F3),
//!          never before. The pause never blocks either.
//! Version: 0.0.2
//! Sprint: 14 (lane L14B). Runs after the SBF build (`BROT_MARKETS_SO`, else `target/deploy/brot_markets.so`).

#[allow(unused_imports)]
#[path = "checks_support/mollusk.rs"]
mod world;

#[path = "contest_support/mod.rs"]
mod contest;

use brot_markets::{
    constants::CONTEST_STAGE2_SECONDS,
    error::BrotError,
    layout::ZeroCopy,
    state::{
        campaign::Campaign,
        enums::{ContestStage, OperatingLevel, Outcome, SettleMode, Status, VoidReason},
    },
};
use contest::*;
use world::{assert_ok, assert_refused, World};

const NOTE: [u8; 32] = [9; 32];
/// Stage 2's deadline: the decision comes before it, the lapse from it on.
const ENDS: i64 = NOW + 24 * HOUR;
const CONFIRM: [u8; 2] = [0, VoidReason::None as u8];
const STAGE2: i64 = CONTEST_STAGE2_SECONDS;

fn stage_two() -> Vec<u8> {
    contested_data(ContestStage::Stage2, ENDS, |_| {})
}

#[test]
fn contest_admin_confirm_keeps_the_stored_outcome() {
    let mut w = World::new();
    let admin = w.admin;
    let result = decide(&w, admin, stage_two(), CONFIRM, NOTE).at(&mut w, NOW);
    assert_ok(&result);
    let bytes = stored(&result);
    let c = Campaign::from_bytes(&bytes).unwrap();
    assert_eq!(
        (c.status, c.outcome, c.void_reason),
        (Status::Settling as u8, Outcome::No as u8, 0)
    );
    assert_eq!(
        (c.settle_mode, c.void_note_hash),
        (SettleMode::Split as u8, [0; 32])
    );
    assert_eq!(
        (c.event_seq.get(), open_count(&result, &w)),
        (EVENT_SEQ + 2, 0)
    );
}

#[test]
fn contest_admin_void_stores_the_reason_and_the_note() {
    for reason in [VoidReason::TeamHouseFailure, VoidReason::TeamOutsideCause] {
        let mut w = World::new();
        let admin = w.admin;
        let result = decide(&w, admin, stage_two(), [1, reason as u8], NOTE).at(&mut w, NOW);
        assert_ok(&result);
        let bytes = stored(&result);
        let c = Campaign::from_bytes(&bytes).unwrap();
        assert_eq!(
            (c.status, c.outcome, c.void_reason),
            (Status::Settling as u8, Outcome::Void as u8, reason as u8)
        );
        assert_eq!(
            (c.settle_mode, c.void_note_hash),
            (SettleMode::Refund as u8, NOTE)
        );
    }
}

#[test]
fn contest_admin_decides_while_entries_are_paused() {
    let mut w = World::new();
    let (admin, paused) = (w.admin, config_data(&w, OperatingLevel::EntriesHalted));
    let call = decide(&w, admin, stage_two(), CONFIRM, NOTE).with_config(&w, paused);
    assert_ok(&call.at(&mut w, NOW));
}

#[test]
fn decide_admin_refuses_a_team_key_and_a_stranger() {
    let mut w = World::new();
    for signer in [TEAM, STRANGER] {
        let result = decide(&w, signer, stage_two(), CONFIRM, NOTE).at(&mut w, NOW);
        assert_refused(&result, BrotError::NotAdmin);
    }
}

#[test]
fn contest_status_refuses_a_decision_on_a_campaign_not_contested() {
    let mut w = World::new();
    let admin = w.admin;
    let campaign = contested_data(ContestStage::Stage2, ENDS, |c| {
        c.status = Status::InReview as u8
    });
    let result = decide(&w, admin, campaign, CONFIRM, NOTE).at(&mut w, NOW);
    assert_refused(&result, BrotError::NotContested);
}

#[test]
fn contest_stage_refuses_a_decision_at_stage_one() {
    let mut w = World::new();
    let admin = w.admin;
    let campaign = contested_data(ContestStage::Stage1, ENDS, |_| {});
    let result = decide(&w, admin, campaign, CONFIRM, NOTE).at(&mut w, NOW);
    assert_refused(&result, BrotError::WrongContestStage);
}

#[test]
fn decide_deadline_refuses_from_the_deadline_on() {
    let mut w = World::new();
    let admin = w.admin;
    let result = decide(&w, admin, stage_two(), CONFIRM, NOTE).at(&mut w, ENDS);
    assert_refused(&result, BrotError::ContestDeadlinePassed);
    assert_ok(&decide(&w, admin, stage_two(), CONFIRM, NOTE).at(&mut w, ENDS - 1));
}

#[test]
fn decide_arguments_are_refused_each_with_its_own_error() {
    let mut w = World::new();
    let admin = w.admin;
    let cases = [
        ([2, 0], BrotError::InvalidContestDecision),
        (
            [0, VoidReason::TeamHouseFailure as u8],
            BrotError::ConfirmWithVoidReason,
        ),
        ([1, VoidReason::None as u8], BrotError::VoidReasonNotForTeam),
        (
            [1, VoidReason::UnreadableAccount as u8],
            BrotError::VoidReasonNotForTeam,
        ),
        ([1, 6], BrotError::BadInstructionData),
    ];
    for (args, error) in cases {
        let result = decide(&w, admin, stage_two(), args, NOTE).at(&mut w, NOW);
        assert_refused(&result, error);
    }
}

#[test]
fn lapse_stage_two_ends_with_the_stored_result() {
    let mut w = World::new();
    let result = finalize(&w, stage_two()).at(&mut w, ENDS);
    assert_ok(&result);
    let bytes = stored(&result);
    let c = Campaign::from_bytes(&bytes).unwrap();
    assert_eq!(
        (c.status, c.outcome, c.settle_mode),
        (Status::Settling as u8, Outcome::No as u8, 1)
    );
    assert_eq!(
        (c.event_seq.get(), open_count(&result, &w)),
        (EVENT_SEQ + 1, 0)
    );
}

#[test]
fn lapse_deadline_refuses_one_second_before() {
    let mut w = World::new();
    let result = finalize(&w, stage_two()).at(&mut w, ENDS - 1);
    assert_refused(&result, BrotError::ContestNotLapsed);
}

#[test]
fn lapse_stage_refuses_a_contest_with_no_stage() {
    let mut w = World::new();
    let campaign = contested_data(ContestStage::None, NOW, |_| {});
    let result = finalize(&w, campaign).at(&mut w, ENDS + STAGE2);
    assert_refused(&result, BrotError::CampaignNotInReview);
}

#[test]
fn lapse_of_an_unread_stage_one_comes_48_hours_after_its_deadline() {
    // Review fix F3: nobody re-read, so the stored result stands where the latest stage 2 would end.
    let mut w = World::new();
    let unread = || contested_data(ContestStage::Stage1, NOW, |_| {});
    let early = finalize(&w, unread()).at(&mut w, NOW + STAGE2 - 1);
    assert_refused(&early, BrotError::ContestNotLapsed);
    let result = finalize(&w, unread()).at(&mut w, NOW + STAGE2);
    assert_ok(&result);
    let bytes = stored(&result);
    let c = Campaign::from_bytes(&bytes).unwrap();
    assert_eq!(
        (c.status, c.outcome, c.settle_mode),
        (Status::Settling as u8, Outcome::No as u8, 1)
    );
}

#[test]
fn lapse_runs_while_entries_are_paused() {
    let mut w = World::new();
    let paused = config_data(&w, OperatingLevel::EntriesHalted);
    let result = finalize(&w, stage_two())
        .with_config(&w, paused)
        .at(&mut w, ENDS);
    assert_ok(&result);
}
