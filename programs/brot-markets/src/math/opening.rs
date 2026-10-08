//! Purpose: the price of a paid opening in lamports at the Pyth SOL/USD price, and its split
//!          into the prize and Brot's opening fee (D-b, D-f; TP section 3.4.16; T25).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); signatures frozen at the sprint's opening, bodies by lane C
//!
//! ```text
//! opening_paid_lamports = ceil(opening_usd × 10^(9 − e) ÷ p)          (u128, toward Brot)
//! prize_lamports        = floor(opening_paid_lamports × opening_prize_bps ÷ 10,000)
//! opening_fee_lamports  = opening_paid_lamports − prize_lamports
//! ```
//! Worked example A of the TP: p = 10,927,000,000, e = −8, US$500 → 4,575,821,360 lamports,
//! prize 4,118,239,224, opening fee 457,582,136.
//!
//! [AC] The conversion accepts exponents from `MIN_PRICE_EXPONENT` (−18) to `MAX_PRICE_EXPONENT`
//! (0). SOL/USD is published at −8. Above 0 a price step would be US$10 per SOL or more, too
//! coarse to charge by; below −18 an i64 price cannot express even US$1 per SOL
//! (`i64::MAX × 10^−19` is about 0.92). Inside the range `9 − e` is 9 to 27, so the formula
//! needs only its first case; `ceil(usd ÷ (p × 10^(e − 9)))`, for an exponent above 9, is
//! refused with the rest.

use super::rounding::{bps_floor, div_ceil, to_u64};
use crate::error::BrotError;

/// The lowest Pyth exponent the conversion accepts (see the module note).
pub const MIN_PRICE_EXPONENT: i32 = -18;
/// The highest Pyth exponent the conversion accepts (see the module note).
pub const MAX_PRICE_EXPONENT: i32 = 0;
/// One SOL is 10^9 lamports.
const LAMPORT_DECIMALS: i32 = 9;

/// What a paid opening moves into the vault, all of it, split by bookkeeping (I14).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct OpeningSplit {
    pub paid: u64,
    pub prize: u64,
    pub fee: u64,
}

/// Lamports for `opening_usd` whole US$ at price `price` × 10^`exponent` US$ per SOL, rounded up.
/// `SolUsdPriceNonPositive` when `price ≤ 0`; `PriceExponentOutOfRange` for an exponent the
/// conversion does not support; `MathOverflow` when the result does not fit a u64.
///
/// Checked in that order. A positive `opening_usd` always costs at least one lamport; 0 US$
/// costs 0 lamports (the caller decides whether a zero opening is allowed).
pub fn opening_paid_lamports(
    opening_usd: u64,
    price: i64,
    exponent: i32,
) -> Result<u64, BrotError> {
    if price <= 0 {
        return Err(BrotError::SolUsdPriceNonPositive);
    }
    if !(MIN_PRICE_EXPONENT..=MAX_PRICE_EXPONENT).contains(&exponent) {
        return Err(BrotError::PriceExponentOutOfRange);
    }
    let scale = LAMPORT_DECIMALS
        .checked_sub(exponent)
        .ok_or(BrotError::MathOverflow)?;
    let scale = u32::try_from(scale).map_err(|_| BrotError::MathOverflow)?;
    let factor = 10_u128.checked_pow(scale).ok_or(BrotError::MathOverflow)?;
    // A numerator past u128 means a result past u64 anyway, since p ≤ i64::MAX and
    // u128::MAX ÷ i64::MAX is above u64::MAX: refusing it as an overflow is exact.
    let numerator = u128::from(opening_usd)
        .checked_mul(factor)
        .ok_or(BrotError::MathOverflow)?;
    let price = u128::try_from(price).map_err(|_| BrotError::MathOverflow)?;
    to_u64(div_ceil(numerator, price)?)
}

/// Splits `paid` into the prize (rounded down) and the opening fee (the rest).
///
/// The fee is therefore `ceil(paid × (10,000 − bps) ÷ 10,000)`: the rounding goes to Brot.
/// An `opening_prize_bps` above 10,000 is `MathOverflow`; its floor of 9,000 is the config's rule.
pub fn split_opening(paid: u64, opening_prize_bps: u16) -> Result<OpeningSplit, BrotError> {
    let prize = bps_floor(paid, opening_prize_bps)?;
    let fee = paid.checked_sub(prize).ok_or(BrotError::MathOverflow)?;
    Ok(OpeningSplit { paid, prize, fee })
}
