//! Purpose: the graduation kind's pool read (`DbcGraduated`) on the Meteora DBC pools captured from
//!          mainnet, one at each stage, and on broken copies of them: the fields read, the stamp,
//!          the owner before a byte, the layout, a stage DBC does not define, and the transfer-hook
//!          pool, refused with its own error at opening, at a join and before the deadline.
//! Version: 0.0.1
//! Sprint: after 05 (the sixth kind, `DbcGraduated`)

mod dbc_support;
mod opening_support;
mod readers_support;

use brot_markets::{
    constants::{DAMM_V2_PROGRAM_ID, DBC_PROGRAM_ID, SPL_TOKEN_PROGRAM_ID},
    error::BrotError::{self, *},
    readers::{
        dbc_graduation::TRANSFER_HOOK_POOL_DISCRIMINATOR as HOOK_DISCRIMINATOR,
        dbc_graduation::{read_pool, CurvePool, MIGRATION_PROGRESS_AT, POOL_DISCRIMINATOR},
        Decision,
        Resolution::Decided,
        Stamped,
    },
    state::enums::VoidReason,
};
use dbc_support::*;
use opening_support::{HostAccount, NOW};
use pinocchio::{address::address, Address};
use readers_support::*;

const NOBODY: Address = Address::new_from_array([0; 32]);
const CONFIG_STAGE1_AT: Address = address!("AJbw8hW4bRSRQQrKdbSfAEQQNobxYk7WiPAnzzd2Bmsx");
const CONFIG_STAGE2_AT: Address = address!("B5iBLfLs2HLECyrZha7cKoT8wqWDeWe5WmjyvToez7z7");
/// Resolution and the join lock never read this kind's target; the tests pass 85 SOL.
const TARGET: i128 = 85_000_000_000;

/// The pool `read_pool` returns: its config, the quote raised, the stage and the stamp.
fn pool(config: Address, raised: u64, stage: u8, stamp: u64) -> Result<CurvePool, BrotError> {
    Ok(CurvePool {
        config,
        quote_reserve: raised,
        stage,
        finish_curve_timestamp: stamp,
    })
}

fn read(data: &[u8]) -> Result<CurvePool, BrotError> {
    read_pool(&DBC_PROGRAM_ID, data)
}

#[test]
fn reads_the_real_pools_at_each_stage() {
    let stage1 = pool(CONFIG_STAGE1_AT, STAGE1_RAISED, 1, STAGE1_STAMP);
    let stage2 = pool(CONFIG_STAGE2_AT, STAGE2_RAISED, 2, STAGE2_STAMP);
    // The migrated pool raised exactly its 85 SOL threshold, and DBC stamped when.
    let stage3 = pool(CONFIG_STAGE3_AT, STAGE3_RAISED, 3, STAGE3_STAMP);
    assert_eq!(read(STAGE0), pool(CONFIG_85_AT, STAGE0_RAISED, 0, 0));
    assert_eq!(
        (read(STAGE1), read(STAGE2), read(STAGE3)),
        (stage1, stage2, stage3)
    );
    assert_eq!(read(SMALL), pool(CONFIG_SMALL_AT, SMALL_RAISED, 0, 0));
    assert_eq!(read(USDC), pool(CONFIG_USDC_AT, 9_900, 0, 0));
    assert_eq!(STAGE0[..8], POOL_DISCRIMINATOR);
    assert_eq!(HOOK[..8], HOOK_DISCRIMINATOR);
}

#[test]
fn the_stamp_counts_only_once_the_curve_has_completed() {
    let stamped = |data: &[u8]| read(data).map(|pool| pool.stamped());
    let unmet = Stamped {
        observed: 19_457_897,
        met_at: None,
    };
    assert_eq!(stamped(STAGE0), Ok(unmet));
    let met = [
        (STAGE1, STAGE1_RAISED, STAGE1_STAMP),
        (STAGE3, STAGE3_RAISED, STAGE3_STAMP),
    ];
    for (data, raised, at) in met {
        let observed = i128::from(raised);
        let met_at = Some(at);
        assert_eq!(stamped(data), Ok(Stamped { observed, met_at }));
    }
    // A stamp left on a pool still on the curve is not read: the stage decides.
    let stray = pool_with(STAGE0, 0, 1, 5);
    assert_eq!(stamped(&stray).map(|s| s.met_at), Ok(None));
}

