//! Purpose: the floors and ceilings of the creation parameters (TP section 3.4.1, C43): the
//!          founder's values pass, every bound passes, and one step past a bound fails with that
//!          parameter's own error.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio); lane B

use std::fmt::Debug;

use brot_markets::{
    constants::{
        BPS_DENOMINATOR, CAMPAIGN_MAX_AGE_CEILING, CAMPAIGN_MAX_AGE_FLOOR, MAX_CREATOR_SHARE_BPS,
        MAX_FEE_BPS, MAX_ONE_SIDED_FEE_BPS, MAX_OPENING_FEE_USD, MAX_OPEN_CAMPAIGNS_CEILING,
        MAX_PRICE_AGE_CEILING, MAX_PRICE_CONF_BPS_CEILING, MIN_ENTRY_CEILING_LAMPORTS,
        MIN_ENTRY_FLOOR_LAMPORTS, MIN_OPENING_FEE_USD, MIN_OPENING_PRIZE_BPS,
    },
    error::BrotError,
    layout::{LeU16, LeU32, LeU64},
    state::config::CreationParams,
};
use pinocchio::error::ProgramError;

/// The Pyth SOL/USD feed id (D-f; knowledge-base/tecnologia/pyth-leitor-de-preco.md).
const SOL_USD_FEED_ID: [u8; 32] = [
    0xef, 0x0d, 0x8b, 0x6f, 0xda, 0x2c, 0xeb, 0xa4, 0x1d, 0xa1, 0x5d, 0x40, 0x95, 0xd1, 0xda, 0x39,
    0x2a, 0x0d, 0x2f, 0x8e, 0xd0, 0xc6, 0xc7, 0xbc, 0x0f, 0x4c, 0xfa, 0xc8, 0xc2, 0x80, 0xb5, 0x6d,
];

/// The founder's values with the devnet [AC] values of Sprint 02. `DEFAULT_PARAMS` in
/// tests/brot/flows.ts mirrors them for the LiteSVM tests.
fn founders_values() -> CreationParams {
    CreationParams {
        opening_fee_usd: LeU64::new(500),
        opening_prize_bps: LeU16::new(9_000),
        fee_bps: LeU16::new(1_000),
        one_sided_fee_bps: LeU16::new(100),
        creator_share_bps: LeU16::new(100),
        max_open_campaigns: LeU32::new(1_000),
        min_entry_lamports: LeU64::new(10_000_000),
        sol_usd_feed_id: SOL_USD_FEED_ID,
        max_price_age: LeU32::new(120),
        max_price_conf_bps: LeU16::new(50),
        campaign_max_age: LeU32::new(120),
    }
}

/// The founder's values with one parameter changed by `set`: each value in `passes` validates,
/// and each value in `fails` is refused with `error`, that parameter's own.
fn assert_bounds<T: Copy + Debug>(
    set: fn(&mut CreationParams, T),
    passes: &[T],
    fails: &[T],
    error: BrotError,
) {
    let validate = |value: T| {
        let mut params = founders_values();
        set(&mut params, value);
        params.validate()
    };
    for &value in passes {
        assert_eq!(validate(value), Ok(()), "{value:?} must pass");
    }
    let refused: Result<(), ProgramError> = Err(error.into());
    for &value in fails {
        assert_eq!(validate(value), refused, "{value:?} must fail");
    }
}

#[test]
fn the_founders_values_pass() {
    assert_eq!(founders_values().validate(), Ok(()));
}

#[test]
fn the_bounds_are_the_ones_recorded_at_the_sprints_opening() {
    // Session log 2026-10-08 (C43 table and T18): a change here is a decision, not a refactor.
    let fees = (MAX_FEE_BPS, MAX_ONE_SIDED_FEE_BPS, MAX_CREATOR_SHARE_BPS);
    let entry = (MIN_ENTRY_FLOOR_LAMPORTS, MIN_ENTRY_CEILING_LAMPORTS);
    let prices = (MAX_PRICE_AGE_CEILING, MAX_PRICE_CONF_BPS_CEILING);
    assert_eq!((MIN_OPENING_FEE_USD, MAX_OPENING_FEE_USD), (1, 5_000));
    assert_eq!((MIN_OPENING_PRIZE_BPS, BPS_DENOMINATOR), (9_000, 10_000));
    assert_eq!(fees, (1_000, 100, 100));
    assert_eq!(MAX_OPEN_CAMPAIGNS_CEILING, 10_000);
    assert_eq!(entry, (1_000_000, 1_000_000_000));
    assert_eq!(prices, (300, 100));
    let ages = (CAMPAIGN_MAX_AGE_FLOOR, CAMPAIGN_MAX_AGE_CEILING);
    assert_eq!(ages, (30, 300));
}

