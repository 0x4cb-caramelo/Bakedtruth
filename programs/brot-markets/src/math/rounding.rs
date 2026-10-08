//! Purpose: the multiply-divide and basis-point shares every money formula uses, rounded down
//!          or up in u128 with checked math: the one place a rounding direction is written.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio), lane C
//!
//! A product of two u64 always fits a u128, so the only overflow left in a multiply-divide is
//! the narrowing back to u64. A share above 100% (`bps > 10,000`) and a zero divisor are refused
//! with `MathOverflow`, like every other failure of the math.

use crate::{constants::BPS_DENOMINATOR, error::BrotError};

/// `bps` as a u128 factor; above 10,000 (100%) it is refused.
pub fn checked_bps(bps: u16) -> Result<u128, BrotError> {
    let bps = u128::from(bps);
    if bps > u128::from(BPS_DENOMINATOR) {
        return Err(BrotError::MathOverflow);
    }
    Ok(bps)
}

/// Narrows a u128 to the u64 every amount is stored as.
pub fn to_u64(value: u128) -> Result<u64, BrotError> {
    u64::try_from(value).map_err(|_| BrotError::MathOverflow)
}

/// `floor(numerator ÷ divisor)`.
pub fn div_floor(numerator: u128, divisor: u128) -> Result<u128, BrotError> {
    numerator
        .checked_div(divisor)
        .ok_or(BrotError::MathOverflow)
}

/// `ceil(numerator ÷ divisor)`, from the quotient and the remainder, so there is no
/// `numerator + divisor − 1` to overflow.
pub fn div_ceil(numerator: u128, divisor: u128) -> Result<u128, BrotError> {
    let quotient = div_floor(numerator, divisor)?;
    let remainder = numerator
        .checked_rem(divisor)
        .ok_or(BrotError::MathOverflow)?;
    if remainder == 0 {
        Ok(quotient)
    } else {
        quotient.checked_add(1).ok_or(BrotError::MathOverflow)
    }
}

/// `floor(a × b ÷ divisor)`: a payout, rounded down.
pub fn mul_div_floor(a: u64, b: u64, divisor: u64) -> Result<u64, BrotError> {
    let product = u128::from(a)
        .checked_mul(u128::from(b))
        .ok_or(BrotError::MathOverflow)?;
    to_u64(div_floor(product, u128::from(divisor))?)
}

/// `floor(amount × bps ÷ 10,000)` on a u128 base, for bases that add two u64 (`V + P`).
pub fn bps_floor_wide(amount: u128, bps: u16) -> Result<u128, BrotError> {
    let product = amount
        .checked_mul(checked_bps(bps)?)
        .ok_or(BrotError::MathOverflow)?;
    div_floor(product, u128::from(BPS_DENOMINATOR))
}

/// `floor(amount × bps ÷ 10,000)`: a share that is paid out, rounded down. Never above `amount`.
pub fn bps_floor(amount: u64, bps: u16) -> Result<u64, BrotError> {
    to_u64(bps_floor_wide(u128::from(amount), bps)?)
}

/// `ceil(amount × bps ÷ 10,000)`: a fee, rounded up. Never above `amount`.
pub fn bps_ceil(amount: u64, bps: u16) -> Result<u64, BrotError> {
    let product = u128::from(amount)
        .checked_mul(checked_bps(bps)?)
        .ok_or(BrotError::MathOverflow)?;
    to_u64(div_ceil(product, u128::from(BPS_DENOMINATOR))?)
}
