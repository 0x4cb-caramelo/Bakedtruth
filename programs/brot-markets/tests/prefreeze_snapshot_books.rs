//! Purpose: S-8 of the audit scope (the third review) on the host: `check_snapshot` pins a `Split` snapshot's
//!          `winning_total` and `losing_total` to the campaign's books (each pool less its late part, the side the
//!          stored outcome names). Every `Split` snapshot the program takes passes; a total one lamport off (alone, or
//!          with `distributable` and Brot's share moved to match), a snapshot taken on an input that is not the books'
//!          (the late parts left in, the sides swapped), a `Split` on an outcome that is neither YES nor NO, and a pool
//!          below its late part are `SnapshotInconsistent`.
//! Version: 0.0.2 (the pots moved to `common/splits.rs`; the fee and `distributable` in `prefreeze_snapshot_derived.rs`)
//! Sprint: 16 (lane S8)

mod common;

use brot_markets::{
    error::BrotError,
    math::{
        invariant::{check_snapshot, Books},
        snapshot::{Snapshot, Verdict},
    },
    state::enums::Outcome,
};
use common::{
    books::books_of,
    splits::{down, grid, input, split, up},
};

const INCONSISTENT: Result<(), BrotError> = Err(BrotError::SnapshotInconsistent);

#[test]
fn prefreeze_snapshot_books_every_split_passes_and_a_total_one_lamport_off_does_not() {
    let all = grid();
    assert_eq!(all.len(), 80);
    for input in &all {
        let snap = split(input);
        let books = books_of(input);
        assert_eq!(check_snapshot(&books, input, &snap), Ok(()), "{input:?}");
        let off = |w: u64, l: u64| Snapshot {
            winning_total: w,
            losing_total: l,
            ..snap
        };
        let (w, l) = (snap.winning_total, snap.losing_total);
        for tampered in [
            off(down(w), l),
            off(up(w), l),
            off(w, down(l)),
            off(w, up(l)),
        ] {
            assert_eq!(check_snapshot(&books, input, &tampered), INCONSISTENT);
        }
        if w != l {
            assert_eq!(check_snapshot(&books, input, &off(l, w)), INCONSISTENT);
        }
        // S-8's own case: V one lamport smaller (or larger) with `distributable` and Brot's share moved to match. The
        // fee, `distributable`'s identity and the sums all hold; only the books refuse it.
        let (d, keeps) = (snap.distributable, snap.brot_keeps);
        for (w, d, keeps) in [(down(w), down(d), up(keeps)), (up(w), up(d), down(keeps))] {
            let shifted = Snapshot {
                winning_total: w,
                distributable: d,
                brot_keeps: keeps,
                ..snap
            };
            assert_eq!(check_snapshot(&books, input, &shifted), INCONSISTENT);
        }
    }
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
        fee_bps: 1_000,
        prize: 4_118_239_224,
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
    for below in [
        Books {
            late_yes: 601,
            ..books
        },
        Books {
            late_no: 401,
            ..books
        },
    ] {
        assert_eq!(check_snapshot(&below, &input, &snap), INCONSISTENT);
    }
}
