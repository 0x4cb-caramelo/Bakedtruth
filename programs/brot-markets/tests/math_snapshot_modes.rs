//! Purpose: the `OneSided` and no-entry snapshots: the one-sided pot of Ana, Bruno and Carla (100,
//!          198, 297 back, 5 to Brot), the one-sided baker with and without the prize, a team
//!          campaign, and the rule for a campaign with no entry at all (founder answer 8).
//! Version: 0.0.1
//! Sprint: 04 (lane B)

use brot_markets::error::BrotError;
use brot_markets::math::{
    invariant::check_snapshot,
    payout::one_sided_refund,
    snapshot::{snapshot, SnapshotInput, Verdict},
    void::VoidClass,
};
use brot_markets::state::enums::SettleMode;

fn input(verdict: Verdict, yes: u64, no: u64, prize: u64, opening: u64) -> SnapshotInput {
    SnapshotInput {
        verdict,
        yes_total: yes,
        no_total: no,
        late_yes: 0,
        late_no: 0,
        prize,
        opening_fee: opening,
        fee_bps: 1_000,
        one_sided_fee_bps: 100,
        creator_share_bps: 100,
        creator_is_team: false,
    }
}

#[test]
fn math_snapshot_modes_ana_bruno_carla_get_back_100_198_297_and_brot_gets_5() {
    // Ana enters first (exempt), Bruno 200, Carla 300, all on YES; NO stays empty.
    let ana = one_sided_refund(100, 100, true).unwrap();
    let bruno = one_sided_refund(200, 100, false).unwrap();
    let carla = one_sided_refund(300, 100, false).unwrap();
    assert_eq!((ana.payout, bruno.payout, carla.payout), (100, 198, 297));
    assert_eq!(ana.fee + bruno.fee + carla.fee, 5);

    let snap = snapshot(input(Verdict::Yes, 600, 0, 0, 0)).unwrap();
    assert_eq!(snap.mode, SettleMode::OneSided);
    assert_eq!(snap.creator_share, 0);
    assert_eq!(snap.distributable, 0);
    assert_eq!(snap.winning_total, 600);
    assert_eq!(snap.losing_total, 0);
}

#[test]
fn math_snapshot_modes_one_sided_pot_the_outcome_does_not_change_the_refunds() {
    // The same pot with the outcome on the empty side: the entries still come back net of the fee.
    let snap = snapshot(input(Verdict::No, 600, 0, 0, 0)).unwrap();
    assert_eq!(snap.mode, SettleMode::OneSided);
    assert_eq!(snap.winning_total, 0);
    assert_eq!(snap.losing_total, 600);
    assert_eq!(snap.creator_share, 0);
}

#[test]
fn math_snapshot_modes_one_sided_prize_returns_to_the_opener_and_the_opening_fee_stays() {
    let snap = snapshot(input(Verdict::Yes, 600, 0, 450, 50)).unwrap();
    assert_eq!(snap.to_opener, 450);
    assert_eq!(snap.brot_keeps, 50);
    assert_eq!(snap.fee_total, 0);
}

#[test]
fn math_snapshot_modes_a_single_baker_is_one_sided_and_exempt() {
    let baker = one_sided_refund(1_000_000_000, 100, true).unwrap();
    assert_eq!(baker.payout, 1_000_000_000);
    let snap = snapshot(input(Verdict::Yes, 1_000_000_000, 0, 450, 50)).unwrap();
    assert_eq!(snap.mode, SettleMode::OneSided);
    assert_eq!(snap.to_opener, 450);
}

#[test]
fn math_snapshot_modes_only_late_entries_on_the_other_side_still_leave_a_one_sided_pot() {
    let mut late = input(Verdict::Yes, 600, 0, 0, 0);
    late.late_no = 40;
    let snap = snapshot(late).unwrap();
    assert_eq!(snap.mode, SettleMode::OneSided);
    assert_eq!(snap.refunded_late, 40);
    assert_eq!(check_snapshot(&late, &snap), Ok(()));
}

#[test]
fn math_snapshot_modes_a_team_one_sided_pot_has_no_share() {
    let mut team = input(Verdict::Yes, 600, 0, 450, 0);
    team.creator_is_team = true;
    let snap = snapshot(team).unwrap();
    assert_eq!(snap.creator_share, 0);
    assert_eq!(snap.to_opener, 450);
}

#[test]
fn math_snapshot_modes_no_entry_returns_the_prize_and_keeps_the_ten_percent() {
    for verdict in [Verdict::Yes, Verdict::No] {
        let case = input(verdict, 0, 0, 450, 50);
        let snap = snapshot(case).unwrap();
        assert_eq!(snap.mode, SettleMode::Refund);
        assert_eq!(snap.to_opener, 450);
        assert_eq!(snap.brot_keeps, 50);
        assert_eq!(snap.distributable, 0);
        assert_eq!(check_snapshot(&case, &snap), Ok(()));
    }
}

#[test]
fn math_snapshot_modes_no_entry_keeps_the_ten_percent_even_on_a_house_failure() {
    // Founder answer 8 is a rule with no switch: with no entry, the void class does not reach the fee.
    let case = input(Verdict::Void(VoidClass::HouseFailure), 0, 0, 450, 50);
    let snap = snapshot(case).unwrap();
    assert_eq!(snap.brot_keeps, 50);
    assert_eq!(snap.to_opener, 450);
}

#[test]
fn math_snapshot_modes_a_rate_above_100_percent_is_refused() {
    let mut bad = input(Verdict::Yes, 600, 400, 0, 0);
    bad.fee_bps = 10_001;
    assert_eq!(snapshot(bad), Err(BrotError::MathOverflow));
}
