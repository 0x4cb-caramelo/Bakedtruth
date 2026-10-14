//! Purpose: `team_open_contest` on the program's SBF binary in Mollusk (Sprint 14, lane L14B): a team key contests a
//!          campaign in review inside its window, and stage 1 starts for 24 hours with the result untouched; every
//!          refusal with its own error (the X0.9 negatives of `contest_rules.rs`); the pause never blocks it. The
//!          team's escalation to stage 2 is in `contest_mollusk_escalate.rs`.
//! Version: 0.0.3 (the opening's byte, S1: `contest_mollusk_act.rs`; stage 1 lasts 24 hours, D2)
//! Sprint: 14 (lane L14B). Runs after the SBF build (`BROT_MARKETS_SO`, else `target/deploy/brot_markets.so`).

#[allow(unused_imports)]
#[path = "checks_support/mollusk.rs"]
mod world;

#[path = "contest_support/mod.rs"]
mod contest;

use brot_markets::{
    constants::CONTEST_STAGE1_SECONDS,
    error::BrotError,
    layout::{LeI64, LeU32, LeU64},
    state::enums::{ContestStage, OperatingLevel, Status},
};
use contest::*;
use world::{after, assert_ok, assert_refused, World};

/// The campaign as a contest opened at `NOW` leaves it: only the status, the stage, its deadline and the event number.
fn contested_at_now() -> Vec<u8> {
    campaign_data(|c| {
        (c.status, c.contest_stage) = (Status::Contested as u8, ContestStage::Stage1 as u8);
        c.contest_ends_at = LeI64::new(NOW + CONTEST_STAGE1_SECONDS);
        c.event_seq = LeU64::new(EVENT_SEQ + 1);
    })
}

#[test]
fn contest_open_starts_stage_one_for_24_hours_and_keeps_the_result() {
    let mut w = World::new();
    let result = open_contest(&w, TEAM, OPEN, campaign_data(|_| {})).at(&mut w, NOW);
    assert_ok(&result);
    assert_eq!(stored(&result), contested_at_now());
    let campaign = after(&result, &campaign_address().0);
    assert_eq!(campaign.lamports, w.rent(campaign.data.len()));
}

#[test]
fn contest_open_runs_while_entries_are_paused() {
    let mut w = World::new();
    let paused = config_data(&w, OperatingLevel::EntriesHalted);
    let call = open_contest(&w, TEAM, OPEN, campaign_data(|_| {})).with_config(&w, paused);
    let result = call.at(&mut w, NOW);
    assert_ok(&result);
    assert_eq!(stored(&result), contested_at_now());
}

#[test]
fn contest_team_key_refuses_a_stranger_and_the_admin() {
    let mut w = World::new();
    let admin = w.admin;
    for signer in [STRANGER, admin] {
        let result = open_contest(&w, signer, OPEN, campaign_data(|_| {})).at(&mut w, NOW);
        assert_refused(&result, BrotError::NotTeamMember);
    }
}

#[test]
fn contest_window_refuses_a_campaign_not_in_review() {
    let mut w = World::new();
    // A Contested campaign refuses the opening before this rule (`ContestAlreadyOpen`, contest_mollusk_act.rs).
    for status in [Status::Open, Status::Settling, Status::Settled] {
        let campaign = campaign_data(|c| c.status = status as u8);
        let result = open_contest(&w, TEAM, OPEN, campaign).at(&mut w, NOW);
        assert_refused(&result, BrotError::TeamKeyOutsideReview);
    }
}

#[test]
fn contest_window_refuses_at_the_instant_the_window_closes() {
    let mut w = World::new();
    let result = open_contest(&w, TEAM, OPEN, campaign_data(|_| {})).at(&mut w, REVIEW_ENDS);
    assert_refused(&result, BrotError::ContestOutsideReview);
    // The window's last second is still inside it.
    let result = open_contest(&w, TEAM, OPEN, campaign_data(|_| {})).at(&mut w, REVIEW_ENDS - 1);
    assert_ok(&result);
}

#[test]
fn contest_tallied_refuses_while_an_entry_is_untallied() {
    let mut w = World::new();
    let campaign = campaign_data(|c| c.entries_untallied = LeU32::new(1));
    let result = open_contest(&w, TEAM, OPEN, campaign).at(&mut w, NOW);
    assert_refused(&result, BrotError::NotTallied);
}
