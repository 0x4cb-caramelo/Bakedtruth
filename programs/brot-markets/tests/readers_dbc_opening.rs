//! Purpose: row 2 of the graduation kind (`DbcGraduated`) on the captured Meteora DBC configs: the
//!          account passed after the nine slots is missing, another pool's, another owner's,
//!          another layout, priced in USDC or below the floor, each with its own refusal; the
//!          config read itself; the floor, inclusive.
//! Version: 0.0.1
//! Sprint: after 05 (the sixth kind, `DbcGraduated`)

mod dbc_support;
mod opening_support;
mod readers_support;

use brot_markets::{
    constants::{DBC_MIN_GRADUATION_LAMPORTS, DBC_PROGRAM_ID, SPL_TOKEN_PROGRAM_ID},
    error::BrotError::*,
    readers::{
        dbc_graduation::{read_config, CurveConfig, CONFIG_DISCRIMINATOR, THRESHOLD_AT},
        CreationReading,
    },
};
use dbc_support::*;
use opening_support::HostAccount;
use pinocchio::{error::ProgramError, Address};
use readers_support::*;

const OPENED: Res<CreationReading> = Ok(CreationReading { price_exponent: 0 });
const T85: i128 = 85_000_000_000;

/// The stage-0 pool with `config` (its bytes, its owner) at the pool's own config address.
fn open_config(config: &[u8], owner: Address, target: i128) -> Res<CreationReading> {
    let config = &mut HostAccount::new(CONFIG_85_AT, owner, config);
    open_dbc(&mut dbc(STAGE0_AT, STAGE0), Some(config), target)
}

#[test]
fn opens_on_the_real_curve_with_its_own_config() {
    assert_eq!(open_stage0(T85), OPENED);
}

#[test]
fn the_config_must_be_passed_and_be_the_pools_own() {
    let pool = || dbc(STAGE0_AT, STAGE0);
    let missing = open_dbc(&mut pool(), None, T85);
    assert_eq!(missing, Err(ProgramError::NotEnoughAccountKeys));
    // Another pool's real 85 SOL config, the pool itself, the program's own id: not its config.
    let others = [
        (CONFIG_STAGE3_AT, CONFIG_STAGE3),
        (STAGE0_AT, STAGE0),
        (DBC_PROGRAM_ID, CONFIG_85),
    ];
    for (address, data) in others {
        let config = &mut dbc(address, data);
        let opened = open_dbc(&mut pool(), Some(config), T85);
        assert_eq!(opened, refused(CurveConfigMismatch), "{address:?}");
    }
}

#[test]
fn the_config_is_read_owner_first_then_as_a_pool_config() {
    let other_owner = open_config(CONFIG_85, SPL_TOKEN_PROGRAM_ID, T85);
    assert_eq!(other_owner, refused(ReaderWrongOwner));
    let flipped = patched(CONFIG_85, 0, &[CONFIG_85[0] ^ 0x01]);
    let stretched = [CONFIG_85, &[0]].concat();
    let cut = &CONFIG_85[..1_047];
    // A config with a transfer hook is 1,128 bytes: refused by its size.
    for data in [
        cut,
        stretched.as_slice(),
        flipped.as_slice(),
        CONFIG_HOOK,
        &[],
    ] {
        let opened = open_config(data, DBC_PROGRAM_ID, T85);
        assert_eq!(opened, refused(ReaderBadLayout), "{} bytes", data.len());
    }
}

#[test]
fn a_curve_priced_in_usdc_is_refused() {
    let usdc = &mut dbc(USDC_AT, USDC);
    let config = &mut dbc(CONFIG_USDC_AT, CONFIG_USDC);
    assert_eq!(
        open_dbc(usdc, Some(config), 1_000_000),
        refused(CurveNotInSol)
    );
}

#[test]
fn a_curve_below_the_floor_is_refused_and_the_floor_itself_opens() {
    let small = &mut dbc(SMALL_AT, SMALL);
    let config = &mut dbc(CONFIG_SMALL_AT, CONFIG_SMALL);
    let opened = open_dbc(small, Some(config), i128::from(THRESHOLD_SMALL));
    // The drill floor of 1 SOL lets the 11 SOL curve through, 97.9% filled: too close then.
    let expected = if cfg!(feature = "drill") {
        TargetTooClose
    } else {
        CurveTooSmall
    };
    assert_eq!(opened, refused(expected));
    let floor = DBC_MIN_GRADUATION_LAMPORTS;
    for (threshold, expected) in [
        (floor.checked_sub(1).unwrap(), refused(CurveTooSmall)),
        (floor, OPENED),
    ] {
        let config = patched(CONFIG_85, THRESHOLD_AT, &threshold.to_le_bytes());
        let opened = open_config(&config, DBC_PROGRAM_ID, i128::from(threshold));
        assert_eq!(opened, expected, "{threshold}");
    }
}

#[test]
fn reads_the_real_configs_and_refuses_the_rest() {
    let read = |data: &[u8]| read_config(&DBC_PROGRAM_ID, data);
    let config = |quote_mint, threshold| {
        Ok(CurveConfig {
            quote_mint,
            threshold,
        })
    };
    assert_eq!(read(CONFIG_85), config(WSOL, THRESHOLD_85));
    assert_eq!(read(CONFIG_STAGE3), config(WSOL, THRESHOLD_85));
    assert_eq!(read(CONFIG_SMALL), config(WSOL, THRESHOLD_SMALL));
    assert_eq!(read(CONFIG_USDC), config(USDC_MINT, 1_000_000));
    assert_eq!(read(CONFIG_HOOK), Err(ReaderBadLayout));
    assert_eq!(CONFIG_85[..8], CONFIG_DISCRIMINATOR);
    let other_owner = read_config(&SPL_TOKEN_PROGRAM_ID, CONFIG_85);
    assert_eq!(other_owner, Err(ReaderWrongOwner));
    for (name, bytes) in broken_copies(CONFIG_85) {
        assert_eq!(read(&bytes), Err(ReaderBadLayout), "{name}");
    }
}
