//! Purpose: the late rule of the tally (`LateRule`): late only on a YES price campaign, at or after the proof's
//!          publish time, inclusive at the boundary. A NO price campaign, a void and a supply campaign have no late joins.
//! Version: 0.0.1
//! Sprint: 04 (contract amendment 2026-10-09), lane G

use brot_markets::{
    instructions::entries::join_tally::LateRule,
    state::enums::{Outcome, ReaderKind},
};

const PUBLISH: i64 = 1_000;

fn rule(outcome: Outcome, kind: ReaderKind) -> LateRule {
    LateRule::of(outcome as u8, kind as u8, PUBLISH)
}

#[test]
fn a_yes_price_campaign_splits_at_the_publish_time_inclusive() {
    let yes_price = rule(Outcome::Yes, ReaderKind::PriceTouch);
    assert!(
        !yes_price.is_late(PUBLISH - 1),
        "one second before the proof is early"
    );
    assert!(
        yes_price.is_late(PUBLISH),
        "the publish time itself is late"
    );
    assert!(yes_price.is_late(PUBLISH + 1), "one second after is late");
}

#[test]
fn a_no_price_campaign_has_no_late_joins_at_any_time() {
    let no_price = rule(Outcome::No, ReaderKind::PriceTouch);
    for joined_at in [PUBLISH - 1, PUBLISH, PUBLISH + 1, i64::MAX] {
        assert!(!no_price.is_late(joined_at), "joined at {joined_at}");
    }
}

#[test]
fn a_void_or_an_unresolved_price_campaign_has_no_late_joins() {
    for outcome in [Outcome::Void, Outcome::Unresolved] {
        let r = rule(outcome, ReaderKind::PriceTouch);
        assert!(!r.is_late(PUBLISH), "{outcome:?}");
    }
}

#[test]
fn a_supply_campaign_has_no_late_joins_even_on_yes() {
    let supply = rule(Outcome::Yes, ReaderKind::SupplyAtMost);
    assert!(!supply.is_late(PUBLISH));
    assert!(!supply.is_late(PUBLISH + 100));
}

#[test]
fn the_other_kinds_on_yes_are_never_late() {
    for kind in [
        ReaderKind::DammV2LockedAtLeast,
        ReaderKind::StakePoolTvlAtLeast,
        ReaderKind::StakeAtLeast,
    ] {
        assert!(!rule(Outcome::Yes, kind).is_late(PUBLISH + 1), "{kind:?}");
    }
}
