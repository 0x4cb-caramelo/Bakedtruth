//! Purpose: the review window's rules (TP section 3.4.7): a team key acts only while the campaign
//!          is `InReview` (`TeamKeyOutsideReview`), and only before `review_ends_at` (the act's own
//!          closed error). Pure functions, so the host tests check them without an account.
//! Version: 0.0.1
//! Sprint: 04 (lane A)

use crate::{error::BrotError, state::enums::Status};

/// The window is open at `now` when `now` is before `review_ends_at`. It is closed at the instant
/// it ends, so the last second of the window is the last one a team key can act in.
pub fn is_open(now: i64, review_ends_at: i64) -> bool {
    now < review_ends_at
}

/// A team act in the window: the stored status is `InReview` (`TeamKeyOutsideReview`), then the
/// window is open (`closed`, the error of the act: `OutsideReviewWindow` or `ContestOutsideReview`).
pub fn require_review(
    status: u8,
    now: i64,
    review_ends_at: i64,
    closed: BrotError,
) -> Result<(), BrotError> {
    if Status::try_from(status)? != Status::InReview {
        return Err(BrotError::TeamKeyOutsideReview);
    }
    if !is_open(now, review_ends_at) {
        return Err(closed);
    }
    Ok(())
}
