//! Purpose: the two pure rules of a join: the campaign's own minimum entry (question 5) and the
//!          proximity buffer at the join lock (question 7). Pure, so the host tests check the edges.
//! Version: 0.0.1
//! Sprint: 04 (settlement and invariants), lane G
//!
//! The buffer's margin is [AC]: `JOIN_BUFFER_BPS` of the sponsored price, read as a price-unit
//! distance from the target. Reasoning (recorded in the report of lane G):
//! - The sponsored account is rewritten when the price moves by the publisher's deviation trigger
//!   (0.5%, the Pyth documentation's figure, not yet annotated to a source commit) or when the
//!   heartbeat expires (about 55 s on mainnet's sponsored accounts, 62 to 64 s seen on devnet).
//! - So the live price can be at most about one trigger away from the account's price, plus the
//!   latency between the publisher's write and its landing. A band edge further than the margin
//!   from the target cannot have crossed the target since the last write unless that movement
//!   exceeds the margin.
//! - The margin is 1% (`MIN_DISTANCE_BPS_PRICE`, the same distance the opening keeps past the band):
//!   twice the trigger, which covers one trigger and the write latency. Constant on both networks:
//!   the update interval (about 60 s on devnet, 5 s on mainnet) bounds how long a move can stay
//!   hidden, but the trigger already bounds how far it can move in that time.

use pinocchio::error::ProgramError;

use crate::{
    error::BrotError,
    readers::{min_distance, price_touch::PriceReading},
    state::enums::Direction,
};

/// The proximity buffer, in basis points of the sponsored price ([AC], see the module note).
pub const JOIN_BUFFER_BPS: u16 = 100;

/// `amount` must be at least the campaign's own `min_entry_lamports` (question 5).
pub fn require_min_entry(amount: u64, campaign_min: u64) -> Result<(), BrotError> {
    if amount < campaign_min {
        return Err(BrotError::BelowCampaignMinEntry);
    }
    Ok(())
}

/// True when the edge of the confidence band on the side of `target` is less than the margin
/// away from it: `target - (price + conf)` for `Above`, `(price - conf) - target` for `Below`,
/// with the margin `min_distance(price, JOIN_BUFFER_BPS)` (at least one unit). A gap equal to the
/// margin is outside the buffer; one unit less is inside.
pub fn buffer_refuses(
    reading: &PriceReading,
    direction: Direction,
    target: i128,
) -> Result<bool, ProgramError> {
    let price = i128::from(reading.price);
    let conf = i128::from(reading.conf);
    let margin = min_distance(price, JOIN_BUFFER_BPS)?;
    let gap = match direction {
        Direction::Above => {
            target.checked_sub(price.checked_add(conf).ok_or(BrotError::MathOverflow)?)
        }
        Direction::Below => price
            .checked_sub(conf)
            .ok_or(BrotError::MathOverflow)?
            .checked_sub(target),
    }
    .ok_or(BrotError::MathOverflow)?;
    Ok(gap < margin)
}
