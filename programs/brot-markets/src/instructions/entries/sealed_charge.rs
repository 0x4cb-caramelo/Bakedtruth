//! Purpose: what a sealed entry costs (Sprint 15, founder answer of 2026-10-13): its US$ at the
//!          sponsored Pyth SOL/USD price, charged exactly as a paid opening is (row 7 of TP section
//!          3.4.10, `open_campaign/payment.rs`, reused as it is), at least the config's
//!          `opening_fee_usd` (the US$500 floor) and at most the signed `max_lamports`, split by the
//!          config's `opening_prize_bps`: the prize part is the entry, the fee part is held.
//! Version: 0.0.2
//! Sprint: 15 (lane L15); the creation rules bound as an opening binds them (red team L2)
//!
//! The sponsor signs the version of the creation rules it previewed (`expected_params_version`): the
//! split, the floor and the price rules change only with that version, so an admin change between
//! the preview and the landing refuses the entry (`CreationParamsChanged`) instead of charging it a
//! larger fee. Then row 7's two refusals that name the opening get the sealed entry's own codes: `OpeningUsdBelowFee`
//! becomes `SealedEntryBelowFloor` (a zero entry included: a sealed entry is never free) and
//! `OpeningAboveMaxLamports` becomes `SealedEntryAboveMaxLamports`. Every refusal of the SOL/USD
//! account keeps its row 7 code, so the error still names the account at fault.

use pinocchio::{error::ProgramError, AccountView, ProgramResult};

use crate::{
    checks,
    error::BrotError,
    instructions::campaigns::open_campaign::payment::{charge, Payment},
    readers::ChainTime,
    state::config::CreationParams,
};

/// The creation rules the sponsor previewed are the config's (`CreationParamsChanged`), checked as
/// `open_campaign/rules.rs` checks an opening's.
pub fn require_terms(expected: u32, current: u32) -> ProgramResult {
    // X0.9 sealed_terms
    checks::require(expected == current, BrotError::CreationParamsChanged)
}

/// The sealed entry's charge: row 7 for a wallet that is not a team key, so a US$ of zero is refused
/// too, with the floor and the bound renamed. Never inlined: the price read keeps its own frame.
#[inline(never)]
pub fn sealed_charge(
    params: &CreationParams,
    entry_usd: u64,
    max_lamports: u64,
    sol_usd_price: &AccountView,
    time: &ChainTime,
) -> Result<Payment, ProgramError> {
    charge(params, false, entry_usd, max_lamports, sol_usd_price, time).map_err(renamed)
}

/// Row 7's refusal as the sealed entry names it; any other refusal passes unchanged.
fn renamed(error: ProgramError) -> ProgramError {
    match below_floor(&error).and_then(|()| above_max(&error)) {
        Err(sealed) => sealed,
        Ok(()) => error,
    }
}

/// Row 7 refused the US$: below the config's `opening_fee_usd`, or zero (`SealedEntryBelowFloor`).
fn below_floor(error: &ProgramError) -> ProgramResult {
    let opening = ProgramError::from(BrotError::OpeningUsdBelowFee);
    // X0.9 sealed_floor
    checks::require(*error != opening, BrotError::SealedEntryBelowFloor)
}

/// Row 7 refused the lamports: more than the signed `max_lamports` at the SOL/USD price
/// (`SealedEntryAboveMaxLamports`).
fn above_max(error: &ProgramError) -> ProgramResult {
    let opening = ProgramError::from(BrotError::OpeningAboveMaxLamports);
    // X0.9 sealed_max_lamports
    checks::require(*error != opening, BrotError::SealedEntryAboveMaxLamports)
}
