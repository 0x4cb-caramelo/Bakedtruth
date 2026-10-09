//! Purpose: the `Split` snapshot on the sprint file's worked examples (V 600 / P 400 with and without
//!          a 450 prize), a team campaign, the late refunds, and the Economic Viability Rule (2026-10-09):
//!          a losing side too small to pay the fees resolves one-sided, with or without a prize.
//! Version: 0.0.2
//! Sprint: 04 (lane B; viability rule added at the closure review)

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
    let snap = snapshot(input).expect("a pot snapshots");
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

/// V 990 / P 10: the fees on the losing side (1 + the share of 10) are 11, more than the 10 there is, so the
/// pot is one-sided and nothing is taken from it.
#[test]
fn math_snapshot_split_small_lopsided_pot_is_one_sided_without_prize() {
    let snap = take(yes_wins(990, 10, 0));
    assert_eq!(snap.mode, SettleMode::OneSided);
    assert_eq!(snap.fee_total, 0);
    assert_eq!(snap.creator_share, 0);
    assert_eq!(snap.distributable, 0);
    assert_eq!(snap.to_opener, 0);
    assert_eq!(snap.brot_keeps, 0);
}

#[test]
fn math_snapshot_split_small_lopsided_pot_is_one_sided_with_prize() {
    let snap = take(yes_wins(990, 10, 450));
    assert_eq!(snap.mode, SettleMode::OneSided);
    assert_eq!(snap.to_opener, 450);
    assert_eq!(snap.creator_share, 0);
    assert_eq!(snap.distributable, 0);
}

/// V 98,900 / P 1,100: the fees are 110 + 1,000 = 1,110, more than the 1,100 on the losing side: one-sided.
#[test]
fn math_snapshot_split_large_lopsided_pot_is_one_sided_without_prize() {
    let snap = take(yes_wins(98_900, 1_100, 0));
    assert_eq!(snap.mode, SettleMode::OneSided);
    assert_eq!(snap.fee_total, 0);
    assert_eq!(snap.creator_share, 0);
    assert_eq!(snap.distributable, 0);
    assert_eq!(snap.to_opener, 0);
    assert_eq!(snap.brot_keeps, 0);
}

#[test]
fn math_snapshot_split_large_lopsided_pot_is_one_sided_with_prize() {
    let snap = take(yes_wins(98_900, 1_100, 4_500));
    assert_eq!(snap.mode, SettleMode::OneSided);
    assert_eq!(snap.to_opener, 4_500);
    assert_eq!(snap.distributable, 0);
}

/// The boundary, with the winning side at 990: the losing side of 12 pays 2 (fee) + 10 (share) = 12, which is
/// not more than 12, so one-sided. At 13 the fees are 12 and the split holds.
#[test]
fn math_snapshot_split_viability_boundary_is_strictly_more_than_the_fees() {
    let at_fees = take(yes_wins(990, 12, 0));
    assert_eq!(at_fees.mode, SettleMode::OneSided);
    let above_fees = take(yes_wins(990, 13, 0));
    assert_eq!(above_fees.mode, SettleMode::Split);
    assert_eq!(above_fees.fee_total, 2);
    assert_eq!(above_fees.creator_share, 10);
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
