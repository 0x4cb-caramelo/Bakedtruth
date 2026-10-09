//! Purpose: the review window's rules of the team instructions on the host: a team key acts only
//!          while `InReview` (`TeamKeyOutsideReview`) and before `review_ends_at` (the act's own closed
//!          error); the event number each event takes; and the team-key membership (`NotTeamMember`).
//! Version: 0.0.1
//! Sprint: 04 (lane A). The handlers' clock and account refusals run in LiteSVM (tests/brot/team-*.test.ts).

use brot_markets::{
    error::BrotError::*,
    instructions::resolution::{
        team_shared::{require_team_key, take_seq},
        window::{is_open, require_review},
    },
    layout::{LeU64, Pubkey, ZeroCopy},
    state::{campaign::Campaign, config::GlobalConfig, enums::Status},
};
use pinocchio::Address;

const REVIEW_ENDS: i64 = 1_791_230_000;
const INSIDE: i64 = REVIEW_ENDS - 1;

fn key(n: u8) -> Address {
    Address::new_from_array([n; 32])
}

fn status(s: Status) -> u8 {
    s as u8
}

#[test]
fn team_window_open_until_the_last_second() {
    assert!(is_open(INSIDE, REVIEW_ENDS));
    assert!(is_open(REVIEW_ENDS - 3_600, REVIEW_ENDS));
}

#[test]
fn team_window_closed_at_the_instant_it_ends() {
    assert!(!is_open(REVIEW_ENDS, REVIEW_ENDS));
    assert!(!is_open(REVIEW_ENDS + 1, REVIEW_ENDS));
}

#[test]
fn team_window_confirm_and_void_refused_after_the_window() {
    let late = require_review(
        status(Status::InReview),
        REVIEW_ENDS,
        REVIEW_ENDS,
        OutsideReviewWindow,
    );
    assert_eq!(late, Err(OutsideReviewWindow));
}

#[test]
fn team_window_contest_refused_after_the_window_with_its_own_error() {
    let late = require_review(
        status(Status::InReview),
        REVIEW_ENDS,
        REVIEW_ENDS,
        ContestOutsideReview,
    );
    assert_eq!(late, Err(ContestOutsideReview));
}

#[test]
fn team_window_inside_the_window_in_review_passes() {
    assert_eq!(
        require_review(
            status(Status::InReview),
            INSIDE,
            REVIEW_ENDS,
            OutsideReviewWindow
        ),
        Ok(())
    );
}

#[test]
fn team_window_a_team_key_acts_only_in_review() {
    // Open, Contested and Settling (and Settled) refuse every team act, inside the window or not.
    for s in [
        Status::Open,
        Status::Contested,
        Status::Settling,
        Status::Settled,
    ] {
        for now in [INSIDE, REVIEW_ENDS + 10] {
            assert_eq!(
                require_review(status(s), now, REVIEW_ENDS, OutsideReviewWindow),
                Err(TeamKeyOutsideReview),
                "status {s:?} at {now}"
            );
            assert_eq!(
                require_review(status(s), now, REVIEW_ENDS, ContestOutsideReview),
                Err(TeamKeyOutsideReview),
                "contest on status {s:?} at {now}"
            );
        }
    }
}

#[test]
fn team_window_status_check_comes_before_the_clock() {
    // A campaign that is not InReview is refused as such, even after its window ended.
    assert_eq!(
        require_review(
            status(Status::Contested),
            REVIEW_ENDS + 1,
            REVIEW_ENDS,
            OutsideReviewWindow
        ),
        Err(TeamKeyOutsideReview)
    );
}

#[test]
fn team_window_a_byte_that_is_no_status_is_refused() {
    assert_eq!(
        require_review(9, INSIDE, REVIEW_ENDS, OutsideReviewWindow),
        Err(BadAccountData)
    );
}

fn campaign_with_seq(seq: u64) -> Vec<u8> {
    let mut bytes = vec![0u8; Campaign::LEN];
    let campaign = Campaign::from_bytes_mut(&mut bytes).unwrap();
    campaign.event_seq = LeU64::new(seq);
    bytes
}

#[test]
fn team_window_each_event_takes_the_next_seq() {
    let mut bytes = campaign_with_seq(7);
    let campaign = Campaign::from_bytes_mut(&mut bytes).unwrap();
    assert_eq!(take_seq(campaign), Ok(7));
    assert_eq!(campaign.event_seq.get(), 8);
    assert_eq!(take_seq(campaign), Ok(8));
    assert_eq!(campaign.event_seq.get(), 9);
}

#[test]
fn team_window_seq_at_its_maximum_refuses_and_changes_nothing() {
    let mut bytes = campaign_with_seq(u64::MAX);
    let campaign = Campaign::from_bytes_mut(&mut bytes).unwrap();
    assert_eq!(take_seq(campaign), Err(MathOverflow));
    assert_eq!(campaign.event_seq.get(), u64::MAX);
}

fn config_with_team(keys: &[Pubkey]) -> Vec<u8> {
    let mut bytes = vec![0u8; GlobalConfig::LEN];
    let config = GlobalConfig::from_bytes_mut(&mut bytes).unwrap();
    config.team_len = u8::try_from(keys.len()).unwrap();
    let mut team = [Pubkey::default(); 5];
    team[..keys.len()].copy_from_slice(keys);
    config.team = team;
    bytes
}

#[test]
fn team_window_only_a_listed_team_key_acts() {
    let mut bytes = config_with_team(&[key(1), key(2)]);
    let config = GlobalConfig::from_bytes_mut(&mut bytes).unwrap();
    assert_eq!(require_team_key(config, &key(1)), Ok(()));
    assert_eq!(require_team_key(config, &key(2)), Ok(()));
    assert_eq!(require_team_key(config, &key(3)), Err(NotTeamMember));
}

#[test]
fn team_window_an_empty_team_refuses_everyone() {
    let mut bytes = config_with_team(&[]);
    let config = GlobalConfig::from_bytes_mut(&mut bytes).unwrap();
    assert_eq!(require_team_key(config, &key(1)), Err(NotTeamMember));
}
