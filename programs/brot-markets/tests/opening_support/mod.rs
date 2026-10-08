//! Purpose: what the opening's host tests share: accounts laid out as the runtime lays them out,
//!          holding the captured Pyth bytes with fields changed in memory, and the fixtures' ids.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane D
// Each test file that includes this module uses only part of it.
#![allow(dead_code)]

use brot_markets::error::BrotError;
use pinocchio::{
    account::{RuntimeAccount, NOT_BORROWED},
    address::address,
    error::ProgramError,
    AccountView, Address,
};

// Real devnet accounts (scripts/capture-fixtures.ts pyth); the files are never edited.
pub const SOL: &[u8] = include_bytes!("../../../../tests/fixtures/pyth-sol-usd-devnet.bin");
pub const BTC: &[u8] = include_bytes!("../../../../tests/fixtures/pyth-btc-usd-devnet.bin");
pub const SOL_LEGACY: &[u8] =
    include_bytes!("../../../../tests/fixtures/pyth-sol-usd-devnet-legacy.bin");

/// The sponsored accounts (shard 0) of the upgraded push oracle, and BTC's pre-upgrade one.
pub const SOL_ACCOUNT: Address = address!("7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE");
pub const BTC_ACCOUNT: Address = address!("APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5");
pub const BTC_LEGACY_ACCOUNT: Address = address!("4cSM2e6rvbGQUFiJbqytoVMi5GgghSMr8LwVrT9VPSPo");
pub const RECEIVER: Address = address!("rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp");
pub const LEGACY_RECEIVER: Address = address!("rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ");
pub const SYSTEM_PROGRAM: Address = address!("11111111111111111111111111111111");

pub const SOL_FEED: [u8; 32] = [
    0xef, 0x0d, 0x8b, 0x6f, 0xda, 0x2c, 0xeb, 0xa4, 0x1d, 0xa1, 0x5d, 0x40, 0x95, 0xd1, 0xda, 0x39,
    0x2a, 0x0d, 0x2f, 0x8e, 0xd0, 0xc6, 0xc7, 0xbc, 0x0f, 0x4c, 0xfa, 0xc8, 0xc2, 0x80, 0xb5, 0x6d,
];
pub const BTC_FEED: [u8; 32] = [
    0xe6, 0x2d, 0xf6, 0xc8, 0xb4, 0xa8, 0x5f, 0xe1, 0xa6, 0x7d, 0xb4, 0x4d, 0xc1, 0x2d, 0xe5, 0xdb,
    0x33, 0x0f, 0x7a, 0xc6, 0x6b, 0x72, 0xdc, 0x65, 0x8a, 0xfe, 0xdf, 0x0f, 0x4a, 0x41, 0x5b, 0x43,
];

/// The fixtures' publish time, and seven seconds after it (`START_TIME` in tests/brot/setup.ts).
pub const PUBLISHED: i64 = 1_791_216_173;
pub const NOW: i64 = 1_791_216_180;

/// Offsets of the `PriceUpdateV2` fields the tests change.
pub const VERIFICATION: usize = 40;
pub const PRICE: usize = 73;
pub const CONF: usize = 81;
pub const PUBLISH_TIME: usize = 93;

/// An account as the runtime lays it out (header, then data), in an 8-byte aligned buffer.
pub struct HostAccount(Vec<u64>);

impl HostAccount {
    pub fn new(address: Address, owner: Address, data: &[u8]) -> Self {
        let header = core::mem::size_of::<RuntimeAccount>();
        let len = header.checked_add(data.len()).unwrap();
        let mut words = vec![0u64; len.div_ceil(8)];
        let raw = words.as_mut_ptr().cast::<RuntimeAccount>();
        let account = RuntimeAccount {
            borrow_state: NOT_BORROWED,
            address,
            owner,
            lamports: 1_000_000,
            data_len: u64::try_from(data.len()).unwrap(),
            ..RuntimeAccount::default()
        };
        // SAFETY: the buffer is 8-byte aligned and holds the header followed by `data`.
        unsafe {
            raw.write(account);
            let at = raw.cast::<u8>().add(header);
            core::ptr::copy_nonoverlapping(data.as_ptr(), at, data.len());
        }
        Self(words)
    }

    /// A captured price account at `address` owned by `owner`, `edit` applied to a copy of it.
    pub fn price(
        address: Address,
        owner: Address,
        fixture: &[u8],
        edit: impl FnOnce(&mut [u8]),
    ) -> Self {
        let mut data = fixture.to_vec();
        edit(&mut data);
        Self::new(address, owner, &data)
    }

    pub fn view(&mut self) -> AccountView {
        // SAFETY: the buffer holds a header and its data, and outlives every use of the view.
        unsafe { AccountView::new_unchecked(self.0.as_mut_ptr().cast()) }
    }
}

/// The sponsored BTC/USD account, fresh, with `edit` applied.
pub fn btc_account(edit: impl FnOnce(&mut [u8])) -> HostAccount {
    HostAccount::price(BTC_ACCOUNT, RECEIVER, BTC, edit)
}

/// The sponsored SOL/USD account, fresh, with `edit` applied.
pub fn sol_account(edit: impl FnOnce(&mut [u8])) -> HostAccount {
    HostAccount::price(SOL_ACCOUNT, RECEIVER, SOL, edit)
}

/// Writes `value` little-endian at `at`, as an i64 field of the price account.
pub fn set_i64(data: &mut [u8], at: usize, value: i64) {
    data[at..][..8].copy_from_slice(&value.to_le_bytes());
}

/// `PUBLISHED` moved by `seconds`, for a publish time.
pub fn published(seconds: i64) -> i64 {
    PUBLISHED.checked_add(seconds).unwrap()
}

pub fn err(error: BrotError) -> ProgramError {
    ProgramError::from(error)
}