#[test]
fn refuses_every_other_owner_before_reading_a_byte() {
    for owner in [
        SPL_TOKEN_PROGRAM_ID,
        DAMM_V2_PROGRAM_ID,
        brot_markets::ID,
        NOBODY,
    ] {
        assert_eq!(read_pool(&owner, STAGE0), Err(ReaderWrongOwner));
        assert_eq!(read_pool(&owner, &[]), Err(ReaderWrongOwner));
        let config = &mut dbc(CONFIG_85_AT, CONFIG_85);
        let pool = &mut HostAccount::new(STAGE0_AT, owner, STAGE0);
        assert_eq!(
            open_dbc(pool, Some(config), TARGET),
            refused(ReaderWrongOwner)
        );
        let gone = || HostAccount::new(STAGE1_AT, owner, STAGE1);
        assert_eq!(
            knowable(KIND, &mut gone(), TARGET),
            refused(ReaderWrongOwner)
        );
        let resolved = resolve(KIND, &mut gone(), TARGET, NOW);
        assert_eq!(resolved, refused(ReaderWrongOwner));
    }
}

#[test]
fn cut_stretched_or_zeroed_pools_are_errors_never_panics() {
    let read = |owner: &Address, data: &[u8]| read_pool(owner, data).map(|_| ());
    let pools = [
        (STAGE0_AT, STAGE0),
        (STAGE1_AT, STAGE1),
        (STAGE2_AT, STAGE2),
        (STAGE3_AT, STAGE3),
    ];
    for (address, fixture) in pools {
        let pool = (address, DBC_PROGRAM_ID);
        assert_refuses_broken_copies(KIND, pool, fixture, ReaderBadLayout, read);
    }
}

#[test]
fn another_discriminator_or_a_stage_dbc_does_not_define_is_bad_layout() {
    for (at, byte) in STAGE0[..8].iter().enumerate() {
        let flipped = patched(STAGE0, at, &[byte ^ 0x01]);
        assert_eq!(read(&flipped), Err(ReaderBadLayout), "byte {at}");
    }
    for stage in [4, 5, 255] {
        let data = patched(STAGE3, MIGRATION_PROGRESS_AT, &[stage]);
        assert_eq!(read(&data), Err(ReaderBadLayout), "{stage}");
    }
}

#[test]
fn a_transfer_hook_pool_is_refused_with_its_own_error_then_voids() {
    // The captured transfer-hook pool, and a plain pool's bytes under its discriminator.
    let as_hook = patched(STAGE0, 0, &HOOK_DISCRIMINATOR);
    for data in [HOOK, as_hook.as_slice()] {
        assert_eq!(read(data), Err(CurveHasTransferHook));
    }
    let hook = || dbc(HOOK_AT, HOOK);
    let config = &mut dbc(CONFIG_HOOK_AT, CONFIG_HOOK);
    let refusal = refused(CurveHasTransferHook);
    assert_eq!(open_dbc(&mut hook(), Some(config), TARGET), refusal);
    assert_eq!(
        knowable(KIND, &mut hook(), TARGET),
        refused(CurveHasTransferHook)
    );
    assert_eq!(
        resolve(KIND, &mut hook(), TARGET, DEADLINE),
        refused(CurveHasTransferHook)
    );
    let void = Decision::void(VoidReason::UnreadableAccount, reading(HOOK_AT, 0));
    assert_eq!(resolve(KIND, &mut hook(), TARGET, AFTER), Ok(Decided(void)));
    // Its bytes under the plain discriminator read as a pool: the layout is the same.
    let plain = patched(HOOK, 0, &POOL_DISCRIMINATOR);
    assert_eq!(read(&plain).map(|pool| pool.quote_reserve), Ok(546_813_395));
}
