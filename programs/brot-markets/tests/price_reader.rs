//! Purpose: the price reader against real Pyth accounts captured from devnet and mainnet, and
//!          against the malformed versions of them. A wrong account must be an error, never a
//!          panic.
//! Version: 0.0.4
//! Sprint: 01 (price reader proof); ported to Pinocchio in 02; the mainnet accounts in 03, lane C

use brot_markets::error::BrotError;
use brot_markets::readers::price_touch::{read_price_update, PriceReading, PYTH_RECEIVER_ID};
use pinocchio::{address::address, Address};

// Real devnet accounts (scripts/capture-fixtures.ts pyth), sponsored push feeds, shard 0.
const SOL: &[u8] = include_bytes!("../../../tests/fixtures/pyth-sol-usd-devnet.bin");
const BTC: &[u8] = include_bytes!("../../../tests/fixtures/pyth-btc-usd-devnet.bin");
// The same SOL feed under the pre-upgrade receiver.
const SOL_LEGACY: &[u8] = include_bytes!("../../../tests/fixtures/pyth-sol-usd-devnet-legacy.bin");
// Real mainnet accounts at the same sponsored addresses (Sprint 03).
const SOL_MAINNET: &[u8] = include_bytes!("../../../tests/fixtures/pyth-sol-usd-mainnet.bin");
const BTC_MAINNET: &[u8] = include_bytes!("../../../tests/fixtures/pyth-btc-usd-mainnet.bin");
const LEGACY_RECEIVER: Address = address!("rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ");

const SOL_FEED: [u8; 32] = [
    0xef, 0x0d, 0x8b, 0x6f, 0xda, 0x2c, 0xeb, 0xa4, 0x1d, 0xa1, 0x5d, 0x40, 0x95, 0xd1, 0xda, 0x39,
    0x2a, 0x0d, 0x2f, 0x8e, 0xd0, 0xc6, 0xc7, 0xbc, 0x0f, 0x4c, 0xfa, 0xc8, 0xc2, 0x80, 0xb5, 0x6d,
];
const BTC_FEED: [u8; 32] = [
    0xe6, 0x2d, 0xf6, 0xc8, 0xb4, 0xa8, 0x5f, 0xe1, 0xa6, 0x7d, 0xb4, 0x4d, 0xc1, 0x2d, 0xe5, 0xdb,
    0x33, 0x0f, 0x7a, 0xc6, 0x6b, 0x72, 0xdc, 0x65, 0x8a, 0xfe, 0xdf, 0x0f, 0x4a, 0x41, 0x5b, 0x43,
];

/// A SOL read from the trusted receiver: what every test below varies one thing of.
fn read_sol(data: &[u8]) -> Result<PriceReading, BrotError> {
    read_price_update(&PYTH_RECEIVER_ID, data, &SOL_FEED)
}

/// The program error number, so a test can tell which check refused the account.
fn code(result: Result<PriceReading, BrotError>) -> u32 {
    u32::from(result.expect_err("the reader accepted an account it must refuse"))
}

