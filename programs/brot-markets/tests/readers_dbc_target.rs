//! Purpose: row 3 of the graduation kind (`DbcGraduated`) on the captured Meteora DBC pools: the
//!          target is the curve's threshold and nothing else, a completed curve is refused (the
//!          real migrated one included), at least 10% of the threshold is still missing; every
//!          refusal of rows 2 and 3 in its order; the distance, the floor and the build switch,
//!          and the mainnet build's real values (T12).
//! Version: 0.0.1
//! Sprint: after 05 (the sixth kind, `DbcGraduated`)

mod dbc_support;
mod opening_support;
mod readers_support;

use brot_markets::{
    constants::{DBC_MIN_GRADUATION_LAMPORTS, MIN_DISTANCE_BPS_DBC},
    error::BrotError::*,
    instructions::campaigns::open_campaign::rules::{opening_kind, DBC_GRADUATED_OPENS},
    readers::{min_distance, CreationReading},
};
use dbc_support::*;
use readers_support::*;

const OPENED: Res<CreationReading> = Ok(CreationReading { price_exponent: 0 });
const T85: i128 = 85_000_000_000;
/// The most a curve may have raised and still open: 85 SOL less 10%; one lamport more; one short.
const MOST_RAISED: u64 = THRESHOLD_85 - DISTANCE_85;
const ONE_TOO_MANY: u64 = MOST_RAISED + 1;
const ALMOST_FULL: u64 = THRESHOLD_85 - 1;

/// The stage-0 pool with `raised` and `stage` set, opened with its config and a target of 85 SOL.
fn open_raised(stage: u8, raised: u64) -> Res<CreationReading> {
    let pool = &mut dbc(STAGE0_AT, &pool_with(STAGE0, stage, 0, raised));
    open_dbc(pool, Some(&mut dbc(CONFIG_85_AT, CONFIG_85)), T85)
}

#[test]
fn the_target_is_the_threshold_and_nothing_else() {
    let targets = [
        i128::MIN,
        -1,
        0,
        1,
        sub(T85, 1),
        add(T85, 1),
        add(T85, T85),
        i128::MAX,
    ];
    for target in targets {
        assert_eq!(open_stage0(target), refused(TargetNotThreshold), "{target}");
    }
    assert_eq!(open_stage0(T85), OPENED);
}

#[test]
fn a_completed_curve_is_refused_the_real_migrated_one_included() {
    let stage3 = &mut dbc(STAGE3_AT, STAGE3);
    let config = &mut dbc(CONFIG_STAGE3_AT, CONFIG_STAGE3);
    assert_eq!(
        open_dbc(stage3, Some(config), T85),
        refused(TargetAlreadyTouched)
    );
    for stage in 1..=3 {
        let opened = open_raised(stage, STAGE0_RAISED);
        assert_eq!(opened, refused(TargetAlreadyTouched), "{stage}");
    }
}

#[test]
fn at_least_ten_percent_of_the_threshold_must_still_be_missing() {
    assert_eq!(min_distance(T85, MIN_DISTANCE_BPS_DBC), Ok(8_500_000_000));
    let rows = [
        (0, OPENED),
        (STAGE0_RAISED, OPENED),
        (MOST_RAISED, OPENED),
        (ONE_TOO_MANY, refused(TargetTooClose)),
        (ALMOST_FULL, refused(TargetTooClose)),
        // Never written by DBC on the curve, and refused all the same.
        (THRESHOLD_85, refused(TargetTooClose)),
        (u64::MAX, refused(TargetTooClose)),
    ];
    for (raised, expected) in rows {
        assert_eq!(open_raised(0, raised), expected, "{raised}");
    }
}

#[test]
fn each_refusal_comes_in_its_order() {
    // The pool before the config, the config before the target, the target before the stage,
    // the stage before the distance.
    let hook = &mut dbc(HOOK_AT, HOOK);
    let config = &mut dbc(CONFIG_STAGE3_AT, CONFIG_STAGE3);
    assert_eq!(
        open_dbc(hook, Some(config), 0),
        refused(CurveHasTransferHook)
    );
    let usdc = &mut dbc(USDC_AT, USDC);
    let usdc_config = &mut dbc(CONFIG_USDC_AT, CONFIG_USDC);
    assert_eq!(open_dbc(usdc, Some(usdc_config), 0), refused(CurveNotInSol));
    let stage3 = &mut dbc(STAGE3_AT, STAGE3);
    let config = &mut dbc(CONFIG_STAGE3_AT, CONFIG_STAGE3);
    assert_eq!(
        open_dbc(stage3, Some(config), 0),
        refused(TargetNotThreshold)
    );
    assert_eq!(open_raised(2, u64::MAX), refused(TargetAlreadyTouched));
}

#[test]
fn the_floor_the_distance_and_the_build_switch() {
    let floor = if cfg!(feature = "drill") {
        SOL
    } else {
        THRESHOLD_85
    };
    assert_eq!(
        (DBC_MIN_GRADUATION_LAMPORTS, MIN_DISTANCE_BPS_DBC),
        (floor, 1_000)
    );
    assert_eq!(DBC_GRADUATED_OPENS, !cfg!(feature = "mainnet"));
    let expected = if DBC_GRADUATED_OPENS {
        Ok(KIND)
    } else {
        Err(ReaderKindNotOpen)
    };
    assert_eq!(opening_kind(KIND as u8), expected);
}

/// T12: the mainnet build carries the real 85 SOL floor and does not open the kind (M-7).
#[cfg(feature = "mainnet")]
#[test]
fn the_mainnet_build_keeps_the_real_floor_and_the_kind_closed() {
    let switch = (DBC_MIN_GRADUATION_LAMPORTS, DBC_GRADUATED_OPENS);
    assert_eq!(switch, (85_000_000_000, false));
    assert_eq!(opening_kind(5), Err(ReaderKindNotOpen));
}
