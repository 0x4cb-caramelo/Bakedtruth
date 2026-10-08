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

use crate::error::BrotError;

/// The creator's share, split by where it comes from.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct CreatorShare {
    pub from_pot: u64,
    pub from_fee: u64,
}

/// The P-2 reading of D-g: from the pot what keeps every winner whole, the rest from the fee.
pub fn creator_share(
    winning: u64,
    losing: u64,
    prize: u64,
    fee: u64,
    creator_share_bps: u16,
) -> Result<CreatorShare, BrotError> {
    let _ = (winning, losing, prize, fee, creator_share_bps);
    todo!("Sprint 02 lane C")
}

/// `V + P − fee − from_pot + R`.
pub fn distributable(
    winning: u64,
    losing: u64,
    prize: u64,
    fee: u64,
    from_pot: u64,
) -> Result<u64, BrotError> {
    let _ = (winning, losing, prize, fee, from_pot);
    todo!("Sprint 02 lane C")
}

/// One winning entry's payout in `Split`: `floor(entry × distributable ÷ winning)`.
pub fn split_payout(entry: u64, distributable: u64, winning: u64) -> Result<u64, BrotError> {
    let _ = (entry, distributable, winning);
    todo!("Sprint 02 lane C")
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
pub fn estimate_return_bps(pot: &JoinedPot) -> Result<u64, BrotError> {
    let _ = pot;
    todo!("Sprint 02 lane C")
}
