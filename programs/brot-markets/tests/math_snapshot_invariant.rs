//! Purpose: the snapshot's own sums (I3′) on a deterministic grid of pots, verdicts and prizes, and
//!          the refusals: a tampered total, a field that disagrees with the others, an unset mode.
//! Version: 0.0.2 (S-8: `check_snapshot` also takes the books the input was read from)
//! Sprint: 04 (lane B); 16 (lane S8)

mod common;

use brot_markets::error::BrotError;
use brot_markets::math::{
    invariant::check_snapshot,
    snapshot::{snapshot, Snapshot, SnapshotInput, Verdict},
    void::VoidClass,
};
use brot_markets::state::enums::SettleMode;
use common::books::books_of;

fn case(
    verdict: Verdict,
    yes: u64,
    no: u64,
    late: u64,
    prize: u64,
    opening: u64,
    team: bool,
) -> SnapshotInput {
    SnapshotInput {
        verdict,
        yes_total: yes,
        no_total: no,
        late_yes: late,
        late_no: late / 2,
        prize,
        opening_fee: opening,
        fee_bps: 1_000,
        one_sided_fee_bps: 100,
        creator_share_bps: 100,
        creator_is_team: team,
    }
}

#[test]
fn math_snapshot_invariant_every_grid_pot_closes() {
    let amounts = [
        0u64,
        1,
        9,
        10,
        99,
        990,
        1_100,
        98_900,
        4_000_000_000,
        6_000_000_000,
    ];
    let prizes = [0u64, 450, 4_118_239_224];
    let verdicts = [
        Verdict::Yes,
        Verdict::No,
        Verdict::Void(VoidClass::HouseFailure),
        Verdict::Void(VoidClass::OutsideCause),
    ];
    let mut checked = 0u32;
    for &yes in &amounts {
        for &no in &amounts {
            for &late in &[0u64, 77] {
                for &prize in &prizes {
                    for &verdict in &verdicts {
                        for team in [false, true] {
                            let input = case(verdict, yes, no, late, prize, 457_582_136, team);
                            let snap = snapshot(input).expect("every grid pot snapshots");
                            assert_eq!(
                                check_snapshot(&books_of(&input), &input, &snap),
                                Ok(()),
                                "{input:?}"
                            );
                            checked += 1;
                        }
                    }
                }
            }
        }
    }
    assert_eq!(checked, 4_800);
}

fn split_snapshot() -> (SnapshotInput, Snapshot) {
    let input = case(Verdict::Yes, 600, 400, 0, 450, 50, false);
    (input, snapshot(input).unwrap())
}

#[test]
fn math_snapshot_invariant_a_distributable_that_does_not_close_is_violated() {
    let (input, mut snap) = split_snapshot();
    snap.distributable += 1;
    assert_eq!(
        check_snapshot(&books_of(&input), &input, &snap),
        Err(BrotError::InvariantViolated)
    );
}

#[test]
fn math_snapshot_invariant_a_creator_share_that_disagrees_is_inconsistent() {
    let (input, mut snap) = split_snapshot();
    snap.creator_share += 1;
    assert_eq!(
        check_snapshot(&books_of(&input), &input, &snap),
        Err(BrotError::SnapshotInconsistent)
    );
}

#[test]
fn math_snapshot_invariant_a_team_campaign_with_a_share_is_inconsistent() {
    // A snapshot that carries a share, checked against an input that says team: the share must be 0.
    let mut input = case(Verdict::Yes, 600, 400, 0, 450, 50, false);
    let snap = snapshot(input).unwrap();
    assert_eq!(snap.creator_share, 10);
    input.creator_is_team = true;
    assert_eq!(
        check_snapshot(&books_of(&input), &input, &snap),
        Err(BrotError::SnapshotInconsistent)
    );
}

#[test]
fn math_snapshot_invariant_an_unset_mode_is_inconsistent() {
    let (input, mut snap) = split_snapshot();
    snap.mode = SettleMode::Unset;
    assert_eq!(
        check_snapshot(&books_of(&input), &input, &snap),
        Err(BrotError::SnapshotInconsistent)
    );
}

#[test]
fn math_snapshot_invariant_a_one_sided_snapshot_with_a_share_is_inconsistent() {
    let input = case(Verdict::Yes, 600, 0, 0, 450, 50, false);
    let mut snap = snapshot(input).unwrap();
    snap.creator_share = 0;
    snap.distributable = 1;
    assert_eq!(
        check_snapshot(&books_of(&input), &input, &snap),
        Err(BrotError::SnapshotInconsistent)
    );
}

#[test]
fn math_snapshot_invariant_a_refund_that_returns_too_much_is_violated() {
    let input = case(
        Verdict::Void(VoidClass::OutsideCause),
        600,
        400,
        0,
        450,
        50,
        false,
    );
    let mut snap = snapshot(input).unwrap();
    snap.to_opener += 50;
    assert_eq!(
        check_snapshot(&books_of(&input), &input, &snap),
        Err(BrotError::InvariantViolated)
    );
}
