//! Purpose: the lamport moves of the settlement instructions, and the two reads they share: the
//!          rent of an empty account, from the Rent sysvar (decision 6), and the fee vault's address.
//! Version: 0.0.2 (G-2: each move re-reads both sides after it, `moved_exactly`)
//! Sprint: 04 (lane D). Used by `collect_fee`, `settle_prize`, `close_campaign`, `sweep_fees` and
//!         `settle_sealed_fee`; `moved_exactly` also by `pay_from_vault`. 16 (lane L16P, the audit package's G-2).
//!
//! A program-owned account gives lamports by a plain balance edit; the sum of the two sides is
//! unchanged, so the runtime's balance check holds. Each side is checked before any is written, and
//! read again after both are: the instruction-level assertion against the books is `VaultWatch`
//! (`settlement/bookkeeping.rs`).

use pinocchio::{
    error::ProgramError,
    sysvars::{rent::Rent, Sysvar},
    AccountView, Address, ProgramResult,
};

use crate::{checks, constants::FEE_VAULT_SEED, error::BrotError};

/// Moves `amount` from `from` to `to`, refusing (`InvariantViolated`) when `from` holds less. Zero moves
/// nothing and touches neither account. Both sides are read again after the move (`moved_exactly`).
pub fn move_lamports(from: &mut AccountView, to: &mut AccountView, amount: u64) -> ProgramResult {
    if amount == 0 {
        return Ok(());
    }
    let left = from
        .lamports()
        .checked_sub(amount)
        .ok_or(BrotError::InvariantViolated)?;
    let arrived = to
        .lamports()
        .checked_add(amount)
        .ok_or(BrotError::MathOverflow)?;
    from.set_lamports(left);
    to.set_lamports(arrived);
    moved_exactly(from, left, to, arrived)
}

/// After a move, each side holds what the move wrote: `from` exactly `amount` less, `to` exactly `amount` more
/// (`InvariantViolated` otherwise). The values are read from the accounts again, so the same account on both sides,
/// which would end with the credit and not the debit (lamports out of nothing), is refused here, before the
/// runtime's own balance check.
pub fn moved_exactly(
    from: &AccountView,
    left: u64,
    to: &AccountView,
    arrived: u64,
) -> ProgramResult {
    let held = (from.lamports(), to.lamports());
    // X0.9 move_both_sides
    checks::require(held == (left, arrived), BrotError::InvariantViolated)
}

/// The rent-exempt minimum of an account with no data, read from the Rent sysvar.
pub fn empty_rent() -> Result<u64, ProgramError> {
    Rent::get()?.try_minimum_balance(0)
}

/// The fee vault is the program's `["fee_vault"]` PDA at its canonical bump (`PdaMismatch` otherwise).
/// Used where no config is passed (`close_campaign`); the config's stored bump is checked elsewhere.
pub fn fee_vault_is_canonical(fee_vault: &AccountView, program_id: &Address) -> ProgramResult {
    checks::owned_by(fee_vault, program_id)?;
    checks::canonical_pda(fee_vault, &[FEE_VAULT_SEED], program_id).map(|_| ())
}
