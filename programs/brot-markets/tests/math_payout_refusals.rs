//! Purpose: what the `Split` math and the join estimate refuse: an empty side, a fee above the
//!          losing side, a share that would cost a winner, a rate above 100%, an entry above its
//!          side, and amounts or returns no u64 holds. Each is `MathOverflow`, never a wrap.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane C

use brot_markets::{
    error::BrotError,
    math::payout::{creator_share, distributable, estimate_return_bps, split_payout, JoinedPot},
};

const SOL: u64 = 1_000_000_000;

fn refused<T>(result: Result<T, BrotError>) -> bool {
    matches!(result, Err(BrotError::MathOverflow))
}

/// A join at the devnet rates (10% fee, 1% one-sided fee, 1% share), with no prize.
fn join(amount: u64, side_after: u64, other: u64) -> JoinedPot {
    JoinedPot {
        amount,
        side_after,
        other,
        prize: 0,
        fee_bps: 1_000,
        one_sided_fee_bps: 100,
        creator_share_bps: 100,
        is_first: false,
    }
}

#[test]
fn an_empty_side_is_one_sided_and_carries_no_share() {
    // P-1: the Split math refuses a pot with an empty side instead of paying a share from it.
    assert!(refused(creator_share(0, SOL, 0, 0, 100)));
    assert!(refused(creator_share(SOL, 0, SOL, 0, 100)));
    assert!(refused(distributable(SOL, 0, SOL, 0, 0)));
    assert!(refused(distributable(0, SOL, 0, 0, 0)));
}

#[test]
fn a_fee_above_p_or_a_share_that_would_cost_a_winner_is_refused() {
    assert!(refused(creator_share(SOL, 10, 0, 11, 100)));
    assert!(refused(distributable(SOL, 10, 0, 11, 0)));
    // P − fee + R is 14 here: a from_pot of 15 would leave the winners below V (I11).
    assert!(refused(distributable(SOL, 10, 5, 1, 15)));
    assert_eq!(distributable(SOL, 10, 5, 1, 14), Ok(SOL));
}

#[test]
fn a_share_rate_above_100_percent_is_refused() {
    assert!(refused(creator_share(SOL, SOL, 0, 0, 10_001)));
    assert!(refused(creator_share(SOL, SOL, 0, 0, u16::MAX)));
    let mut pot = join(SOL, SOL, SOL);
    pot.fee_bps = 10_001;
    assert!(refused(estimate_return_bps(&pot)));
}

#[test]
fn split_payout_refuses_no_winners_and_an_entry_above_its_side() {
    assert!(refused(split_payout(0, SOL, 0)));
    assert!(refused(split_payout(SOL, SOL, 0)));
    assert!(refused(split_payout(SOL.checked_add(1).unwrap(), SOL, SOL)));
    assert_eq!(split_payout(SOL, SOL, SOL), Ok(SOL));
    assert_eq!(split_payout(0, SOL, SOL), Ok(0));
}

#[test]
fn the_estimate_refuses_an_empty_amount_and_one_above_its_side() {
    let larger = SOL.checked_add(1).unwrap();
    assert!(refused(estimate_return_bps(&join(0, SOL, SOL))));
    assert!(refused(estimate_return_bps(&join(0, SOL, 0))));
    assert!(refused(estimate_return_bps(&join(larger, SOL, SOL))));
    assert!(refused(estimate_return_bps(&join(larger, SOL, 0))));
}

#[test]
fn amounts_and_returns_past_u64_are_refused_not_wrapped() {
    // V + P + R past u64 (every lamport there is fits in 60 bits, so only a bug gets here).
    assert!(refused(distributable(u64::MAX, u64::MAX, u64::MAX, 0, 0)));
    // The largest pot the math can still hold: C is computed in u128, from_pot fits.
    let big = creator_share(u64::MAX, u64::MAX, 0, 0, 10_000).unwrap();
    assert_eq!((big.from_pot, big.from_fee), (u64::MAX, 0));
    assert_eq!(
        distributable(u64::MAX, u64::MAX, 0, 0, u64::MAX),
        Ok(u64::MAX)
    );
    // A return no u64 of bps holds (one lamport against 2^62) is refused; at the 10^6-lamport
    // entry floor the same pot fits.
    assert!(refused(estimate_return_bps(&join(1, 1, 1 << 62))));
    let at_floor = estimate_return_bps(&join(1_000_000, 1_000_000, 1 << 62));
    assert!(at_floor.is_ok_and(|bps| bps > 10_000));
}
