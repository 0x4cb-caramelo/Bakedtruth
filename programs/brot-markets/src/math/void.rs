//! Purpose: what a void, and a pot with no entry, returns to whoever opened and what Brot keeps
//!          (TP section 3.4.7, P-4, founder answer 8). The 10% opening fee follows the cause: it goes
//!          back to the opener on a house failure and stays with Brot on an outside cause. The prize
//!          always goes back to the opener.
//! Version: 0.0.1
//! Sprint: 04 (lane B; called by `math/snapshot.rs`)
//!
//! Entries are not here: a void refunds every entry whole, from the entry's own amount.

use crate::{error::BrotError, state::enums::VoidReason};

/// Who caused the void: the house (the team or the window) or a cause outside it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum VoidClass {
    HouseFailure,
    OutsideCause,
}

impl VoidClass {
    /// The class of a stored reason. `None` is not a void, so it has no class.
    pub fn of(reason: VoidReason) -> Option<VoidClass> {
        match reason {
            VoidReason::None => None,
            VoidReason::MissedWindow | VoidReason::TeamHouseFailure => {
                Some(VoidClass::HouseFailure)
            }
            VoidReason::UnreadableAccount
            | VoidReason::StaleFeed
            | VoidReason::TeamOutsideCause => Some(VoidClass::OutsideCause),
        }
    }
}

/// The part of the held money that is not an entry: what the opener gets back and what Brot keeps.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct OpenerReturn {
    pub to_opener: u64,
    pub brot_keeps: u64,
}

/// A void: the prize returns to the opener; the opening fee returns with it on a house failure
/// and stays with Brot on an outside cause (P-4).
pub fn void_return(
    class: VoidClass,
    prize: u64,
    opening_fee: u64,
) -> Result<OpenerReturn, BrotError> {
    match class {
        VoidClass::HouseFailure => Ok(OpenerReturn {
            to_opener: prize
                .checked_add(opening_fee)
                .ok_or(BrotError::MathOverflow)?,
            brot_keeps: 0,
        }),
        VoidClass::OutsideCause => Ok(OpenerReturn {
            to_opener: prize,
            brot_keeps: opening_fee,
        }),
    }
}

/// A pot with no entry, and a `OneSided` pot: the prize returns to the opener and Brot keeps the
/// opening fee, whatever the outcome (founder answer 8, a rule with no switch).
pub fn kept_opening_return(prize: u64, opening_fee: u64) -> OpenerReturn {
    OpenerReturn {
        to_opener: prize,
        brot_keeps: opening_fee,
    }
}
