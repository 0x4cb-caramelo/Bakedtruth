//! Purpose: the in-program assertion of TP section 3.4.13: the vault's lamport change across an
//!          instruction equals the change the bookkeeping makes. A lamport sent by hand to the vault
//!          never refuses a join (it is outside the instruction); a lamport the bookkeeping does not
//!          explain is refused (`InvariantViolated`).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze; called at the end of `user_open_campaign` and `user_join_campaign`)
//!
//! `booked_in` is every lamport the instruction moved into the vault, including the rent it funded
//! when it created the vault; `booked_out` is every lamport it moved out.

use crate::error::BrotError;

/// `vault_after − vault_before == booked_in − booked_out`, in `i128` with checked math.
pub fn vault_change_matches(
    vault_before: u64,
    vault_after: u64,
    booked_in: u64,
    booked_out: u64,
) -> Result<(), BrotError> {
    let change = i128::from(vault_after)
        .checked_sub(i128::from(vault_before))
        .ok_or(BrotError::MathOverflow)?;
    let booked = i128::from(booked_in)
        .checked_sub(i128::from(booked_out))
        .ok_or(BrotError::MathOverflow)?;
    if change == booked {
        Ok(())
    } else {
        Err(BrotError::InvariantViolated)
    }
}
