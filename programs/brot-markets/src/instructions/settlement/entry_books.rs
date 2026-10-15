//! Purpose: S-8 of the audit scope (the third review): in `Refund` and `OneSided`, `settle_entry` checks each entry's
//!          payout against the entry's own amounts before any lamport moves, as `require_within_share` does in
//!          `Split`. The rules restate `math/payout.rs` without its helpers, rounding included, so no payout the
//!          program computes trips them and a regression in the formula does not pass them.
//! Version: 0.0.1
//! Sprint: 16 (lane S8)
//!
//! - `Refund` (`entry_payout`: the entry back whole): no fee, and at most the entry's YES plus its NO
//!   (`RefundPayoutAboveEntry`).
//! - `OneSided` (`one_sided_refund` on the early part, the late parts back whole): the payout plus its fee is the
//!   entry's YES plus its NO exactly, and the fee is `ceil(early × one_sided_fee_bps ÷ 10,000)` on the early part
//!   (YES and NO less their late parts), or zero for the campaign's first baker (`OneSidedPayoutNotExact`). The
//!   ceiling is checked without a division: `fee` is it exactly when `early × bps ≤ fee × 10,000 < early × bps +
//!   10,000`. The first baker is the campaign's stored `first_baker`, not the entry's `is_first` flag the payout reads;
//!   every join sets both at once (`entries/join_core.rs`), so they agree on every entry the program wrote.

use super::rules::{EntryAmounts, EntryPayout, PotRule};
use crate::{constants::BPS_DENOMINATOR, error::BrotError, state::enums::SettleMode};

/// The `Refund` and `OneSided` rules for one entry's payout; `Split` is `require_within_share`'s. `first_baker`:
/// the entry's baker is the campaign's `first_baker`.
pub fn require_entry_books(
    rule: &PotRule,
    entry: &EntryAmounts,
    payout: &EntryPayout,
    first_baker: bool,
) -> Result<(), BrotError> {
    match rule.mode {
        SettleMode::Refund => refund_within_entry(entry, payout),
        SettleMode::OneSided => one_sided_exact(rule.one_sided_fee_bps, entry, payout, first_baker),
        SettleMode::Split | SettleMode::Unset => Ok(()),
    }
}

/// The entry's YES plus its NO, late parts included, in u128.
fn both_sides(entry: &EntryAmounts) -> Result<u128, BrotError> {
    u128::from(entry.yes)
        .checked_add(u128::from(entry.no))
        .ok_or(BrotError::MathOverflow)
}

/// `Refund`: no one-sided fee, and the payout is at most the entry's YES plus its NO.
fn refund_within_entry(entry: &EntryAmounts, payout: &EntryPayout) -> Result<(), BrotError> {
    let entered = both_sides(entry)?;
    // X0.9 refund_within_entry
    if payout.one_sided_fee != 0 || u128::from(payout.amount) > entered {
        return Err(BrotError::RefundPayoutAboveEntry);
    }
    Ok(())
}

/// `OneSided`: `amount + fee = yes + no`, and the fee is the rate's ceiling on the early part, or zero for the first
/// baker.
fn one_sided_exact(
    bps: u16,
    entry: &EntryAmounts,
    payout: &EntryPayout,
    first_baker: bool,
) -> Result<(), BrotError> {
    let entered = both_sides(entry)?;
    let early_yes = entry
        .yes
        .checked_sub(entry.late_yes)
        .ok_or(BrotError::MathOverflow)?;
    let early_no = entry
        .no
        .checked_sub(entry.late_no)
        .ok_or(BrotError::MathOverflow)?;
    let early = u128::from(early_yes)
        .checked_add(u128::from(early_no))
        .ok_or(BrotError::MathOverflow)?;
    let fee = u128::from(payout.one_sided_fee);
    let paid = u128::from(payout.amount)
        .checked_add(fee)
        .ok_or(BrotError::MathOverflow)?;
    let due = early
        .checked_mul(u128::from(bps))
        .ok_or(BrotError::MathOverflow)?;
    let charged = fee
        .checked_mul(u128::from(BPS_DENOMINATOR))
        .ok_or(BrotError::MathOverflow)?;
    let ceiling = due
        .checked_add(u128::from(BPS_DENOMINATOR))
        .ok_or(BrotError::MathOverflow)?;
    let fee_is_the_rate = if first_baker {
        fee == 0
    } else {
        due <= charged && charged < ceiling
    };
    // X0.9 one_sided_exact
    if paid != entered || !fee_is_the_rate {
        return Err(BrotError::OneSidedPayoutNotExact);
    }
    Ok(())
}
