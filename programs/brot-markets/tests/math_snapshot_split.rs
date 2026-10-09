//! Purpose: the `Split` snapshot on the sprint file's worked examples (V 600 / P 400 with and without
//!          a 450 prize; V 990 / P 10 and V 98,900 / P 1,100 with and without the prize, under the P-2
//!          reading of D-g), a team campaign, and the late refunds. The literal reading of D-g is an
//!          oracle here only, never in production code.
//! Version: 0.0.1
//! Sprint: 04 (lane B)

use brot_markets::math::{
    invariant::check_snapshot,
    snapshot::{snapshot, Snapshot, SnapshotInput, Verdict},
};
use brot_markets::state::enums::SettleMode;

const FEE_BPS: u16 = 1_000;
const CREATOR_BPS: u16 = 100;

fn yes_wins(yes: u64, no: u64, prize: u64) -> SnapshotInput {
    SnapshotInput {
        verdict: Verdict::Yes,
        yes_total: yes,
        no_total: no,
        late_yes: 0,
        late_no: 0,
        prize,
        opening_fee: 0,
        fee_bps: FEE_BPS,
        one_sided_fee_bps: 100,
        creator_share_bps: CREATOR_BPS,
        creator_is_team: false,
    }
}

fn take(input: SnapshotInput) -> Snapshot {
    let snap = snapshot(input).expect("a split pot snapshots");
    assert_eq!(check_snapshot(&input, &snap), Ok(()));
    snap
}

#[test]
fn math_snapshot_split_example_without_prize_pays_the_winners_950() {
    let snap = take(yes_wins(600, 400, 0));
    assert_eq!(snap.mode, SettleMode::Split);
    assert_eq!(snap.fee_total, 40);
    assert_eq!(snap.creator_share, 10);
    assert_eq!(snap.from_pot, 10);
    assert_eq!(snap.creator_share_from_fee, 0);
    assert_eq!(snap.distributable, 950);
    assert_eq!(snap.brot_keeps, 40);
    assert_eq!(snap.to_opener, 0);
}

#[test]
fn math_snapshot_split_example_with_prize_pays_the_winners_1400() {
    let snap = take(yes_wins(600, 400, 450));
    assert_eq!(snap.distributable, 1_400);
    assert_eq!(snap.creator_share, 10);
    assert_eq!(snap.brot_keeps, 40);
}

#[test]
fn math_snapshot_split_small_lopsided_pot_without_prize() {
    // V 990 / P 10: C = 10, the pot covers 9 of it and the fee covers the last one.
    let snap = take(yes_wins(990, 10, 0));
    assert_eq!(snap.fee_total, 1);
    assert_eq!(snap.creator_share, 10);
    assert_eq!(snap.from_pot, 9);
    assert_eq!(snap.creator_share_from_fee, 1);
    assert_eq!(snap.distributable, 990);
    assert_eq!(snap.brot_keeps, 0);
}

#[test]
fn math_snapshot_split_small_lopsided_pot_with_prize() {
    // The prize (450 in the test's units) covers the whole share from the pot; the fee is kept.
    let snap = take(yes_wins(990, 10, 450));
    assert_eq!(snap.creator_share, 10);
    assert_eq!(snap.from_pot, 10);
    assert_eq!(snap.creator_share_from_fee, 0);
    assert_eq!(snap.distributable, 1_439);
    assert_eq!(snap.brot_keeps, 1);
}

#[test]
fn math_snapshot_split_large_lopsided_pot_without_prize() {
    // V 98,900 / P 1,100: C = 1,000; the pot gives 990 and the fee 10 (the fee is 110).
    let snap = take(yes_wins(98_900, 1_100, 0));
    assert_eq!(snap.fee_total, 110);
    assert_eq!(snap.creator_share, 1_000);
    assert_eq!(snap.from_pot, 990);
    assert_eq!(snap.creator_share_from_fee, 10);
    assert_eq!(snap.distributable, 98_900);
    assert_eq!(snap.brot_keeps, 100);
}

#[test]
fn math_snapshot_split_large_lopsided_pot_with_prize() {
    // With a 4,500 prize the pot covers the whole share; winners get back their entries plus the prize.
    let snap = take(yes_wins(98_900, 1_100, 4_500));
    assert_eq!(snap.from_pot, 1_000);
    assert_eq!(snap.creator_share_from_fee, 0);
    assert_eq!(snap.distributable, 103_390);
    assert_eq!(snap.brot_keeps, 110);
}

#[test]
fn math_snapshot_split_the_no_side_wins_the_same_way() {
    let yes = take(yes_wins(600, 400, 450));
    let no_input = SnapshotInput {
        verdict: Verdict::No,
        ..yes_wins(400, 600, 450)
    };
    let no = take(no_input);
    assert_eq!(no.distributable, yes.distributable);
    assert_eq!(no.creator_share, yes.creator_share);
}

#[test]
fn math_snapshot_split_late_refunds_stay_out_of_the_pot() {
    let mut input = yes_wins(600, 400, 0);
    input.late_yes = 50;
    input.late_no = 25;
    let snap = take(input);
    assert_eq!(snap.refunded_late, 75);
    assert_eq!(snap.distributable, 950);
    assert_eq!(snap.creator_share, 10);
}

#[test]
fn math_snapshot_split_team_campaign_pays_no_creator_share() {
    let mut input = yes_wins(600, 400, 450);
    input.creator_is_team = true;
    let snap = take(input);
    assert_eq!(snap.creator_share, 0);
    assert_eq!(snap.from_pot, 0);
    assert_eq!(snap.distributable, 1_410);
    assert_eq!(snap.brot_keeps, 40);
}

#[test]
fn math_snapshot_split_opening_fee_stays_with_brot_on_a_split() {
    let mut input = yes_wins(600, 400, 450);
    input.opening_fee = 50;
    let snap = take(input);
    assert_eq!(snap.brot_keeps, 40 + 50);
    assert_eq!(snap.to_opener, 0);
}

/// The literal reading of D-g, as an oracle: the whole 1% comes from the fee, capped at the fee.
/// It leaves the winners more than their entries, which is why production uses the P-2 reading.
#[test]
fn math_snapshot_split_literal_oracle_overpays_winners_where_p2_does_not() {
    let (v, p) = (98_900u64, 1_100u64);
    let fee = 110u64;
    let literal_creator = 1_000u64.min(fee);
    let literal_winners = v + p - fee;
    assert_eq!(literal_creator, 110);
    assert_eq!(literal_winners, 99_890);
    let p2 = take(yes_wins(v, p, 0));
    assert!(p2.distributable >= v);
    assert_eq!(p2.distributable, v);
}
