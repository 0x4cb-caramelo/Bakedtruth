//! Purpose: read a Pyth `PriceUpdateV2` account into a price, checking who wrote it and how well it
//!          was verified. The base of the "price of a large asset" question type.
//! Version: 0.0.1
//! Sprint: 01 (price reader proof)
//!
//! Sprint 01 ships the read only. Freshness, the bet lock and the "touch" rule arrive in Sprint 03;
//! until then nothing in the program calls this. The layout below was checked against real accounts
//! on devnet and mainnet (knowledge-base/tecnologia/pyth-leitor-de-preco.md).

use anchor_lang::prelude::*;

use super::cursor::Cursor;
use crate::error::BrotError;

/// The Pyth receiver program whose accounts this reader trusts: the upgraded Core generation, which
/// Pyth recommends for new integrations since its 2026-08-26 upgrade. Same address on devnet and
/// mainnet. The pre-upgrade receiver (`rec5EK...`) writes the same layout and is rejected on purpose:
/// one trusted writer, not two.
pub const PYTH_RECEIVER_ID: Pubkey = pubkey!("rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp");

/// Anchor discriminator of `PriceUpdateV2`.
pub const PRICE_UPDATE_V2_DISCRIMINATOR: [u8; 8] = [34, 241, 35, 99, 157, 126, 244, 205];

/// The receiver allocates every `PriceUpdateV2` at this size.
pub const PRICE_UPDATE_V2_LEN: usize = 134;

/// Borsh tag of `VerificationLevel::Full`. `Partial` (tag 0) means the receiver checked fewer
/// guardian signatures than a full verification needs, and it also shifts every later field by one
/// byte, so it is refused before anything else is read.
const VERIFICATION_FULL: u8 = 1;

/// What the reader takes from a price update. `price` and `conf` are integers scaled by
/// `10^exponent`: 11921844516 with exponent -8 is 119.21844516.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PriceReading {
    pub feed_id: [u8; 32],
    pub price: i64,
    /// Confidence interval around `price`, in the same scale.
    pub conf: u64,
    pub exponent: i32,
    /// Unix time the price was published by Pyth. It can be a few seconds ahead of the cluster clock.
    pub publish_time: i64,
    /// Slot in which the update was written to this account.
    pub posted_slot: u64,
}

/// Reads a fully verified `PriceUpdateV2`. The caller still has to check `feed_id` against the
/// question and `publish_time` against its own rule; this function only answers "is this a price
/// the trusted receiver wrote, and what does it say".
pub fn read_price_update(owner: &Pubkey, data: &[u8]) -> Result<PriceReading> {
    require_keys_eq!(*owner, PYTH_RECEIVER_ID, BrotError::ReaderWrongOwner);
    require!(
        data.len() == PRICE_UPDATE_V2_LEN,
        BrotError::ReaderBadLayout
    );

    let mut cursor = Cursor::new(data);
    require!(
        cursor.take::<8>()? == PRICE_UPDATE_V2_DISCRIMINATOR,
        BrotError::ReaderBadLayout
    );
    // write_authority: who may overwrite this account. Not part of the trust decision.
    cursor.skip(32)?;
    require!(
        cursor.u8()? == VERIFICATION_FULL,
        BrotError::PriceNotFullyVerified
    );

    let feed_id = cursor.take::<32>()?;
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
