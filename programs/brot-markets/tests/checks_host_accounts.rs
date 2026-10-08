//! Purpose: the checks that read whole accounts, on the host: the upgrade authority recorded in
//!          a ProgramData account, and the guards in front of account creation (T24).
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane A

#[path = "checks_support/host.rs"]
mod host;

use brot_markets::{
    checks,
    constants::{BPF_LOADER_UPGRADEABLE_ID as LOADER, CONFIG_SEED},
    error::BrotError,
    layout::ZeroCopy,
    state::config::GlobalConfig,
    ID,
};
use host::{config_data, config_pda, key, HostAccount, SYSTEM};
use pinocchio::{cpi::Seed, error::ProgramError, Address, ProgramResult};

const AUTHORITY: Address = key(0xA0);

fn refused(error: BrotError) -> ProgramResult {
    Err(error.into())
}

/// A ProgramData account's bytes: state 3, a slot, `Option<Pubkey>`, then some code.
fn program_data_bytes(state: u32, authority: Option<&Address>) -> Vec<u8> {
    let mut data = state.to_le_bytes().to_vec();
    data.extend_from_slice(&77u64.to_le_bytes());
    match authority {
        Some(key) => {
            data.push(1);
            data.extend_from_slice(key.as_ref());
        }
        None => data.extend_from_slice(&[0; 33]),
    }
    data.extend_from_slice(&[0x7F; 16]);
    data
}

/// The upgrade-authority check on `data` owned by `owner` at the address of `program`'s data.
fn upgrade_check(program: &Address, owner: Address, data: &[u8], signer: Address) -> ProgramResult {
    let (address, _) = Address::find_program_address(&[program.as_ref()], &LOADER);
    let mut program_data = HostAccount::new(address, owner, data);
    let mut authority = HostAccount::new(signer, SYSTEM, &[]).signer();
    checks::upgrade_authority(&program_data.view(), &ID, &authority.view())
}

#[test]
fn upgrade_authority_accepts_the_recorded_key_and_refuses_any_other() {
    let data = program_data_bytes(3, Some(&AUTHORITY));
    assert_eq!(upgrade_check(&ID, LOADER, &data, AUTHORITY), Ok(()));
    let mismatch = refused(BrotError::UpgradeAuthorityMismatch);
    assert_eq!(upgrade_check(&ID, LOADER, &data, key(0xA1)), mismatch);
}

#[test]
fn upgrade_authority_refuses_program_data_that_is_not_this_programs() {
    let data = program_data_bytes(3, Some(&AUTHORITY));
    let wrong = refused(BrotError::WrongProgramData);
    // Another program's ProgramData, naming the same authority.
    assert_eq!(upgrade_check(&key(0x55), LOADER, &data, AUTHORITY), wrong);
    // The right address and bytes under an owner other than the upgradeable loader.
    assert_eq!(upgrade_check(&ID, SYSTEM, &data, AUTHORITY), wrong);
    assert_eq!(upgrade_check(&ID, ID, &data, AUTHORITY), wrong);
}

#[test]
fn upgrade_authority_refuses_an_immutable_program_or_another_layout() {
    let wrong = refused(BrotError::WrongProgramData);
    let immutable = program_data_bytes(3, None);
    assert_eq!(upgrade_check(&ID, LOADER, &immutable, AUTHORITY), wrong);
    for state in [0, 1, 2, 4] {
        let data = program_data_bytes(state, Some(&AUTHORITY));
        let result = upgrade_check(&ID, LOADER, &data, AUTHORITY);
        assert_eq!(result, wrong, "state {state}");
    }
    let full = program_data_bytes(3, Some(&AUTHORITY));
    assert_eq!(upgrade_check(&ID, LOADER, &full[..44], AUTHORITY), wrong);
    assert_eq!(upgrade_check(&ID, LOADER, &full[..45], AUTHORITY), Ok(()));
    let mut bad_option = full.clone();
    bad_option[12] = 2;
    assert_eq!(upgrade_check(&ID, LOADER, &bad_option, AUTHORITY), wrong);
}

/// `create_pda_account` for the config address held by `owner` with `data` and 1 SOL.
fn create(owner: Address, data: &[u8]) -> ProgramResult {
    create_with(owner, data, 1_000_000_000)
}

fn create_with(owner: Address, data: &[u8], lamports: u64) -> ProgramResult {
    let (address, bump) = config_pda();
    let mut payer = HostAccount::new(key(0xB0), SYSTEM, &[]).signer().writable();
    let account = HostAccount::new(address, owner, data).writable();
    let mut account = account.lamports(lamports);
    let bump_seed = [bump];
    let seeds = [Seed::from(CONFIG_SEED), Seed::from(&bump_seed)];
    let (payer, account) = (payer.view(), account.view());
    checks::create_pda_account(&payer, &account, GlobalConfig::LEN, &ID, &seeds)
}

#[test]
fn create_never_reinitialises_and_refuses_what_it_cannot_create() {
    let (_, bump) = config_pda();
    let initialised = config_data(bump, key(1));
    let already = refused(BrotError::AlreadyInitialized);
    assert_eq!(create(ID, &initialised), already);
    // A data-less account the program owns (the vaults' shape) is just as created.
    assert_eq!(create(ID, &[]), already);
    assert_eq!(create(key(0x66), &[]), refused(BrotError::WrongOwner));
    assert_eq!(create(SYSTEM, &[0; 8]), already);
}

#[test]
fn create_lets_a_fresh_or_funded_address_reach_the_runtime() {
    // On the host the Rent sysvar fails: the guards let the address through to the System
    // Program steps, which the Mollusk tests run on the real binary.
    let reached = Err(ProgramError::UnsupportedSysvar);
    assert_eq!(create_with(SYSTEM, &[], 0), reached);
    assert_eq!(create_with(SYSTEM, &[], 1), reached);
    assert_eq!(create(SYSTEM, &[]), reached);
}
