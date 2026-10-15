//! Purpose: L-2 of the S-8 review on the host: after its totals, `check_snapshot` pins a `Split` snapshot's fee to the
//!          campaign's rate on `losing_total` (`⌈P × fee_bps ÷ 10,000⌉`, without a division) and its `distributable` to
//!          `V + P − fee − from_pot + R`. A lamport moved between the fee or `distributable` and the winners or Brot's
//!          share, every sum kept, and a snapshot taken at another rate or on another prize than the campaign's, are
//!          `SnapshotInconsistent`; every `Split` of the grid passes (`prefreeze_snapshot_books.rs`).
//! Version: 0.0.1
//! Sprint: 16 (lane S8, the review's L-2)

mod common;

use brot_markets::{
    error::BrotError,
    math::{
        invariant::{check_snapshot, Books},
        snapshot::{Snapshot, SnapshotInput, Verdict},
    },
};
use common::{
    books::books_of,
    splits::{down, grid, input, split, up},
};

const INCONSISTENT: Result<(), BrotError> = Err(BrotError::SnapshotInconsistent);

#[test]
fn prefreeze_snapshot_derived_a_fee_off_the_rate_is_refused() {
    for input in &grid() {
        let (snap, books) = (split(input), books_of(input));
        let (d, fee, keeps) = (snap.distributable, snap.fee_total, snap.brot_keeps);
        // A lamport moved between the winners and Brot's fee, every sum kept: only the fee's own rate refuses it.
        for (fee, keeps, d) in [
            (up(fee), up(keeps), down(d)),
            (down(fee), down(keeps), up(d)),
        ] {
            let moved = Snapshot {
                fee_total: fee,
                brot_keeps: keeps,
                distributable: d,
                ..snap
            };
            assert_eq!(
                check_snapshot(&books, input, &moved),
                INCONSISTENT,
                "{input:?}"
            );
        }
    }
    // Taken at another rate than the campaign's: 400 lost at 10.01% is a fee of 41, not 40.
    let input = input(Verdict::Yes, 600, 400, 0, 0, false);
    let books = Books {
        fee_bps: 1_001,
        ..books_of(&input)
    };
    assert_eq!(check_snapshot(&books, &input, &split(&input)), INCONSISTENT);
}

#[test]
fn prefreeze_snapshot_derived_a_distributable_off_the_identity_is_refused() {
    for input in &grid() {
        let (snap, books) = (split(input), books_of(input));
        let (d, keeps) = (snap.distributable, snap.brot_keeps);
        // A lamport moved between Brot's share, which is not stored, and `distributable`: the sums still close.
        for (d, keeps) in [(up(d), down(keeps)), (down(d), up(keeps))] {
            let moved = Snapshot {
                distributable: d,
                brot_keeps: keeps,
                ..snap
            };
            assert_eq!(
                check_snapshot(&books, input, &moved),
                INCONSISTENT,
                "{input:?}"
            );
        }
    }
    // Taken on another prize than the campaign's: its own sums close.
    let books = books_of(&input(Verdict::Yes, 600, 400, 0, 0, false));
    let other = SnapshotInput {
        prize: 4_118_239_225,
        ..input(Verdict::Yes, 600, 400, 0, 0, false)
    };
    assert_eq!(check_snapshot(&books, &other, &split(&other)), INCONSISTENT);
}
