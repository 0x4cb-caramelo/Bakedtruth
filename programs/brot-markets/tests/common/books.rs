//! Purpose: the campaign books a snapshot's input was read from, for the host tests of `check_snapshot` (S-8): each
//!          pool is its side's total plus its late part, and the outcome is the verdict's.
//! Version: 0.0.1
//! Sprint: 16 (lane S8)

use brot_markets::{
    math::{
        invariant::Books,
        snapshot::{SnapshotInput, Verdict},
    },
    state::enums::Outcome,
};

/// The books `settlement/snapshot.rs` reads `input` from.
pub fn books_of(input: &SnapshotInput) -> Books {
    let outcome = match input.verdict {
        Verdict::Yes => Outcome::Yes,
        Verdict::No => Outcome::No,
        Verdict::Void(_) => Outcome::Void,
    };
    let pool = |total: u64, late: u64| total.checked_add(late).expect("test pools fit a u64");
    Books {
        outcome,
        pool_yes: pool(input.yes_total, input.late_yes),
        pool_no: pool(input.no_total, input.late_no),
        late_yes: input.late_yes,
        late_no: input.late_no,
    }
}