#[test]
fn the_opening_price_and_its_prize_share_stay_in_range() {
    assert_bounds(
        |p, v| p.opening_fee_usd.set(v),
        &[MIN_OPENING_FEE_USD, MAX_OPENING_FEE_USD],
        &[0, MAX_OPENING_FEE_USD.checked_add(1).unwrap(), u64::MAX],
        BrotError::OpeningFeeUsdOutOfRange,
    );
    // Brot's part of a paid opening is never above 10% (D-b), and the prize never above 100%.
    let below = MIN_OPENING_PRIZE_BPS.checked_sub(1).unwrap();
    assert_bounds(
        |p, v| p.opening_prize_bps.set(v),
        &[MIN_OPENING_PRIZE_BPS, 10_000],
        &[0, below, 10_001, u16::MAX],
        BrotError::OpeningPrizeBpsOutOfRange,
    );
}

#[test]
fn the_fees_and_the_creator_share_stay_under_their_ceilings() {
    assert_bounds(
        |p, v| p.fee_bps.set(v),
        &[0, MAX_FEE_BPS],
        &[MAX_FEE_BPS.checked_add(1).unwrap(), u16::MAX],
        BrotError::FeeBpsAboveCeiling,
    );
    assert_bounds(
        |p, v| p.one_sided_fee_bps.set(v),
        &[0, MAX_ONE_SIDED_FEE_BPS],
        &[MAX_ONE_SIDED_FEE_BPS.checked_add(1).unwrap(), u16::MAX],
        BrotError::OneSidedFeeBpsAboveCeiling,
    );
    assert_bounds(
        |p, v| p.creator_share_bps.set(v),
        &[0, MAX_CREATOR_SHARE_BPS],
        &[MAX_CREATOR_SHARE_BPS.checked_add(1).unwrap(), u16::MAX],
        BrotError::CreatorShareBpsAboveCeiling,
    );
}

#[test]
fn max_open_campaigns_stays_between_one_and_its_ceiling() {
    let above = MAX_OPEN_CAMPAIGNS_CEILING.checked_add(1).unwrap();
    assert_bounds(
        |p, v| p.max_open_campaigns.set(v),
        &[1, MAX_OPEN_CAMPAIGNS_CEILING],
        &[0, above, u32::MAX],
        BrotError::MaxOpenCampaignsOutOfRange,
    );
}

#[test]
fn min_entry_lamports_stays_between_its_floor_and_ceiling() {
    let below = MIN_ENTRY_FLOOR_LAMPORTS.checked_sub(1).unwrap();
    let above = MIN_ENTRY_CEILING_LAMPORTS.checked_add(1).unwrap();
    assert_bounds(
        |p, v| p.min_entry_lamports.set(v),
        &[MIN_ENTRY_FLOOR_LAMPORTS, MIN_ENTRY_CEILING_LAMPORTS],
        &[0, below, above, u64::MAX],
        BrotError::MinEntryOutOfRange,
    );
}

#[test]
fn the_sol_usd_feed_id_is_never_all_zeros() {
    let mut one_byte = [0u8; 32];
    one_byte[31] = 1;
    assert_bounds(
        |p, v| p.sol_usd_feed_id = v,
        &[SOL_USD_FEED_ID, one_byte],
        &[[0u8; 32]],
        BrotError::SolUsdFeedIdZero,
    );
}

#[test]
fn the_sol_usd_read_bounds_stay_between_one_and_their_ceilings() {
    assert_bounds(
        |p, v| p.max_price_age.set(v),
        &[1, MAX_PRICE_AGE_CEILING],
        &[0, MAX_PRICE_AGE_CEILING.checked_add(1).unwrap(), u32::MAX],
        BrotError::MaxPriceAgeOutOfRange,
    );
    let above = MAX_PRICE_CONF_BPS_CEILING.checked_add(1).unwrap();
    assert_bounds(
        |p, v| p.max_price_conf_bps.set(v),
        &[1, MAX_PRICE_CONF_BPS_CEILING],
        &[0, above, u16::MAX],
        BrotError::MaxPriceConfOutOfRange,
    );
}

#[test]
fn campaign_max_age_is_never_below_thirty_seconds_nor_above_its_ceiling() {
    let below = CAMPAIGN_MAX_AGE_FLOOR.checked_sub(1).unwrap();
    let above = CAMPAIGN_MAX_AGE_CEILING.checked_add(1).unwrap();
    assert_bounds(
        |p, v| p.campaign_max_age.set(v),
        &[CAMPAIGN_MAX_AGE_FLOOR, CAMPAIGN_MAX_AGE_CEILING],
        &[0, below, above, u32::MAX],
        BrotError::CampaignMaxAgeOutOfRange,
    );
}
