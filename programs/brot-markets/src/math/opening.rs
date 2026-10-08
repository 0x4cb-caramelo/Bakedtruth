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

use crate::error::BrotError;

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
pub fn opening_paid_lamports(
    opening_usd: u64,
    price: i64,
    exponent: i32,
) -> Result<u64, BrotError> {
    let _ = (opening_usd, price, exponent);
    todo!("Sprint 02 lane C")
}

/// Splits `paid` into the prize (rounded down) and the opening fee (the rest).
pub fn split_opening(paid: u64, opening_prize_bps: u16) -> Result<OpeningSplit, BrotError> {
    let _ = (paid, opening_prize_bps);
    todo!("Sprint 02 lane C")
}
