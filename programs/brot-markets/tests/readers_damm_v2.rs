//! Purpose: the locked-liquidity kind's reader (`DammV2LockedAtLeast`) on the two DAMM v2 pools
//!          captured from mainnet and on broken copies of them: the read, the saturation above
//!          i128::MAX, rows 2 and 3 in their order, the join lock and resolution.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution), lane A

mod opening_support;
mod readers_support;

use brot_markets::{
    constants::{DAMM_V2_PROGRAM_ID, MIN_DISTANCE_BPS_DAMM, SPL_TOKEN_PROGRAM_ID},
    error::BrotError::*,
    readers::{
        damm_v2::PERMANENT_LOCK_LIQUIDITY_AT as LOCKED_AT,
        damm_v2::{read_locked_liquidity as read_pool, POOL_DISCRIMINATOR},
        min_distance, CreationReading, Decision,
        Resolution::Decided,
    },
    state::enums::ReaderKind,
};
use opening_support::{HostAccount, NOW};
use pinocchio::{address::address, error::ProgramError, Address};
use readers_support::*;

// Real mainnet pools (scripts/capture-fixtures.ts); the files are never edited.
const DAMM_SOL_USDC: &[u8] = include_bytes!("../../../tests/fixtures/damm-sol-usdc.bin");
const DAMM_FT8FD9: &[u8] = include_bytes!("../../../tests/fixtures/damm-ft8fd9.bin");
const SOL_USDC: Address = address!("8Pm2kZpnxD3hoMmt4bjStX2Pw2Z9abpbHzZxMPqxPmie");
const FT8FD9: Address = address!("Ft8FD9gg1TdawhWijNzdkpYTiVL8ETfY6gAwS24bwYio");
/// An owner no program has: the all-zero address.
const NOBODY: Address = Address::new_from_array([0; 32]);

const KIND: ReaderKind = ReaderKind::DammV2LockedAtLeast;
/// The liquidity locked forever in each captured pool, and row 3's distance from it: 1%, rounded
/// up.
const SOL_USDC_LOCKED: i128 = 24_632_261_441_830_973_163_426_669_659;
const SOL_USDC_DISTANCE: i128 = 246_322_614_418_309_731_634_266_697;
const FT8_LOCKED: i128 = 36_147_769_331_809_244_933_896_548_063;
const FT8_DISTANCE: i128 = 361_477_693_318_092_449_338_965_481;
/// `(i128::MAX − 9,999) / 100`, where a multiply-first distance used to overflow.
const OLD_DISTANCE_EDGE: u128 = 1_701_411_834_604_692_317_316_873_037_158_840_957;
const OPENED: Result<CreationReading, ProgramError> = Ok(CreationReading { price_exponent: 0 });

fn damm(address: Address, data: &[u8]) -> HostAccount {
    HostAccount::new(address, DAMM_V2_PROGRAM_ID, data)
}

/// Ft8FD9's bytes with another locked liquidity: a lock as the reader sees it.
fn ft8_locking(locked: u128) -> HostAccount {
    let bytes = patched(DAMM_FT8FD9, LOCKED_AT, &locked.to_le_bytes());
    damm(FT8FD9, &bytes)
}

#[test]
fn reads_the_real_pools() {
    let read = |data| read_pool(&DAMM_V2_PROGRAM_ID, data);
    let (sol_usdc, ft8) = (read(DAMM_SOL_USDC), read(DAMM_FT8FD9));
    assert_eq!(sol_usdc, Ok(24_632_261_441_830_973_163_426_669_659));
    // Ft8FD9 has the most liquidity locked of the pools sampled: 3.6e28 units, 95 bits.
    assert_eq!(ft8, Ok(36_147_769_331_809_244_933_896_548_063));
    assert_eq!(DAMM_SOL_USDC[..8], POOL_DISCRIMINATOR);
}

#[test]
fn refuses_every_other_owner_before_reading_a_byte() {
    for owner in [SPL_TOKEN_PROGRAM_ID, brot_markets::ID, NOBODY] {
        assert_eq!(read_pool(&owner, DAMM_FT8FD9), Err(ReaderWrongOwner));
        assert_eq!(read_pool(&owner, &[]), Err(ReaderWrongOwner));
        let pool = &mut HostAccount::new(FT8FD9, owner, DAMM_FT8FD9);
        assert_eq!(open(KIND, pool, i128::MAX), refused(ReaderWrongOwner));
    }
}

#[test]
fn cut_stretched_or_zeroed_pools_are_errors_never_panics() {
    let read = |owner: &Address, data: &[u8]| read_pool(owner, data).map(|_| ());
    for (address, fixture) in [(SOL_USDC, DAMM_SOL_USDC), (FT8FD9, DAMM_FT8FD9)] {
        let pool = (address, DAMM_V2_PROGRAM_ID);
        assert_refuses_broken_copies(KIND, pool, fixture, ReaderBadLayout, read);
    }
}

