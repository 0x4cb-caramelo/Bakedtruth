//! Purpose: host `AccountView`s for the checks tests: an 8-byte-aligned buffer holding the
//!          runtime's account header (`RuntimeAccount`) followed by the account's data, as the
//!          entrypoint hands accounts to the program; plus the keys and bytes the tests share.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane A
//!
//! On the host, CPIs are no-ops and sysvars fail, so these tests stop where a check would call
//! the runtime; the Mollusk tests run the rest on the real binary.

// Shared by several test crates, each of which uses part of it.
#![allow(dead_code)]

use core::mem::size_of;

use brot_markets::{
    constants::CONFIG_SEED,
    layout::{Pubkey, ZeroCopy},
    state::{config::GlobalConfig, AccountTag, LAYOUT_VERSION},
    ID,
};
use pinocchio::{
    account::{RuntimeAccount, NOT_BORROWED},
    AccountView, Address,
};

/// The header the runtime writes before each account's data.
const HEADER: usize = size_of::<RuntimeAccount>();

/// The System Program, owner of every wallet and of every address nobody created yet.
pub const SYSTEM: Address = pinocchio_system::ID;

/// A key nobody derives: `n` repeated 32 times.
pub const fn key(n: u8) -> Address {
    Address::new_from_array([n; 32])
}

/// One account in host memory. Its views point into `words`, a heap buffer that never moves or
/// shrinks, so they stay valid while the `HostAccount` lives.
pub struct HostAccount {
    words: Vec<u64>,
}

impl HostAccount {
    /// A read-only, unsigned account holding `data`, with 1 SOL.
    pub fn new(address: Address, owner: Address, data: &[u8]) -> Self {
        let bytes = HEADER.checked_add(data.len()).expect("account size");
        let mut words = vec![0u64; bytes.div_ceil(8)];
        let header = RuntimeAccount {
            borrow_state: NOT_BORROWED,
            is_signer: 0,
            is_writable: 0,
            executable: 0,
            padding: [0; 4],
            address,
            owner,
            lamports: 1_000_000_000,
            data_len: u64::try_from(data.len()).expect("data length"),
        };
        // SAFETY: `words` holds at least `HEADER + data.len()` bytes and is 8-byte aligned, the
        // alignment of `RuntimeAccount`; the header goes at its start and the data right after.
        unsafe {
            let base = words.as_mut_ptr().cast::<u8>();
            base.cast::<RuntimeAccount>().write(header);
            core::ptr::copy_nonoverlapping(data.as_ptr(), base.add(HEADER), data.len());
        }
        Self { words }
    }

    fn header(&mut self) -> &mut RuntimeAccount {
        // SAFETY: `new` wrote a `RuntimeAccount` at the start of the aligned buffer.
        unsafe { &mut *self.words.as_mut_ptr().cast::<RuntimeAccount>() }
    }

    /// The same account, signed.
    pub fn signer(mut self) -> Self {
        self.header().is_signer = 1;
        self
    }

    /// The same account, writable.
    pub fn writable(mut self) -> Self {
        self.header().is_writable = 1;
        self
    }

    /// The same account, holding `lamports`.
    pub fn lamports(mut self, lamports: u64) -> Self {
        self.header().lamports = lamports;
        self
    }

    /// A view of this account, as the entrypoint builds it. Two views of one `HostAccount` alias
    /// the same memory, as Pinocchio's views of a repeated slot do.
    pub fn view(&mut self) -> AccountView {
        // SAFETY: the pointer is to the `RuntimeAccount` written by `new`, followed by its
        // `data_len` bytes of data; the tests use a view only while its `HostAccount` lives.
        unsafe { AccountView::new_unchecked(self.words.as_mut_ptr().cast()) }
    }
}

/// The config PDA and its canonical bump, derived on the host.
pub fn config_pda() -> (Address, u8) {
    Address::find_program_address(&[CONFIG_SEED], &ID)
}

/// A PDA of `seeds` under `program` with a valid bump below the canonical one, and that bump.
pub fn non_canonical_pda(seeds: &[&[u8]], program: &Address) -> (Address, u8) {
    let (_, canonical) = Address::find_program_address(seeds, program);
    (0..canonical)
        .rev()
        .find_map(|bump| {
            let bump_seed = [bump];
            let mut with_bump = seeds.to_vec();
            with_bump.push(&bump_seed);
            let address = Address::create_program_address(&with_bump, program).ok()?;
            Some((address, bump))
        })
        .expect("a valid bump below the canonical one")
}

/// A `GlobalConfig` with its tag, layout version, `bump` and `admin`; everything else zero.
pub fn config_data(bump: u8, admin: Pubkey) -> Vec<u8> {
    let mut data = vec![0u8; GlobalConfig::LEN];
    let config = GlobalConfig::from_bytes_mut(&mut data).expect("exact length");
    config.tag = AccountTag::GlobalConfig as u8;
    config.version = LAYOUT_VERSION;
    config.bump = bump;
    config.admin = admin;
    data
}
