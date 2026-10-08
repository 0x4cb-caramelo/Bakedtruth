//! Purpose: the money invariants of a `Split` pot over random sides, prizes and rates: I3′, I11
//!          and I13 and the share's bound, against both readings of D-g; I6 and I9 over random
//!          winners.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane C

mod common;

use brot_markets::math::payout::split_payout;
use common::{
    add, div, literal_reading, mul,
    pots::{random_pot, settle},
    sub, w, Rng, CASES,
};

#[test]
fn the_creator_share_keeps_every_winner_whole_and_the_books_closed() {
    let seed = 0xB407_1A7A_0000_0001;
    let mut rng = Rng::new(seed);
    let mut fired = 0_usize;
    for case in 0..CASES {
        let pot = random_pot(&mut rng);
        let (v, p, r) = (pot.v, pot.p, pot.r);
        let (fee, share, pool) = settle(&pot);
        let at = format!("seed {seed:#x} case {case}: {pot:?}");
        let c = div(mul(add(w(v), w(p)), u128::from(pot.share_bps)), 10_000);
        let creator = add(w(share.from_pot), w(share.from_fee));
        let brot = sub(w(fee), w(share.from_fee));
        // I11: no winner gets back less than it put in.
        assert!(pool >= v, "{at}");
        // I3′: Brot's part, the creator's part and the winners' part are the whole pot.
        let whole = add(add(w(v), w(p)), w(r));
        assert_eq!(add(add(brot, creator), w(pool)), whole, "{at}");
        // I13 and the share's bound.
        assert!(share.from_fee <= fee && creator <= c, "{at}");
        // D-g's condition first: the creator gets less than C only when the winners are at
        // exactly their entries and Brot has given up its whole fee.
        if creator < c {
            assert!(pool == v && share.from_fee == fee, "{at}");
        }
        // Against the literal reading: equal when the 1% fits in P − fee + R; otherwise P-2
        // pays the creator at least as much and the winners no more (and never below V).
        let (literal_creator, literal_pool) = literal_reading(v, p, r, fee, pot.share_bps);
        if c > add(sub(w(p), w(fee)), w(r)) {
            let between = creator >= literal_creator && w(pool) <= literal_pool;
            assert!(between, "{at}");
            fired = fired.checked_add(1).unwrap();
        } else {
            assert_eq!((creator, w(pool)), (literal_creator, literal_pool), "{at}");
        }
    }
    let enough = CASES.checked_div(50).unwrap();
    assert!(
        fired > enough,
        "the case D-g guards against fired {fired} times"
    );
}

#[test]
fn split_payouts_never_exceed_the_pool_and_leave_less_dust_than_winners() {
    let seed = 0xB407_1A7A_0000_0002;
    let mut rng = Rng::new(seed);
    for case in 0..5_000 {
        let pot = random_pot(&mut rng);
        let (_, _, pool) = settle(&pot);
        let winners = rng.split(pot.v, 60);
        let at = format!("seed {seed:#x} case {case}: {pot:?} won by {winners:?}");
        let mut paid = 0_u128;
        for entry in &winners {
            let payout = split_payout(*entry, pool, pot.v).unwrap();
            // I11, entry by entry.
            assert!(payout >= *entry, "{at}");
            paid = add(paid, w(payout));
        }
        // I3′'s second half and I6: never above distributable, and less dust than winners.
        assert!(paid <= w(pool), "{at}");
        let winners_len = u128::try_from(winners.len()).unwrap();
        assert!(sub(w(pool), paid) < winners_len, "{at}");
        // I9: one entry split across two wallets never receives more than it would whole.
        let whole = winners[0];
        let part = rng.between(0, whole);
        let rest = whole.checked_sub(part).unwrap();
        let [one, other, all] = [part, rest, whole].map(|e| split_payout(e, pool, pot.v));
        let apart = add(w(one.unwrap()), w(other.unwrap()));
        assert!(apart <= w(all.unwrap()), "{at}");
    }
}
