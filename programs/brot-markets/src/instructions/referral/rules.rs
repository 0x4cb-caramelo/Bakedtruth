//! Purpose: the one rule of a referral link: the referrer is a wallet, never the zero address and
//!          never the referee itself (`InvalidReferrer`). Hygiene only, not a lock: a second wallet
//!          of the referee still passes, the accepted risk of P1 section 3.9.
//! Version: 0.0.1
//! Sprint: 14 (referral), lane L14A
//!
//! Each refusal follows an `// X0.9 <name>` line, as in `checks.rs`: `scripts/checks-mutation.mjs`
//! returns early right after it and shows the refusal's own tests fail without it.

use pinocchio::{Address, ProgramResult};

use crate::{checks::require, error::BrotError, instructions::admin::shared::is_zero};

/// The referrer the referee named is neither the zero address nor the referee (`InvalidReferrer`).
pub fn require_referrer(referrer: &Address, referee: &Address) -> ProgramResult {
    // X0.9 referrer_not_zero
    require(!is_zero(referrer), BrotError::InvalidReferrer)?;
    // X0.9 referrer_not_referee
    require(referrer != referee, BrotError::InvalidReferrer)
}
