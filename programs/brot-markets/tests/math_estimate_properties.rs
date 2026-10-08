//! Purpose: the join's return estimate over random pots: in `Split` it is the settlement's own
//!          payout in bps and never below 10,000; in a one-sided pot it is the refund, with the
//!          first baker exempt and the prize left out.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane C

mod common;

use brot_markets::{
    constants::{MAX_CREATOR_SHARE_BPS, MAX_FEE_BPS, MAX_ONE_SIDED_FEE_BPS},
    error::BrotError,
    math::{
        fees::one_sided_fee,
        payout::{estimate_return_bps, split_payout, JoinedPot},
    },
};
use common::{
    div, mul,
    pots::{random_pot, settle},
    w, Rng, CASES,
};

#[test]
fn the_estimate_in_split_is_the_payout_and_never_below_the_entry() {
    let seed = 0xB407_1A7A_0000_0003;
    let mut rng = Rng::new(seed);
    let mut estimated = 0_usize;
    for case in 0..CASES {
        let pot = random_pot(&mut rng);
        let amount = rng.between(1, pot.v);
        let joined = JoinedPot {
            amount,
            side_after: pot.v,
            other: pot.p,
            prize: pot.r,
            fee_bps: pot.fee_bps,
            one_sided_fee_bps: rng.bps(MAX_ONE_SIDED_FEE_BPS),
            creator_share_bps: pot.share_bps,
            is_first: rng.one_in(2),
        };
        let at = format!("seed {seed:#x} case {case}: {joined:?}");
        let (_, _, pool) = settle(&pot);
        let payout = split_payout(amount, pool, pot.v).unwrap();
        let exact = div(mul(w(payout), 10_000), w(amount));
        let estimate = estimate_return_bps(&joined);
        match u64::try_from(exact) {
            Ok(expected) => {
                assert_eq!(estimate, Ok(expected), "{at}");
                assert!(expected >= 10_000, "{at}");
                estimated = estimated.checked_add(1).unwrap();
            }
            // A return past u64::MAX bps (a lamport against a huge pot) is refused, not wrapped.
            Err(_) => assert_eq!(estimate, Err(BrotError::MathOverflow), "{at}"),
        }
    }
    let most = CASES.checked_div(2).unwrap();
    assert!(estimated > most, "only {estimated} estimates fit a u64");
}

#[test]
fn the_estimate_in_a_one_sided_pot_is_the_refund() {
    let seed = 0xB407_1A7A_0000_0004;
    let mut rng = Rng::new(seed);
    for case in 0..CASES {
        let side_after = rng.positive_bits(60);
        let rate = if rng.one_in(4) {
            rng.bps(10_000)
        } else {
            rng.bps(MAX_ONE_SIDED_FEE_BPS)
        };
        let joined = JoinedPot {
            amount: rng.between(1, side_after),
            side_after,
            other: 0,
            prize: rng.bits(60),
            fee_bps: rng.bps(MAX_FEE_BPS),
            one_sided_fee_bps: rate,
            creator_share_bps: rng.bps(MAX_CREATOR_SHARE_BPS),
            is_first: rng.one_in(3),
        };
        let at = format!("seed {seed:#x} case {case}: {joined:?}");
        let fee = one_sided_fee(joined.amount, rate, joined.is_first).unwrap();
        let refund = joined.amount.checked_sub(fee).unwrap();
        let bps = estimate_return_bps(&joined).unwrap();
        assert_eq!(
            w(bps),
            div(mul(w(refund), 10_000), w(joined.amount)),
            "{at}"
        );
        assert!(bps <= 10_000, "{at}");
        if joined.is_first {
            assert_eq!(bps, 10_000, "{at}");
        }
        // The prize never enters a one-sided refund (P-4).
        let mut without_prize = joined;
        without_prize.prize = 0;
        assert_eq!(estimate_return_bps(&without_prize), Ok(bps), "{at}");
    }
}
