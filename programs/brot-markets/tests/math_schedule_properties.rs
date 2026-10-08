//! Purpose: the schedule math over random durations, under whichever build runs it (drill or
//!          not): where entries close, that it is monotonic, and that both functions refuse alike.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane C

mod common;

use brot_markets::{
    constants::{
        ENTRY_CLOSE_MAX_SECONDS, ENTRY_CLOSE_MIN_SECONDS, MAX_DURATION_SECONDS,
        MIN_DURATION_SECONDS,
    },
    error::BrotError,
    math::schedule::{check_duration, entries_close_at},
};
use common::{Rng, CASES};

/// The duration at which 5% reaches the entry-close floor: the clamp's lower kink.
const KINK: i64 = 20 * ENTRY_CLOSE_MIN_SECONDS;

/// `at + seconds`, checked.
fn after(at: i64, seconds: i64) -> i64 {
    at.checked_add(seconds).unwrap()
}

/// A duration the build accepts, often at an edge or near the clamp's kink.
fn accepted_duration(rng: &mut Rng) -> i64 {
    let duration = match rng.below(6) {
        0 => MIN_DURATION_SECONDS,
        1 => MAX_DURATION_SECONDS,
        2 => rng.between_i64(KINK - 40, KINK + 40),
        _ => rng.between_i64(MIN_DURATION_SECONDS, MAX_DURATION_SECONDS),
    };
    duration.clamp(MIN_DURATION_SECONDS, MAX_DURATION_SECONDS)
}

#[test]
fn every_accepted_duration_closes_inside_the_campaign_at_the_clamped_five_percent() {
    let seed = 0xB407_5C4E_0000_0001;
    let mut rng = Rng::new(seed);
    for case in 0..CASES {
        let opens_at = rng.between_i64(0, 1 << 40);
        let duration = accepted_duration(&mut rng);
        let deadline_at = after(opens_at, duration);
        let at = format!("seed {seed:#x} case {case}: {duration} s from {opens_at}");
        let close = entries_close_at(opens_at, deadline_at).expect(&at);
        assert!(opens_at < close && close < deadline_at, "{at}");
        // An independent oracle: 5% is exactly one twentieth.
        let twentieth = duration.checked_div(20).unwrap();
        let lead = twentieth.clamp(ENTRY_CLOSE_MIN_SECONDS, ENTRY_CLOSE_MAX_SECONDS);
        assert_eq!(Some(close), deadline_at.checked_sub(lead), "{at}");
        // A later deadline never closes entries earlier.
        let longer = rng.between_i64(duration, MAX_DURATION_SECONDS);
        let later = entries_close_at(opens_at, after(opens_at, longer)).expect(&at);
        assert!(later >= close, "{at}, then {longer} s");
    }
}

#[test]
fn every_refused_duration_is_refused_by_both_functions() {
    let seed = 0xB407_5C4E_0000_0002;
    let mut rng = Rng::new(seed);
    for case in 0..CASES {
        let opens_at = rng.between_i64(0, 1 << 40);
        let (duration, expected) = if rng.one_in(2) {
            let short = rng.between_i64(-(1 << 40), MIN_DURATION_SECONDS - 1);
            (short, BrotError::DurationTooShort)
        } else {
            let long = rng.between_i64(MAX_DURATION_SECONDS + 1, 1 << 40);
            (long, BrotError::DurationTooLong)
        };
        let deadline_at = after(opens_at, duration);
        let at = format!("seed {seed:#x} case {case}: {duration} s from {opens_at}");
        assert_eq!(check_duration(opens_at, deadline_at), Err(expected), "{at}");
        let close = entries_close_at(opens_at, deadline_at);
        assert_eq!(close, Err(BrotError::MathOverflow), "{at}");
    }
}
