//! Purpose: what the price reader checks at an opening, on the captured Pyth accounts: the
//!          sponsored account each feed derives, the freshness and confidence bounds at their
//!          edges, and the touch rule at its boundary in both directions (TP section 3.4.10).
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane D

use brot_markets::readers::price_touch::{
    band_reaches_target, check_fresh_and_tight, read_price_update, sponsored_account, PriceReading,
    PriceRefusal, PYTH_RECEIVER_ID,
};
use brot_markets::state::enums::Direction;
use pinocchio::address::address;

// Real devnet accounts (scripts/capture-fixtures.ts pyth), sponsored push feeds, shard 0. Their
// fields are changed in memory below; the files are never edited.
const SOL: &[u8] = include_bytes!("../../../tests/fixtures/pyth-sol-usd-devnet.bin");
const BTC: &[u8] = include_bytes!("../../../tests/fixtures/pyth-btc-usd-devnet.bin");

const SOL_FEED: [u8; 32] = [
    0xef, 0x0d, 0x8b, 0x6f, 0xda, 0x2c, 0xeb, 0xa4, 0x1d, 0xa1, 0x5d, 0x40, 0x95, 0xd1, 0xda, 0x39,
    0x2a, 0x0d, 0x2f, 0x8e, 0xd0, 0xc6, 0xc7, 0xbc, 0x0f, 0x4c, 0xfa, 0xc8, 0xc2, 0x80, 0xb5, 0x6d,
];
const BTC_FEED: [u8; 32] = [
    0xe6, 0x2d, 0xf6, 0xc8, 0xb4, 0xa8, 0x5f, 0xe1, 0xa6, 0x7d, 0xb4, 0x4d, 0xc1, 0x2d, 0xe5, 0xdb,
    0x33, 0x0f, 0x7a, 0xc6, 0x6b, 0x72, 0xdc, 0x65, 0x8a, 0xfe, 0xdf, 0x0f, 0x4a, 0x41, 0x5b, 0x43,
];

/// The devnet values of `max_price_age` and `max_price_conf_bps` (and of `campaign_max_age`).
const MAX_AGE: u32 = 120;
const CONF_BPS: u16 = 50;

fn sol() -> PriceReading {
    read_price_update(&PYTH_RECEIVER_ID, SOL, &SOL_FEED).unwrap()
}

fn btc() -> PriceReading {
    read_price_update(&PYTH_RECEIVER_ID, BTC, &BTC_FEED).unwrap()
}

/// `time` moved by `seconds`, without unchecked arithmetic.
fn shift(time: i64, seconds: i64) -> i64 {
    time.checked_add(seconds).unwrap()
}

fn check(reading: &PriceReading, now: i64) -> Result<(), PriceRefusal> {
    check_fresh_and_tight(reading, now, MAX_AGE, CONF_BPS)
}

#[test]
fn derives_the_sponsored_accounts_of_sol_and_btc() {
    let sol = address!("7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE");
    let btc = address!("APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5");
    assert_eq!(sponsored_account(&SOL_FEED).unwrap(), sol);
    assert_eq!(sponsored_account(&BTC_FEED).unwrap(), btc);
}

#[test]
fn a_fresh_price_passes_up_to_exactly_max_age() {
    let reading = sol();
    assert_eq!(check(&reading, shift(reading.publish_time, 7)), Ok(()));
    assert_eq!(check(&reading, shift(reading.publish_time, 120)), Ok(()));
    assert_eq!(check(&reading, reading.publish_time), Ok(()));
}

#[test]
fn one_second_past_max_age_is_stale() {
    let reading = sol();
    let now = shift(reading.publish_time, 121);
    assert_eq!(check(&reading, now), Err(PriceRefusal::Stale));
    // With a zero bound only a price published now, or later, passes.
    let at_zero = check_fresh_and_tight(&reading, shift(reading.publish_time, 1), 0, CONF_BPS);
    assert_eq!(at_zero, Err(PriceRefusal::Stale));
}

#[test]
fn a_publish_time_up_to_a_minute_ahead_of_the_clock_is_fresh() {
    // Seen on mainnet: the publish time 2 s ahead of the reader's clock. Up to 60 s ahead passes;
    // a price stamped further ahead, by a fault upstream, would otherwise never age.
    let reading = sol();
    assert_eq!(check(&reading, shift(reading.publish_time, -5)), Ok(()));
    assert_eq!(check(&reading, shift(reading.publish_time, -60)), Ok(()));
    assert_eq!(
        check(&reading, shift(reading.publish_time, -61)),
        Err(PriceRefusal::Stale)
    );
    assert_eq!(check(&reading, i64::MIN), Err(PriceRefusal::Stale));
}

