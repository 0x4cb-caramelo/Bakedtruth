//! Purpose: when entries close and which durations a campaign may have (D-k; P1 section 3.6).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); signatures frozen at the sprint's opening, bodies by lane C
//!
//! `entries_close_at = deadline_at − clamp(5% × (deadline_at − opens_at), 24 h, 7 d)`. A 3-day
//! campaign closes at day 2.0, a 30-day one at day 28.5, a 90-day one at day 85.5. The minimum
//! duration and the 24-hour floor have drill values behind the `drill` feature (constants.rs).
//!
//! Durations are taken in i128, where the difference of two i64 cannot overflow: a deadline far
//! in the past is `DurationTooShort`, never `MathOverflow`.

use crate::{
    constants::{
        BPS_DENOMINATOR, ENTRY_CLOSE_BPS, ENTRY_CLOSE_MAX_SECONDS, ENTRY_CLOSE_MIN_SECONDS,
        MAX_DURATION_SECONDS, MIN_DURATION_SECONDS,
    },
    error::BrotError,
};

// Checked at compile time, under every feature set: the bounds are ordered, and the shortest
// campaign outlasts the entry-close floor, so every accepted duration leaves entries open for
// a while (the lead is either the floor, below the duration, or at most 5% of it).
const _: () = assert!(0 < MIN_DURATION_SECONDS && MIN_DURATION_SECONDS <= MAX_DURATION_SECONDS);
const _: () = assert!(ENTRY_CLOSE_MIN_SECONDS < MIN_DURATION_SECONDS);
const _: () =
    assert!(0 < ENTRY_CLOSE_MIN_SECONDS && ENTRY_CLOSE_MIN_SECONDS <= ENTRY_CLOSE_MAX_SECONDS);
const _: () = assert!(0 < ENTRY_CLOSE_BPS && ENTRY_CLOSE_BPS <= 10_000);

/// `deadline_at − opens_at`, in i128.
fn duration(opens_at: i64, deadline_at: i64) -> Result<i128, BrotError> {
    i128::from(deadline_at)
        .checked_sub(i128::from(opens_at))
        .ok_or(BrotError::MathOverflow)
}

/// The duration `deadline_at − opens_at` is between `MIN_DURATION_SECONDS` and
/// `MAX_DURATION_SECONDS`, both inclusive (`DurationTooShort`, `DurationTooLong`; a deadline in
/// the past is too short).
pub fn check_duration(opens_at: i64, deadline_at: i64) -> Result<(), BrotError> {
    let duration = duration(opens_at, deadline_at)?;
    if duration < i128::from(MIN_DURATION_SECONDS) {
        return Err(BrotError::DurationTooShort);
    }
    if duration > i128::from(MAX_DURATION_SECONDS) {
        return Err(BrotError::DurationTooLong);
    }
    Ok(())
}

/// The moment entries close, rounding the 5% down to whole seconds before the clamp. Assumes a
/// duration `check_duration` accepted; returns `MathOverflow` otherwise.
///
/// A refused duration is `MathOverflow` here, not the duration error: the opening calls
/// `check_duration` first, so reaching this with one is a bug of the caller, not a refusal.
pub fn entries_close_at(opens_at: i64, deadline_at: i64) -> Result<i64, BrotError> {
    check_duration(opens_at, deadline_at).map_err(|_| BrotError::MathOverflow)?;
    let duration = duration(opens_at, deadline_at)?;
    let five_percent = duration
        .checked_mul(i128::from(ENTRY_CLOSE_BPS))
        .ok_or(BrotError::MathOverflow)?
        .checked_div(i128::from(BPS_DENOMINATOR))
        .ok_or(BrotError::MathOverflow)?;
    // `max` then `min` instead of `clamp`, which panics on reversed bounds; the bounds are
    // ordered anyway (asserted above).
    let lead = five_percent
        .max(i128::from(ENTRY_CLOSE_MIN_SECONDS))
        .min(i128::from(ENTRY_CLOSE_MAX_SECONDS));
    let close = i128::from(deadline_at)
        .checked_sub(lead)
        .ok_or(BrotError::MathOverflow)?;
    i64::try_from(close).map_err(|_| BrotError::MathOverflow)
}
