//! Purpose: read a Pyth `PriceUpdateV2` account into the price of one named feed, checking who
//!          wrote it and how well it was verified; the price kind's reader, and the SOL/USD read
//!          that prices an opening.
//! Version: 0.0.4
//! Sprint: 01 (price reader proof); ported to Pinocchio in 02, which adds the opening checks
//!
//! The layout below was checked against real accounts on devnet and mainnet and against the IDL
//! the receiver publishes on-chain (knowledge-base/tecnologia/pyth-leitor-de-preco.md). Sprint 02
//! adds what an opening checks: the sponsored account a feed derives, the freshness and confidence
//! bounds, and the touch rule (TP section 3.4.10, rows 2 to 4 and 7). The join lock and the YES
//! proof arrive in Sprint 03.

use pinocchio::{AccountView, Address};

use super::cursor::Cursor;
use crate::{
    constants::{BPS_DENOMINATOR, PYTH_PUSH_ORACLE_ID, PYTH_SHARD},
    error::BrotError,
    state::enums::Direction,
};

pub use crate::constants::PYTH_RECEIVER_ID;

/// Anchor discriminator of `PriceUpdateV2`.
pub const PRICE_UPDATE_V2_DISCRIMINATOR: [u8; 8] = [34, 241, 35, 99, 157, 126, 244, 205];

/// The receiver allocates every `PriceUpdateV2` at this size.
pub const PRICE_UPDATE_V2_LEN: usize = 134;

/// Borsh tag of `VerificationLevel::Full`. `Partial` (tag 0) means the receiver checked fewer
/// guardian signatures than a full verification needs, and it also shifts every later field by
/// one byte, so it is refused before anything else is read.
const VERIFICATION_FULL: u8 = 1;

/// What the reader takes from a price update. `price` and `conf` are integers scaled by
/// `10^exponent`: 11921844516 with exponent -8 is 119.21844516. Nothing here is sanitised:
/// `price` can be negative and `conf` can be any `u64`, so a rule that combines them has to widen
/// first.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PriceReading {
    pub feed_id: [u8; 32],
    pub price: i64,
    /// Confidence interval around `price`, in the same scale.
    pub conf: u64,
    pub exponent: i32,
    /// Unix time the price was published by Pyth. It can be a few seconds ahead of the cluster
    /// clock.
    pub publish_time: i64,
    /// Slot in which the update was written to this account.
    pub posted_slot: u64,
}

/// Reads a fully verified `PriceUpdateV2` of the feed the caller expects.
///
/// Anyone can post an update of any feed, of any age, through the receiver. An account that
/// passes the owner and layout checks therefore proves only "Pyth signed this, for some asset,
/// at some time". Naming the feed is part of the read so that a BTC price can never answer a SOL
/// question by omission. The age is not checked here: the caller compares `publish_time` with its
/// own rule.
pub fn read_price_update(
    owner: &Address,
    data: &[u8],
    expected_feed_id: &[u8; 32],
) -> Result<PriceReading, BrotError> {
    if *owner != PYTH_RECEIVER_ID {
        return Err(BrotError::ReaderWrongOwner);
    }
    if data.len() != PRICE_UPDATE_V2_LEN {
        return Err(BrotError::ReaderBadLayout);
    }

    let mut cursor = Cursor::new(data);
    if cursor.take::<8>()? != PRICE_UPDATE_V2_DISCRIMINATOR {
        return Err(BrotError::ReaderBadLayout);
    }
    // write_authority: who may overwrite this account. Not part of the trust decision.
    cursor.skip(32)?;
    if cursor.u8()? != VERIFICATION_FULL {
        return Err(BrotError::PriceNotFullyVerified);
    }

    let feed_id = cursor.take::<32>()?;
    if feed_id != *expected_feed_id {
        return Err(BrotError::PriceWrongFeed);
    }
    let price = cursor.i64()?;
    let conf = cursor.u64()?;
    let exponent = cursor.i32()?;
    let publish_time = cursor.i64()?;
    // prev_publish_time, ema_price and ema_conf: 24 bytes this reader does not use.
    cursor.skip(24)?;
    let posted_slot = cursor.u64()?;

    Ok(PriceReading {
        feed_id,
        price,
        conf,
        exponent,
        publish_time,
        posted_slot,
    })
}

