//! Purpose: the moves and counters every settlement instruction shares: the event sequence number, the
//!          lamport move out of the vault, the credit of lamports that are not from the vault (an Entry's rent,
//!          back to its baker), and the in-program assertion of TP section 3.4.13 against the books: the vault's
//!          lamport change across a paying instruction equals the change its books make, within the snapshot's cap
//!          (`VaultWatch`), and at close the vault covers what the books still hold (`books_held`,
//!          `require_books_covered`).
//! Version: 0.0.3 (the review's F4: the payout cap in the watch; F5: close takes its rent above the books)
//! Sprint: 04 (lane C); 16 (lane L16P, the audit package's G-2 and the review's F4, F5)
//!
//! Callers run `checks::paying_vault` before `pay_from_vault`, and the stored-key checks before anything here.
//! The books are the campaign's fields, never the vault's balance (I15): what went in (`booked_in`) and what has
//! gone out (`booked_out`). The watch compares changes, not levels, so SOL sent to the vault by hand never refuses
//! a payout (Sprint 04 DoD); close compares a level, with the hand-sent SOL on the side it may only add to.

use pinocchio::{AccountView, ProgramResult};

use super::{
    collect_fee::{amount, moves::moved_exactly},
    payout_cap::require_within_snapshot,
};
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
/// amount moves nothing. The vault must hold it (`PayoutExceedsSnapshot`), and both sides are read again
/// after the move (`moved_exactly`, `InvariantViolated`). The books are the caller's `VaultWatch`.
pub fn pay_from_vault(vault: &mut AccountView, to: &mut AccountView, amount: u64) -> ProgramResult {
    if amount == 0 {
        return Ok(());
    }
    let vault_after = vault
        .lamports()
        .checked_sub(amount)
        .ok_or(BrotError::PayoutExceedsSnapshot)?;
    let to_after = to
        .lamports()
        .checked_add(amount)
        .ok_or(BrotError::MathOverflow)?;
    vault.set_lamports(vault_after);
    to.set_lamports(to_after);
    moved_exactly(vault, vault_after, to, to_after)
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

/// What the books put into the campaign's vault: both pools (their late parts included), the prize and the held
/// opening fee (I1). The rent and SOL sent by hand are not in the books.
pub fn booked_in(c: &Campaign) -> Result<u64, BrotError> {
    [
        c.pool_no.get(),
        c.prize_lamports.get(),
        c.opening_fee_lamports.get(),
    ]
    .iter()
    .try_fold(c.pool_yes.get(), |sum, &part| sum.checked_add(part))
    .ok_or(BrotError::MathOverflow)
}

/// What the books say has left the campaign's vault: the payouts (`paid_out_total`: the entries with their late
/// parts, the creator share, a claimed reserve), what `collect_fee` moved once `fee_collected` is set
/// (`amount::kept`), and what `settle_prize` moved once `prize_settled` is set (`amount::prize_return`). A reserved
/// creator share is still in the vault.
pub fn booked_out(c: &Campaign) -> Result<u64, BrotError> {
    let fee = if c.fee_collected != 0 {
        amount::kept(c)?.amount
    } else {
        0
    };
    let prize = if c.prize_settled != 0 {
        let back = amount::prize_return(c)?;
        back.prize
            .checked_add(back.opening)
            .ok_or(BrotError::MathOverflow)?
    } else {
        0
    };
    c.paid_out_total
        .get()
        .checked_add(fee)
        .and_then(|sum| sum.checked_add(prize))
        .ok_or(BrotError::MathOverflow)
}

/// The vault's balance and the books' total out of it, taken before a paying instruction's first write (G-2).
pub struct VaultWatch {
    lamports: u64,
    booked_out: u64,
}

impl VaultWatch {
    pub fn start(vault: &AccountView, campaign: &Campaign) -> Result<Self, BrotError> {
        Ok(Self {
            lamports: vault.lamports(),
            booked_out: booked_out(campaign)?,
        })
    }

    /// At the instruction's end: the payouts are within the snapshot's cap (`require_within_snapshot`,
    /// `PaidOutAboveSnapshot`), and the vault's lamport change since `start` equals the change of `booked_out` (TP
    /// section 3.4.13, as `user_join_campaign` asserts its deposit). A move the books do not record, a record the
    /// vault did not follow, or the books going backwards is `InvariantViolated`.
    pub fn check(&self, vault: &AccountView, campaign: &Campaign) -> Result<(), BrotError> {
        require_within_snapshot(campaign)?;
        let out = booked_out(campaign)?
            .checked_sub(self.booked_out)
            .ok_or(BrotError::InvariantViolated)?;
        // X0.9 vault_booked_change
        vault_change_matches(self.lamports, vault.lamports(), 0, out)
    }
}

/// What the books still hold in the campaign's vault, `booked_in − booked_out`: at close, the split's dust and a
/// reserved creator share. Books that paid out more than they took in are `InvariantViolated`.
pub fn books_held(c: &Campaign) -> Result<u64, BrotError> {
    booked_in(c)?
        .checked_sub(booked_out(c)?)
        .ok_or(BrotError::InvariantViolated)
}

/// At close, before any move (I15 there, G-2): the vault's lamports cover what the books still hold
/// (`books_held`), and the reserve close pays to the rent payer is part of it. The rent comes back from what lies
/// above the books only (`close_campaign`, the review's F5): a rent-exempt minimum that rose since the opening never
/// blocks the close nor takes what the books owe. `InvariantViolated` when the vault holds less than the books still
/// owe, or when the reserve is not inside them.
pub fn require_books_covered(vault: u64, held: u64, reserved: u64) -> Result<(), BrotError> {
    // X0.9 close_books_covered
    if vault < held || reserved > held {
        return Err(BrotError::InvariantViolated);
    }
    Ok(())
}
