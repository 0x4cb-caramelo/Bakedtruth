//! Purpose: every failure the program can return, one code per cause.
//! Version: 0.0.1
//! Sprint: 00 (setup); reader errors added in 01

use anchor_lang::prelude::*;

#[error_code]
pub enum BrotError {
    #[msg("Arithmetic overflow")]
    MathOverflow,
    #[msg("Account is not owned by the program this reader trusts")]
    ReaderWrongOwner,
    #[msg("Account data does not match the layout this reader expects")]
    ReaderBadLayout,
    #[msg("Price update was not fully verified by the Pyth receiver")]
    PriceNotFullyVerified,
    #[msg("Price update is for another feed than the one expected")]
    PriceWrongFeed,
}
