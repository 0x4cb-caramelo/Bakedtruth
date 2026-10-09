//! Purpose: the transition table of TP section 3.4.2, checked over all 25 pairs of statuses: the six
//!          edges are allowed, every other pair is refused with `IllegalTransition`.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze)

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
fn the_table_has_exactly_its_six_edges() {
    let allowed = [
        (Status::Open, Status::InReview),
        (Status::InReview, Status::Settling),
        (Status::InReview, Status::Contested),
        (Status::Contested, Status::Settling),
        (Status::Contested, Status::Contested),
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