#[test]
fn extreme_times_give_an_answer_never_a_panic() {
    let mut reading = sol();
    reading.publish_time = i64::MIN;
    assert_eq!(check(&reading, i64::MAX), Err(PriceRefusal::Stale));
    reading.publish_time = i64::MAX;
    assert_eq!(check(&reading, i64::MIN), Err(PriceRefusal::Stale));
    assert_eq!(check(&reading, i64::MAX), Ok(()));
}

#[test]
fn confidence_at_the_bound_passes_and_one_above_is_too_wide() {
    // 11,921,844,516 x 50 / 10,000 = 59,609,222.58: the bound falls between two integers.
    let mut reading = sol();
    let now = shift(reading.publish_time, 7);
    reading.conf = 59_609_222;
    assert_eq!(check(&reading, now), Ok(()));
    reading.conf = 59_609_223;
    assert_eq!(check(&reading, now), Err(PriceRefusal::ConfidenceTooWide));
    // A price where the bound is exact: 0.5% of 10,000,000,000 is 50,000,000.
    reading.price = 10_000_000_000;
    reading.conf = 50_000_000;
    assert_eq!(check(&reading, now), Ok(()));
    reading.conf = 50_000_001;
    assert_eq!(check(&reading, now), Err(PriceRefusal::ConfidenceTooWide));
}

#[test]
fn the_largest_values_never_overflow_the_confidence_check() {
    let mut reading = sol();
    let now = shift(reading.publish_time, 7);
    reading.conf = u64::MAX;
    assert_eq!(check(&reading, now), Err(PriceRefusal::ConfidenceTooWide));
    reading.price = i64::MAX;
    let widest = check_fresh_and_tight(&reading, now, MAX_AGE, u16::MAX);
    assert_eq!(widest, Ok(()));
}

#[test]
fn a_price_at_or_below_zero_is_refused() {
    let mut reading = sol();
    let now = shift(reading.publish_time, 7);
    for price in [0, -1, i64::MIN] {
        reading.price = price;
        assert_eq!(
            check(&reading, now),
            Err(PriceRefusal::NonPositive),
            "{price}"
        );
    }
}

#[test]
fn staleness_is_checked_before_the_price_and_the_confidence() {
    let mut reading = sol();
    reading.price = 0;
    reading.conf = u64::MAX;
    let now = shift(reading.publish_time, 121);
    assert_eq!(check(&reading, now), Err(PriceRefusal::Stale));
}

#[test]
fn above_is_touched_once_price_plus_confidence_reaches_the_target() {
    let reading = btc();
    let edge = i128::from(reading.price)
        .checked_add(i128::from(reading.conf))
        .unwrap();
    assert_eq!(edge, 8_522_008_012_531);
    let one_past = edge.checked_add(1).unwrap();
    assert!(band_reaches_target(&reading, Direction::Above, edge).unwrap());
    assert!(!band_reaches_target(&reading, Direction::Above, one_past).unwrap());
    assert!(band_reaches_target(&reading, Direction::Above, 0).unwrap());
}

#[test]
fn below_is_touched_once_price_minus_confidence_reaches_the_target() {
    let reading = btc();
    let edge = i128::from(reading.price)
        .checked_sub(i128::from(reading.conf))
        .unwrap();
    assert_eq!(edge, 8_520_459_601_209);
    let one_under = edge.checked_sub(1).unwrap();
    assert!(band_reaches_target(&reading, Direction::Below, edge).unwrap());
    assert!(!band_reaches_target(&reading, Direction::Below, one_under).unwrap());
    assert!(band_reaches_target(&reading, Direction::Below, i128::MAX).unwrap());
}

#[test]
fn the_touch_rule_never_overflows() {
    let mut reading = btc();
    reading.price = i64::MAX;
    reading.conf = u64::MAX;
    assert!(!band_reaches_target(&reading, Direction::Above, i128::MAX).unwrap());
    reading.price = i64::MIN;
    assert!(!band_reaches_target(&reading, Direction::Below, i128::MIN).unwrap());
}
