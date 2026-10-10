//! Purpose: the class of each `VoidReason` (TP section 3.4.7): one test per reason, for the 10%
//!          opening fee (refunded on a house failure, kept on an outside cause), for whether a team
//!          key may choose it, and for the outcome a team void records. The manual voids Sprint 03 left
//!          to the team (StaleFeed after a late update, MissedWindow) are among them.
//! Version: 0.0.1
//! Sprint: 04 (lane A)

use brot_markets::{
    error::BrotError::{self, *},
    instructions::resolution::void_reason::{is_house_failure, team_may_choose, team_void_outcome},
    state::enums::{Outcome, VoidReason},
};

#[test]
fn team_window_missed_window_refunds_the_fee() {
    // Written by resolve_campaign (house failure); a team key may also record it by hand.
    assert!(is_house_failure(VoidReason::MissedWindow));
    assert_eq!(team_may_choose(VoidReason::MissedWindow), Ok(()));
}

#[test]
fn team_window_unreadable_account_keeps_the_fee_and_is_not_for_the_team() {
    assert!(!is_house_failure(VoidReason::UnreadableAccount));
    assert_eq!(
        team_may_choose(VoidReason::UnreadableAccount),
        Err(VoidReasonNotForTeam)
    );
}

#[test]
fn team_window_stale_feed_keeps_the_fee_and_a_team_may_void_it_after_a_late_update() {
    // Founder answer 9 (2026-10-09): an outside cause, so the 10% is kept.
    assert!(!is_house_failure(VoidReason::StaleFeed));
    assert_eq!(team_may_choose(VoidReason::StaleFeed), Ok(()));
    // Decision of 2026-10-09: a team key never voids a YES that resolve_campaign read, even with a late update.
    assert_eq!(team_void_outcome(Outcome::Yes), Err(TeamVoidNotAutomatic));
}

#[test]
fn team_window_team_house_failure_refunds_the_fee() {
    assert!(is_house_failure(VoidReason::TeamHouseFailure));
    assert_eq!(team_may_choose(VoidReason::TeamHouseFailure), Ok(()));
}

#[test]
fn team_window_team_outside_cause_keeps_the_fee() {
    assert!(!is_house_failure(VoidReason::TeamOutsideCause));
    assert_eq!(team_may_choose(VoidReason::TeamOutsideCause), Ok(()));
}

#[test]
fn team_window_no_reason_is_not_a_void_for_the_team() {
    assert!(!is_house_failure(VoidReason::None));
    assert_eq!(team_may_choose(VoidReason::None), Err(VoidReasonNotForTeam));
}

#[test]
fn team_window_a_manual_missed_window_void_of_a_no_result() {
    assert_eq!(team_may_choose(VoidReason::MissedWindow), Ok(()));
    assert_eq!(team_void_outcome(Outcome::No), Err(TeamVoidNotAutomatic));
}

#[test]
fn team_window_an_automatic_void_is_confirmed_never_inverted() {
    // A team key may record its reason on an automatic void (Void stays Void); it never turns it into YES or NO.
    assert_eq!(team_void_outcome(Outcome::Void), Ok(Outcome::Void));
}

#[test]
fn team_window_an_unresolved_campaign_is_not_in_review() {
    assert_eq!(
        team_void_outcome(Outcome::Unresolved),
        Err(TeamKeyOutsideReview)
    );
}

#[test]
fn team_window_void_refusals_are_the_frozen_codes() {
    let as_code = |e: BrotError| u32::from(e);
    assert_eq!(as_code(VoidReasonNotForTeam), 6094);
    assert_eq!(as_code(TeamVoidNotAutomatic), 6097);
    assert_eq!(as_code(TeamKeyOutsideReview), 6091);
    assert_eq!(as_code(OutsideReviewWindow), 6092);
    assert_eq!(as_code(ContestOutsideReview), 6095);
}
