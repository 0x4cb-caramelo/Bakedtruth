//! Purpose: the fee functions and the rounding helpers under them on the host: the TP's worked
//!          examples, the 100% ceiling, and the tight round-up over random amounts and rates.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane C

mod common;

use brot_markets::{
    error::BrotError,
    math::{
        fees::{house_fee, one_sided_fee},
        rounding::{bps_ceil, bps_floor, div_ceil, mul_div_floor},
    },
};
use common::{mul, w, Rng, CASES};

const SOL: u64 = 1_000_000_000;

#[test]
fn house_fee_matches_the_worked_examples() {
    // Example A: 10% of Carla's 4 SOL on NO; from NO's side, 10% of 6 SOL; example B: of 1 SOL.
    assert_eq!(house_fee(4 * SOL, 1_000), Ok(400_000_000));
    assert_eq!(house_fee(6 * SOL, 1_000), Ok(600_000_000));
    assert_eq!(house_fee(SOL, 1_000), Ok(100_000_000));
}

#[test]
fn one_sided_fee_matches_example_c_and_spares_the_first_baker() {
    // Ana first with 1 SOL, then Bruno 2 SOL and Carla 3 SOL, all on YES (TP example C).
    assert_eq!(one_sided_fee(SOL, 100, true), Ok(0));
    assert_eq!(one_sided_fee(2 * SOL, 100, false), Ok(20_000_000));
    assert_eq!(one_sided_fee(3 * SOL, 100, false), Ok(30_000_000));
    // The exemption covers the first baker's whole entry, whatever its size (Q3).
    assert_eq!(one_sided_fee(u64::MAX, 100, true), Ok(0));
}

#[test]
fn fees_round_up_to_the_lamport() {
    assert_eq!(house_fee(1, 1_000), Ok(1));
    assert_eq!(house_fee(10, 1_000), Ok(1));
    assert_eq!(house_fee(11, 1_000), Ok(2));
    assert_eq!(house_fee(0, 1_000), Ok(0));
    assert_eq!(house_fee(123_456_789, 0), Ok(0));
    assert_eq!(house_fee(u64::MAX, 10_000), Ok(u64::MAX));
    assert_eq!(one_sided_fee(1, 100, false), Ok(1));
    assert_eq!(one_sided_fee(100, 100, false), Ok(1));
    assert_eq!(one_sided_fee(101, 100, false), Ok(2));
}

#[test]
fn a_rate_above_100_percent_is_refused_even_for_the_first_baker() {
    assert_eq!(house_fee(1_000, 10_001), Err(BrotError::MathOverflow));
    assert_eq!(
        one_sided_fee(1_000, 10_001, false),
        Err(BrotError::MathOverflow)
    );
    assert_eq!(
        one_sided_fee(1_000, 10_001, true),
        Err(BrotError::MathOverflow)
    );
    assert_eq!(bps_floor(1_000, u16::MAX), Err(BrotError::MathOverflow));
    assert_eq!(bps_ceil(1_000, u16::MAX), Err(BrotError::MathOverflow));
}

#[test]
fn the_helpers_refuse_a_zero_divisor_and_a_result_past_u64() {
    assert_eq!(mul_div_floor(1, 1, 0), Err(BrotError::MathOverflow));
    assert_eq!(div_ceil(1, 0), Err(BrotError::MathOverflow));
    assert_eq!(mul_div_floor(u64::MAX, 2, 1), Err(BrotError::MathOverflow));
    assert_eq!(mul_div_floor(u64::MAX, u64::MAX, u64::MAX), Ok(u64::MAX));
    assert_eq!(div_ceil(u128::MAX, 1), Ok(u128::MAX));
    assert_eq!(div_ceil(u128::MAX, 2), Ok(1 << 127));
    assert_eq!(div_ceil(0, 7), Ok(0));
}

#[test]
fn fees_are_the_tight_round_up_and_never_exceed_their_base() {
    let seed = 0xB407_FEE5_0000_0001;
    let mut rng = Rng::new(seed);
    for case in 0..CASES {
        let amount = rng.bits(64);
        let bps = rng.bps(10_000);
        let at = format!("seed {seed:#x} case {case}: {amount} at {bps} bps");
        let fee = house_fee(amount, bps).unwrap();
        let exact = mul(w(amount), u128::from(bps));
        // fee × 10,000 ≥ amount × bps > (fee − 1) × 10,000.
        assert!(mul(w(fee), 10_000) >= exact, "{at}");
        if let Some(less) = fee.checked_sub(1) {
            assert!(mul(w(less), 10_000) < exact, "{at}");
        }
        assert!(fee <= amount, "{at}");
        // The one-sided fee is the same round-up on the entry, for anyone but the first baker.
        assert_eq!(one_sided_fee(amount, bps, false), Ok(fee), "{at}");
        assert_eq!(one_sided_fee(amount, bps, true), Ok(0), "{at}");
        // Rounding down differs by at most one lamport, and only when the share is not exact.
        let floor = bps_floor(amount, bps).unwrap();
        let gap = fee.checked_sub(floor).expect(&at);
        let inexact = exact.checked_rem(10_000).unwrap() != 0;
        assert_eq!(gap, u64::from(inexact), "{at}");
    }
}
