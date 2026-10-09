//! Purpose: the regression tests of the Sprint 04 closure review (second lens, 2026-10-09): a void that
//!          follows a late-only pot pays the opener as a house failure requires, and the no-entry rule
//!          applies only when there is no entry at all.
//! Version: 0.0.1
//! Sprint: 04 (closure review)

use brot_markets::{
    math::snapshot::{snapshot, SnapshotInput, Verdict},
    math::void::VoidClass,
    state::enums::SettleMode,
};

const SOL: u64 = 1_000_000_000;

fn input(verdict: Verdict, yes: u64, no: u64, late_yes: u64, late_no: u64) -> SnapshotInput {
    SnapshotInput {
        verdict,
        yes_total: yes,
        no_total: no,
        late_yes,
        late_no,
        prize: 4 * SOL,
        opening_fee: SOL / 10,
        fee_bps: 1_000,
        one_sided_fee_bps: 100,
        creator_share_bps: 100,
        creator_is_team: false,
    }
}

#[test]
fn a_house_failure_void_after_a_late_only_pot_returns_the_opening_fee_to_the_opener() {
    // Every entry is late (the early totals are zero): the void follows its class, not the no-entry rule.
    let s = snapshot(input(
        Verdict::Void(VoidClass::HouseFailure),
        0,
        0,
        2 * SOL,
        SOL,
    ))
    .unwrap();
    assert_eq!(s.mode, SettleMode::Refund);
    assert_eq!(s.refunded_late, 3 * SOL);
    assert_eq!(s.to_opener, 4 * SOL + SOL / 10);
    assert_eq!(s.brot_keeps, 0);
}

#[test]
fn an_outside_cause_void_after_a_late_only_pot_keeps_the_opening_fee_for_brot() {
    let s = snapshot(input(
        Verdict::Void(VoidClass::OutsideCause),
        0,
        0,
        2 * SOL,
        SOL,
    ))
    .unwrap();
    assert_eq!(s.to_opener, 4 * SOL);
    assert_eq!(s.brot_keeps, SOL / 10);
}

#[test]
fn a_campaign_with_no_entry_at_all_keeps_the_opening_fee_whatever_the_class() {
    // Answer 8 (2026-10-09): no entry at all, the prize returns, Brot keeps the 10% (even on a house failure).
    let s = snapshot(input(Verdict::Void(VoidClass::HouseFailure), 0, 0, 0, 0)).unwrap();
    assert_eq!(s.mode, SettleMode::Refund);
    assert_eq!(s.to_opener, 4 * SOL);
    assert_eq!(s.brot_keeps, SOL / 10);
}
