//! Purpose: the price rules the opening, the join lock and the YES proof share: freshness by time
//!          and by slot, the confidence bound, and the two touch tests (the confidence band
//!          reaching the target, and the whole band past it).
//! Version: 0.0.6
//! Sprint: 01 (price reader proof); 02 (the opening checks, in `price_touch.rs`); 03 (the slot
//!         bound, the shared time bound and the crossing test, moved here by lane C)
//!
//! `price` (i64, may be negative) and `conf` (u64) are widened to i128 before they are combined,
//! and times are compared in i128, so no field of a reading can overflow a rule. Every function
//! returns an answer or a refusal for any reading, and none of them refuses a good price.

use super::PriceReading;
use crate::{
    constants::{BPS_DENOMINATOR, MAX_PRICE_CLOCK_LEAD_SECONDS, MIN_SLOT_MS},
    error::BrotError,
    state::enums::Direction,
};

/// Checks a reading for an opening: published at most `max_age` seconds before `now` and at most
/// `MAX_PRICE_CLOCK_LEAD_SECONDS` after it (`published_within`), a positive price, and a
/// confidence of at most `max_conf_bps` of the price. The caller maps the refusals to its own
/// row's errors (row 4 for the campaign's feed, row 7 for SOL/USD), so the three outcomes are
/// distinct. Checked in that order: a stale price is `Stale` whatever its value.
pub fn check_fresh_and_tight(
    reading: &PriceReading,
    now: i64,
    max_age: u32,
    max_conf_bps: u16,
) -> Result<(), PriceRefusal> {
    if !published_within(reading, now, max_age) {
        return Err(PriceRefusal::Stale);
    }
    let price = u128::try_from(reading.price)
        .ok()
        .filter(|price| *price > 0)
        .ok_or(PriceRefusal::NonPositive)?;
    // conf / price <= max_conf_bps / 10,000, cross-multiplied: no rounding at the bound.
    let width = u128::from(reading.conf)
        .checked_mul(u128::from(BPS_DENOMINATOR))
        .ok_or(PriceRefusal::ConfidenceTooWide)?;
    let bound = price
        .checked_mul(u128::from(max_conf_bps))
        .ok_or(PriceRefusal::ConfidenceTooWide)?;
    if width > bound {
        return Err(PriceRefusal::ConfidenceTooWide);
    }
    Ok(())
}

/// The time bound, shared by the opening, the join and the proof: the reading was published at
/// most `max_age` seconds before `now` and at most `MAX_PRICE_CLOCK_LEAD_SECONDS` after it. A
/// publish time ahead of the clock is fresh, because Pyth signs the time and the cluster clock may
/// lag it, but only up to the lead bound, so a price stamped far ahead by a fault upstream cannot
/// stay fresh for hours. In i128 neither a publish time far in the past nor one far ahead of the
/// clock can overflow.
pub fn published_within(reading: &PriceReading, now: i64, max_age: u32) -> bool {
    let (now, published) = (i128::from(now), i128::from(reading.publish_time));
    let (Some(age), Some(lead)) = (now.checked_sub(published), published.checked_sub(now)) else {
        return false;
    };
    age <= i128::from(max_age) && lead <= i128::from(MAX_PRICE_CLOCK_LEAD_SECONDS)
}

/// The slot bound (Sprint 03 [AC]): the reading was posted at most `ceil(age_seconds × 1,000 /
/// MIN_SLOT_MS)` slots before `slot`, a backstop to the time rules against a lagging cluster
/// clock. A posted slot ahead of `slot`, which no cluster writes, counts as posted now. Frozen at
/// the sprint's opening: the opening (SOL/USD), the join and the proof all call it.
pub fn posted_within(reading: &PriceReading, slot: u64, age_seconds: u32) -> bool {
    let lag = slot.saturating_sub(reading.posted_slot);
    let bound = u64::from(age_seconds)
        .saturating_mul(1_000)
        .div_ceil(MIN_SLOT_MS);
    lag <= bound
}

/// The touch rule: true when the reading's confidence band already reaches `target` in
/// `direction`, that is `price + conf >= target` for `Above` and `price - conf <= target` for
/// `Below`. Row 3 refuses an opening on it, so no campaign is decided at birth, and the join lock
/// locks entries on it. `target` is in the feed's own units (the reading's exponent).
pub fn band_reaches_target(
    reading: &PriceReading,
    direction: Direction,
    target: i128,
) -> Result<bool, BrotError> {
    // Widened from i64 and u64, so neither edge of the band can overflow an i128.
    let price = i128::from(reading.price);
    let conf = i128::from(reading.conf);
    Ok(match direction {
        Direction::Above => price.checked_add(conf).ok_or(BrotError::MathOverflow)? >= target,
        Direction::Below => price.checked_sub(conf).ok_or(BrotError::MathOverflow)? <= target,
    })
}

/// The proof rule: true when the whole confidence band is past `target` in `direction`, that is
/// `price - conf >= target` for `Above` and `price + conf <= target` for `Below`. Stricter than
/// the touch rule on purpose: a YES needs the price certainly across the target, while the join
/// lock needs only that it may be. Exactly on the target counts as across.
pub fn band_crosses_target(
    reading: &PriceReading,
    direction: Direction,
    target: i128,
) -> Result<bool, BrotError> {
    let price = i128::from(reading.price);
    let conf = i128::from(reading.conf);
    Ok(match direction {
        Direction::Above => price.checked_sub(conf).ok_or(BrotError::MathOverflow)? >= target,
        Direction::Below => price.checked_add(conf).ok_or(BrotError::MathOverflow)? <= target,
    })
}

/// Why `check_fresh_and_tight` refused a reading.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PriceRefusal {
    Stale,
    NonPositive,
    ConfidenceTooWide,
}
