//! Purpose: the transition table of TP section 3.4.2, checked over all 25 pairs of statuses: its eight
//!          edges are allowed, every other pair is refused with `IllegalTransition`.
//! Version: 0.0.2 (the edge `Contested` to `Settled` of the lead's addendum for Sprint 14, 2026-10-13)
//! Sprint: 04 (contract freeze); 14 (lane L14B, after the lead's addendum)

use brot_markets::{
    error::BrotError,
    state::{enums::Status, transitions::transition},
};

const ALL: [Status; 5] = [
    Status::Open,
    Status::InReview,
    Status::Contested,
    Status::Settling,
    Status::Settled,
];

#[test]
fn the_table_has_exactly_its_eight_edges() {
    let allowed = [
        (Status::Open, Status::InReview),
        (Status::InReview, Status::Settling),
        (Status::InReview, Status::Contested),
        (Status::InReview, Status::Settled),
        (Status::Contested, Status::Settling),
        (Status::Contested, Status::Contested),
        // A contested campaign with no entry: the snapshot settles it at once (lead's addendum, Sprint 14).
        (Status::Contested, Status::Settled),
        (Status::Settling, Status::Settled),
    ];
    for from in ALL {
        for to in ALL {
            let expected = if allowed.contains(&(from, to)) {
                Ok(())
            } else {
                Err(BrotError::IllegalTransition)
            };
            assert_eq!(transition(from, to), expected, "{from:?} to {to:?}");
        }
    }
}

#[test]
fn nothing_goes_back_to_open_or_from_settled() {
    for to in ALL {
        assert_eq!(
            transition(to, Status::Open),
            Err(BrotError::IllegalTransition)
        );
        assert!(transition(Status::Settled, to).is_err());
    }
}
