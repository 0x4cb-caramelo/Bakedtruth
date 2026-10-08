//! Purpose: rows 1 to 4 of TP section 3.4.10 on the host, each refusal with its own error (X0.7):
//!          `readers::validate_at_creation` over runtime-shaped accounts holding the captured Pyth
//!          bytes, the account itself checked before the price and the price before the target.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane D. The handler runs these rows again in LiteSVM
//!         (tests/brot/open-campaign-*.test.ts), after the SBF build.

mod opening_support;

use brot_markets::{
    error::BrotError,
    readers::{validate_at_creation, CreationContext, CreationReading},
    state::enums::{Direction, ReaderKind},
};
use opening_support::*;
use pinocchio::error::ProgramError;

/// 110% of the BTC/USD fixture's price: the default target of tests/brot/flows.ts.
const TARGET: i128 = 9_373_357_187_557;
/// The BTC/USD fixture's price ± its confidence: the edges of the band the touch rule reads.
const ABOVE_EDGE: i128 = 8_522_008_012_531;
const BELOW_EDGE: i128 = 8_520_459_601_209;
const OPENED: Result<CreationReading, ProgramError> = Ok(CreationReading { price_exponent: -8 });

/// Rows 2 to 4 for `kind` on `metric`, with the devnet `campaign_max_age` (120 s).
fn validate(
    kind: ReaderKind,
    metric: &mut HostAccount,
    feed_id: &[u8; 32],
    direction: Direction,
    target: i128,
) -> Result<CreationReading, ProgramError> {
    let view = metric.view();
    let context = CreationContext {
        metric: &view,
        feed_id,
        direction,
        target,
        max_age: 120,
        now: NOW,
    };
    validate_at_creation(kind, &context)
}

/// A BTC/USD campaign, `Above` 110% of the price, on `metric`.
fn btc_campaign(mut metric: HostAccount) -> Result<CreationReading, ProgramError> {
    validate(
        ReaderKind::PriceTouch,
        &mut metric,
        &BTC_FEED,
        Direction::Above,
        TARGET,
    )
}

/// A BTC/USD campaign on the fresh sponsored account, in `direction` towards `target`.
fn btc_touching(direction: Direction, target: i128) -> Result<CreationReading, ProgramError> {
    let mut metric = btc_account(|_| ());
    validate(
        ReaderKind::PriceTouch,
        &mut metric,
        &BTC_FEED,
        direction,
        target,
    )
}

/// The BTC/USD account with one i64 field changed.
fn btc_with(at: usize, value: i64) -> HostAccount {
    btc_account(|data| set_i64(data, at, value))
}

#[test]
fn rows_2_to_4_accept_a_fresh_sponsored_price_and_return_its_exponent() {
    assert_eq!(btc_campaign(btc_account(|_| ())), OPENED);
    assert_eq!(btc_touching(Direction::Below, 1), OPENED);
    // A campaign on SOL/USD itself reads the account that also prices the opening.
    let mut sol = sol_account(|_| ());
    let on_sol = validate(
        ReaderKind::PriceTouch,
        &mut sol,
        &SOL_FEED,
        Direction::Below,
        1,
    );
    assert_eq!(on_sol, OPENED);
}

#[test]
fn row_1_the_four_other_kinds_do_not_open_yet() {
    let others = [
        ReaderKind::SupplyAtMost,
        ReaderKind::DammV2LockedAtLeast,
        ReaderKind::StakePoolTvlAtLeast,
        ReaderKind::StakeAtLeast,
    ];
    for kind in others {
        let mut metric = btc_account(|_| ());
        let refused = validate(kind, &mut metric, &BTC_FEED, Direction::Above, TARGET);
        assert_eq!(refused, Err(err(BrotError::ReaderKindNotOpen)), "{kind:?}");
    }
}