#[test]
fn reads_the_real_sol_account() {
    assert_eq!(
        read_sol(SOL).unwrap(),
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
    assert_eq!(
        read_price_update(&PYTH_RECEIVER_ID, BTC, &BTC_FEED).unwrap(),
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
fn reads_the_real_mainnet_accounts() {
    let sol = PriceReading {
        feed_id: SOL_FEED,
        price: 11_000_079_114,
        conf: 2_688_373,
        exponent: -8,
        publish_time: 1_791_515_877,
        posted_slot: 454_743_011,
    };
    assert_eq!(read_sol(SOL_MAINNET).unwrap(), sol);
    let btc = PriceReading {
        feed_id: BTC_FEED,
        price: 8_206_475_000_000,
        conf: 2_805_000_000,
        ..sol
    };
    let read = read_price_update(&PYTH_RECEIVER_ID, BTC_MAINNET, &BTC_FEED);
    assert_eq!(read.unwrap(), btc);
}

#[test]
fn prev_publish_time_is_pythnets_previous_second_not_this_accounts_previous_write() {
    // Mainnet's sponsored accounts are rewritten every 5 to 11 s, devnet's every 62 to 64 s, yet
    // every capture holds publish_time − 1 here: no rule may read it as the previous write (D7).
    for fixture in [SOL, BTC, SOL_LEGACY, SOL_MAINNET, BTC_MAINNET] {
        let field = |at: usize| i64::from_le_bytes(fixture[at..][..8].try_into().unwrap());
        assert_eq!(field(93).checked_sub(field(101)), Some(1));
    }
}

#[test]
fn refuses_the_price_of_another_asset() {
    // A real, fully verified BTC price is still the wrong answer to a SOL question.
    assert_eq!(code(read_sol(BTC)), u32::from(BrotError::PriceWrongFeed));
    assert_eq!(
        code(read_price_update(&PYTH_RECEIVER_ID, SOL, &BTC_FEED)),
        u32::from(BrotError::PriceWrongFeed)
    );
}

#[test]
fn refuses_the_pre_upgrade_receiver() {
    // Its own owner is not trusted...
    assert_eq!(
        code(read_price_update(&LEGACY_RECEIVER, SOL_LEGACY, &SOL_FEED)),
        u32::from(BrotError::ReaderWrongOwner)
    );
    // ...though the bytes are a valid update, which is why the owner check has to exist.
    assert_eq!(read_sol(SOL_LEGACY).unwrap().feed_id, SOL_FEED);
}

#[test]
fn refuses_any_other_owner() {
    for fixture in [SOL, SOL_MAINNET] {
        assert_eq!(
            code(read_price_update(&brot_markets::ID, fixture, &SOL_FEED)),
            u32::from(BrotError::ReaderWrongOwner)
        );
    }
}

#[test]
fn a_cut_or_padded_account_is_an_error_never_a_panic() {
    let bad_layout = u32::from(BrotError::ReaderBadLayout);
    let fixtures = [(SOL, SOL_FEED), (BTC, BTC_FEED)];
    for (fixture, feed) in fixtures
        .into_iter()
        .chain([(SOL_MAINNET, SOL_FEED), (BTC_MAINNET, BTC_FEED)])
    {
        let read = |data: &[u8]| code(read_price_update(&PYTH_RECEIVER_ID, data, &feed));
        for len in 0..fixture.len() {
            let cut = fixture.get(..len).unwrap();
            assert_eq!(read(cut), bad_layout, "length {len}");
        }
        let mut padded = fixture.to_vec();
        padded.push(0);
        assert_eq!(read(&padded), bad_layout);
    }
}

#[test]
fn refuses_another_account_type_of_the_same_size() {
    let mut other = SOL.to_vec();
    other[0] ^= 0xff;
    assert_eq!(
        code(read_sol(&other)),
        u32::from(BrotError::ReaderBadLayout)
    );
}

#[test]
fn refuses_a_zeroed_account_of_the_right_size() {
    // What anyone gets by allocating 134 bytes and assigning them to the receiver.
    assert_eq!(
        code(read_sol(&[0u8; 134])),
        u32::from(BrotError::ReaderBadLayout)
    );
}

#[test]
fn refuses_every_verification_level_but_full() {
    // Byte 40 is the verification level, right after the discriminator and the authority.
    // Tag 0 is `Partial`; 2 to 255 are not levels at all.
    for fixture in [SOL, SOL_MAINNET] {
        for tag in (0..=u8::MAX).filter(|tag| *tag != 1) {
            let mut update = fixture.to_vec();
            update[40] = tag;
            assert_eq!(
                code(read_sol(&update)),
                u32::from(BrotError::PriceNotFullyVerified),
                "tag {tag}"
            );
        }
    }
}

#[test]
fn ignores_the_bytes_it_does_not_read() {
    // write_authority (8..40) and the spare last byte carry no part of the price.
    let mut tampered = SOL.to_vec();
    for byte in &mut tampered[8..40] {
        *byte ^= 0xff;
    }
    tampered[133] ^= 0xff;
    assert_eq!(read_sol(&tampered).unwrap(), read_sol(SOL).unwrap());
}
