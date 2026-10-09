//! Purpose: the outcomes the price kind's host tests expect from the readers: the reading behind
//!          a recorded outcome, a YES, a NO, a void and a refusal, in the readers' own types.
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane C

use brot_markets::{
    error::BrotError,
    readers::{Decision, Reading, Resolution},
    state::enums::VoidReason,
};
use pinocchio::{error::ProgramError, Address};

use super::{BTC_MAINNET_PRICE, MAINNET_POSTED_SLOT, MAINNET_PUBLISHED};

/// The reading behind an outcome: `price` read from `account` at `published`, posted at `slot`.
pub fn read(account: Address, published: i64, price: i128, slot: u64) -> Reading {
    Reading {
        observed: price,
        account,
        publish_time: published,
        posted_slot: slot,
    }
}

/// The mainnet BTC/USD update as captured, read from `account`.
pub fn mainnet_btc(account: Address) -> Reading {
    read(
        account,
        MAINNET_PUBLISHED,
        BTC_MAINNET_PRICE,
        MAINNET_POSTED_SLOT,
    )
}

/// A recorded YES, NO (never `met_late`) or void, as `try_resolve` returns it.
pub fn yes(reading: Reading) -> Result<Resolution, ProgramError> {
    Ok(Resolution::Decided(Decision::yes(reading)))
}

pub fn no(reading: Reading) -> Result<Resolution, ProgramError> {
    Ok(Resolution::Decided(Decision::no(reading, false)))
}

pub fn void(reason: VoidReason, reading: Reading) -> Result<Resolution, ProgramError> {
    Ok(Resolution::Decided(Decision::void(reason, reading)))
}

/// A refusal with the program's `error`, for any of the readers' results.
pub fn refused<T>(error: BrotError) -> Result<T, ProgramError> {
    Err(error.into())
}
