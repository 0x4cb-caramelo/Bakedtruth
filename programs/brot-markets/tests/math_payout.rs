//! Purpose: the creator share, the split payout and the join estimate on the TP's worked
//!          examples A, B and C to the lamport, the proposal's table under both readings of D-g
//!          (the literal one as an oracle only), and a team campaign.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane C

mod common;

use brot_markets::math::{
    fees::{house_fee, one_sided_fee},
    payout::{
        creator_share, distributable, estimate_return_bps, split_payout, CreatorShare, JoinedPot,
    },
};
use common::{add, literal_reading, sub, w};

const SOL: u64 = 1_000_000_000;
/// Worked example A's prize: 90% of US$500 at US$109.27 per SOL.
const PRIZE_A: u64 = 4_118_239_224;
/// Example A's payment and its opening fee, held in the vault until the outcome (T23).
const PAID_A: u64 = 4_575_821_360;
const OPENING_FEE_A: u64 = 457_582_136;

fn share(from_pot: u64, from_fee: u64) -> CreatorShare {
    CreatorShare { from_pot, from_fee }
}

/// A join at the devnet rates (10% fee, 1% one-sided fee, 1% share) on example A's prize.
fn join(amount: u64, side_after: u64, other: u64, is_first: bool) -> JoinedPot {
    JoinedPot {
        amount,
        side_after,
        other,
        prize: PRIZE_A,
        fee_bps: 1_000,
        one_sided_fee_bps: 100,
        creator_share_bps: 100,
        is_first,
    }
}

/// The P-2 chain on one `Split` pot at the devnet rates: (fee, share, distributable).
fn settle(v: u64, p: u64, r: u64) -> (u64, CreatorShare, u64) {
    let fee = house_fee(p, 1_000).unwrap();
    let share = creator_share(v, p, r, fee, 100).unwrap();
    let pool = distributable(v, p, r, fee, share.from_pot).unwrap();
    (fee, share, pool)
}

#[test]
fn worked_example_a_to_the_lamport() {
    // Ana 4 SOL and Bruno 2 SOL on YES, Carla 4 SOL on NO; YES wins.
    let (v, p) = (6 * SOL, 4 * SOL);
    let (fee, cut, pool) = settle(v, p, PRIZE_A);
    assert_eq!(
        (fee, cut, pool),
        (400_000_000, share(100_000_000, 0), 13_618_239_224)
    );
    let ana = split_payout(4 * SOL, pool, v).unwrap();
    let bruno = split_payout(2 * SOL, pool, v).unwrap();
    assert_eq!((ana, bruno), (9_078_826_149, 4_539_413_074));
    let dust = sub(sub(w(pool), w(ana)), w(bruno));
    assert_eq!(dust, 1);
    let creator = add(w(cut.from_pot), w(cut.from_fee));
    let brot = add(sub(w(fee), w(cut.from_fee)), w(OPENING_FEE_A));
    assert_eq!(brot, 857_582_136);
    // Payouts, share, Brot and dust are the payment plus both sides (I1).
    let out = add(add(add(w(ana), w(bruno)), add(creator, brot)), dust);
    assert_eq!(out, add(w(PAID_A), add(w(v), w(p))));
    // I3′: Brot's part, the creator's part and the winners' part are V + P + R.
    let parts = add(add(sub(w(fee), w(cut.from_fee)), creator), w(pool));
    assert_eq!(parts, add(add(w(v), w(p)), w(PRIZE_A)));
}

#[test]
fn worked_example_a_join_estimates() {
    // Bruno joins YES last with 2 SOL: each SOL returns 2.2697 SOL (TP section 3.4.16).
    let bruno = join(2 * SOL, 6 * SOL, 4 * SOL, false);
    assert_eq!(estimate_return_bps(&bruno), Ok(22_697));
    // Carla's 4 SOL on NO against 6 SOL on YES: 3.3545 per SOL if NO wins.
    let carla = join(4 * SOL, 4 * SOL, 6 * SOL, false);
    assert_eq!(estimate_return_bps(&carla), Ok(33_545));
}