#[test]
fn row_2_refuses_an_account_that_is_not_the_feeds_sponsored_one() {
    let mismatch = Err(err(BrotError::MetricAccountMismatch));
    // The real SOL/USD account named for a BTC campaign.
    assert_eq!(btc_campaign(sol_account(|_| ())), mismatch);
    // BTC's own bytes at another address, and at BTC's pre-upgrade sponsored address.
    let elsewhere = HostAccount::price(SOL_ACCOUNT, RECEIVER, BTC, |_| ());
    assert_eq!(btc_campaign(elsewhere), mismatch);
    let legacy = HostAccount::price(BTC_LEGACY_ACCOUNT, LEGACY_RECEIVER, BTC, |_| ());
    assert_eq!(btc_campaign(legacy), mismatch);
}

#[test]
fn row_4_passes_the_readers_own_errors_at_the_sponsored_address() {
    // The pre-upgrade receiver's real SOL account, placed at the upgraded sponsored address.
    let mut legacy = HostAccount::price(SOL_ACCOUNT, LEGACY_RECEIVER, SOL_LEGACY, |_| ());
    let on_legacy = validate(
        ReaderKind::PriceTouch,
        &mut legacy,
        &SOL_FEED,
        Direction::Below,
        1,
    );
    assert_eq!(on_legacy, Err(err(BrotError::ReaderWrongOwner)));
    let partial = btc_account(|data| data[VERIFICATION] = 0);
    assert_eq!(
        btc_campaign(partial),
        Err(err(BrotError::PriceNotFullyVerified))
    );
    let cut = HostAccount::new(BTC_ACCOUNT, RECEIVER, &BTC[..133]);
    assert_eq!(btc_campaign(cut), Err(err(BrotError::ReaderBadLayout)));
    // The sponsored address of one feed holding another feed's update.
    let other_feed = HostAccount::price(BTC_ACCOUNT, RECEIVER, SOL, |_| ());
    assert_eq!(
        btc_campaign(other_feed),
        Err(err(BrotError::PriceWrongFeed))
    );
}

#[test]
fn row_4_refuses_a_stale_price_and_accepts_one_exactly_max_age_old() {
    // NOW is PUBLISHED + 7: a publish time 114 s earlier is 121 s old, 113 s earlier is 120 s.
    let stale = btc_with(PUBLISH_TIME, published(-114));
    assert_eq!(btc_campaign(stale), Err(err(BrotError::PriceStale)));
    assert_eq!(
        btc_campaign(btc_with(PUBLISH_TIME, published(-113))),
        OPENED
    );
    // Published ahead of the clock counts as fresh.
    assert_eq!(btc_campaign(btc_with(PUBLISH_TIME, published(30))), OPENED);
}

#[test]
fn row_4_refuses_a_price_at_or_below_zero() {
    for price in [0, -1] {
        let refused = btc_campaign(btc_with(PRICE, price));
        assert_eq!(refused, Err(err(BrotError::PriceNonPositive)), "{price}");
    }
}

#[test]
fn row_4_refuses_a_confidence_wider_than_half_a_percent() {
    // 0.5% of 8,521,233,806,870 is 42,606,169,034.35.
    let wide = btc_with(CONF, 42_606_169_035);
    assert_eq!(
        btc_campaign(wide),
        Err(err(BrotError::PriceConfidenceTooWide))
    );
    assert_eq!(btc_campaign(btc_with(CONF, 42_606_169_034)), OPENED);
}

#[test]
fn row_3_refuses_a_target_already_touched_in_either_direction() {
    let touched = Err(err(BrotError::TargetAlreadyTouched));
    let above_past = ABOVE_EDGE.checked_add(1).unwrap();
    let below_past = BELOW_EDGE.checked_sub(1).unwrap();
    assert_eq!(btc_touching(Direction::Above, ABOVE_EDGE), touched);
    assert_eq!(btc_touching(Direction::Above, above_past), OPENED);
    assert_eq!(btc_touching(Direction::Below, BELOW_EDGE), touched);
    assert_eq!(btc_touching(Direction::Below, below_past), OPENED);
    // A target on the wrong side of the price is touched from birth.
    assert_eq!(btc_touching(Direction::Above, 1), touched);
    assert_eq!(btc_touching(Direction::Below, TARGET), touched);
}
