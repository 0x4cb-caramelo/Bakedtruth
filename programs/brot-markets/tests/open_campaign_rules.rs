//! Purpose: the rules of `user_open_campaign` that read no account, on the host: row 1 (the six
//!          kinds, `StakeAtLeast` behind its feature, `DbcGraduated` off mainnet), the canonical
//!          arguments (D-j), the terms the creator saw, and the fields `record` stores per kind.
//! Version: 0.0.2
//! Sprint: 03 (readers and resolution), lane F; the sixth kind. The handler runs the same rules
//!         in LiteSVM (tests/brot/open-campaign-kinds.test.ts and its siblings), after the build.

use brot_markets::{
    error::BrotError,
    instructions::campaigns::open_campaign::{
        payment::Payment,
        record::{opened_event, write, Opening},
        rules::*,
        OpenCampaignArgs,
    },
    layout::{LeI128, LeI64, LeU16, LeU32, LeU64, ZeroCopy},
    state::{
        campaign::Campaign,
        config::CreationParams,
        enums::{Direction, ReaderKind},
    },
};
use pinocchio::Address;

const KINDS: [ReaderKind; 6] = [
    ReaderKind::PriceTouch,
    ReaderKind::SupplyAtMost,
    ReaderKind::DammV2LockedAtLeast,
    ReaderKind::StakePoolTvlAtLeast,
    ReaderKind::StakeAtLeast,
    ReaderKind::DbcGraduated,
];
const NO_FEED: [u8; 32] = [0; 32];
const FEED: [u8; 32] = [7; 32];
const UNUSED: Result<Direction, BrotError> = Err(BrotError::UnusedArgumentNotZero);
const ABOVE: Result<Direction, BrotError> = Ok(Direction::Above);

/// What row 1 answers for `kind`, whether or not it opens in this build.
fn row_1(kind: ReaderKind, opens: bool) -> Result<ReaderKind, BrotError> {
    opens.then_some(kind).ok_or(BrotError::ReaderKindNotOpen)
}

#[test]
fn row_1_four_kinds_open_stake_at_least_with_its_feature_and_dbc_off_mainnet() {
    assert_eq!(STAKE_AT_LEAST_OPENS, cfg!(feature = "stake-at-least"));
    assert_eq!(DBC_GRADUATED_OPENS, !cfg!(feature = "mainnet"));
    for kind in &KINDS[..4] {
        assert_eq!(opening_kind(*kind as u8), Ok(*kind));
    }
    let (stake, dbc) = (ReaderKind::StakeAtLeast, ReaderKind::DbcGraduated);
    assert_eq!(opening_kind(4), row_1(stake, STAKE_AT_LEAST_OPENS));
    assert_eq!(opening_kind(5), row_1(dbc, DBC_GRADUATED_OPENS));
    for byte in 6..=u8::MAX {
        assert_eq!(opening_kind(byte), Err(BrotError::UnknownReaderKind));
    }
}

#[test]
fn every_kind_refuses_a_direction_byte_that_names_no_direction() {
    for kind in KINDS {
        for byte in [2, 255] {
            let refused = canonical_direction(kind, byte, &NO_FEED, 0);
            assert_eq!(refused, Err(BrotError::InvalidDirection));
        }
    }
}

#[test]
fn the_price_kind_takes_a_feed_and_both_directions_but_no_epoch() {
    let price =
        |direction, epoch| canonical_direction(ReaderKind::PriceTouch, direction, &FEED, epoch);
    assert_eq!(price(0, 0), ABOVE);
    assert_eq!(price(1, 0), Ok(Direction::Below));
    assert_eq!(price(1, 1), UNUSED);
    assert_eq!(price(0, u64::MAX), UNUSED);
}

#[test]
fn the_other_kinds_refuse_any_byte_of_a_feed_and_the_below_direction() {
    for kind in &KINDS[1..] {
        let epoch = if kind.measured_by_epoch() { 900 } else { 0 };
        assert_eq!(canonical_direction(*kind, 0, &NO_FEED, epoch), ABOVE);
        assert_eq!(canonical_direction(*kind, 1, &NO_FEED, epoch), UNUSED);
        for at in 0..32 {
            let mut feed = NO_FEED;
            feed[at] = 1;
            assert_eq!(canonical_direction(*kind, 0, &feed, epoch), UNUSED);
        }
    }
}

#[test]
fn only_the_epoch_kinds_take_an_epoch_and_their_reader_checks_it() {
    for kind in KINDS {
        let taken = canonical_direction(kind, 0, &NO_FEED, 1);
        if kind.measured_by_epoch() {
            assert_eq!(taken, ABOVE);
            // Epoch 0 passes here: whether it has started is the reader's row 5.
            assert_eq!(canonical_direction(kind, 0, &NO_FEED, 0), ABOVE);
        } else if kind != ReaderKind::PriceTouch {
            assert_eq!(taken, UNUSED);
        }
    }
}