#[test]
fn worked_example_b_keeps_every_winner_whole() {
    let (v, p) = (600 * SOL, SOL);
    let (fee, cut, pool) = settle(v, p, PRIZE_A);
    assert_eq!((fee, cut), (100_000_000, share(5_018_239_224, 100_000_000)));
    // The creator gets 5,118,239,224, less than C (6,010,000,000); Brot keeps no house fee.
    assert_eq!(add(w(cut.from_pot), w(cut.from_fee)), 5_118_239_224);
    assert_eq!(sub(w(fee), w(cut.from_fee)), 0);
    // distributable is exactly V, so every winner gets back exactly its entry (I11).
    assert_eq!(pool, v);
    assert_eq!(split_payout(SOL, pool, v), Ok(SOL));
    // The literal reading, as an oracle: the creator 100,000,000, the winners 605,018,239,224.
    let literal = literal_reading(v, p, PRIZE_A, fee, 100);
    assert_eq!(literal, (100_000_000, 605_018_239_224));
}

#[test]
fn worked_example_c_refunds_a_one_sided_pot() {
    // Ana first with 1 SOL, then Bruno 2 SOL and Carla 3 SOL, all on YES; NO stays empty.
    let entries = [(SOL, true), (2 * SOL, false), (3 * SOL, false)];
    let fees = entries.map(|(entry, first)| one_sided_fee(entry, 100, first).unwrap());
    assert_eq!(fees, [0, 20_000_000, 30_000_000]);
    let refunds = [0, 1, 2].map(|i| entries[i].0.checked_sub(fees[i]).unwrap());
    assert_eq!(refunds, [1_000_000_000, 1_980_000_000, 2_970_000_000]);
    assert_eq!(add(add(w(fees[0]), w(fees[1])), w(fees[2])), 50_000_000);
    // The estimates on the same pot; the prize stays out (it returns to whoever opened, P-4).
    let joins = [
        (join(SOL, SOL, 0, true), 10_000),
        (join(2 * SOL, 3 * SOL, 0, false), 9_900),
        (join(3 * SOL, 6 * SOL, 0, false), 9_900),
    ];
    for (pot, bps) in joins {
        assert_eq!(estimate_return_bps(&pot), Ok(bps), "{pot:?}");
    }
}

#[test]
fn the_proposal_table_under_both_readings_of_d_g() {
    // Proposal section 2.4.4 in SOL instead of US$ (the formulas do not care): (V, P, R) →
    // P-2's (creator, Brot keeps, winners) and the literal reading's (creator, winners).
    let rows = [
        ((600, 400, 0), (10, 40, 950), (10, 950)),
        ((600, 400, 450), (10, 40, 1_400), (10, 1_400)),
        ((990, 10, 0), (10, 0, 990), (1, 999)),
        ((98_900, 1_100, 0), (1_000, 100, 98_900), (110, 99_890)),
        ((98_900, 1_100, 450), (1_000, 110, 99_340), (1_000, 99_340)),
    ];
    let in_sol = |amount: u64| amount.checked_mul(SOL).unwrap();
    let sol = |amount: u64| w(in_sol(amount));
    for ((v, p, r), (creator, brot, winners), literal) in rows {
        let at = format!("V {v} P {p} R {r}");
        let (v, p, r) = (in_sol(v), in_sol(p), in_sol(r));
        let (fee, cut, pool) = settle(v, p, r);
        assert_eq!(add(w(cut.from_pot), w(cut.from_fee)), sol(creator), "{at}");
        assert_eq!(sub(w(fee), w(cut.from_fee)), sol(brot), "{at}");
        assert_eq!(w(pool), sol(winners), "{at}");
        let oracle = literal_reading(v, p, r, fee, 100);
        assert_eq!(oracle, (sol(literal.0), sol(literal.1)), "{at}");
    }
}

#[test]
fn a_team_campaign_pays_no_share() {
    // creator_share_bps = 0 (P-3, I12): the winners split the whole pot less Brot's fee.
    let fee = house_fee(4 * SOL, 1_000).unwrap();
    let cut = creator_share(6 * SOL, 4 * SOL, PRIZE_A, fee, 0);
    assert_eq!(cut, Ok(share(0, 0)));
    let pool = distributable(6 * SOL, 4 * SOL, PRIZE_A, fee, 0);
    assert_eq!(pool, Ok(13_718_239_224));
}
