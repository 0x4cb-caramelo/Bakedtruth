//! Purpose: the burn kind's reader (`SupplyAtMost`) on the mainnet mints captured in
//!          tests/fixtures and on broken copies of them: the read, rows 2 and 3 in their order,
//!          the join lock and resolution. A wrong account is an error, never a panic.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution), lane A

mod opening_support;
mod readers_support;

use brot_markets::{
    constants::TOKEN_2022_PROGRAM_ID as TOKEN_2022,
    constants::{DAMM_V2_PROGRAM_ID, MIN_DISTANCE_BPS_SUPPLY, SPL_TOKEN_PROGRAM_ID},
    error::BrotError::{self, *},
    readers::{
        min_distance,
        spl_mint::{read_mint, MintReading},
        CreationReading,
    },
    state::enums::ReaderKind,
};
use opening_support::HostAccount;
use pinocchio::{address::address, error::ProgramError, Address};
use readers_support::*;

// Real mainnet mints (scripts/capture-fixtures.ts); the files are never edited.
const MINT_WIF: &[u8] = include_bytes!("../../../tests/fixtures/mint-wif.bin");
const MINT_BONK: &[u8] = include_bytes!("../../../tests/fixtures/mint-bonk.bin");
const MINT_USDC: &[u8] = include_bytes!("../../../tests/fixtures/mint-usdc.bin");
const MINT_PYUSD: &[u8] = include_bytes!("../../../tests/fixtures/mint-pyusd.bin");
const WIF: Address = address!("EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm");
const BONK: Address = address!("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");
const USDC: Address = address!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const PYUSD: Address = address!("2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo");

const KIND: ReaderKind = ReaderKind::SupplyAtMost;
/// The captured supplies, and row 3's distance from each: 1%, rounded up.
const WIF_SUPPLY: i128 = 998_837_281_907_977;
const WIF_DISTANCE: i128 = 9_988_372_819_080;
const BONK_SUPPLY: i128 = 8_799_436_581_014_215_323;
const BONK_DISTANCE: i128 = 87_994_365_810_142_154;
const OPENED: Result<CreationReading, ProgramError> = Ok(CreationReading { price_exponent: 0 });

fn classic(address: Address, data: &[u8]) -> HostAccount {
    HostAccount::new(address, SPL_TOKEN_PROGRAM_ID, data)
}

/// WIF's bytes with another supply: a burn (or a mint) as the reader sees it.
fn wif_with_supply(supply: u64) -> HostAccount {
    classic(WIF, &patched(MINT_WIF, 36, &supply.to_le_bytes()))
}

fn read(data: &[u8]) -> Result<MintReading, BrotError> {
    read_mint(&SPL_TOKEN_PROGRAM_ID, data)
}

#[test]
fn reads_the_real_mints() {
    let fields = |data| read(data).map(|mint| (mint.mint_authority_live, mint.supply));
    assert_eq!(fields(MINT_WIF), Ok((false, 998_837_281_907_977)));
    // BONK's supply sits just under i64::MAX: read as a u64, compared as an i128.
    assert_eq!(fields(MINT_BONK), Ok((false, 8_799_436_581_014_215_323)));
    assert_eq!(fields(MINT_USDC), Ok((true, 7_720_815_959_912_468)));
}

#[test]
fn refuses_token_2022_and_every_other_owner_before_reading_a_byte() {
    assert_eq!(read_mint(&TOKEN_2022, MINT_PYUSD), Err(ReaderWrongOwner));
    // An extension-less Token-2022 mint has the classic 82-byte layout: the owner refuses it.
    assert_eq!(read_mint(&TOKEN_2022, MINT_WIF), Err(ReaderWrongOwner));
    for owner in [TOKEN_2022, DAMM_V2_PROGRAM_ID, brot_markets::ID] {
        assert_eq!(read_mint(&owner, &[]), Err(ReaderWrongOwner), "{owner:?}");
    }
    // PYUSD's base mint is the classic layout, which is why the owner check has to exist...
    assert!(read(&MINT_PYUSD[..82]).unwrap().mint_authority_live);
    // ...and its 866 bytes are no classic mint.
    assert_eq!(read(MINT_PYUSD), Err(ReaderBadLayout));
}

#[test]
fn cut_stretched_or_zeroed_mints_are_errors_never_panics() {
    let read = |owner: &Address, data: &[u8]| read_mint(owner, data).map(|_| ());
    for (address, fixture) in [(WIF, MINT_WIF), (BONK, MINT_BONK), (USDC, MINT_USDC)] {
        let account = (address, SPL_TOKEN_PROGRAM_ID);
        assert_refuses_broken_copies(KIND, account, fixture, ReaderBadLayout, read);
    }
    // Under its real owner, every copy of PYUSD fails the owner check first.
    let pyusd = (PYUSD, TOKEN_2022);
    assert_refuses_broken_copies(KIND, pyusd, MINT_PYUSD, ReaderWrongOwner, read);
}

