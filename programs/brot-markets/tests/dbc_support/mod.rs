//! Purpose: what the graduation kind's host tests share: the Meteora DBC pools and configs captured
//!          from mainnet (tests/fixtures, never edited), their addresses and pinned values, copies
//!          with one field changed in memory, and an opening that passes the pool's config after
//!          the nine slots.
//! Version: 0.0.1
//! Sprint: after 05 (the sixth kind, `DbcGraduated`)
// Each test file that includes this module uses only part of it.
#![allow(dead_code)]

use brot_markets::{
    constants::DBC_PROGRAM_ID,
    readers::{
        dbc_graduation::{FINISH_CURVE_TIMESTAMP_AT, MIGRATION_PROGRESS_AT, QUOTE_RESERVE_AT},
        validate_at_creation, CreationContext, CreationReading,
    },
    state::enums::{Direction, ReaderKind},
};
use pinocchio::{address::address, Address};

use crate::opening_support::{HostAccount, NOW};
use crate::readers_support::{at, patched, Res, DEADLINE};

pub const KIND: ReaderKind = ReaderKind::DbcGraduated;
pub const SOL: u64 = 1_000_000_000;

// Real mainnet accounts (scripts/capture-fixtures-dbc.ts), captured at slot 456,186,130.
pub const STAGE0: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-pool-stage0.bin");
pub const STAGE1: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-pool-stage1.bin");
pub const STAGE2: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-pool-stage2.bin");
pub const STAGE3: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-pool-stage3.bin");
pub const SMALL: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-pool-11sol.bin");
pub const USDC: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-pool-usdc.bin");
pub const HOOK: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-hook-pool.bin");
pub const CONFIG_85: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-config-85sol.bin");
pub const CONFIG_STAGE3: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-config-stage3.bin");
pub const CONFIG_SMALL: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-config-11sol.bin");
pub const CONFIG_USDC: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-config-usdc.bin");
pub const CONFIG_HOOK: &[u8] = include_bytes!("../../../../tests/fixtures/dbc-hook-config.bin");

pub const STAGE0_AT: Address = address!("mxGZ5hpgCENm94f19rp8NoBd14E4YLXVe4ZFJXQP8S6");
pub const STAGE1_AT: Address = address!("5sNKeCx162vt6rJmiz2gARcax74HFtwPjGkxDg3zurdf");
pub const STAGE2_AT: Address = address!("9A3dtuE7mtdAShFDoVtZEyBdG1kJHym8DUkeR4VqxwF");
pub const STAGE3_AT: Address = address!("2GDDUim6HEM58k1vwFcAZ8KT79jXic6eJiLWkgbBaNo9");
pub const SMALL_AT: Address = address!("5r3zMQNJBDyyVThjK2ba3mffxKkE97x9Jvx6QVo8h8i5");
pub const USDC_AT: Address = address!("7CLJhnNdfzr91eibB4L8r5PKP1L4nNmkjpWJCiGF1Sca");
pub const HOOK_AT: Address = address!("19FgvYumZoSwc5hxxH18QPsowjYURDAPHrPydSJ79Nv");
pub const CONFIG_85_AT: Address = address!("4hHU3Uu4THMoWUG8fpTfbT921PeYJ1yni6NZEGfTLYRm");
pub const CONFIG_STAGE3_AT: Address = address!("GXn7ng2QbEoGqUcNpuc2v7iqnez71waBsxEH4obiHVAB");
pub const CONFIG_SMALL_AT: Address = address!("EiN7QibVnPq8kYUmxB8KtFCt9WgXpz17QyQRmapPnCUW");
pub const CONFIG_USDC_AT: Address = address!("4Tr44n6TUwQvihe4vuBpNWvwUkHip5fyMCkrubXhseqt");
pub const CONFIG_HOOK_AT: Address = address!("HKf3CHysP3YbCudWnYuBBwHSwSGE2GpjxmRakefUhjyX");
pub const WSOL: Address = address!("So11111111111111111111111111111111111111112");
pub const USDC_MINT: Address = address!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

/// The quote each captured pool had raised, in lamports (base units of USDC for the USDC pool).
pub const STAGE0_RAISED: u64 = 19_457_897;
pub const STAGE1_RAISED: u64 = 543_005_542;
pub const STAGE2_RAISED: u64 = 1_007_049_641;
pub const STAGE3_RAISED: u64 = 85_000_000_000;
pub const SMALL_RAISED: u64 = 10_765_146_729;
/// When the three graduated pools completed their curves, as each stamped it.
pub const STAGE1_STAMP: u64 = 1_747_723_621;
pub const STAGE2_STAMP: u64 = 1_754_354_560;
pub const STAGE3_STAMP: u64 = 1_762_617_513;
/// The thresholds: 85 SOL (stage 0's and stage 3's configs), 11 SOL, 1 USDC.
pub const THRESHOLD_85: u64 = 85 * SOL;
pub const THRESHOLD_SMALL: u64 = 11 * SOL;
/// 10% of 85 SOL: row 3's distance on an 85 SOL curve.
pub const DISTANCE_85: u64 = 8_500_000_000;

/// An account DBC owns, holding `data`.
pub fn dbc(address: Address, data: &[u8]) -> HostAccount {
    HostAccount::new(address, DBC_PROGRAM_ID, data)
}

/// A captured pool with its stage, its stamp and the quote raised set as given.
pub fn pool_with(data: &[u8], stage: u8, stamp: u64, raised: u64) -> Vec<u8> {
    let staged = patched(data, MIGRATION_PROGRESS_AT, &[stage]);
    let stamped = patched(&staged, FINISH_CURVE_TIMESTAMP_AT, &stamp.to_le_bytes());
    patched(&stamped, QUOTE_RESERVE_AT, &raised.to_le_bytes())
}

/// The stage-0 pool once its curve completed at `stamp`, at stage `stage`, with 85 SOL raised.
pub fn graduated_at(stage: u8, stamp: u64) -> HostAccount {
    dbc(STAGE0_AT, &pool_with(STAGE0, stage, stamp, THRESHOLD_85))
}

/// Rows 2 and 3 for the graduation kind on `pool`, with `config` passed after the nine slots (or
/// none), and the arguments a fact campaign passes: no feed, `Above`, epoch 0, seven days.
pub fn open_dbc(
    pool: &mut HostAccount,
    config: Option<&mut HostAccount>,
    target: i128,
) -> Res<CreationReading> {
    let view = pool.view();
    let config_view = config.map(|config| config.view());
    let context = CreationContext {
        metric: &view,
        feed_id: &[0; 32],
        direction: Direction::Above,
        target,
        max_age: 0,
        epoch: 0,
        deadline_at: DEADLINE,
        time: at(NOW),
        curve_config: config_view.as_ref(),
    };
    validate_at_creation(KIND, &context)
}

/// An opening on the stage-0 pool, with its 85 SOL config, as captured.
pub fn open_stage0(target: i128) -> Res<CreationReading> {
    let config = &mut dbc(CONFIG_85_AT, CONFIG_85);
    open_dbc(&mut dbc(STAGE0_AT, STAGE0), Some(config), target)
}
