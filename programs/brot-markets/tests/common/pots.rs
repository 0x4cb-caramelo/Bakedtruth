//! Purpose: random `Split` pots for the property tests, and the P-2 chain that settles one
//!          (fee, creator share, distributable), shared by the payout and estimate properties.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane C

use brot_markets::{
    constants::{MAX_CREATOR_SHARE_BPS, MAX_FEE_BPS},
    math::{
        fees::house_fee,
        payout::{creator_share, distributable, CreatorShare},
    },
};

use super::Rng;

/// A `Split` pot: V and P of up to 60 bits (every lamport there is fits in 60), a prize on two
/// pots in three, and the config's rates, or any rate up to 100% one time in four.
#[derive(Debug)]
pub struct Pot {
    pub v: u64,
    pub p: u64,
    pub r: u64,
    pub fee_bps: u16,
    pub share_bps: u16,
}

pub fn random_pot(rng: &mut Rng) -> Pot {
    let v = rng.positive_bits(60);
    let p = rng.positive_bits(60);
    let r = if rng.one_in(3) { 0 } else { rng.bits(60) };
    let fee_ceiling = if rng.one_in(4) { 10_000 } else { MAX_FEE_BPS };
    let share_ceiling = if rng.one_in(4) {
        10_000
    } else {
        MAX_CREATOR_SHARE_BPS
    };
    let (fee_bps, share_bps) = (rng.bps(fee_ceiling), rng.bps(share_ceiling));
    Pot {
        v,
        p,
        r,
        fee_bps,
        share_bps,
    }
}

/// The P-2 chain: (fee, share, distributable).
pub fn settle(pot: &Pot) -> (u64, CreatorShare, u64) {
    let fee = house_fee(pot.p, pot.fee_bps).unwrap();
    let share = creator_share(pot.v, pot.p, pot.r, fee, pot.share_bps).unwrap();
    let pool = distributable(pot.v, pot.p, pot.r, fee, share.from_pot).unwrap();
    (fee, share, pool)
}
