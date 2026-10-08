//! Purpose: each per-slot and per-byte check of the `checks` module on the host, over account
//!          views laid out like the runtime's: its own error on the wrong input, `Ok` on the right
//!          one (T24). PDAs are real derivations.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane A

#[path = "checks_support/host.rs"]
mod host;

use brot_markets::{
    checks,
    constants::{CONFIG_SEED, EVENT_AUTHORITY, FEE_VAULT_SEED},
    error::BrotError,
    state::{AccountTag, LAYOUT_VERSION},
    ID,
};
use host::{config_pda, key, non_canonical_pda, HostAccount, SYSTEM};
use pinocchio::{error::ProgramError, ProgramResult};

fn refused(error: BrotError) -> ProgramResult {
    Err(error.into())
}

#[test]
fn owned_by_accepts_the_owner_and_refuses_any_other() {
    let wrong = refused(BrotError::WrongOwner);
    let mut account = HostAccount::new(key(1), ID, &[1, 1]);
    assert_eq!(checks::owned_by(&account.view(), &ID), Ok(()));
    assert_eq!(checks::owned_by(&account.view(), &SYSTEM), wrong);
    let mut foreign = HostAccount::new(key(1), key(9), &[1, 1]);
    assert_eq!(checks::owned_by(&foreign.view(), &ID), wrong);
}

#[test]
fn signer_refuses_an_unsigned_slot() {
    let mut unsigned = HostAccount::new(key(1), SYSTEM, &[]).writable();
    let missing = refused(BrotError::MissingSignature);
    assert_eq!(checks::signer(&unsigned.view()), missing);
    let mut signed = HostAccount::new(key(1), SYSTEM, &[]).signer();
    assert_eq!(checks::signer(&signed.view()), Ok(()));
}

#[test]
fn writable_refuses_a_read_only_slot() {
    let mut read_only = HostAccount::new(key(1), ID, &[]).signer();
    let wrong = refused(BrotError::NotWritable);
    assert_eq!(checks::writable(&read_only.view()), wrong);
    let mut writable = HostAccount::new(key(1), ID, &[]).writable();
    assert_eq!(checks::writable(&writable.view()), Ok(()));
}

#[test]
fn len_refuses_short_long_and_empty_data() {
    let wrong = refused(BrotError::WrongLength);
    let data = [7u8; 401];
    assert_eq!(checks::len(&data[..400], 400), Ok(()));
    assert_eq!(checks::len(&data[..399], 400), wrong);
    assert_eq!(checks::len(&data, 400), wrong);
    assert_eq!(checks::len(&[], 400), wrong);
    assert_eq!(checks::len(&[], 0), Ok(()));
}

#[test]
fn tag_refuses_another_type_and_a_zeroed_account() {
    let wrong = refused(BrotError::WrongTag);
    let config = AccountTag::GlobalConfig;
    assert_eq!(checks::tag(&[1, LAYOUT_VERSION, 0], config), Ok(()));
    let campaign = [AccountTag::Campaign as u8, LAYOUT_VERSION, 0];
    assert_eq!(checks::tag(&campaign, config), wrong);
    assert_eq!(checks::tag(&[0; 400], config), wrong);
    assert_eq!(checks::tag(&[], config), wrong);
    assert_eq!(checks::tag(&[3, 1], AccountTag::Entry), Ok(()));
}

#[test]
fn tag_refuses_another_layout_version() {
    let wrong = refused(BrotError::WrongLayoutVersion);
    let config = AccountTag::GlobalConfig;
    assert_eq!(checks::tag(&[1, 2, 0], config), wrong);
    assert_eq!(checks::tag(&[1, 0, 0], config), wrong);
    // The tag byte alone, with no version byte after it.
    assert_eq!(checks::tag(&[1], config), wrong);
}

