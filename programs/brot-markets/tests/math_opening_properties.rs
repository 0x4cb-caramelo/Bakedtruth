//! Purpose: the opening conversion and split over random dollars, prices and exponents: tight
//!          rounding toward Brot, an overflow exactly past u64, and a larger prize at 90/10.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane C

mod common;

use brot_markets::{
    error::BrotError,
    math::opening::{opening_paid_lamports, split_opening},
};
use common::{add, div, div_ceil, mul, sub, w, Rng, CASES};

/// `usd × 10^(9 − e)` in u128, or `None` past it.
fn numerator(usd: u64, exponent: i32) -> Option<u128> {
    let scale = u32::try_from(9_i32.checked_sub(exponent)?).ok()?;
    w(usd).checked_mul(10_u128.checked_pow(scale)?)
}

#[test]
fn the_conversion_rounds_toward_brot_and_is_tight() {
    let seed = 0xB407_0BE7_0000_0001;
    let mut rng = Rng::new(seed);
    let (mut charged, mut overflowed) = (0_usize, 0_usize);
    for case in 0..CASES {
        let usd = rng.bits(64);
        let price = i64::try_from(rng.positive_bits(63)).unwrap();
        let exponent = i32::try_from(rng.between_i64(-18, 0)).unwrap();
        let p = u128::try_from(price).unwrap();
        let exact = numerator(usd, exponent);
        let at = format!("seed {seed:#x} case {case}: {usd} US$ at {price}e{exponent}");
        match opening_paid_lamports(usd, price, exponent) {
            Ok(paid) => {
                let exact = exact.expect(&at);
                // paid × p ≥ usd × 10^(9 − e): never less than the dollars asked.
                assert!(mul(w(paid), p) >= exact, "{at}");
                // (paid − 1) × p < usd × 10^(9 − e): not one lamport more than needed.
                match paid.checked_sub(1) {
                    Some(less) => assert!(mul(w(less), p) < exact, "{at}"),
                    None => assert_eq!(exact, 0, "{at}"),
                }
                charged = charged.checked_add(1).unwrap();
            }
            Err(BrotError::MathOverflow) => {
                // Only when the exact amount is past u64::MAX lamports.
                if let Some(exact) = exact {
                    assert!(exact > mul(w(u64::MAX), p), "{at}");
                }
                overflowed = overflowed.checked_add(1).unwrap();
            }
            Err(other) => panic!("{at}: {other:?}"),
        }
    }
    let tenth = CASES.checked_div(10).unwrap();
    let both = charged > tenth && overflowed > tenth;
    assert!(both, "{charged} charged, {overflowed} overflowed");
}

#[test]
fn a_larger_opening_buys_a_larger_prize_at_the_same_90_10() {
    let seed = 0xB407_0BE7_0000_0002;
    let mut rng = Rng::new(seed);
    for case in 0..CASES {
        // SOL between US$1 and US$100,000, at Pyth's exponent for SOL/USD.
        let price = i64::try_from(rng.between(100_000_000, 10_000_000_000_000)).unwrap();
        let usd = rng.between(500, 10_000_000);
        let more = usd.checked_add(rng.between(1, 1_000_000)).unwrap();
        let at = format!("seed {seed:#x} case {case}: {usd} and {more} US$ at {price}e-8");
        let [small, large] = [usd, more].map(|dollars| {
            let paid = opening_paid_lamports(dollars, price, -8).unwrap();
            split_opening(paid, 9_000).unwrap()
        });
        assert!(large.prize > small.prize && large.fee >= small.fee, "{at}");
        // The same 90/10 at every size: the fee is 10% of the payment, rounded up.
        for split in [small, large] {
            let tenth = div_ceil(mul(w(split.paid), 1_000), 10_000);
            assert_eq!(w(split.fee), tenth, "{at}");
        }
    }
}

#[test]
fn the_split_adds_up_and_rounds_toward_brot() {
    let seed = 0xB407_0BE7_0000_0003;
    let mut rng = Rng::new(seed);
    for case in 0..CASES {
        let paid = rng.bits(64);
        let bps = if rng.one_in(2) {
            9_000
        } else {
            rng.bps(10_000)
        };
        let at = format!("seed {seed:#x} case {case}: {paid} at {bps} bps");
        let split = split_opening(paid, bps).unwrap();
        assert_eq!(split.paid, paid, "{at}");
        assert_eq!(add(w(split.prize), w(split.fee)), w(paid), "{at}");
        // The prize is the floor of its share; the fee, the ceiling of the rest.
        let prize = div(mul(w(paid), u128::from(bps)), 10_000);
        assert_eq!(w(split.prize), prize, "{at}");
        let rest = sub(10_000, u128::from(bps));
        assert_eq!(w(split.fee), div_ceil(mul(w(paid), rest), 10_000), "{at}");
    }
}
