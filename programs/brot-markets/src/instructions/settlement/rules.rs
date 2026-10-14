//! Purpose: the settlement rules as pure functions: what one entry is paid under the snapshot's mode, the check
//!          that a `Split` payout stays within the entry's exact share, and the reserve path of a credit below rent
//!          (TP section 3.4.5; amendment 2026-10-09). No account is read here; the instructions call these and host
//!          tests check them.
//! Version: 0.0.2 (the second pre-freeze review's R1: `require_within_share`)
//! Sprint: 04 (lane C); 16 (lane L16P)

use crate::{
    error::BrotError,
    math::{payout::one_sided_refund, payout::split_payout},
    state::enums::{SettleMode, Side},
};

/// The part of a snapshot an entry is paid from.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PotRule {
    pub mode: SettleMode,
    /// The side that wins in `Split` (ignored in the other modes).
    pub winning: Side,
    /// `V`, the winning side without its late entries.
    pub winning_total: u64,
    pub distributable: u64,
    pub one_sided_fee_bps: u16,
}

/// One baker's entry: both sides, and the late part of each (tallied before settlement).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct EntryAmounts {
    pub yes: u64,
    pub no: u64,
    pub late_yes: u64,
    pub late_no: u64,
}

/// What one entry is paid, and the one-sided fee Brot keeps on it (recorded in the campaign).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct EntryPayout {
    pub amount: u64,
    pub one_sided_fee: u64,
}

/// The early part of one side: the side's amount less its late part.
fn early(total: u64, late: u64) -> Result<u64, BrotError> {
    total.checked_sub(late).ok_or(BrotError::MathOverflow)
}

/// The late parts come back whole in every mode (I11, question 7). Then:
/// - `Refund`: the entry back whole.
/// - `OneSided`: the early part less the one-sided fee (first baker exempt); the fee is reported.
/// - `Split`: a winner gets `floor(early_winning × distributable ÷ V)`; a loser gets nothing from the pot.
pub fn entry_payout(
    rule: &PotRule,
    entry: &EntryAmounts,
    is_first: bool,
) -> Result<EntryPayout, BrotError> {
    let late = entry
        .late_yes
        .checked_add(entry.late_no)
        .ok_or(BrotError::MathOverflow)?;
    match rule.mode {
        SettleMode::Refund => Ok(EntryPayout {
            amount: entry
                .yes
                .checked_add(entry.no)
                .ok_or(BrotError::MathOverflow)?,
            one_sided_fee: 0,
        }),
        SettleMode::OneSided => {
            let early_total = early(entry.yes, entry.late_yes)?
                .checked_add(early(entry.no, entry.late_no)?)
                .ok_or(BrotError::MathOverflow)?;
            let refund = one_sided_refund(early_total, rule.one_sided_fee_bps, is_first)?;
            Ok(EntryPayout {
                amount: refund
                    .payout
                    .checked_add(late)
                    .ok_or(BrotError::MathOverflow)?,
                one_sided_fee: refund.fee,
            })
        }
        SettleMode::Split => {
            let early_winning = match rule.winning {
                Side::Yes => early(entry.yes, entry.late_yes)?,
                Side::No => early(entry.no, entry.late_no)?,
            };
            let share = if early_winning == 0 {
                0
            } else {
                split_payout(early_winning, rule.distributable, rule.winning_total)?
            };
            Ok(EntryPayout {
                amount: share.checked_add(late).ok_or(BrotError::MathOverflow)?,
                one_sided_fee: 0,
            })
        }
        SettleMode::Unset => Err(BrotError::BadAccountData),
    }
}

/// R1 of the second pre-freeze review (S-5): a `Split` entry is never paid more than its exact share. Its payout is
/// `floor(early × D ÷ V) + late` (`entry_payout`: D `distributable`, which already holds the prize and leaves out
/// the house fee and the creator's share from the pot; V `winning_total`; early the entry's early part on the winning
/// side; late both its late parts, refunded whole). Checked in u128 without the floor division the payout used:
/// `(payout − late) × V ≤ early × D`. The floor the program pays always passes, the running cap (`payout_cap.rs`)
/// still bounds the campaign as a whole, and an overpaid entry is refused before any lamport moves
/// (`EntryPayoutAboveShare`). A payout below its own late parts is `InvariantViolated`. Other modes pay exact sums.
pub fn require_within_share(
    rule: &PotRule,
    entry: &EntryAmounts,
    payout: &EntryPayout,
) -> Result<(), BrotError> {
    if rule.mode != SettleMode::Split {
        return Ok(());
    }
    let late = entry
        .late_yes
        .checked_add(entry.late_no)
        .ok_or(BrotError::MathOverflow)?;
    let early_winning = match rule.winning {
        Side::Yes => early(entry.yes, entry.late_yes)?,
        Side::No => early(entry.no, entry.late_no)?,
    };
    let share = payout
        .amount
        .checked_sub(late)
        .ok_or(BrotError::InvariantViolated)?;
    let paid = u128::from(share)
        .checked_mul(u128::from(rule.winning_total))
        .ok_or(BrotError::MathOverflow)?;
    let owed = u128::from(early_winning)
        .checked_mul(u128::from(rule.distributable))
        .ok_or(BrotError::MathOverflow)?;
    // X0.9 entry_within_share
    if paid > owed {
        return Err(BrotError::EntryPayoutAboveShare);
    }
    Ok(())
}

/// What a credit of `amount` to a wallet with `wallet_lamports` does: `Pay` when the wallet ends at or above
/// `rent_min`, `Reserve` when it would end below it (the runtime refuses such a balance, so the share stays
/// in the vault, bookkept against its owner).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Credit {
    Pay,
    Reserve,
}

pub fn plan_credit(wallet_lamports: u64, amount: u64, rent_min: u64) -> Result<Credit, BrotError> {
    let after = wallet_lamports
        .checked_add(amount)
        .ok_or(BrotError::MathOverflow)?;
    Ok(if after < rent_min {
        Credit::Reserve
    } else {
        Credit::Pay
    })
}

/// A reserved credit can be claimed once the wallet, with it, reaches `rent_min` (`ReserveNotClaimable`
/// otherwise).
pub fn claimable(wallet_lamports: u64, reserved: u64, rent_min: u64) -> Result<(), BrotError> {
    let after = wallet_lamports
        .checked_add(reserved)
        .ok_or(BrotError::MathOverflow)?;
    if after >= rent_min {
        Ok(())
    } else {
        Err(BrotError::ReserveNotClaimable)
    }
}
