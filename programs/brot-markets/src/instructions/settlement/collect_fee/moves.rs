//! Purpose: the lamport moves of the settlement instructions, and the two reads they share: the
//!          rent of an empty account, from the Rent sysvar (decision 6), and the fee vault's address.
//! Version: 0.0.1
//! Sprint: 04 (lane D). Used by `collect_fee`, `settle_prize`, `close_campaign` and `sweep_fees`.
//!
//! A program-owned account gives lamports by a plain balance edit; the sum of the two sides is
//! unchanged, so the runtime's balance check holds. Each side is checked before any is written.

use pinocchio::{
    error::ProgramError,
    sysvars::{rent::Rent, Sysvar},
    AccountView, Address, ProgramResult,
};

use crate::{checks, constants::FEE_VAULT_SEED, error::BrotError};

/// Moves `amount` from `from` to `to`, refusing (`InvariantViolated`) when `from` holds less. Zero moves
/// nothing and touches neither account.
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
    Ok(())
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
