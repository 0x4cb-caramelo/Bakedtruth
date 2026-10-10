//! Purpose: lane H, question 2 (founder answer 2, 2026-10-09): a paid opening is charged at the low
//!          end of the SOL/USD band, `price − conf`, and the campaign records that charged price. The
//!          conversion, the 90/10 split and the refusal of a non-positive charged price are checked on
//!          the host; the fixtures are the captured devnet SOL/USD account (tests/fixtures).
//! Version: 0.0.1
//! Sprint: 04 (opening side of questions 1 to 5), lane H

mod opening_support;

use brot_markets::{
    error::BrotError,
    instructions::campaigns::open_campaign::payment::{charge, charged_price, Payment},
    layout::{LeU16, LeU32, LeU64},
    math::opening::{opening_paid_lamports, split_opening},
    readers::{price_update::PriceReading, ChainTime},
    state::config::CreationParams,
};
use opening_support::*;
use pinocchio::error::ProgramError;

/// The devnet SOL/USD fixture's price and confidence fields (`PriceUpdateV2`, see `opening_support`).
fn fixture_price_and_conf() -> (i64, u64, i32) {
    let price = i64::from_le_bytes(SOL[PRICE..PRICE + 8].try_into().unwrap());
    let conf = u64::from_le_bytes(SOL[CONF..CONF + 8].try_into().unwrap());
    let exponent = i32::from_le_bytes(SOL[89..93].try_into().unwrap());
    (price, conf, exponent)
}

fn params() -> CreationParams {
    CreationParams {
        opening_fee_usd: LeU64::new(500),
        opening_prize_bps: LeU16::new(9_000),
        fee_bps: LeU16::new(1_000),
        one_sided_fee_bps: LeU16::new(100),
        creator_share_bps: LeU16::new(100),
        max_open_campaigns: LeU32::new(1_000),
        min_entry_lamports: LeU64::new(10_000_000),
        sol_usd_feed_id: SOL_FEED,
        max_price_age: LeU32::new(120),
        max_price_conf_bps: LeU16::new(50),
        campaign_max_age: LeU32::new(120),
    }
}

fn pay_fresh(usd: u64) -> Result<Payment, ProgramError> {
    let time = ChainTime {
        unix_timestamp: NOW,
        slot: SLOT,
        epoch: 0,
    };
    let mut sol_usd = sol_account(|_| ());
    charge(&params(), false, usd, u64::MAX, &sol_usd.view(), &time)
}

/// The SOL/USD clock slot of the fixture, as in open_campaign_payment.rs.
const SLOT: u64 = 507_785_482;

#[test]
fn the_fixture_has_a_band_to_charge_from() {
    let (price, conf, exponent) = fixture_price_and_conf();
    assert!(
        price > 0 && conf > 0,
        "the band must be non-empty for this test"
    );
    assert_eq!(exponent, -8, "SOL/USD is published at -8");
}

#[test]
fn a_paid_opening_is_charged_at_price_minus_conf() {
    let (price, conf, exponent) = fixture_price_and_conf();
    let low = price - i64::try_from(conf).unwrap();
    let paid = pay_fresh(500).expect("a fresh fixture is accepted");
    let expected = opening_paid_lamports(500, low, exponent).unwrap();
    assert_eq!(paid.paid, expected);
    assert_eq!(paid.price, low, "the campaign records the charged price");
    assert_eq!(paid.exponent, exponent);
}

#[test]
fn the_charge_at_the_low_end_is_never_below_the_charge_at_the_mid_price() {
    let (price, _, exponent) = fixture_price_and_conf();
    let at_mid = opening_paid_lamports(500, price, exponent).unwrap();
    let paid = pay_fresh(500).unwrap();
    assert!(paid.paid >= at_mid, "{} < {}", paid.paid, at_mid);
}

#[test]
fn the_90_10_split_is_taken_from_the_charged_amount() {
    let paid = pay_fresh(500).unwrap();
    let split = split_opening(paid.paid, 9_000).unwrap();
    assert_eq!((paid.prize, paid.fee), (split.prize, split.fee));
    assert_eq!(paid.prize.checked_add(paid.fee), Some(paid.paid));
}

fn reading(price: i64, conf: u64) -> PriceReading {
    PriceReading {
        feed_id: SOL_FEED,
        price,
        conf,
        exponent: -8,
        publish_time: PUBLISHED,
        posted_slot: 0,
    }
}

#[test]
fn charged_price_is_price_minus_conf() {
    assert_eq!(charged_price(&reading(10_000, 3)), Ok(9_997));
    assert_eq!(charged_price(&reading(10_000, 0)), Ok(10_000));
}

#[test]
fn a_charged_price_of_zero_or_less_is_non_positive() {
    let non_positive = Err(BrotError::SolUsdPriceNonPositive);
    assert_eq!(charged_price(&reading(10_000, 10_000)), non_positive);
    assert_eq!(charged_price(&reading(10_000, 10_001)), non_positive);
    assert_eq!(charged_price(&reading(-5, 0)), non_positive);
}

#[test]
fn a_confidence_past_i64_is_an_overflow_not_a_wrap() {
    assert_eq!(
        charged_price(&reading(10_000, u64::MAX)),
        Err(BrotError::MathOverflow)
    );
}

#[test]
fn a_zero_price_is_refused_by_the_conversion_itself() {
    assert_eq!(
        opening_paid_lamports(500, 0, -8),
        Err(BrotError::SolUsdPriceNonPositive)
    );
}
