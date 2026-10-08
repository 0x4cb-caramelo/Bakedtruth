//! Purpose: the Mollusk world of the checks negatives: the program's SBF binary loaded once per
//!          test, the keys of a fresh deployment, and the assertion on the exact custom error.
//!          The accounts and instructions it runs are in `mollusk_data.rs`.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane A
//!
//! The binary comes from `BROT_MARKETS_SO`, else `target/deploy/brot_markets.so` at the workspace
//! root. Mollusk prints the program's logs for a failing test.

// Shared by several test crates, each of which uses part of it.
#![allow(dead_code)]

#[path = "mollusk_data.rs"]
mod data;

use std::path::{Path, PathBuf};

use brot_markets::{
    constants::{BPF_LOADER_UPGRADEABLE_ID as LOADER, CONFIG_SEED, FEE_VAULT_SEED},
    error::BrotError,
    ID,
};
use mollusk_svm::{result::InstructionResult, Mollusk};
use solana_account::Account;
use solana_instruction::{error::InstructionError, Instruction};
use solana_pubkey::Pubkey;

pub use data::*;

pub const SOL: u64 = 1_000_000_000;
/// What the upgrade authority holds before it pays any rent.
pub const AUTHORITY_FUNDS: u64 = 10 * SOL;
pub const SYSTEM: Pubkey = pinocchio_system::ID;
/// A program that is neither this one, the loader nor the System Program.
pub const OTHER_PROGRAM: Pubkey = Pubkey::new_from_array([0x77; 32]);

/// The accounts Mollusk runs an instruction with.
pub type Accounts = Vec<(Pubkey, Account)>;

/// A key nobody derives: `n` repeated 32 times.
pub const fn key(n: u8) -> Pubkey {
    Pubkey::new_from_array([n; 32])
}

/// The program binary's path.
pub fn program_path() -> PathBuf {
    match std::env::var_os("BROT_MARKETS_SO") {
        Some(path) => PathBuf::from(path),
        None => Path::new(env!("CARGO_MANIFEST_DIR")).join("../../target/deploy/brot_markets.so"),
    }
}

pub struct World {
    pub mollusk: Mollusk,
    /// The program's upgrade authority, recorded in its ProgramData account.
    pub authority: Pubkey,
    pub admin: Pubkey,
    pub fee_recipient: Pubkey,
    pub config: Pubkey,
    pub config_bump: u8,
    pub fee_vault: Pubkey,
    pub fee_vault_bump: u8,
    pub program_data: Pubkey,
}

impl World {
    pub fn new() -> Self {
        let path = program_path();
        let elf = std::fs::read(&path).unwrap_or_else(|error| {
            panic!(
                "the Mollusk tests run the program's SBF binary, and {} cannot be read ({error}). \
                 Build it with `cargo build-sbf --manifest-path programs/brot-markets/Cargo.toml`, \
                 or point BROT_MARKETS_SO at it.",
                path.display()
            )
        });
        let mut mollusk = Mollusk::default();
        mollusk.add_program_with_loader_and_elf(&ID, &LOADER, &elf);
        let (config, config_bump) = Pubkey::find_program_address(&[CONFIG_SEED], &ID);
        let (fee_vault, fee_vault_bump) = Pubkey::find_program_address(&[FEE_VAULT_SEED], &ID);
        let (program_data, _) = Pubkey::find_program_address(&[ID.as_ref()], &LOADER);
        let (authority, admin, fee_recipient) = (key(0xA0), key(0xAD), key(0xFE));
        Self {
            mollusk,
            authority,
            admin,
            fee_recipient,
            config,
            config_bump,
            fee_vault,
            fee_vault_bump,
            program_data,
        }
    }

    pub fn rent(&self, len: usize) -> u64 {
        self.mollusk.sysvars.rent.minimum_balance(len)
    }

    /// An account this program owns holding `data`, rent-exempt.
    pub fn owned(&self, data: Vec<u8>) -> Account {
        let lamports = self.rent(data.len());
        Account {
            lamports,
            data,
            owner: ID,
            executable: false,
            rent_epoch: 0,
        }
    }

    pub fn run(
        &self,
        instruction: &Instruction,
        accounts: &[(Pubkey, Account)],
    ) -> InstructionResult {
        self.mollusk.process_instruction(instruction, accounts)
    }
}

/// `accounts` with `account` at `address`, replacing the one there or added at the end.
pub fn with(mut accounts: Accounts, address: Pubkey, account: Account) -> Accounts {
    match accounts.iter_mut().find(|(key, _)| *key == address) {
        Some(slot) => slot.1 = account,
        None => accounts.push((address, account)),
    }
    accounts
}

/// The account at `address` after the instruction.
pub fn after<'a>(result: &'a InstructionResult, address: &Pubkey) -> &'a Account {
    result
        .get_account(address)
        .expect("the account is in the result")
}

/// The instruction failed with this program's `error`, and with nothing else.
pub fn assert_refused(result: &InstructionResult, error: BrotError) {
    let (code, found) = (u32::from(error), &result.raw_result);
    let expected = Err(InstructionError::Custom(code));
    assert_eq!(
        *found, expected,
        "expected {error:?} ({code}), got {found:?}"
    );
}

pub fn assert_ok(result: &InstructionResult) {
    let found = &result.raw_result;
    assert_eq!(*found, Ok(()), "expected success, got {found:?}");
}