#[test]
fn pda_accepts_the_stored_bump_and_refuses_a_look_alike() {
    let mismatch = refused(BrotError::PdaMismatch);
    let (address, bump) = config_pda();
    let seeds = [CONFIG_SEED];
    let mut config = HostAccount::new(address, ID, &[]);
    assert_eq!(checks::pda(&config.view(), &seeds, bump, &ID), Ok(()));
    assert_eq!(checks::pda_address(&address, &seeds, bump, &ID), Ok(()));
    let mut look_alike = HostAccount::new(key(4), ID, &[]);
    assert_eq!(checks::pda(&look_alike.view(), &seeds, bump, &ID), mismatch);
    let lower = bump.wrapping_sub(1);
    assert_eq!(checks::pda_address(&address, &seeds, lower, &ID), mismatch);
    let other_seeds = [FEE_VAULT_SEED];
    assert_eq!(
        checks::pda_address(&address, &other_seeds, bump, &ID),
        mismatch
    );
    assert_eq!(
        checks::pda_address(&address, &seeds, bump, &key(5)),
        mismatch
    );
    // A real PDA of the same seeds under its own bump, but not the bump this account stored.
    let (other, other_bump) = non_canonical_pda(&seeds, &ID);
    assert_eq!(checks::pda_address(&other, &seeds, other_bump, &ID), Ok(()));
    assert_eq!(checks::pda_address(&other, &seeds, bump, &ID), mismatch);
}

#[test]
fn canonical_pda_returns_the_canonical_bump_and_refuses_any_other_address() {
    let mismatch: Result<u8, ProgramError> = Err(BrotError::PdaMismatch.into());
    let (address, bump) = config_pda();
    let seeds: [&[u8]; 1] = [CONFIG_SEED];
    let mut config = HostAccount::new(address, SYSTEM, &[]);
    assert_eq!(checks::canonical_pda(&config.view(), &seeds, &ID), Ok(bump));
    let (lower, _) = non_canonical_pda(&seeds, &ID);
    let mut non_canonical = HostAccount::new(lower, SYSTEM, &[]);
    assert_eq!(
        checks::canonical_pda(&non_canonical.view(), &seeds, &ID),
        mismatch
    );
    let mut elsewhere = HostAccount::new(key(6), SYSTEM, &[]);
    assert_eq!(
        checks::canonical_pda(&elsewhere.view(), &seeds, &ID),
        mismatch
    );
    let other_seeds: [&[u8]; 1] = [FEE_VAULT_SEED];
    assert_eq!(
        checks::canonical_pda(&config.view(), &other_seeds, &ID),
        mismatch
    );
}

#[test]
fn system_program_refuses_a_look_alike() {
    let wrong = refused(BrotError::WrongSystemProgram);
    let mut system = HostAccount::new(SYSTEM, key(0xEE), &[]);
    assert_eq!(checks::system_program(&system.view()), Ok(()));
    let mut look_alike = HostAccount::new(key(1), key(0xEE), &[]);
    assert_eq!(checks::system_program(&look_alike.view()), wrong);
    let mut this_program = HostAccount::new(ID, key(0xEE), &[]);
    assert_eq!(checks::system_program(&this_program.view()), wrong);
}

#[test]
fn distinct_refuses_one_account_in_two_slots() {
    let duplicate = refused(BrotError::DuplicateAccount);
    let mut first = HostAccount::new(key(1), ID, &[]);
    let mut second = HostAccount::new(key(2), ID, &[]);
    assert_eq!(checks::distinct(&first.view(), &second.view()), Ok(()));
    // Two views of one account, as Pinocchio builds for a repeated slot.
    assert_eq!(checks::distinct(&first.view(), &first.view()), duplicate);
    // The comparison is by address, whatever memory the views point to.
    let mut copy = HostAccount::new(key(1), SYSTEM, &[9]);
    assert_eq!(checks::distinct(&first.view(), &copy.view()), duplicate);
}

#[test]
fn event_accounts_refuse_a_wrong_authority_or_program() {
    let wrong_authority = refused(BrotError::WrongEventAuthority);
    let wrong_program = refused(BrotError::WrongProgramAccount);
    let mut authority = HostAccount::new(EVENT_AUTHORITY, SYSTEM, &[]);
    let mut program = HostAccount::new(ID, key(0xEE), &[]);
    let mut other = HostAccount::new(key(3), SYSTEM, &[]);
    let check = |a: &mut HostAccount, p: &mut HostAccount| -> ProgramResult {
        checks::event_accounts(&a.view(), &p.view(), &ID)
    };
    assert_eq!(check(&mut authority, &mut program), Ok(()));
    assert_eq!(check(&mut other, &mut program), wrong_authority);
    assert_eq!(check(&mut authority, &mut other), wrong_program);
    // The authority is checked first.
    let mut other_too = HostAccount::new(key(4), SYSTEM, &[]);
    assert_eq!(check(&mut other, &mut other_too), wrong_authority);
    // The program's own address in the authority slot is still the wrong authority.
    let mut program_again = HostAccount::new(ID, key(0xEE), &[]);
    assert_eq!(check(&mut program_again, &mut program), wrong_authority);
}