/// The same read taken from the account itself, so the owner and the bytes cannot come from two
/// different accounts. Instructions use this one.
pub fn read_price_account(
    account: &AccountView,
    expected_feed_id: &[u8; 32],
) -> Result<PriceReading, pinocchio::error::ProgramError> {
    let data = account.try_borrow()?;
    Ok(read_price_update(account.owner(), &data, expected_feed_id)?)
}

/// The sponsored push-oracle account of `feed_id` on shard 0: the PDA of
/// `[PYTH_SHARD as u16 LE, feed_id]` under `PYTH_PUSH_ORACLE_ID`. The only account the program
/// accepts for a price campaign's own feed and for the SOL/USD price at opening (TP section
/// 3.4.8); derived here, never trusted as passed. `7AviUf…` for SOL/USD, `APgzQG…` for BTC/USD.
/// Fails only when no bump gives an address off the curve, which no feed id is known to do; the
/// error is then the campaign's `MetricAccountMismatch`, and the SOL/USD read maps it to its own.
pub fn sponsored_account(feed_id: &[u8; 32]) -> Result<Address, BrotError> {
    let shard = PYTH_SHARD.to_le_bytes();
    Address::try_find_program_address(
        &[shard.as_slice(), feed_id.as_slice()],
        &PYTH_PUSH_ORACLE_ID,
    )
    .map(|(address, _bump)| address)
    .ok_or(BrotError::MetricAccountMismatch)
}

/// Checks a reading for an opening: published at most `max_age` seconds before `now` (a publish
/// time a few seconds ahead of the clock counts as fresh), a positive price, and a confidence of
/// at most `max_conf_bps` of the price. The caller maps the refusals to its own row's errors
/// (row 4 for the campaign's feed, row 7 for SOL/USD), so the three outcomes are distinct.
/// Checked in that order: a stale price is `Stale` whatever its value.
pub fn check_fresh_and_tight(
    reading: &PriceReading,
    now: i64,
    max_age: u32,
    max_conf_bps: u16,
) -> Result<(), PriceRefusal> {
    // In i128 neither a publish time far in the past nor one ahead of the clock can overflow. A
    // publish time ahead of the clock gives a negative age: fresh, with no upper bound, because
    // Pyth signs the time and the cluster clock may lag it (pyth-leitor-de-preco.md, 1.4 and 1.7).
    let age = i128::from(now)
        .checked_sub(i128::from(reading.publish_time))
        .ok_or(PriceRefusal::Stale)?;
    if age > i128::from(max_age) {
        return Err(PriceRefusal::Stale);
    }
    let price = u128::try_from(reading.price)
        .ok()
        .filter(|price| *price > 0)
        .ok_or(PriceRefusal::NonPositive)?;
    // conf / price <= max_conf_bps / 10,000, cross-multiplied: no rounding at the bound.
    let width = u128::from(reading.conf)
        .checked_mul(u128::from(BPS_DENOMINATOR))
        .ok_or(PriceRefusal::ConfidenceTooWide)?;
    let bound = price
        .checked_mul(u128::from(max_conf_bps))
        .ok_or(PriceRefusal::ConfidenceTooWide)?;
    if width > bound {
        return Err(PriceRefusal::ConfidenceTooWide);
    }
    Ok(())
}

/// The touch rule: true when the reading's confidence band already reaches `target` in
/// `direction`, that is `price + conf >= target` for `Above` and `price - conf <= target` for
/// `Below`. Row 3 refuses an opening on it, so no campaign is decided at birth; the join lock of
/// Sprint 03 can reuse it. `target` is in the feed's own units (the reading's exponent).
pub fn band_reaches_target(
    reading: &PriceReading,
    direction: Direction,
    target: i128,
) -> Result<bool, BrotError> {
    // Widened from i64 and u64, so neither edge of the band can overflow an i128.
    let price = i128::from(reading.price);
    let conf = i128::from(reading.conf);
    Ok(match direction {
        Direction::Above => price.checked_add(conf).ok_or(BrotError::MathOverflow)? >= target,
        Direction::Below => price.checked_sub(conf).ok_or(BrotError::MathOverflow)? <= target,
    })
}

/// Why `check_fresh_and_tight` refused a reading.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PriceRefusal {
    Stale,
    NonPositive,
    ConfidenceTooWide,
}
