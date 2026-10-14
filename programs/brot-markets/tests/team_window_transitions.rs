//! Purpose: the status moves of the team instructions go through `state::transitions::transition`:
//!          confirm and void move `InReview` to `Settling`, contest moves it to `Contested`, and nothing
//!          in this sprint leaves `Contested` (Sprint 14 owns the exits).
//! Version: 0.0.1
//! Sprint: 04 (lane A)

use brot_markets::{
    error::BrotError::{self, *},
    state::{
        enums::Status::{self, *},
        transitions::transition,
    },
};

#[test]
fn team_window_confirm_and_void_move_in_review_to_settling() {
    assert_eq!(transition(InReview, Settling), Ok(()));
}

#[test]
fn team_window_contest_moves_in_review_to_contested() {
    assert_eq!(transition(InReview, Contested), Ok(()));
}

#[test]
fn team_window_no_team_act_starts_from_another_status() {
    // Lane A's acts call transition(InReview, _) only, after the window check refuses every other status.
    assert_eq!(transition(Open, Settling), Err(IllegalTransition));
    assert_eq!(transition(Settling, Contested), Err(IllegalTransition));
    assert_eq!(transition(Open, Contested), Err(IllegalTransition));
}

#[test]
fn team_window_a_contested_campaign_gets_no_exit_from_lane_a() {
    // The table keeps Sprint 14's exit (Contested to Settling) as the design, and it is refused by
    // ContestExitDisabled at the instruction that would take it, which this sprint does not have.
    // Lane A's own acts refuse a Contested campaign first (TeamKeyOutsideReview, team_window_rules).
    let from: Status = Contested;
    assert_eq!(transition(from, InReview), Err(IllegalTransition));
    assert_eq!(transition(from, Open), Err(IllegalTransition));
}

#[test]
fn team_window_transition_refusal_is_illegal_transition() {
    let refused: BrotError = transition(Settled, InReview).unwrap_err();
    assert_eq!(refused, IllegalTransition);
}

#[test]
fn team_window_a_contested_campaign_with_no_entry_finalizes_to_settled() {
    // The lead's addendum of Sprint 14 (2026-10-13): the finalize snapshot of a campaign with no open
    // entry goes straight to Settled, from a contest as from the window, or the pot would freeze.
    assert_eq!(transition(Contested, Settled), Ok(()));
    assert_eq!(transition(InReview, Settled), Ok(()));
}
