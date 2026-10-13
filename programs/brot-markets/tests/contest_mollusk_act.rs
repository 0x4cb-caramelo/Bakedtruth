//! Purpose: the act of `team_open_contest` is its signed byte (the second review's S1, 2026-10-13), on the host and on
//!          the program's SBF binary in Mollusk: byte 1 on a campaign already `Contested`, at either stage, is a
//!          retried or duplicate opening and is refused (`ContestAlreadyOpen`) before any other rule on the campaign;
//!          byte 2 on a campaign that is not `Contested` is refused (`NotContested`); any other byte, or data of
//!          another length, is `BadInstructionData`; the team key is still checked first.
//! Version: 0.0.1
//! Sprint: 14 (lane L14B, the second review's S1). Runs after the SBF build (`BROT_MARKETS_SO`, else
//!         `target/deploy/brot_markets.so`).

#[allow(unused_imports)]
#[path = "checks_support/mollusk.rs"]
mod world;

#[path = "contest_support/mod.rs"]
mod contest;

use brot_markets::{
    error::BrotError,
    instructions::resolution::contest_rules::{require_act_fits, require_contest_act},
    state::enums::{ContestStage, Status},
};
use contest::*;
use world::{assert_refused, World};

/// Stage 1's deadline, still ahead at `NOW`.
const ENDS: i64 = NOW + 20 * HOUR;
const NOT_CONTESTED: [Status; 4] = [
    Status::Open,
    Status::InReview,
    Status::Settling,
    Status::Settled,
];

#[test]
fn contest_act_is_the_byte_and_fits_the_campaign_on_the_host() {
    for byte in [1, 2] {
        assert_eq!(require_contest_act(byte), Ok(()));
    }
    for byte in [0, 3, 255] {
        assert_eq!(
            require_contest_act(byte),
            Err(BrotError::BadInstructionData)
        );
    }
    let (one, two) = (ContestStage::Stage1, ContestStage::Stage2);
    let contested = Status::Contested as u8;
    assert_eq!(require_act_fits(one, Status::InReview as u8), Ok(()));
    assert_eq!(
        require_act_fits(one, contested),
        Err(BrotError::ContestAlreadyOpen)
    );
    assert_eq!(require_act_fits(two, contested), Ok(()));
    for status in NOT_CONTESTED {
        assert_eq!(
            require_act_fits(two, status as u8),
            Err(BrotError::NotContested)
        );
    }
}

#[test]
fn contest_already_open_refuses_a_retried_opening_at_either_stage() {
    // Review S1: the opening landed, its sender saw a 429 and sends the same bytes again (or a second team member acts
    // on the same alert), inside the review window with every entry tallied: nothing escalates.
    let mut w = World::new();
    for stage in [ContestStage::Stage1, ContestStage::Stage2] {
        let campaign = contested_data(stage, ENDS, |_| {});
        let result = open_contest(&w, TEAM, OPEN, campaign).at(&mut w, NOW);
        assert_refused(&result, BrotError::ContestAlreadyOpen);
    }
}

#[test]
fn contest_not_open_refuses_an_escalation_of_a_campaign_not_contested() {
    let mut w = World::new();
    for status in NOT_CONTESTED {
        let campaign = campaign_data(|c| c.status = status as u8);
        let result = open_contest(&w, TEAM, ESCALATE, campaign).at(&mut w, NOW);
        assert_refused(&result, BrotError::NotContested);
    }
}

#[test]
fn contest_act_refuses_any_other_byte_and_any_other_length() {
    let mut w = World::new();
    let datas: [&[u8]; 6] = [&[], &[0], &[3], &[255], &[1, 0], &[2, 2]];
    for data in datas {
        let result = open_contest(&w, TEAM, data, campaign_data(|_| {})).at(&mut w, NOW);
        assert_refused(&result, BrotError::BadInstructionData);
    }
}

#[test]
fn contest_act_comes_after_the_team_key() {
    // A stranger's opening of a contested campaign is refused as a stranger's.
    let mut w = World::new();
    let campaign = contested_data(ContestStage::Stage1, ENDS, |_| {});
    let result = open_contest(&w, STRANGER, OPEN, campaign).at(&mut w, NOW);
    assert_refused(&result, BrotError::NotTeamMember);
}
