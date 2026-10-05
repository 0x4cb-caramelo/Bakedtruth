//! Purpose: every failure the program can return, one code per cause.
//! Version: 0.0.1
//! Sprint: 00 (setup)

use anchor_lang::prelude::*;

#[error_code]
pub enum BrotError {
    #[msg("Arithmetic overflow")]
    MathOverflow,
}
