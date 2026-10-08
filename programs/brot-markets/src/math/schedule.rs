//! Purpose: when entries close and which durations a campaign may have (D-k; P1 section 3.6).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); signatures frozen at the sprint's opening, bodies by lane C
//!
//! `entries_close_at = deadline_at − clamp(5% × (deadline_at − opens_at), 24 h, 7 d)`. A 3-day
//! campaign closes at day 2.0, a 30-day one at day 28.5, a 90-day one at day 85.5. The minimum
//! duration and the 24-hour floor have drill values behind the `drill` feature (constants.rs).

use crate::error::BrotError;

/// The duration `deadline_at − opens_at` is between `MIN_DURATION_SECONDS` and
/// `MAX_DURATION_SECONDS`, both inclusive (`DurationTooShort`, `DurationTooLong`; a deadline in
/// the past is too short).
pub fn check_duration(opens_at: i64, deadline_at: i64) -> Result<(), BrotError> {
    let _ = (opens_at, deadline_at);
    todo!("Sprint 02 lane C")
}

/// The moment entries close, rounding the 5% down to whole seconds before the clamp. Assumes a
/// duration `check_duration` accepted; returns `MathOverflow` otherwise.
pub fn entries_close_at(opens_at: i64, deadline_at: i64) -> Result<i64, BrotError> {
    let _ = (opens_at, deadline_at);
    todo!("Sprint 02 lane C")
}
