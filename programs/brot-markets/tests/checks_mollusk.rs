//! Purpose: the checks negatives on the program's SBF binary in Mollusk, through `admin_set_team`:
//!          the config under another owner, unsigned and read-only slots, a wrong tag or layout
//!          version, a zeroed, short or long config, a look-alike PDA and wrong event slots, each
//!          refused with its exact error (T24). X0.9 reruns them with each check removed.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane A

#[path = "checks_support/mollusk.rs"]
mod world;

use brot_markets::{error::BrotError, state::AccountTag};
use mollusk_svm::result::InstructionResult;
use solana_account::Account;
use solana_instruction::AccountMeta;
use world::{assert_ok, assert_refused, key, with, with_slot, World, OTHER_PROGRAM, SOL, SYSTEM};

/// `admin_set_team` with `config` at the config address.
fn set_team_on(world: &World, config: Account) -> InstructionResult {
    world.run(&world.set_team_ix(), &world.set_team_accounts(config))
}

/// `admin_set_team` with slot `index` replaced by `meta`, the account at `meta`'s address given.
fn set_team_with(
    world: &World,
    index: usize,
    meta: AccountMeta,
    held: Account,
) -> InstructionResult {
    let address = meta.pubkey;
    let instruction = with_slot(world.set_team_ix(), index, meta);
    let accounts = world.set_team_accounts(world.owned(world.config_data()));
    world.run(&instruction, &with(accounts, address, held))
}

/// The config's bytes with byte `index` set to `value`.
fn config_with_byte(world: &World, index: usize, value: u8) -> Account {
    let mut data = world.config_data();
    data[index] = value;
    world.owned(data)
}

#[test]
fn set_team_runs_on_the_config_a_real_initialization_wrote() {
    let world = World::new();
    let init = world.run(&world.init_ix(), &world.init_accounts());
    assert_ok(&init);
    let admin = Account::new(SOL, 0, &SYSTEM);
    let accounts = with(init.resulting_accounts.clone(), world.admin, admin);
    assert_ok(&world.run(&world.set_team_ix(), &accounts));
}

#[test]
fn set_team_runs_on_the_crafted_config() {
    let world = World::new();
    assert_ok(&set_team_on(&world, world.owned(world.config_data())));
}

#[test]
fn owned_by_refuses_the_config_under_another_owner() {
    let world = World::new();
    let mut config = world.owned(world.config_data());
    config.owner = OTHER_PROGRAM;
    assert_refused(&set_team_on(&world, config), BrotError::WrongOwner);
}

#[test]
fn signer_refuses_an_unsigned_admin() {
    let world = World::new();
    let unsigned = AccountMeta::new_readonly(world.admin, false);
    let admin = Account::new(SOL, 0, &SYSTEM);
    let result = set_team_with(&world, 0, unsigned, admin);
    assert_refused(&result, BrotError::MissingSignature);
}

#[test]
fn writable_refuses_a_read_only_config() {
    let world = World::new();
    let read_only = AccountMeta::new_readonly(world.config, false);
    let config = world.owned(world.config_data());
    assert_refused(
        &set_team_with(&world, 1, read_only, config),
        BrotError::NotWritable,
    );
}

#[test]
fn tag_refuses_another_account_types_tag() {
    let world = World::new();
    let config = config_with_byte(&world, 0, AccountTag::Campaign as u8);
    assert_refused(&set_team_on(&world, config), BrotError::WrongTag);
}

#[test]
fn tag_refuses_a_zeroed_config() {
    let world = World::new();
    let config = world.owned(vec![0; world.config_data().len()]);
    assert_refused(&set_team_on(&world, config), BrotError::WrongTag);
}

#[test]
fn tag_version_refuses_another_layout_version() {
    let world = World::new();
    let config = config_with_byte(&world, 1, 2);
    assert_refused(&set_team_on(&world, config), BrotError::WrongLayoutVersion);
}

#[test]
fn len_refuses_a_short_and_a_long_config() {
    let world = World::new();
    let mut short = world.config_data();
    short.pop();
    assert_refused(
        &set_team_on(&world, world.owned(short)),
        BrotError::WrongLength,
    );
    let mut long = world.config_data();
    long.push(0);
    assert_refused(
        &set_team_on(&world, world.owned(long)),
        BrotError::WrongLength,
    );
}

#[test]
fn len_refuses_the_data_less_fee_vault_as_the_config() {
    // A real account of this program in the wrong slot: owner right, length wrong. Without the
    // length check the tag check still refuses it, with another error.
    let world = World::new();
    let fee_vault = AccountMeta::new(world.fee_vault, false);
    let result = set_team_with(&world, 1, fee_vault, world.owned(Vec::new()));
    assert_refused(&result, BrotError::WrongLength);
}

#[test]
fn pda_refuses_a_look_alike_config() {
    // Valid config bytes, owned by this program, at an address that is not the config PDA.
    let world = World::new();
    let look_alike = AccountMeta::new(key(0x1A), false);
    let result = set_team_with(&world, 1, look_alike, world.owned(world.config_data()));
    assert_refused(&result, BrotError::PdaMismatch);
}

#[test]
fn event_accounts_refuse_a_wrong_event_authority() {
    let world = World::new();
    let other = AccountMeta::new_readonly(key(0xEA), false);
    let result = set_team_with(&world, 2, other, Account::default());
    assert_refused(&result, BrotError::WrongEventAuthority);
}

#[test]
fn event_program_refuses_a_wrong_program_slot() {
    let world = World::new();
    let other = AccountMeta::new_readonly(key(0xEB), false);
    let result = set_team_with(&world, 3, other, Account::default());
    assert_refused(&result, BrotError::WrongProgramAccount);
}
