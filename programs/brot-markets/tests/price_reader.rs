//! Purpose: the price reader against real Pyth accounts captured from devnet, and against the
//!          malformed versions of them. A wrong account must be an error, never a panic.
//! Version: 0.0.1
//! Sprint: 01 (price reader proof)

use anchor_lang::prelude::*;
use brot_markets::error::BrotError;
use brot_markets::readers::price_touch::{read_price_update, PriceReading, PYTH_RECEIVER_ID};

// Real devnet accounts (scripts/capture-fixtures.ts pyth), sponsored push feeds, shard 0.
const SOL: &[u8] = include_bytes!("../../../tests/fixtures/pyth-sol-usd-devnet.bin");
const BTC: &[u8] = include_bytes!("../../../tests/fixtures/pyth-btc-usd-devnet.bin");
// The same SOL feed under the pre-upgrade receiver.
const SOL_LEGACY: &[u8] = include_bytes!("../../../tests/fixtures/pyth-sol-usd-devnet-legacy.bin");
const LEGACY_RECEIVER: Pubkey = pubkey!("rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ");

const SOL_FEED: [u8; 32] = [
    0xef, 0x0d, 0x8b, 0x6f, 0xda, 0x2c, 0xeb, 0xa4, 0x1d, 0xa1, 0x5d, 0x40, 0x95, 0xd1, 0xda, 0x39,
    0x2a, 0x0d, 0x2f, 0x8e, 0xd0, 0xc6, 0xc7, 0xbc, 0x0f, 0x4c, 0xfa, 0xc8, 0xc2, 0x80, 0xb5, 0x6d,
];
const BTC_FEED: [u8; 32] = [
    0xe6, 0x2d, 0xf6, 0xc8, 0xb4, 0xa8, 0x5f, 0xe1, 0xa6, 0x7d, 0xb4, 0x4d, 0xc1, 0x2d, 0xe5, 0xdb,
    0x33, 0x0f, 0x7a, 0xc6, 0x6b, 0x72, 0xdc, 0x65, 0x8a, 0xfe, 0xdf, 0x0f, 0x4a, 0x41, 0x5b, 0x43,
];

/// The program error number, so a test can tell which check refused the account.
fn code(result: Result<PriceReading>) -> u32 {
    match result.expect_err("the reader accepted an account it must refuse") {
        Error::AnchorError(e) => e.error_code_number,
        Error::ProgramError(_) => 0,
    }
}

#[test]
fn reads_the_real_sol_account() {
    let reading = read_price_update(&PYTH_RECEIVER_ID, SOL).unwrap();
    assert_eq!(
        reading,
        PriceReading {
            feed_id: SOL_FEED,
            price: 11_921_844_516,
            conf: 655_484,
            exponent: -8,
            publish_time: 1_791_216_173,
            posted_slot: 507_785_464,
        }
    );
}

#[test]
fn reads_the_real_btc_account() {
    let reading = read_price_update(&PYTH_RECEIVER_ID, BTC).unwrap();
    assert_eq!(
        reading,
        PriceReading {
            feed_id: BTC_FEED,
            price: 8_521_233_806_870,
            conf: 774_205_661,
            exponent: -8,
            publish_time: 1_791_216_173,
            posted_slot: 507_785_465,
        }
    );
}

#[test]
fn refuses_the_pre_upgrade_receiver() {
    // Its own owner is not trusted...
    assert_eq!(
        code(read_price_update(&LEGACY_RECEIVER, SOL_LEGACY)),
        u32::from(BrotError::ReaderWrongOwner)
    );
    // ...though the bytes are a valid update, which is why the owner check has to exist.
    assert_eq!(
        read_price_update(&PYTH_RECEIVER_ID, SOL_LEGACY)
            .unwrap()
            .feed_id,
        SOL_FEED
    );
}

#[test]
fn refuses_any_other_owner() {
    assert_eq!(
        code(read_price_update(&brot_markets::ID, SOL)),
        u32::from(BrotError::ReaderWrongOwner)
    );
}

#[test]
fn a_cut_or_padded_account_is_an_error_never_a_panic() {
    for len in 0..SOL.len() {
        let cut = SOL.get(..len).unwrap();
        assert_eq!(
            code(read_price_update(&PYTH_RECEIVER_ID, cut)),
            u32::from(BrotError::ReaderBadLayout),
            "length {len}"
        );
    }
    let mut padded = SOL.to_vec();
    padded.push(0);
    assert_eq!(
        code(read_price_update(&PYTH_RECEIVER_ID, &padded)),
        u32::from(BrotError::ReaderBadLayout)
    );
}

#[test]
fn refuses_another_account_type_of_the_same_size() {
    let mut other = SOL.to_vec();
    other[0] ^= 0xff;
    assert_eq!(
        code(read_price_update(&PYTH_RECEIVER_ID, &other)),
        u32::from(BrotError::ReaderBadLayout)
    );
}

#[test]
fn refuses_a_partially_verified_update() {
    let mut partial = SOL.to_vec();
    // Byte 40 is the verification level, right after the discriminator and the authority.
    partial[40] = 0;
    assert_eq!(
        code(read_price_update(&PYTH_RECEIVER_ID, &partial)),
        u32::from(BrotError::PriceNotFullyVerified)
    );
}
