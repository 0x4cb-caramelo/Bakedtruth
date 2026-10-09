//! Purpose: the creator share, what winners split, and the return estimate a join checks against
//!          `min_return_bps` (D-g read as P-2; TP section 3.4.16).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio): the parts the join needs; Sprint 04 completes the file.
//!
//! ```text
//! fee           = ceil(P × fee_bps ÷ 10,000)
//! C             = floor((V + P) × creator_share_bps ÷ 10,000)          the prize is outside the base
//! from_pot      = min(C, P − fee + R)
//! from_fee      = min(C − from_pot, fee)
//! distributable = V + P − fee − from_pot + R                            never below V
//! ```
//! V is the winning side, P the losing side, R the prize, all lamports.
//!
//! The `Split` functions refuse with `MathOverflow` what no `Split` pot can hold: an empty side
//! (that pot is `OneSided`, with no share, P-1), a fee above P, a `from_pot` above `P − fee + R`
//! (a winner would get back less than its entry, I11), an entry above its side.

use super::{
    fees::{house_fee, one_sided_fee},
    rounding::{bps_floor_wide, mul_div_floor, to_u64},
};
use crate::{constants::BPS_DENOMINATOR, error::BrotError};

/// The creator's share, split by where it comes from.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct CreatorShare {
    pub from_pot: u64,
    pub from_fee: u64,
}

/// Both sides hold entries, as in every `Split` pot.
fn require_split(winning: u64, losing: u64) -> Result<(), BrotError> {
    if winning == 0 || losing == 0 {
        return Err(BrotError::MathOverflow);
    }
    Ok(())
}

/// `P − fee + R`: what the pot holds beyond the winners' own entries.
fn above_winners(losing: u64, fee: u64, prize: u64) -> Result<u128, BrotError> {
    let kept = losing.checked_sub(fee).ok_or(BrotError::MathOverflow)?;
    u128::from(kept)
        .checked_add(u128::from(prize))
        .ok_or(BrotError::MathOverflow)
}

/// The P-2 reading of D-g: from the pot what keeps every winner whole, the rest from the fee.
///
/// Decision of 2026-10-09 (closure review): the share comes only from the losing side and Brot's fee, never from
/// the prize, so a creator with a second wallet cannot take the prize. `prize` stays in the signature for the
/// callers; it does not enter the share.
pub fn creator_share(
    winning: u64,
    losing: u64,
    _prize: u64,
    fee: u64,
    creator_share_bps: u16,
) -> Result<CreatorShare, BrotError> {
    require_split(winning, losing)?;
    let base = u128::from(winning)
        .checked_add(u128::from(losing))
        .ok_or(BrotError::MathOverflow)?;
    let share = bps_floor_wide(base, creator_share_bps)?;
    let losing_kept = u128::from(losing)
        .checked_sub(u128::from(fee))
        .ok_or(BrotError::MathOverflow)?;
    let from_pot = share.min(losing_kept);
    let from_fee = share
        .checked_sub(from_pot)
        .ok_or(BrotError::MathOverflow)?
        .min(u128::from(fee));
    Ok(CreatorShare {
        from_pot: to_u64(from_pot)?,
        from_fee: to_u64(from_fee)?,
    })
}

/// `V + P − fee − from_pot + R`.
pub fn distributable(
    winning: u64,
    losing: u64,
    prize: u64,
    fee: u64,
    from_pot: u64,
) -> Result<u64, BrotError> {
    require_split(winning, losing)?;
    let left = above_winners(losing, fee, prize)?
        .checked_sub(u128::from(from_pot))
        .ok_or(BrotError::MathOverflow)?;
    to_u64(
        u128::from(winning)
            .checked_add(left)
            .ok_or(BrotError::MathOverflow)?,
    )
}

/// One winning entry's payout in `Split`: `floor(entry × distributable ÷ winning)`.
pub fn split_payout(entry: u64, distributable: u64, winning: u64) -> Result<u64, BrotError> {
    if entry > winning {
        return Err(BrotError::MathOverflow);
    }
    mul_div_floor(entry, distributable, winning)
}

/// The pot as a join would leave it, from the joining side's point of view.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct JoinedPot {
    /// The entry being added now.
    pub amount: u64,
    /// The joining side's pool after the entry (V if this side wins).
    pub side_after: u64,
    /// The other side's pool (P if this side wins).
    pub other: u64,
    pub prize: u64,
    pub fee_bps: u16,
    pub one_sided_fee_bps: u16,
    pub creator_share_bps: u16,
    /// The baker is the campaign's first baker (exempt from the one-sided fee).
    pub is_first: bool,
}

/// What `amount` returns if its side wins, in bps of `amount`, on the pot as it stands after the
/// entry: the `Split` payout when the other side holds entries, else the `OneSided` refund
/// (`amount − one_sided_fee`). Rounded down. The join refuses when it is below `min_return_bps`.
///
/// `MathOverflow` when `amount` is 0 or above `side_after`, and when the return in bps does
/// not fit a u64, which above the `min_entry_lamports` floor (10^6) would take a payout of more
/// than 1.8 × 10^12 SOL. The prize stays out of the `OneSided` refund: it returns to whoever
/// opened (P-4).
pub fn estimate_return_bps(pot: &JoinedPot) -> Result<u64, BrotError> {
    if pot.amount == 0 || pot.amount > pot.side_after {
        return Err(BrotError::MathOverflow);
    }
    let returned = if pot.other == 0 {
        let fee = one_sided_fee(pot.amount, pot.one_sided_fee_bps, pot.is_first)?;
        pot.amount.checked_sub(fee).ok_or(BrotError::MathOverflow)?
    } else {
        let fee = house_fee(pot.other, pot.fee_bps)?;
        let share = creator_share(
            pot.side_after,
            pot.other,
            pot.prize,
            fee,
            pot.creator_share_bps,
        )?;
        let pool = distributable(pot.side_after, pot.other, pot.prize, fee, share.from_pot)?;
        split_payout(pot.amount, pool, pot.side_after)?
    };
    mul_div_floor(returned, BPS_DENOMINATOR, pot.amount)
}

/// What a `OneSided` entry gets back: `entry − its one-sided fee`, whatever the outcome (P1 section
/// 3.5). The fee is the one `fees::one_sided_fee` charges; a payout that would be negative is
/// `MathOverflow`.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct OneSidedRefund {
    pub payout: u64,
    pub fee: u64,
}

pub fn one_sided_refund(
    entry: u64,
    one_sided_fee_bps: u16,
    is_first: bool,
) -> Result<OneSidedRefund, BrotError> {
    let fee = one_sided_fee(entry, one_sided_fee_bps, is_first)?;
    let payout = entry.checked_sub(fee).ok_or(BrotError::MathOverflow)?;
    Ok(OneSidedRefund { payout, fee })
}
