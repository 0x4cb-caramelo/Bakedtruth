//! Purpose: S-8 of the audit scope (the third review) on the host: `check_snapshot` pins a `Split` snapshot's
//!          `winning_total` and `losing_total` to the campaign's books (each pool less its late part, the side the
//!          stored outcome names). Every `Split` snapshot the program takes passes; a total one lamport off, a snapshot
//!          taken on an input that is not the books' (the late parts left in, the sides swapped), a `Split` on an
//!          outcome that is neither YES nor NO, and a pool below its late part are `SnapshotInconsistent`.
//! Version: 0.0.1
//! Sprint: 16 (lane S8)

mod common;

use brot_markets::{
    error::BrotError,
    math::{
        invariant::{check_snapshot, Books},
        snapshot::{snapshot, Snapshot, SnapshotInput, Verdict},
    },
    state::enums::{Outcome, SettleMode},
};
use common::books::books_of;

const INCONSISTENT: Result<(), BrotError> = Err(BrotError::SnapshotInconsistent);

fn input(
    verdict: Verdict,
    yes: u64,
    no: u64,
    late_yes: u64,
    late_no: u64,
    team: bool,
) -> SnapshotInput {
    SnapshotInput {
        verdict,
        yes_total: yes,
        no_total: no,
        late_yes,
        late_no,
        prize: 4_118_239_224,
        opening_fee: 457_582_136,
        fee_bps: 1_000,
        one_sided_fee_bps: 100,
        creator_share_bps: 100,
        creator_is_team: team,
    }
}

fn split(input: &SnapshotInput) -> Snapshot {
    let snap = snapshot(*input).expect("the pot snapshots");
    assert_eq!(snap.mode, SettleMode::Split, "{input:?}");
    snap
}

#[test]
fn prefreeze_snapshot_books_every_split_passes_and_a_total_one_lamport_off_does_not() {
    // Each pot splits on either verdict: neither side is 89 times the other (the Economic Viability Rule).
    let pots = [
        (600u64, 400u64),
        (400, 600),
        (2_000_000_000, 1_000_000_000),
        (1_000_000, 50_000_000),
        (9_007_199_254_740_993, 1_000_000_000_000_007),
    ];
    let lates = [(0u64, 0u64), (77, 0), (0, 13), (1_000_000_000, 7)];
    let mut checked = 0u32;
    for verdict in [Verdict::Yes, Verdict::No] {
        for &(yes, no) in &pots {
            for &(late_yes, late_no) in &lates {
                for team in [false, true] {
                    let input = input(verdict, yes, no, late_yes, late_no, team);
                    let snap = split(&input);
                    let books = books_of(&input);
                    assert_eq!(check_snapshot(&books, &input, &snap), Ok(()), "{input:?}");
                    let off = |w: u64, l: u64| Snapshot {
                        winning_total: w,
                        losing_total: l,
                        ..snap
                    };
                    let (w, l) = (snap.winning_total, snap.losing_total);
                    let (w_up, l_up) = (w.checked_add(1).unwrap(), l.checked_add(1).unwrap());
                    let (w_down, l_down) = (w.checked_sub(1).unwrap(), l.checked_sub(1).unwrap());
                    for tampered in [off(w_down, l), off(w_up, l), off(w, l_down), off(w, l_up)] {
                        assert_eq!(check_snapshot(&books, &input, &tampered), INCONSISTENT);
                    }
                    if w != l {
                        assert_eq!(check_snapshot(&books, &input, &off(l, w)), INCONSISTENT);
                    }
                    checked = checked.checked_add(1).unwrap();
                }
            }
        }
    }
    assert_eq!(checked, 80);
}

#[test]
fn prefreeze_snapshot_books_a_snapshot_taken_on_another_input_is_refused() {
    // The books: YES 1,100 with 100 late, NO 550 with 50 late; YES won.
    let books = Books {
        outcome: Outcome::Yes,
        pool_yes: 1_100,
        pool_no: 550,
        late_yes: 100,
        late_no: 50,
    };
    let right = input(Verdict::Yes, 1_000, 500, 100, 50, false);
    assert_eq!(books_of(&right), books);
    assert_eq!(check_snapshot(&books, &right, &split(&right)), Ok(()));
    // An input that left the late parts in V and P: its own sums close, and winners would share by 1,100 not 1,000.
    let late_left_in = input(Verdict::Yes, 1_100, 550, 100, 50, false);
    let snap = split(&late_left_in);
    assert_eq!(check_snapshot(&books, &late_left_in, &snap), INCONSISTENT);
    // An input whose verdict names the other side: NO's 500 would be V on a YES outcome.
    let swapped = input(Verdict::No, 1_000, 500, 100, 50, false);
    let snap = split(&swapped);
    assert_eq!(check_snapshot(&books, &swapped, &snap), INCONSISTENT);
}

#[test]
fn prefreeze_snapshot_books_a_split_on_another_outcome_or_a_pool_below_its_late_part_is_refused() {
    let input = input(Verdict::Yes, 600, 400, 0, 0, false);
    let snap = split(&input);
    let books = books_of(&input);
    for outcome in [Outcome::Unresolved, Outcome::Void] {
        let books = Books { outcome, ..books };
        assert_eq!(check_snapshot(&books, &input, &snap), INCONSISTENT);
    }
    let below = Books {
        late_yes: 601,
        ..books
    };
    assert_eq!(check_snapshot(&below, &input, &snap), INCONSISTENT);
    let below = Books {
        late_no: 401,
        ..books
    };
    assert_eq!(check_snapshot(&below, &input, &snap), INCONSISTENT);
}
