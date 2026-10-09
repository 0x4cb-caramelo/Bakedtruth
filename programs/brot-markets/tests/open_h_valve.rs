//! Purpose: lane H, question 4 (founder answer 4, 2026-10-09): the valve `max_open_campaigns` counts
//!          paid openings only. A team key's free opening is outside the limit, neither refused by it nor
//!          counted; a paid opening, by a team key or any wallet, is counted and refused at the limit. The
//!          counter itself moves in `user_open_campaign` (checked on the binary in LiteSVM).
//! Version: 0.0.1
//! Sprint: 04 (opening side of questions 1 to 5), lane H

use brot_markets::{
    error::BrotError,
    instructions::campaigns::open_campaign::rules::{counts_toward_limit, within_valve},
};

#[test]
fn only_a_paid_opening_counts() {
    assert!(
        !counts_toward_limit(0),
        "a team key's free opening is outside the limit"
    );
    assert!(counts_toward_limit(1));
    assert!(counts_toward_limit(500));
}

#[test]
fn a_free_team_opening_is_never_refused_by_the_valve() {
    let counts = counts_toward_limit(0);
    assert_eq!(within_valve(counts, 5, 5), Ok(()));
    assert_eq!(within_valve(counts, 10_000, 5), Ok(()));
}

#[test]
fn a_paid_opening_is_refused_once_the_limit_is_reached() {
    let counts = counts_toward_limit(500);
    assert_eq!(within_valve(counts, 4, 5), Ok(()));
    assert_eq!(
        within_valve(counts, 5, 5),
        Err(BrotError::TooManyOpenCampaigns)
    );
    assert_eq!(
        within_valve(counts, 6, 5),
        Err(BrotError::TooManyOpenCampaigns)
    );
}

#[test]
fn a_paid_team_opening_counts_like_any_paid_opening() {
    // A team key that adds a prize pays like any wallet (payment.rs), so it counts too.
    assert_eq!(
        within_valve(counts_toward_limit(1), 5, 5),
        Err(BrotError::TooManyOpenCampaigns)
    );
}
