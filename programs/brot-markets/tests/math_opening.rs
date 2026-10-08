//! Purpose: the opening conversion and its 90/10 split on the host: worked example A, the
//!          captured devnet SOL/USD price, the supported exponents, and every refusal.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane C

use brot_markets::{
    error::BrotError::{
        self, MathOverflow, PriceExponentOutOfRange as BadExponent,
        SolUsdPriceNonPositive as NonPositive,
    },
    math::opening::{
        opening_paid_lamports, split_opening, OpeningSplit, MAX_PRICE_EXPONENT, MIN_PRICE_EXPONENT,
    },
    readers::price_touch::{read_price_update, PYTH_RECEIVER_ID},
};

// The real devnet SOL/USD account the price reader's tests read (scripts/capture-fixtures.ts).
const SOL_USD: &[u8] = include_bytes!("../../../tests/fixtures/pyth-sol-usd-devnet.bin");
const SOL_FEED: [u8; 32] = [
    0xef, 0x0d, 0x8b, 0x6f, 0xda, 0x2c, 0xeb, 0xa4, 0x1d, 0xa1, 0x5d, 0x40, 0x95, 0xd1, 0xda, 0x39,
    0x2a, 0x0d, 0x2f, 0x8e, 0xd0, 0xc6, 0xc7, 0xbc, 0x0f, 0x4c, 0xfa, 0xc8, 0xc2, 0x80, 0xb5, 0x6d,
];
/// The price in that account: US$119.21844516 per SOL at exponent −8.
const CAPTURED: i64 = 11_921_844_516;

fn split(paid: u64, prize: u64, fee: u64) -> Result<OpeningSplit, BrotError> {
    Ok(OpeningSplit { paid, prize, fee })
}

#[test]
fn worked_example_a_charges_500_dollars_at_109_27() {
    // TP section 3.4.16: 500 × 10^17 ÷ 10,927,000,000 = 4,575,821,359.93, rounded up.
    let paid = opening_paid_lamports(500, 10_927_000_000, -8);
    assert_eq!(paid, Ok(4_575_821_360));
    let expected = split(4_575_821_360, 4_118_239_224, 457_582_136);
    assert_eq!(split_opening(4_575_821_360, 9_000), expected);
}

#[test]
fn opening_charges_500_dollars_at_the_captured_sol_usd_price() {
    let reading = read_price_update(&PYTH_RECEIVER_ID, SOL_USD, &SOL_FEED).unwrap();
    assert_eq!((reading.price, reading.exponent), (CAPTURED, -8));
    // 500 × 10^17 ÷ 11,921,844,516 = 4,193,981,890.38, rounded up toward Brot.
    let paid = opening_paid_lamports(500, reading.price, reading.exponent).unwrap();
    assert_eq!(paid, 4_193_981_891);
    // 90% of it is 3,774,583,701.9: the prize rounds down and the fee takes the rest.
    let expected = split(paid, 3_774_583_701, 419_398_190);
    assert_eq!(split_opening(paid, 9_000), expected);
}

#[test]
fn every_supported_exponent_prices_the_same_dollars_alike() {
    assert_eq!((MIN_PRICE_EXPONENT, MAX_PRICE_EXPONENT), (-18, 0));
    // US$5 per SOL written at each exponent: US$500 is exactly 100 SOL every time.
    for exponent in MIN_PRICE_EXPONENT..=MAX_PRICE_EXPONENT {
        let digits = u32::try_from(exponent.checked_neg().unwrap()).unwrap();
        let price = 10_i64
            .checked_pow(digits)
            .and_then(|scale| scale.checked_mul(5));
        let paid = opening_paid_lamports(500, price.unwrap(), exponent);
        assert_eq!(paid, Ok(100_000_000_000), "{exponent}");
    }
}

#[test]
fn the_conversion_refuses_in_order_and_overflows_exactly_past_u64() {
    let all = u64::MAX;
    let cases = [
        // The price is checked first, then the exponent.
        (500, 0, -8, Err(NonPositive)),
        (500, -1, -8, Err(NonPositive)),
        (500, i64::MIN, i32::MAX, Err(NonPositive)),
        (500, CAPTURED, i32::MIN, Err(BadExponent)),
        (500, CAPTURED, -40, Err(BadExponent)),
        (500, CAPTURED, -19, Err(BadExponent)),
        (500, CAPTURED, 1, Err(BadExponent)),
        (500, CAPTURED, 10, Err(BadExponent)),
        (500, CAPTURED, i32::MAX, Err(BadExponent)),
        // p = 10^17 at e = −8 is US$10^9 per SOL: u64::MAX dollars cost exactly u64::MAX.
        (all, 100_000_000_000_000_000, -8, Ok(all)),
        (all, 99_999_999_999_999_999, -8, Err(MathOverflow)),
        (all, 1, -8, Err(MathOverflow)),
        // Here the numerator itself passes u128 (u64::MAX × 10^27).
        (all, i64::MAX, -18, Err(MathOverflow)),
        // Nothing costs nothing; one dollar always costs at least one lamport.
        (0, CAPTURED, -8, Ok(0)),
        (1, i64::MAX, 0, Ok(1)),
    ];
    for (usd, price, exponent, expected) in cases {
        let paid = opening_paid_lamports(usd, price, exponent);
        assert_eq!(paid, expected, "{usd} US$ at {price}e{exponent}");
    }
}

#[test]
fn split_opening_refuses_a_prize_share_above_100_percent() {
    assert_eq!(split_opening(1_000, 10_001), Err(MathOverflow));
    assert_eq!(split_opening(1_000, u16::MAX), Err(MathOverflow));
    assert_eq!(split_opening(1_000, 10_000), split(1_000, 1_000, 0));
    assert_eq!(split_opening(1_000, 0), split(1_000, 0, 1_000));
    assert_eq!(split_opening(0, 9_000), split(0, 0, 0));
}
