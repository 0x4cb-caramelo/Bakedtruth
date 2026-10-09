//! Purpose: row 3 of TP section 3.4.10 for a price campaign, at both ends: the target is not
//!          touched at opening, sits at least the minimum distance past the edge of the confidence
//!          band, and is within `PRICE_TARGET_MAX_RATIO` of the price, never at or below zero.
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane C
//!
//! Until Sprint 03 only the near end was checked, so a `Below` target of 1 opened: a campaign no
//! realistic move decides, whose pot could only go to NO. The far end ([AC], C45) keeps a target
//! within a tenfold move of the price; the near end keeps it 1% (`MIN_DISTANCE_BPS_PRICE`) past
//! the band. All math is in i128 with checked operations. The reading has passed row 4 when the
//! opening calls this, but nothing here relies on it: any reading gives an answer or a refusal.

use pinocchio::error::ProgramError;

use super::{band_reaches_target, PriceReading};
use crate::{
    constants::{MIN_DISTANCE_BPS_PRICE, PRICE_TARGET_MAX_RATIO},
    error::BrotError,
    readers::min_distance,
    state::enums::Direction,
};

/// Row 3 for a price campaign, with `d = min_distance(price, MIN_DISTANCE_BPS_PRICE)` (1% of the
/// price, rounded up, at least one unit) and `R = PRICE_TARGET_MAX_RATIO` (10), in this order:
///
/// - `Above`: `TargetAlreadyTouched` when `target <= price + conf`; `TargetTooClose` when
///   `target < price + conf + d`; `TargetUnreachable` when `target > price × R`.
/// - `Below`: `TargetUnreachable` when `target <= 0` or `target < ceil(price / R)`;
///   `TargetAlreadyTouched` when `target >= price - conf`; `TargetTooClose` when
///   `target > price - conf - d`.
///
/// Each bound itself opens. The far bound of `Below` is rounded up, so a target on it is a fall
/// of at most R times, as the far bound of `Above` is a rise of at most R times.
pub fn check_target(
    reading: &PriceReading,
    direction: Direction,
    target: i128,
) -> Result<(), ProgramError> {
    let price = i128::from(reading.price);
    let conf = i128::from(reading.conf);
    let distance = min_distance(price, MIN_DISTANCE_BPS_PRICE)?;
    let touched = band_reaches_target(reading, direction, target)?;
    match direction {
        Direction::Above => {
            refuse_if(touched, BrotError::TargetAlreadyTouched)?;
            let nearest = price
                .checked_add(conf)
                .and_then(|edge| edge.checked_add(distance))
                .ok_or(BrotError::MathOverflow)?;
            refuse_if(target < nearest, BrotError::TargetTooClose)?;
            let farthest = price
                .checked_mul(PRICE_TARGET_MAX_RATIO)
                .ok_or(BrotError::MathOverflow)?;
            refuse_if(target > farthest, BrotError::TargetUnreachable)
        }
        Direction::Below => {
            refuse_if(target <= 0, BrotError::TargetUnreachable)?;
            let farthest = ceil_div(price, PRICE_TARGET_MAX_RATIO)?;
            refuse_if(target < farthest, BrotError::TargetUnreachable)?;
            refuse_if(touched, BrotError::TargetAlreadyTouched)?;
            let nearest = price
                .checked_sub(conf)
                .and_then(|edge| edge.checked_sub(distance))
                .ok_or(BrotError::MathOverflow)?;
            refuse_if(target > nearest, BrotError::TargetTooClose)
        }
    }
}

fn refuse_if(refused: bool, error: BrotError) -> Result<(), ProgramError> {
    if refused {
        Err(error.into())
    } else {
        Ok(())
    }
}

/// `ceil(value / divisor)` for a positive `divisor`. `checked_div` truncates toward zero, which
/// is already the ceiling of a negative quotient; a positive remainder rounds a positive one up.
fn ceil_div(value: i128, divisor: i128) -> Result<i128, BrotError> {
    let quotient = value.checked_div(divisor).ok_or(BrotError::MathOverflow)?;
    let remainder = value.checked_rem(divisor).ok_or(BrotError::MathOverflow)?;
    if remainder > 0 {
        quotient.checked_add(1).ok_or(BrotError::MathOverflow)
    } else {
        Ok(quotient)
    }
}
