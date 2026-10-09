//! Purpose: the price kind's rules: an opening's freshness, confidence and touch checks, the join
//!          lock on the sponsored account, the YES proof and the stale-feed void (TP section
//!          3.4.8; D7).
//! Version: 0.0.5
//! Sprint: 01 (price reader proof); 02 (the opening checks); 03 (the split: join, proof, void)
//!
//! The account is read by `price_update.rs`. Joining accepts only the sponsored account; a YES
//! proof any fully verified account of the feed (proposal section 2.5). Price math is widened to
//! i128 before `price` (i64, may be negative) and `conf` (u64) are combined.

use pinocchio::error::ProgramError;

use super::{CreationContext, CreationReading, ReadContext, Resolution};
use crate::{
    constants::{
        BPS_DENOMINATOR, MAX_PRICE_CLOCK_LEAD_SECONDS, MIN_SLOT_MS, PRICE_CAMPAIGN_MAX_CONF_BPS,
    },
    error::BrotError,
    state::enums::Direction,
};

pub use super::price_update::{
    read_price_account, read_price_update, sponsored_account, PriceReading,
    PRICE_UPDATE_V2_DISCRIMINATOR, PRICE_UPDATE_V2_LEN, PYTH_RECEIVER_ID,
};

/// Rows 2 to 4 (and row 3 at both ends, Sprint 03) for the price kind. Sprint 02's body, kept as
/// it was until lane C extends it: the metric account is the sponsored account of `feed_id`
/// (`MetricAccountMismatch`), reads as a Full update of that feed (the reader's errors), is fresh
/// within `max_age` (`PriceStale`), positive (`PriceNonPositive`), within 0.5% confidence
/// (`PriceConfidenceTooWide`), and price ± confidence has not reached the target in the
/// campaign's direction (`TargetAlreadyTouched`). The address is compared before a byte is read.
pub fn validate_at_creation(ctx: &CreationContext) -> Result<CreationReading, ProgramError> {
    if *ctx.metric.address() != sponsored_account(ctx.feed_id)? {
        return Err(BrotError::MetricAccountMismatch.into());
    }
    let reading = read_price_account(ctx.metric, ctx.feed_id)?;
    let now = ctx.time.unix_timestamp;
    check_fresh_and_tight(&reading, now, ctx.max_age, PRICE_CAMPAIGN_MAX_CONF_BPS).map_err(
        |refusal| match refusal {
            PriceRefusal::Stale => BrotError::PriceStale,
            PriceRefusal::NonPositive => BrotError::PriceNonPositive,
            PriceRefusal::ConfidenceTooWide => BrotError::PriceConfidenceTooWide,
        },
    )?;
    if band_reaches_target(&reading, ctx.direction, ctx.target)? {
        return Err(BrotError::TargetAlreadyTouched.into());
    }
    Ok(CreationReading {
        price_exponent: reading.exponent,
    })
}

/// The join lock (lane C): the sponsored account only, Full, the campaign's feed and exponent,
/// fresh by the campaign's `max_age` (and the clock-lead and slot bounds); true when price ±
/// confidence reaches the target in the campaign's direction.
pub fn outcome_knowable(ctx: &ReadContext) -> Result<bool, ProgramError> {
    let _ = ctx;
    Err(BrotError::ReaderNotReady.into())
}

/// The YES proof, then NO or `StaleFeed` after the deadline's proof window (lane C).
pub fn try_resolve(ctx: &ReadContext) -> Result<Resolution, ProgramError> {
    let _ = ctx;
    Err(BrotError::ReaderNotReady.into())
}

/// Checks a reading for an opening: published at most `max_age` seconds before `now` and at most
/// `MAX_PRICE_CLOCK_LEAD_SECONDS` after it (the clock may lag Pyth's), a positive price, and a
/// confidence of at most `max_conf_bps` of the price. The caller maps the refusals to its own
/// row's errors (row 4 for the campaign's feed, row 7 for SOL/USD), so the three outcomes are
/// distinct. Checked in that order: a stale price is `Stale` whatever its value.
pub fn check_fresh_and_tight(
    reading: &PriceReading,
    now: i64,
    max_age: u32,
    max_conf_bps: u16,
) -> Result<(), PriceRefusal> {
    // In i128 neither a publish time far in the past nor one ahead of the clock can overflow. A
    // publish time ahead of the clock gives a negative age: fresh, because Pyth signs the time and
    // the cluster clock may lag it, but only up to `MAX_PRICE_CLOCK_LEAD_SECONDS`, so a price
    // stamped far ahead by a fault upstream cannot stay fresh for hours.
    let age = i128::from(now)
        .checked_sub(i128::from(reading.publish_time))
        .ok_or(PriceRefusal::Stale)?;
    let lead = i128::from(reading.publish_time)
        .checked_sub(i128::from(now))
        .ok_or(PriceRefusal::Stale)?;
    if age > i128::from(max_age) || lead > i128::from(MAX_PRICE_CLOCK_LEAD_SECONDS) {
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

/// The touch rule: true when the reading's confidence band already reaches `target` in
/// `direction`, that is `price + conf >= target` for `Above` and `price - conf <= target` for
/// `Below`. Row 3 refuses an opening on it, so no campaign is decided at birth; the join lock of
/// Sprint 03 can reuse it. `target` is in the feed's own units (the reading's exponent).
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

/// Why `check_fresh_and_tight` refused a reading.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PriceRefusal {
    Stale,
    NonPositive,
    ConfidenceTooWide,
}
