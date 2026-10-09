//! Purpose: rows 1, 2 and 4 of TP section 3.4.10 on the host, each refusal with its own error
//!          (X0.7): `readers::validate_at_creation` over runtime-shaped accounts holding the
//!          captured Pyth bytes, the account checked before the price; row 3 is `price_target.rs`.
//! Version: 0.0.3
//! Sprint: 02 (pot core on Pinocchio), lane D; 03 (the slot bound, the mainnet accounts, row 3
//!         moved out), lane C. The handler runs these rows again in LiteSVM after the SBF build.

mod opening_support;
mod price_support;

use brot_markets::{
    error::BrotError::*,
    state::enums::{
        Direction::{self, Above, Below},
        ReaderKind,
    },
};
use opening_support::*;
use price_support::*;

/// 90% of the SOL/USD devnet price: a `Below` target far from touched.
const SOL_BELOW: i128 = 10_729_660_064;

/// A price campaign on `metric` towards `aim` at `NOW`, slot 0.
fn validate(metric: &mut HostAccount, feed_id: &[u8; 32], aim: (Direction, i128)) -> Opened {
    open(metric, feed_id, aim, at(NOW, 0))
}

/// A BTC/USD campaign, `Above` 110% of the price, on `metric`.
fn btc_campaign(mut metric: HostAccount) -> Opened {
    validate(&mut metric, &BTC_FEED, (Above, ABOVE_TARGET))
}

/// The BTC/USD account with one i64 field changed.
fn btc_with(at: usize, value: i64) -> HostAccount {
    btc_account(|data| set_i64(data, at, value))
}

#[test]
fn rows_2_to_4_accept_a_fresh_sponsored_price_and_return_its_exponent() {
    assert_eq!(btc_campaign(btc_account(|_| ())), OPENED);
    let below = validate(&mut btc_account(|_| ()), &BTC_FEED, (Below, BELOW_TARGET));
    assert_eq!(below, OPENED);
    // A campaign on SOL/USD itself reads the account that also prices the opening.
    let on_sol = validate(&mut sol_account(|_| ()), &SOL_FEED, (Below, SOL_BELOW));
    assert_eq!(on_sol, OPENED);
}

#[test]
fn rows_2_to_4_accept_the_mainnet_accounts_as_captured() {
    let time = at(after(MAINNET_PUBLISHED, 7), 0);
    let mut btc = account(BTC_ACCOUNT, BTC_MAINNET, Update::captured());
    let opened = open(&mut btc, &BTC_FEED, (Above, 9_027_122_500_000), time);
    assert_eq!(opened, OPENED);
    let mut sol = account(SOL_ACCOUNT, SOL_MAINNET, Update::captured());
    let opened = open(&mut sol, &SOL_FEED, (Below, 9_900_071_202), time);
    assert_eq!(opened, OPENED);
}

#[test]
fn the_four_other_kinds_never_accept_a_price_account() {
    // Their readers (lanes A and B) check their own owner first; only the refusal is asserted.
    let others = [
        ReaderKind::SupplyAtMost,
        ReaderKind::DammV2LockedAtLeast,
        ReaderKind::StakePoolTvlAtLeast,
        ReaderKind::StakeAtLeast,
    ];
    for kind in others {
        let mut metric = btc_account(|_| ());
        let opened = open_kind(
            kind,
            &mut metric,
            &BTC_FEED,
            (Above, ABOVE_TARGET),
            at(NOW, 0),
        );
        assert!(opened.is_err(), "{kind:?} accepted a price account");
    }
}

#[test]
fn row_2_refuses_an_account_that_is_not_the_feeds_sponsored_one() {
    // The real SOL/USD account named for a BTC campaign; BTC's own bytes at another address, and
    // at BTC's pre-upgrade sponsored address.
    let accounts = [
        sol_account(|_| ()),
        HostAccount::price(SOL_ACCOUNT, RECEIVER, BTC, |_| ()),
        HostAccount::price(BTC_LEGACY_ACCOUNT, LEGACY_RECEIVER, BTC, |_| ()),
    ];
    for metric in accounts {
        assert_eq!(btc_campaign(metric), refused(MetricAccountMismatch));
    }
}

#[test]
fn row_4_passes_the_readers_own_errors_at_the_sponsored_address() {
    // The pre-upgrade receiver's real SOL account, placed at the upgraded sponsored address.
    let mut legacy = HostAccount::price(SOL_ACCOUNT, LEGACY_RECEIVER, SOL_LEGACY, |_| ());
    let on_legacy = validate(&mut legacy, &SOL_FEED, (Below, SOL_BELOW));
    assert_eq!(on_legacy, refused(ReaderWrongOwner));
    let partial = btc_account(|data| data[VERIFICATION] = 0);
    assert_eq!(btc_campaign(partial), refused(PriceNotFullyVerified));
    let cut = HostAccount::new(BTC_ACCOUNT, RECEIVER, &BTC[..133]);
    assert_eq!(btc_campaign(cut), refused(ReaderBadLayout));
    // The sponsored address of one feed holding another feed's update.
    let other_feed = HostAccount::price(BTC_ACCOUNT, RECEIVER, SOL, |_| ());
    assert_eq!(btc_campaign(other_feed), refused(PriceWrongFeed));
}

#[test]
fn row_4_refuses_a_stale_price_and_accepts_one_exactly_max_age_old() {
    // NOW is PUBLISHED + 7: a publish time 114 s earlier is 121 s old, 113 s earlier is 120 s.
    let stale = btc_with(PUBLISH_TIME, published(-114));
    assert_eq!(btc_campaign(stale), refused(PriceStale));
    let oldest = btc_with(PUBLISH_TIME, published(-113));
    assert_eq!(btc_campaign(oldest), OPENED);
    // Published ahead of the clock counts as fresh.
    assert_eq!(btc_campaign(btc_with(PUBLISH_TIME, published(30))), OPENED);
}

#[test]
fn row_4_bounds_the_posted_slot_by_max_age_and_checks_it_before_the_value() {
    // 120 s at the shortest slot (100 ms) is 1,200 slots behind the clock's slot.
    let posted = |slot: u64, price: i128| {
        let mut metric = account(BTC_ACCOUNT, BTC, Update::captured().slot(slot).price(price));
        open(
            &mut metric,
            &BTC_FEED,
            (Above, ABOVE_TARGET),
            at(NOW, 10_000),
        )
    };
    assert_eq!(posted(8_800, BTC_PRICE), OPENED);
    assert_eq!(posted(8_799, BTC_PRICE), refused(PriceStale));
    // Too many slots old is stale whatever the price, as too many seconds old is.
    assert_eq!(posted(8_799, 0), refused(PriceStale));
    // A posted slot ahead of the clock (LiteSVM starts at slot 1) counts as posted now.
    assert_eq!(posted(10_001, BTC_PRICE), OPENED);
}

#[test]
fn row_4_refuses_a_price_at_or_below_zero() {
    for price in [0, -1] {
        let refusal = btc_campaign(btc_with(PRICE, price));
        assert_eq!(refusal, refused(PriceNonPositive), "{price}");
    }
}

#[test]
fn row_4_refuses_a_confidence_wider_than_half_a_percent() {
    // 0.5% of 8,521,233,806,870 is 42,606,169,034.35.
    let wide = btc_with(CONF, 42_606_169_035);
    assert_eq!(btc_campaign(wide), refused(PriceConfidenceTooWide));
    assert_eq!(btc_campaign(btc_with(CONF, 42_606_169_034)), OPENED);
}
