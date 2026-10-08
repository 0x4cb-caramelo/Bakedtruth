//! Purpose: the schedule math on the host: the P1 section 3.6 table, the 3-to-90-day bounds,
//!          the past deadline, and the drill and mainnet values (T12).
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane C

#[cfg(any(feature = "drill", feature = "mainnet"))]
use brot_markets::constants::ENTRY_CLOSE_MIN_SECONDS;
#[cfg(feature = "mainnet")]
use brot_markets::constants::REVIEW_WINDOW_SECONDS;
use brot_markets::{
    constants::{
        ENTRY_CLOSE_MAX_SECONDS, MAX_DURATION_SECONDS, MIN_DURATION_SECONDS, SECONDS_PER_DAY as DAY,
    },
    error::BrotError,
    math::schedule::{check_duration, entries_close_at},
};

/// A realistic `now`: the publish time of the captured SOL/USD fixture.
const NOW: i64 = 1_791_216_173;
const OK: Result<(), BrotError> = Ok(());
const SHORT: Result<(), BrotError> = Err(BrotError::DurationTooShort);
const LONG: Result<(), BrotError> = Err(BrotError::DurationTooLong);

/// `at + seconds`, checked.
fn after(at: i64, seconds: i64) -> i64 {
    at.checked_add(seconds).unwrap()
}

/// Each `(opens_at, deadline_at, answer)` gets `answer` from `check_duration`; a refused one is
/// also `MathOverflow` from `entries_close_at`, whose caller must have checked it first.
fn check_all(cases: &[(i64, i64, Result<(), BrotError>)]) {
    for &(opens_at, deadline_at, answer) in cases {
        let at = format!("{opens_at} to {deadline_at}");
        assert_eq!(check_duration(opens_at, deadline_at), answer, "{at}");
        if answer.is_err() {
            let close = entries_close_at(opens_at, deadline_at);
            assert_eq!(close, Err(BrotError::MathOverflow), "{at}");
        }
    }
}

/// `tenths` tenths of a day, in seconds.
#[cfg(not(feature = "drill"))]
fn tenths_of_a_day(tenths: i64) -> i64 {
    tenths.checked_mul(DAY / 10).unwrap()
}

/// P1 section 3.6: 3, 7, 14, 30, 60 and 90 days close at day 2.0, 6.0, 13.0, 28.5, 57.0 and 85.5.
#[cfg(not(feature = "drill"))]
#[test]
fn entries_close_at_five_percent_of_the_duration() {
    // In tenths of a day: (duration, entries close this long after opening).
    let rows = [
        (30, 20),
        (70, 60),
        (140, 130),
        (300, 285),
        (600, 570),
        (900, 855),
    ];
    for opens_at in [0, NOW] {
        for (duration, open_for) in rows {
            let deadline_at = after(opens_at, tenths_of_a_day(duration));
            let expected = after(opens_at, tenths_of_a_day(open_for));
            check_all(&[(opens_at, deadline_at, OK)]);
            let close = entries_close_at(opens_at, deadline_at);
            assert_eq!(close, Ok(expected), "{duration} tenths of a day");
        }
    }
}

#[cfg(not(feature = "drill"))]
#[test]
fn durations_from_three_to_ninety_days_both_inclusive() {
    check_all(&[
        (NOW, after(NOW, 3 * DAY - 1), SHORT),
        (NOW, after(NOW, 3 * DAY), OK),
        (NOW, after(NOW, 90 * DAY), OK),
        (NOW, after(NOW, 90 * DAY + 1), LONG),
    ]);
    // The 24-hour floor: a 3-day campaign closes a day early, not 5% (3.6 hours) early.
    let close = entries_close_at(NOW, after(NOW, 3 * DAY));
    assert_eq!(close, Ok(after(NOW, 2 * DAY)));
}

#[test]
fn a_past_or_equal_deadline_is_too_short_never_an_overflow() {
    check_all(&[
        (NOW, NOW, SHORT),
        (NOW, NOW - 1, SHORT),
        (NOW, i64::MIN, SHORT),
        (i64::MAX, i64::MIN, SHORT),
        (i64::MIN, i64::MAX, LONG),
    ]);
}

#[test]
fn the_bounds_of_this_build_are_both_inclusive() {
    // Whichever build runs this, drill or not.
    check_all(&[
        (NOW, after(NOW, MIN_DURATION_SECONDS - 1), SHORT),
        (NOW, after(NOW, MIN_DURATION_SECONDS), OK),
        (NOW, after(NOW, MAX_DURATION_SECONDS), OK),
        (NOW, after(NOW, MAX_DURATION_SECONDS + 1), LONG),
    ]);
}

#[cfg(feature = "drill")]
#[test]
fn drill_campaigns_last_from_fifteen_minutes_and_close_five_minutes_early() {
    assert_eq!(MIN_DURATION_SECONDS, 15 * 60);
    assert_eq!(ENTRY_CLOSE_MIN_SECONDS, 5 * 60);
    check_all(&[
        (NOW, after(NOW, 15 * 60 - 1), SHORT),
        (NOW, after(NOW, 15 * 60), OK),
    ]);
    // (duration, entries close this long after opening). 15 minutes: 5% is 45 s, raised to
    // the 5-minute floor. 3 days: 5% (3.6 hours) is above the drill floor, so day 2.85, not 2.
    // 30 days: 5% is above both floors, so the drill and real builds agree on day 28.5.
    let rows = [
        (15 * 60, 10 * 60),
        (3 * DAY, 3 * DAY - 12_960),
        (30 * DAY, 285 * DAY / 10),
    ];
    for (duration, open_for) in rows {
        let close = entries_close_at(NOW, after(NOW, duration));
        assert_eq!(close, Ok(after(NOW, open_for)), "{duration} s");
    }
}

/// Run by CI on the mainnet build (T12): the real window and minimum duration, never drill.
#[cfg(feature = "mainnet")]
#[test]
fn mainnet_build_carries_the_real_values() {
    assert_eq!(MIN_DURATION_SECONDS, 3 * DAY);
    assert_eq!(REVIEW_WINDOW_SECONDS, 6 * 3_600);
    assert_eq!(ENTRY_CLOSE_MIN_SECONDS, 24 * 3_600);
    assert_eq!(MAX_DURATION_SECONDS, 90 * DAY);
    assert_eq!(ENTRY_CLOSE_MAX_SECONDS, 7 * DAY);
}

#[test]
fn the_entry_close_lead_is_never_above_seven_days() {
    // No accepted duration reaches the cap (90 days × 5% is 4.5 days); it is a ceiling only.
    assert_eq!(ENTRY_CLOSE_MAX_SECONDS, 7 * DAY);
    let close = entries_close_at(NOW, after(NOW, MAX_DURATION_SECONDS));
    let lead = after(NOW, MAX_DURATION_SECONDS).checked_sub(close.unwrap());
    assert_eq!(lead, Some(MAX_DURATION_SECONDS / 20));
}
