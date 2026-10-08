//! Purpose: the checks negatives on the program's SBF binary in Mollusk, through
//!          `admin_initialize_config`: non-canonical bumps, a look-alike System Program, the upgrade
//!          authority, a second initialisation, addresses funded in advance and one account in two
//!          slots, each with its exact error or its exact accounts (T24, X0.9).
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane A

#[path = "checks_support/mollusk.rs"]
mod world;

use brot_markets::{
    constants::{BPF_LOADER_UPGRADEABLE_ID as LOADER, CONFIG_SEED, FEE_VAULT_SEED},
    error::BrotError,
    state::{AccountTag, LAYOUT_VERSION},
    ID,
};
use mollusk_svm::result::InstructionResult;
use solana_account::Account;
use solana_instruction::AccountMeta;
use solana_pubkey::Pubkey;
use world::{after, assert_ok, assert_refused, key, non_canonical, program_data, with, with_slot};
use world::{World, AUTHORITY_FUNDS, OTHER_PROGRAM, SYSTEM};

/// `admin_initialize_config` with slot `index` replaced by `meta`, the account at its address given.
fn init_with(world: &World, index: usize, meta: AccountMeta, held: Account) -> InstructionResult {
    let address = meta.pubkey;
    let instruction = with_slot(world.init_ix(), index, meta);
    world.run(&instruction, &with(world.init_accounts(), address, held))
}

/// `admin_initialize_config` on a fresh deployment with `account` at `address`.
fn init_holding(world: &World, address: Pubkey, account: Account) -> InstructionResult {
    world.run(
        &world.init_ix(),
        &with(world.init_accounts(), address, account),
    )
}

#[test]
fn initialize_config_creates_both_accounts_with_their_rent() {
    let world = World::new();
    let result = world.run(&world.init_ix(), &world.init_accounts());
    assert_ok(&result);
    let config = after(&result, &world.config);
    assert_eq!((config.owner, config.data.len()), (ID, 400));
    assert_eq!(config.lamports, world.rent(400));
    let head = [
        AccountTag::GlobalConfig as u8,
        LAYOUT_VERSION,
        world.config_bump,
    ];
    assert_eq!(config.data[..3], head);
    let fee_vault = after(&result, &world.fee_vault);
    assert_eq!((fee_vault.owner, fee_vault.data.len()), (ID, 0));
    assert_eq!(fee_vault.lamports, world.rent(0));
    let paid = world.rent(400).checked_add(world.rent(0)).unwrap();
    let left = AUTHORITY_FUNDS.checked_sub(paid).unwrap();
    assert_eq!(after(&result, &world.authority).lamports, left);
}

#[test]
fn canonical_pda_refuses_a_non_canonical_config_or_fee_vault() {
    let world = World::new();
    let config = AccountMeta::new(non_canonical(&[CONFIG_SEED]), false);
    let result = init_with(&world, 1, config, Account::default());
    assert_refused(&result, BrotError::PdaMismatch);
    let fee_vault = AccountMeta::new(non_canonical(&[FEE_VAULT_SEED]), false);
    let result = init_with(&world, 2, fee_vault, Account::default());
    assert_refused(&result, BrotError::PdaMismatch);
}

#[test]
fn system_program_refuses_a_look_alike() {
    let world = World::new();
    let look_alike = AccountMeta::new_readonly(OTHER_PROGRAM, false);
    let result = init_with(&world, 4, look_alike, Account::default());
    assert_refused(&result, BrotError::WrongSystemProgram);
}

#[test]
fn upgrade_authority_refuses_any_other_signer() {
    let world = World::new();
    let impostor = AccountMeta::new(key(0xBB), true);
    let funds = Account::new(AUTHORITY_FUNDS, 0, &SYSTEM);
    let result = init_with(&world, 0, impostor, funds);
    assert_refused(&result, BrotError::UpgradeAuthorityMismatch);
}

#[test]
fn upgrade_authority_refuses_program_data_that_is_not_this_programs() {
    let world = World::new();
    // Another program's ProgramData, naming this program's upgrade authority.
    let (other, _) = Pubkey::find_program_address(&[OTHER_PROGRAM.as_ref()], &LOADER);
    let slot = AccountMeta::new_readonly(other, false);
    let result = init_with(&world, 3, slot, program_data(Some(&world.authority)));
    assert_refused(&result, BrotError::WrongProgramData);
    // The right address and bytes, not owned by the upgradeable loader.
    let mut not_the_loaders = program_data(Some(&world.authority));
    not_the_loaders.owner = SYSTEM;
    let result = init_holding(&world, world.program_data, not_the_loaders);
    assert_refused(&result, BrotError::WrongProgramData);
}

#[test]
fn upgrade_authority_refuses_an_immutable_program() {
    let world = World::new();
    let result = init_holding(&world, world.program_data, program_data(None));
    assert_refused(&result, BrotError::WrongProgramData);
}

#[test]
fn create_refuses_a_second_initialization() {
    let world = World::new();
    let first = world.run(&world.init_ix(), &world.init_accounts());
    assert_ok(&first);
    let second = world.run(&world.init_ix(), &first.resulting_accounts);
    assert_refused(&second, BrotError::AlreadyInitialized);
}

#[test]
fn create_tops_up_a_config_and_a_fee_vault_funded_in_advance() {
    // One lamport on the config, below its minimum; twice the minimum on the fee vault.
    let world = World::new();
    let vault_funds = world.rent(0).checked_mul(2).unwrap();
    let accounts = with(
        world.init_accounts(),
        world.config,
        Account::new(1, 0, &SYSTEM),
    );
    let accounts = with(
        accounts,
        world.fee_vault,
        Account::new(vault_funds, 0, &SYSTEM),
    );
    let result = world.run(&world.init_ix(), &accounts);
    assert_ok(&result);
    let config = after(&result, &world.config);
    assert_eq!((config.owner, config.data.len()), (ID, 400));
    assert_eq!(config.lamports, world.rent(400));
    let head = [AccountTag::GlobalConfig as u8, LAYOUT_VERSION];
    assert_eq!(config.data[..2], head);
    let fee_vault = after(&result, &world.fee_vault);
    assert_eq!((fee_vault.owner, fee_vault.data.len()), (ID, 0));
    assert_eq!(fee_vault.lamports, vault_funds);
    // The authority paid only the config's top-up.
    let top_up = world.rent(400).checked_sub(1).unwrap();
    let left = AUTHORITY_FUNDS.checked_sub(top_up).unwrap();
    assert_eq!(after(&result, &world.authority).lamports, left);
}

#[test]
fn create_refuses_an_address_another_program_owns() {
    let world = World::new();
    let foreign = Account::new(world.rent(0), 0, &OTHER_PROGRAM);
    let result = init_holding(&world, world.config, foreign);
    assert_refused(&result, BrotError::WrongOwner);
}

#[test]
fn distinct_refuses_the_config_as_the_fee_vault() {
    let world = World::new();
    let instruction = with_slot(world.init_ix(), 2, AccountMeta::new(world.config, false));
    let result = world.run(&instruction, &world.init_accounts());
    assert_refused(&result, BrotError::DuplicateAccount);
}
