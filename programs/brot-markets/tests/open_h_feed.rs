//! Purpose: lane H, question 3 and question 1 (founder answers 3 and 1, 2026-10-09): the SOL/USD
//!          feed id is a compiled constant that equals the id the captured mainnet and devnet accounts
//!          carry (bytes 41 to 73), and a price campaign names only a feed on the compiled list at
//!          opening (`FeedNotOnList`); the other kinds name no feed and are not checked.
//! Version: 0.0.1
//! Sprint: 04 (opening side of questions 1 to 5), lane H

use brot_markets::{
    constants::SOL_USD_FEED_ID, error::BrotError, feeds::require_listed,
    instructions::campaigns::open_campaign::rules::require_listed_feed, state::enums::ReaderKind,
};

// The feed id sits at bytes 41..73 of a `PriceUpdateV2` account (the layout the readers read).
const SOL_MAINNET: &[u8] = include_bytes!("../../../tests/fixtures/pyth-sol-usd-mainnet.bin");
const SOL_DEVNET: &[u8] = include_bytes!("../../../tests/fixtures/pyth-sol-usd-devnet.bin");
const BTC_DEVNET: &[u8] = include_bytes!("../../../tests/fixtures/pyth-btc-usd-devnet.bin");

fn feed_id(account: &[u8]) -> [u8; 32] {
    let mut id = [0u8; 32];
    id.copy_from_slice(&account[41..73]);
    id
}

#[test]
fn the_compiled_sol_usd_id_is_the_id_of_both_captured_accounts() {
    assert_eq!(feed_id(SOL_MAINNET), SOL_USD_FEED_ID);
    assert_eq!(feed_id(SOL_DEVNET), SOL_USD_FEED_ID);
}

#[test]
fn the_compiled_sol_usd_id_is_on_the_list() {
    assert_eq!(require_listed(&SOL_USD_FEED_ID), Ok(()));
}

#[test]
fn a_price_campaign_on_sol_usd_or_btc_usd_is_accepted() {
    let btc = feed_id(BTC_DEVNET);
    assert_eq!(
        require_listed_feed(ReaderKind::PriceTouch, &SOL_USD_FEED_ID),
        Ok(())
    );
    assert_eq!(require_listed_feed(ReaderKind::PriceTouch, &btc), Ok(()));
}

#[test]
fn a_fresh_valid_feed_outside_the_list_is_refused_with_feed_not_on_list() {
    // The SOL/USD id with its last byte flipped: a well-formed Pyth id that is not on the list.
    let mut unlisted = SOL_USD_FEED_ID;
    unlisted[31] ^= 0x01;
    assert_eq!(
        require_listed_feed(ReaderKind::PriceTouch, &unlisted),
        Err(BrotError::FeedNotOnList)
    );
    assert_eq!(
        require_listed_feed(ReaderKind::PriceTouch, &[0xAB; 32]),
        Err(BrotError::FeedNotOnList)
    );
}

#[test]
fn the_other_kinds_name_no_feed_and_are_not_checked_against_the_list() {
    let unlisted = [0xAB; 32];
    for kind in [
        ReaderKind::SupplyAtMost,
        ReaderKind::DammV2LockedAtLeast,
        ReaderKind::StakePoolTvlAtLeast,
    ] {
        assert_eq!(require_listed_feed(kind, &unlisted), Ok(()));
    }
}
