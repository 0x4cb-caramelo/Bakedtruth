//! Purpose: what Brot keeps and what the opener gets back, worked out from the stored campaign alone
//!          (TP section 3.4.16, P-4). The snapshot's `brot_keeps` and `to_opener` are not stored, so
//!          they follow from `settle_mode`, the fee, the creator share, the held opening fee, the void
//!          reason and `first_baker` (zero when no entry landed).
//! Version: 0.0.1
//! Sprint: 04 (lane D). The void classes mirror lane B's `math/void.rs`; unify at integration.

use pinocchio::Address;

use crate::{
    error::BrotError,
    state::{
        campaign::Campaign,
        enums::{SettleMode, VoidReason},
    },
};

/// What `collect_fee` moves: `amount` to the fee vault, of which `opening` is the held opening fee.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Kept {
    pub amount: u64,
    pub opening: u64,
}

/// What `settle_prize` returns: the prize, and the opening fee on a house-failure void.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PrizeReturn {
    pub prize: u64,
    pub opening: u64,
}

/// Whether the void was the house's fault (the opening fee goes back) or an outside cause (Brot keeps it).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum VoidClass {
    HouseFailure,
    OutsideCause,
}

fn class_of(reason: VoidReason) -> Option<VoidClass> {
    match reason {
        VoidReason::None => None,
        VoidReason::MissedWindow | VoidReason::TeamHouseFailure => Some(VoidClass::HouseFailure),
        VoidReason::UnreadableAccount | VoidReason::StaleFeed | VoidReason::TeamOutsideCause => {
            Some(VoidClass::OutsideCause)
        }
    }
}

/// The part of the held money that is not an entry, as the snapshot shares it: `to_opener` and what
/// Brot keeps. Zero for `Split`, where the prize sits inside the distributable amount.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct OpenerReturn {
    pub to_opener: u64,
    pub brot_keeps: u64,
}

/// The snapshot's rule for the opener. A pot with no entry (`first_baker` zero, or no void) returns the
/// prize and keeps the opening fee whatever the outcome (founder answer 8). A void returns the prize,
/// and the opening fee too on a house failure; an outside cause keeps it.
pub fn opener_return(c: &Campaign) -> Result<OpenerReturn, BrotError> {
    let prize = c.prize_lamports.get();
    let opening = c.opening_fee_lamports.get();
    let kept_opening = OpenerReturn {
        to_opener: prize,
        brot_keeps: opening,
    };
    match SettleMode::try_from(c.settle_mode)? {
        SettleMode::Unset => Err(BrotError::NotFinalized),
        SettleMode::Split => Ok(OpenerReturn {
            to_opener: 0,
            brot_keeps: 0,
        }),
        SettleMode::OneSided => Ok(kept_opening),
        SettleMode::Refund => {
            let reason = VoidReason::try_from(c.void_reason)?;
            match class_of(reason) {
                Some(class) if !no_entry(c) => match class {
                    VoidClass::HouseFailure => Ok(OpenerReturn {
                        to_opener: prize.checked_add(opening).ok_or(BrotError::MathOverflow)?,
                        brot_keeps: 0,
                    }),
                    VoidClass::OutsideCause => Ok(kept_opening),
                },
                _ => Ok(kept_opening),
            }
        }
    }
}

/// No entry landed in the pot: `first_baker` is set by the first join and never otherwise.
fn no_entry(c: &Campaign) -> bool {
    c.first_baker == Address::new_from_array([0; 32])
}

/// What `collect_fee` moves to the fee vault. A split keeps the house fee not given to the creator plus
/// the opening fee. A refund keeps what `opener_return` leaves to Brot. A one-sided pot keeps the one-sided
/// fees recorded at each settlement, plus the opening fee.
pub fn kept(c: &Campaign) -> Result<Kept, BrotError> {
    let opening = c.opening_fee_lamports.get();
    match SettleMode::try_from(c.settle_mode)? {
        SettleMode::Unset => Err(BrotError::NotFinalized),
        SettleMode::Split => {
            let house = c
                .fee_total
                .get()
                .checked_sub(c.creator_share_from_fee.get())
                .ok_or(BrotError::MathOverflow)?;
            let amount = house.checked_add(opening).ok_or(BrotError::MathOverflow)?;
            Ok(Kept { amount, opening })
        }
        SettleMode::OneSided => {
            // Each entry's one-sided fee is recorded at its settlement (`one_sided_fees`); the opening fee is Brot's.
            let amount = c
                .one_sided_fees
                .get()
                .checked_add(opening)
                .ok_or(BrotError::MathOverflow)?;
            Ok(Kept { amount, opening })
        }
        SettleMode::Refund => {
            let ret = opener_return(c)?;
            Ok(Kept {
                amount: ret.brot_keeps,
                opening: ret.brot_keeps,
            })
        }
    }
}

/// What `settle_prize` returns, split into the prize and the opening fee. Zero for `Split`.
pub fn prize_return(c: &Campaign) -> Result<PrizeReturn, BrotError> {
    if SettleMode::try_from(c.settle_mode)? == SettleMode::Split {
        return Ok(PrizeReturn {
            prize: 0,
            opening: 0,
        });
    }
    let ret = opener_return(c)?;
    let prize = c.prize_lamports.get();
    let opening = ret
        .to_opener
        .checked_sub(prize)
        .ok_or(BrotError::MathOverflow)?;
    Ok(PrizeReturn { prize, opening })
}