#[test]
fn refuses_another_account_type_of_the_same_size() {
    for at in 0..8 {
        for flip in [0x01, 0x80] {
            let mut bytes = DAMM_FT8FD9.to_vec();
            bytes[at] ^= flip;
            let read = read_pool(&DAMM_V2_PROGRAM_ID, &bytes);
            assert_eq!(read, Err(ReaderBadLayout), "byte {at}");
        }
    }
    // The Anchor discriminator of an account named `Position`: sha256("account:Position")[..8].
    let position = &patched(DAMM_FT8FD9, 0, &[170, 188, 143, 228, 122, 64, 247, 208]);
    let pool = &mut damm(FT8FD9, position);
    assert_eq!(open(KIND, pool, 1), refused(ReaderBadLayout));
}

#[test]
fn a_lock_above_i128_max_saturates_there_and_meets_every_target() {
    let edge = u128::try_from(i128::MAX).unwrap();
    let max = i128::MAX;
    let yes = Ok(Decided(Decision::yes(reading(FT8FD9, max))));
    for locked in [edge, edge.checked_add(1).unwrap(), u128::MAX] {
        assert_eq!(resolve(KIND, &mut ft8_locking(locked), max, NOW), yes);
        assert_eq!(knowable(KIND, &mut ft8_locking(locked), max), Ok(true));
        let opening = open(KIND, &mut ft8_locking(locked), max);
        assert_eq!(opening, refused(TargetAlreadyTouched), "{locked}");
    }
    // One unit below the edge is read as itself, and falls one unit short of i128::MAX.
    let below = &mut ft8_locking(edge.checked_sub(1).unwrap());
    assert_eq!(knowable(KIND, below, max), Ok(false));
}

#[test]
fn rows_2_and_3_in_their_order_on_the_real_pools() {
    let pools = [
        (SOL_USDC, DAMM_SOL_USDC, SOL_USDC_LOCKED, SOL_USDC_DISTANCE),
        (FT8FD9, DAMM_FT8FD9, FT8_LOCKED, FT8_DISTANCE),
    ];
    for (address, data, locked, distance) in pools {
        assert_eq!(min_distance(locked, MIN_DISTANCE_BPS_DAMM), Ok(distance));
        let opening = |target| open(KIND, &mut damm(address, data), target);
        let rows = [
            // At or below zero, every pool has met the target.
            (i128::MIN, refused(TargetAlreadyTouched)),
            (-1, refused(TargetAlreadyTouched)),
            (0, refused(TargetAlreadyTouched)),
            (1, refused(TargetAlreadyTouched)),
            (sub(locked, 1), refused(TargetAlreadyTouched)),
            (locked, refused(TargetAlreadyTouched)),
            (add(locked, 1), refused(TargetTooClose)),
            // One unit short of the minimum distance, then exactly at it.
            (sub(add(locked, distance), 1), refused(TargetTooClose)),
            (add(locked, distance), OPENED),
            (add(locked, add(distance, distance)), OPENED),
            (i128::MAX, OPENED),
        ];
        for (target, expected) in rows {
            assert_eq!(opening(target), expected, "{target}");
        }
    }
}

#[test]
fn row_3_at_the_smallest_and_largest_locks() {
    let beyond = OLD_DISTANCE_EDGE.checked_add(1).unwrap();
    let rows: [(u128, i128, Result<CreationReading, ProgramError>); 8] = [
        // A target at or below zero is met by every pool.
        (0, 0, refused(TargetAlreadyTouched)),
        (0, -1, refused(TargetAlreadyTouched)),
        (0, 1, OPENED),
        (1_000_000, 1_009_999, refused(TargetTooClose)),
        (1_000_000, 1_010_000, OPENED),
        (OLD_DISTANCE_EDGE, i128::MAX, OPENED),
        // Past it the distance still computes (it divides first): the opening is judged, not refused.
        (beyond, i128::MAX, OPENED),
        (u128::MAX, i128::MAX, refused(TargetAlreadyTouched)),
    ];
    for (locked, target, expected) in rows {
        let pool = &mut ft8_locking(locked);
        assert_eq!(open(KIND, pool, target), expected, "{locked} {target}");
    }
}

#[test]
fn the_join_lock_and_resolution_on_the_real_pool() {
    // Met once the lock is at or above the target: `FT8_LOCKED` is met, one unit more is not.
    let fact = (FT8FD9, FT8_LOCKED, add(FT8_LOCKED, 1));
    let ft8 = || damm(FT8FD9, DAMM_FT8FD9);
    let gone = || HostAccount::new(FT8FD9, SPL_TOKEN_PROGRAM_ID, DAMM_FT8FD9);
    assert_fact_table(KIND, fact, ft8, gone, ReaderWrongOwner);
    // Someone locks liquidity up to a goal opened 1% above the pool's lock: it locks and is YES.
    let target = add(FT8_LOCKED, FT8_DISTANCE);
    let locked = || ft8_locking(u128::try_from(target).unwrap());
    let fact = (FT8FD9, target, add(target, 1));
    assert_fact_table(KIND, fact, locked, gone, ReaderWrongOwner);
    assert_eq!(knowable(KIND, &mut ft8(), target), Ok(false));
}
