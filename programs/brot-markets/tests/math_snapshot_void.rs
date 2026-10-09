//! Purpose: the `Refund` snapshot of a void, per class: every entry back whole (late ones too), the
//!          prize to the opener, and the 10% opening fee back to the opener on a house failure and kept
//!          by Brot on an outside cause (P-4). One test per stored void reason.
//! Version: 0.0.1
//! Sprint: 04 (lane B)

use brot_markets::math::{
    invariant::check_snapshot,
    snapshot::{snapshot, SnapshotInput, Verdict},
    void::{void_return, VoidClass},
};
use brot_markets::state::enums::{SettleMode, VoidReason};

fn void(class: VoidClass, yes: u64, no: u64, late: u64) -> SnapshotInput {
    SnapshotInput {
        verdict: Verdict::Void(class),
        yes_total: yes,
        no_total: no,
        late_yes: late,
        late_no: 0,
        prize: 450,
        opening_fee: 50,
        fee_bps: 1_000,
        one_sided_fee_bps: 100,
        creator_share_bps: 100,
        creator_is_team: false,
    }
}

#[test]
fn math_snapshot_void_house_failure_returns_the_prize_and_the_opening_fee() {
    let case = void(VoidClass::HouseFailure, 600, 400, 30);
    let snap = snapshot(case).unwrap();
    assert_eq!(snap.mode, SettleMode::Refund);
    assert_eq!(snap.to_opener, 500);
    assert_eq!(snap.brot_keeps, 0);
    assert_eq!(snap.creator_share, 0);
    assert_eq!(snap.fee_total, 0);
    assert_eq!(snap.refunded_late, 30);
    assert_eq!(check_snapshot(&case, &snap), Ok(()));
}

#[test]
fn math_snapshot_void_outside_cause_keeps_the_opening_fee() {
    let case = void(VoidClass::OutsideCause, 600, 400, 30);
    let snap = snapshot(case).unwrap();
    assert_eq!(snap.mode, SettleMode::Refund);
    assert_eq!(snap.to_opener, 450);
    assert_eq!(snap.brot_keeps, 50);
    assert_eq!(check_snapshot(&case, &snap), Ok(()));
}

#[test]
fn math_snapshot_void_one_sided_void_refunds_the_same_way() {
    let case = void(VoidClass::OutsideCause, 600, 0, 0);
    let snap = snapshot(case).unwrap();
    assert_eq!(snap.mode, SettleMode::Refund);
    assert_eq!(snap.creator_share, 0);
    assert_eq!(snap.brot_keeps, 50);
}

#[test]
fn math_snapshot_void_missed_window_is_a_house_failure() {
    assert_eq!(
        VoidClass::of(VoidReason::MissedWindow),
        Some(VoidClass::HouseFailure)
    );
    assert_eq!(
        void_return(VoidClass::HouseFailure, 450, 50)
            .unwrap()
            .to_opener,
        500
    );
}

#[test]
fn math_snapshot_void_team_house_failure_is_a_house_failure() {
    assert_eq!(
        VoidClass::of(VoidReason::TeamHouseFailure),
        Some(VoidClass::HouseFailure)
    );
}

#[test]
fn math_snapshot_void_unreadable_account_is_an_outside_cause() {
    assert_eq!(
        VoidClass::of(VoidReason::UnreadableAccount),
        Some(VoidClass::OutsideCause)
    );
    let kept = void_return(VoidClass::OutsideCause, 450, 50).unwrap();
    assert_eq!((kept.to_opener, kept.brot_keeps), (450, 50));
}

#[test]
fn math_snapshot_void_stale_feed_is_an_outside_cause() {
    assert_eq!(
        VoidClass::of(VoidReason::StaleFeed),
        Some(VoidClass::OutsideCause)
    );
}

#[test]
fn math_snapshot_void_team_outside_cause_is_an_outside_cause() {
    assert_eq!(
        VoidClass::of(VoidReason::TeamOutsideCause),
        Some(VoidClass::OutsideCause)
    );
}

#[test]
fn math_snapshot_void_none_is_not_a_void() {
    assert_eq!(VoidClass::of(VoidReason::None), None);
}
