//! Purpose: the moves and counters every settlement instruction shares: the event sequence number, the
//!          lamport move out of the vault (checked against I1 by `math::invariant`), and the credit of
//!          lamports that are not from the vault (an Entry's rent, back to its baker).
//! Version: 0.0.1
//! Sprint: 04 (lane C)
//!
//! Callers run `checks::paying_vault` before `pay_from_vault`, and the stored-key checks before anything here.

use pinocchio::{AccountView, ProgramResult};

use crate::{
    error::BrotError, layout::LeU64, math::invariant::vault_change_matches,
    state::campaign::Campaign,
};

/// Takes the campaign's next event sequence number (the one the event carries) and advances it.
pub fn take_seq(campaign: &mut Campaign) -> Result<u64, BrotError> {
    let seq = campaign.event_seq.get();
    let next = seq.checked_add(1).ok_or(BrotError::MathOverflow)?;
    campaign.event_seq.set(next);
    Ok(seq)
}

/// Moves `amount` from the vault to `to` by balance edit (the vault is owned by this program). A zero
/// amount moves nothing. The vault must hold it (`PayoutExceedsSnapshot`), and the change must equal what
/// was booked out (`InvariantViolated`).
pub fn pay_from_vault(vault: &mut AccountView, to: &mut AccountView, amount: u64) -> ProgramResult {
    if amount == 0 {
        return Ok(());
    }
    let vault_before = vault.lamports();
    let vault_after = vault_before
        .checked_sub(amount)
        .ok_or(BrotError::PayoutExceedsSnapshot)?;
    let to_after = to
        .lamports()
        .checked_add(amount)
        .ok_or(BrotError::MathOverflow)?;
    vault.set_lamports(vault_after);
    to.set_lamports(to_after);
    vault_change_matches(vault_before, vault_after, 0, amount)?;
    Ok(())
}

/// Credits lamports that come from an account this program owns but not from the vault (an `Entry`'s rent).
pub fn credit(to: &mut AccountView, lamports: u64) -> ProgramResult {
    let after = to
        .lamports()
        .checked_add(lamports)
        .ok_or(BrotError::MathOverflow)?;
    to.set_lamports(after);
    Ok(())
}

/// `field += delta`, checked (`MathOverflow`).
pub fn bump(field: &mut LeU64, delta: u64) -> Result<(), BrotError> {
    let next = field
        .get()
        .checked_add(delta)
        .ok_or(BrotError::MathOverflow)?;
    field.set(next);
    Ok(())
}
