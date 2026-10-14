//! Purpose: the team's escalation on the program's SBF binary in Mollusk (the founder's answer to D2, 2026-10-13): a
//!          team key calls `team_open_contest(2)` on a contest still at stage 1, before stage 1's deadline, and the
//!          contest goes to stage 2 for 48 hours, the result untouched; refused to anyone but a team key
//!          (`NotTeamMember`, first), at stage 2 already (`WrongContestStage`), and from stage 1's deadline on
//!          (`ContestDeadlinePassed`); the pause never blocks it.
//! Version: 0.0.2 (the escalation is its own byte, the second review's S1)
//! Sprint: 14 (lane L14B, D2). Runs after the SBF build (`BROT_MARKETS_SO`, else `target/deploy/brot_markets.so`).

#[allow(unused_imports)]
#[path = "checks_support/mollusk.rs"]
mod world;

#[path = "contest_support/mod.rs"]
mod contest;

use brot_markets::{
    constants::CONTEST_STAGE2_SECONDS,
    error::BrotError,
    layout::LeU64,
    state::enums::{ContestStage, OperatingLevel},
};
use contest::*;
use world::{assert_ok, assert_refused, World};

/// Stage 1's deadline: the escalation comes before it.
const ENDS: i64 = NOW + 20 * HOUR;

/// A contest at `stage` until `ENDS`.
fn contest_at(stage: ContestStage) -> Vec<u8> {
    contested_data(stage, ENDS, |_| {})
}

/// The campaign as an escalation at `NOW` leaves it: stage 2 until `NOW + 48 h`, the next event number.
fn escalated_at_now() -> Vec<u8> {
    contested_data(ContestStage::Stage2, NOW + CONTEST_STAGE2_SECONDS, |c| {
        c.event_seq = LeU64::new(EVENT_SEQ + 1);
    })
}

#[test]
fn escalation_sends_a_stage_one_contest_to_the_admin_and_keeps_the_result() {
    let mut w = World::new();
    let result = open_contest(&w, TEAM, ESCALATE, contest_at(ContestStage::Stage1)).at(&mut w, NOW);
    assert_ok(&result);
    assert_eq!(stored(&result), escalated_at_now());
    // The second before stage 1's deadline is still before it.
    let last =
        open_contest(&w, TEAM, ESCALATE, contest_at(ContestStage::Stage1)).at(&mut w, ENDS - 1);
    assert_ok(&last);
    let c = contested_data(
        ContestStage::Stage2,
        ENDS - 1 + CONTEST_STAGE2_SECONDS,
        |c| {
            c.event_seq = LeU64::new(EVENT_SEQ + 1);
        },
    );
    assert_eq!(stored(&last), c);
}

#[test]
fn escalation_runs_while_entries_are_paused() {
    let mut w = World::new();
    let paused = config_data(&w, OperatingLevel::EntriesHalted);
    let call =
        open_contest(&w, TEAM, ESCALATE, contest_at(ContestStage::Stage1)).with_config(&w, paused);
    let result = call.at(&mut w, NOW);
    assert_ok(&result);
    assert_eq!(stored(&result), escalated_at_now());
}

#[test]
fn escalation_refuses_anyone_but_a_team_key_first() {
    let mut w = World::new();
    let admin = w.admin;
    for signer in [STRANGER, admin] {
        let result =
            open_contest(&w, signer, ESCALATE, contest_at(ContestStage::Stage1)).at(&mut w, NOW);
        assert_refused(&result, BrotError::NotTeamMember);
    }
}

#[test]
fn escalate_stage_refuses_a_contest_at_stage_two_already() {
    let mut w = World::new();
    let result = open_contest(&w, TEAM, ESCALATE, contest_at(ContestStage::Stage2)).at(&mut w, NOW);
    assert_refused(&result, BrotError::WrongContestStage);
}

#[test]
fn escalate_deadline_refuses_from_stage_one_deadline_on() {
    // From stage 1's deadline a matching re-read may pay, and a different one escalates by itself.
    let mut w = World::new();
    for at in [ENDS, ENDS + 1] {
        let result =
            open_contest(&w, TEAM, ESCALATE, contest_at(ContestStage::Stage1)).at(&mut w, at);
        assert_refused(&result, BrotError::ContestDeadlinePassed);
    }
}
