//! Purpose: the compiled feed list (`feeds::require_listed`): the SOL/USD and BTC/USD feeds are listed on
//!          this cluster, the feed ids are the ones the captured mainnet and devnet accounts carry, and an
//!          unlisted feed is refused with its own error (founder answer 1, 2026-10-09).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze)

use brot_markets::{
    error::BrotError,
    feeds::{constants_decode, require_listed},
};

// The feed id sits at bytes 41..73 of a `PriceUpdateV2` account (the layout the readers read).
const SOL_MAINNET: &[u8] = include_bytes!("../../../tests/fixtures/pyth-sol-usd-mainnet.bin");
const BTC_MAINNET: &[u8] = include_bytes!("../../../tests/fixtures/pyth-btc-usd-mainnet.bin");
const SOL_DEVNET: &[u8] = include_bytes!("../../../tests/fixtures/pyth-sol-usd-devnet.bin");
const BTC_DEVNET: &[u8] = include_bytes!("../../../tests/fixtures/pyth-btc-usd-devnet.bin");

fn feed_id(account: &[u8]) -> [u8; 32] {
    let mut id = [0u8; 32];
    id.copy_from_slice(&account[41..73]);
    id
}

#[test]
fn sol_usd_and_btc_usd_are_listed_on_this_cluster() {
    for account in [SOL_MAINNET, BTC_MAINNET, SOL_DEVNET, BTC_DEVNET] {
        assert_eq!(require_listed(&feed_id(account)), Ok(()));
    }
}

#[test]
fn an_unlisted_feed_is_refused_with_its_own_error() {
    assert_eq!(require_listed(&[0xAB; 32]), Err(BrotError::FeedNotOnList));
    assert_eq!(require_listed(&[0; 32]), Err(BrotError::FeedNotOnList));
}

#[test]
fn every_compiled_id_is_a_full_hex_feed_id() {
    assert!(constants_decode());
}
