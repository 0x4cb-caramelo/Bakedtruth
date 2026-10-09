//! Purpose: the join's minimum entry (question 5): the campaign's own minimum, one lamport below
//!          refused, the minimum itself accepted, and the refusal's own error.
//! Version: 0.0.1
//! Sprint: 04 (settlement and invariants), lane G

use brot_markets::{error::BrotError, instructions::entries::join_rules::require_min_entry};

#[test]
fn one_lamport_below_the_campaigns_minimum_is_refused() {
    let minimum = 10_000_000;
    assert_eq!(
        require_min_entry(minimum - 1, minimum),
        Err(BrotError::BelowCampaignMinEntry)
    );
}

#[test]
fn the_campaigns_minimum_itself_is_accepted() {
    let minimum = 10_000_000;
    assert_eq!(require_min_entry(minimum, minimum), Ok(()));
    assert_eq!(require_min_entry(minimum + 1, minimum), Ok(()));
}

#[test]
fn the_minimum_is_the_one_the_campaign_opened_with() {
    // The campaign's stored minimum decides, whatever the config holds now: the rule takes only the
    // campaign's value, so a later config change (1 SOL, 1 lamport) cannot move it.
    let opened_with = 10_000_000;
    assert_eq!(require_min_entry(opened_with, opened_with), Ok(()));
    assert_eq!(
        require_min_entry(opened_with - 1, opened_with),
        Err(BrotError::BelowCampaignMinEntry)
    );
}

#[test]
fn a_zero_minimum_accepts_a_zero_entry() {
    assert_eq!(require_min_entry(0, 0), Ok(()));
}