#[test]
fn an_opening_signed_against_other_params_is_refused_older_or_newer() {
    assert_eq!(terms_unchanged(0, 0), Ok(()));
    assert_eq!(terms_unchanged(7, 7), Ok(()));
    assert_eq!(terms_unchanged(u32::MAX, u32::MAX), Ok(()));
    let changed = Err(BrotError::CreationParamsChanged);
    assert_eq!(terms_unchanged(0, 1), changed);
    assert_eq!(terms_unchanged(2, 1), changed);
    assert_eq!(terms_unchanged(u32::MAX, 0), changed);
}

/// Opening arguments for `kind` with `feed`, `direction` and `epoch` as given.
fn args(kind: ReaderKind, feed_id: [u8; 32], direction: Direction, epoch: u64) -> OpenCampaignArgs {
    OpenCampaignArgs {
        id: LeU64::new(42),
        kind: kind as u8,
        direction: direction as u8,
        feed_id,
        target: LeI128::new(1_000_000),
        deadline_at: LeI64::new(1_800_000_000),
        opening_usd: LeU64::new(0),
        max_lamports: LeU64::new(0),
        epoch: LeU64::new(epoch),
        expected_params_version: LeU32::new(3),
    }
}

/// The campaign `record::write` leaves for `args`, the reader having reported exponent −8.
fn recorded(args: &OpenCampaignArgs, kind: ReaderKind, direction: Direction) -> Vec<u8> {
    let params = CreationParams {
        opening_fee_usd: LeU64::new(500),
        opening_prize_bps: LeU16::new(9_000),
        fee_bps: LeU16::new(1_000),
        one_sided_fee_bps: LeU16::new(100),
        creator_share_bps: LeU16::new(100),
        max_open_campaigns: LeU32::new(1_000),
        min_entry_lamports: LeU64::new(10_000_000),
        sol_usd_feed_id: FEED,
        max_price_age: LeU32::new(120),
        max_price_conf_bps: LeU16::new(50),
        campaign_max_age: LeU32::new(90),
    };
    let creator = Address::new_from_array([1; 32]);
    let metric = Address::new_from_array([2; 32]);
    let mut bytes = vec![0u8; Campaign::LEN];
    let campaign = Campaign::from_bytes_mut(&mut bytes).unwrap();
    let opening = Opening {
        args,
        kind,
        direction,
        bump: 255,
        vault_bump: 254,
        creator: &creator,
        is_team: true,
        params: &params,
        metric_account: &metric,
        price_exponent: -8,
        now: 1_790_000_000,
        entries_close_at: 1_799_000_000,
        payment: Payment::default(),
    };
    write(campaign, &opening);
    bytes
}

#[test]
fn a_price_campaign_stores_its_exponent_and_the_configs_join_age() {
    let a = args(ReaderKind::PriceTouch, FEED, Direction::Below, 0);
    let bytes = recorded(&a, ReaderKind::PriceTouch, Direction::Below);
    let c = Campaign::from_bytes(&bytes).unwrap();
    let event = opened_event(&Address::new_from_array([3; 32]), c);
    assert_eq!((c.price_exponent.get(), c.max_age.get()), (-8, 90));
    assert_eq!((c.feed_id, c.direction, c.epoch.get()), (FEED, 1, 0));
    assert_eq!((event.price_exponent.get(), event.max_age.get()), (-8, 90));
}

#[test]
fn the_other_kinds_store_zero_in_every_price_only_field_and_the_epoch_kinds_their_epoch() {
    for kind in &KINDS[1..] {
        let epoch = if kind.measured_by_epoch() { 1_048 } else { 0 };
        let a = args(*kind, NO_FEED, Direction::Above, epoch);
        let bytes = recorded(&a, *kind, Direction::Above);
        let c = Campaign::from_bytes(&bytes).unwrap();
        let event = opened_event(&Address::new_from_array([3; 32]), c);
        // The reader's exponent is ignored and the join-time age is not copied (D-j).
        assert_eq!((c.price_exponent.get(), c.max_age.get()), (0, 0));
        assert_eq!((c.feed_id, c.direction, c.kind), (NO_FEED, 0, *kind as u8));
        assert_eq!((c.epoch.get(), event.epoch.get()), (epoch, epoch));
        assert_eq!((event.price_exponent.get(), event.max_age.get()), (0, 0));
        assert_eq!((c.target.get(), event.target.get()), (1_000_000, 1_000_000));
    }
}
