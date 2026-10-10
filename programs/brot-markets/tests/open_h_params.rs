//! Purpose: lane H, question 5 (founder answer 5, 2026-10-09): the minimum entry the campaign opens with
//!          is copied from the config at opening, and the admin range is 0.001 to 1 SOL (the config's
//!          default is 0.01 SOL, P-5). The copy is checked on a real `Campaign` buffer through
//!          `record::write`, and the range through `CreationParams::validate`.
//! Version: 0.0.1
//! Sprint: 04 (opening side of questions 1 to 5), lane H

mod opening_support;

use brot_markets::{
    constants::SOL_USD_FEED_ID,
    error::BrotError,
    instructions::campaigns::open_campaign::{
        payment::Payment,
        record::{self, Opening},
        OpenCampaignArgs,
    },
    layout::{LeI128, LeI64, LeU16, LeU32, LeU64, ZeroCopy},
    state::{campaign::Campaign, config::CreationParams, enums::ReaderKind},
};
use opening_support::err;
use pinocchio::Address;

fn params(min_entry: u64) -> CreationParams {
    CreationParams {
        opening_fee_usd: LeU64::new(500),
        opening_prize_bps: LeU16::new(9_000),
        fee_bps: LeU16::new(1_000),
        one_sided_fee_bps: LeU16::new(100),
        creator_share_bps: LeU16::new(100),
        max_open_campaigns: LeU32::new(1_000),
        min_entry_lamports: LeU64::new(min_entry),
        sol_usd_feed_id: SOL_USD_FEED_ID,
        max_price_age: LeU32::new(120),
        max_price_conf_bps: LeU16::new(50),
        campaign_max_age: LeU32::new(120),
    }
}

#[test]
fn the_default_of_0_01_sol_is_inside_the_admin_range() {
    assert_eq!(params(10_000_000).validate(), Ok(()));
}

#[test]
fn the_admin_range_is_0_001_to_1_sol() {
    assert_eq!(params(1_000_000).validate(), Ok(()));
    assert_eq!(params(1_000_000_000).validate(), Ok(()));
    assert_eq!(
        params(999_999).validate(),
        Err(err(BrotError::MinEntryOutOfRange))
    );
    assert_eq!(
        params(1_000_000_001).validate(),
        Err(err(BrotError::MinEntryOutOfRange))
    );
}

#[test]
fn the_opening_copies_the_config_minimum_into_the_campaign() {
    let config = params(50_000_000);
    let args = OpenCampaignArgs {
        id: LeU64::new(7),
        kind: ReaderKind::PriceTouch as u8,
        direction: 0,
        feed_id: SOL_USD_FEED_ID,
        target: LeI128::new(1),
        deadline_at: LeI64::new(0),
        opening_usd: LeU64::new(500),
        max_lamports: LeU64::new(u64::MAX),
        epoch: LeU64::new(0),
        expected_params_version: LeU32::new(1),
    };
    let creator = Address::new_from_array([3; 32]);
    let metric = Address::new_from_array([4; 32]);
    let opening = Opening {
        args: &args,
        kind: ReaderKind::PriceTouch,
        direction: brot_markets::state::enums::Direction::Above,
        bump: 255,
        vault_bump: 254,
        creator: &creator,
        is_team: false,
        params: &config,
        metric_account: &metric,
        price_exponent: -8,
        now: 1,
        entries_close_at: 2,
        payment: Payment::default(),
    };
    let mut bytes = vec![0u8; Campaign::LEN];
    let campaign = Campaign::from_bytes_mut(&mut bytes).expect("exact length");
    record::write(campaign, &opening);
    assert_eq!(campaign.min_entry_lamports.get(), 50_000_000);
}