#[test]
fn coption_tags_are_0_or_1_and_the_mint_is_initialized() {
    // SPL Token's own unpacking refuses each of these, so no real mint carries one.
    let broken: [(usize, &[u8]); 7] = [
        (0, &[2, 0, 0, 0]),
        (0, &[0, 1, 0, 0]),
        (0, &[0xff; 4]),
        (46, &[2, 0, 0, 0]),
        (46, &[1, 0, 0, 1]),
        (45, &[0]),
        (45, &[2]),
    ];
    for (at, bytes) in broken {
        let mint = patched(MINT_WIF, at, bytes);
        assert_eq!(read(&mint), Err(ReaderBadLayout), "{at} {bytes:?}");
    }
    // A set tag is live whatever key follows; the key after a `None` tag is not read.
    let zero_key = &mut classic(WIF, &patched(&patched(MINT_WIF, 0, &[1]), 4, &[0; 32]));
    assert_eq!(open(KIND, zero_key, 0), refused(MintAuthorityLive));
    let stray_key = &mut classic(WIF, &patched(MINT_WIF, 4, &[7; 32]));
    assert_eq!(open(KIND, stray_key, 0), OPENED);
    // A freeze authority, set or not, changes nothing.
    let frozen = &mut classic(WIF, &patched(&patched(MINT_WIF, 46, &[1]), 50, &[9; 32]));
    assert_eq!(open(KIND, frozen, 0), OPENED);
}

#[test]
fn rows_2_and_3_in_their_order_on_the_real_mints() {
    // USDC can still mint: refused whatever the target, before the target is looked at.
    for target in [i128::MIN, -1, 0, 7_720_815_959_912_468, i128::MAX] {
        let usdc = open(KIND, &mut classic(USDC, MINT_USDC), target);
        assert_eq!(usdc, refused(MintAuthorityLive), "{target}");
    }
    // The owner comes before the authority: Token-2022 PYUSD is refused as an account.
    let pyusd = &mut HostAccount::new(PYUSD, TOKEN_2022, MINT_PYUSD);
    assert_eq!(open(KIND, pyusd, 0), refused(ReaderWrongOwner));
    let mints = [
        (WIF, MINT_WIF, WIF_SUPPLY, WIF_DISTANCE),
        (BONK, MINT_BONK, BONK_SUPPLY, BONK_DISTANCE),
    ];
    for (address, data, supply, distance) in mints {
        assert_eq!(min_distance(supply, MIN_DISTANCE_BPS_SUPPLY), Ok(distance));
        let opening = |target| open(KIND, &mut classic(address, data), target);
        let rows = [
            (i128::MIN, refused(TargetUnreachable)),
            (-1, refused(TargetUnreachable)),
            (i128::MAX, refused(TargetAlreadyTouched)),
            (add(supply, 1), refused(TargetAlreadyTouched)),
            (supply, refused(TargetAlreadyTouched)),
            (sub(supply, 1), refused(TargetTooClose)),
            // One unit past the minimum distance, then exactly at it.
            (add(sub(supply, distance), 1), refused(TargetTooClose)),
            (sub(supply, distance), OPENED),
            (sub(supply, add(distance, distance)), OPENED),
            (1, OPENED),
            (0, OPENED),
        ];
        for (target, expected) in rows {
            assert_eq!(opening(target), expected, "{target}");
        }
    }
}

#[test]
fn row_3_at_the_smallest_and_largest_supplies() {
    let top = u64::MAX;
    let rows: [(u64, i128, Result<CreationReading, ProgramError>); 9] = [
        (0, 0, refused(TargetAlreadyTouched)),
        (1, 0, OPENED),
        (100, 99, OPENED),
        (101, 99, OPENED),
        (101, 100, refused(TargetTooClose)),
        (1_000_000, 990_000, OPENED),
        (1_000_000, 990_001, refused(TargetTooClose)),
        // u64::MAX − ceil(u64::MAX / 100), then one unit more.
        (top, 18_262_276_632_972_456_098, OPENED),
        (top, 18_262_276_632_972_456_099, refused(TargetTooClose)),
    ];
    for (supply, target, expected) in rows {
        let mint = &mut wif_with_supply(supply);
        assert_eq!(open(KIND, mint, target), expected, "{supply} {target}");
    }
}

#[test]
fn the_join_lock_and_resolution_on_the_real_mint() {
    // Met once the supply is at or below the target: `WIF_SUPPLY` is met, one unit less is not.
    let fact = (WIF, WIF_SUPPLY, sub(WIF_SUPPLY, 1));
    let wif = || classic(WIF, MINT_WIF);
    let gone = || HostAccount::new(WIF, TOKEN_2022, MINT_WIF);
    assert_fact_table(KIND, fact, wif, gone, ReaderWrongOwner);
    // A burn down to the target of a campaign opened at 99% of the supply locks it and is YES.
    let target = sub(WIF_SUPPLY, WIF_DISTANCE);
    let burned = || wif_with_supply(u64::try_from(target).unwrap());
    let unmet = sub(target, 1);
    assert_fact_table(KIND, (WIF, target, unmet), burned, gone, ReaderWrongOwner);
    assert_eq!(knowable(KIND, &mut wif(), target), Ok(false));
}
