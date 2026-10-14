//! Purpose: every refusal of `user_link_referrer` on the program's SBF binary in Mollusk, each with
//!          its exact error and nothing created: an unsigned or read-only referee, a read-only link,
//!          a look-alike, non-canonical or another referee's link address, another program's
//!          account or a System account with data at the link, a look-alike System Program, wrong
//!          event slots, the zero referrer, the referee as its own referrer, arguments of another
//!          length and missing accounts (T24, X0.9).
//! Version: 0.0.1
//! Sprint: 14 (referral), lane L14A. Runs after the SBF build, like `checks_mollusk.rs`.

#[path = "referral_support/mod.rs"]
mod referral;
// The world re-exports the checks' instruction builders, which this file does not use.
#[allow(unused_imports)]
#[path = "checks_support/mollusk.rs"]
mod world;

use brot_markets::{constants::REFERRAL_SEED, error::BrotError};
use mollusk_svm::result::{InstructionResult, ProgramResult};
use pinocchio::error::ProgramError;
use referral::{
    assert_no_link, link_accounts, link_ix, link_ix_with_data, link_of, referee_lamports,
    world_at_now, REFEREE, REFEREE_FUNDS, REFERRER,
};
use solana_account::Account;
use solana_instruction::{AccountMeta, Instruction};
use solana_pubkey::Pubkey;
use world::{assert_refused, key, non_canonical, with, with_slot, OTHER_PROGRAM, SYSTEM};

/// `link_ix(REFEREE, REFERRER)` with slot `index` replaced by `meta`, on a fresh referee's accounts
/// with `held` at the new slot's address.
fn link_with(index: usize, meta: AccountMeta, held: Account) -> InstructionResult {
    let address = meta.pubkey;
    let instruction = with_slot(link_ix(&REFEREE, &REFERRER), index, meta);
    world_at_now().run(&instruction, &with(link_accounts(&REFEREE), address, held))
}

/// `instruction` on a fresh referee's accounts.
fn run(instruction: &Instruction) -> InstructionResult {
    world_at_now().run(instruction, &link_accounts(&REFEREE))
}

/// Refused with `error`, with no link created and no lamport taken from the referee.
fn assert_refused_untouched(result: &InstructionResult, error: BrotError) {
    assert_refused(result, error);
    assert_no_link(result, &REFEREE);
    assert_eq!(referee_lamports(result, &REFEREE), REFEREE_FUNDS);
}

#[test]
fn link_refuses_an_unsigned_referee() {
    let unsigned = with_slot(
        link_ix(&REFEREE, &REFERRER),
        0,
        AccountMeta::new(REFEREE, false),
    );
    assert_refused_untouched(&run(&unsigned), BrotError::MissingSignature);
}

#[test]
fn link_refuses_a_read_only_referee() {
    let read_only = with_slot(
        link_ix(&REFEREE, &REFERRER),
        0,
        AccountMeta::new_readonly(REFEREE, true),
    );
    assert_refused_untouched(&run(&read_only), BrotError::NotWritable);
}

#[test]
fn link_refuses_a_read_only_link() {
    let link = AccountMeta::new_readonly(link_of(&REFEREE).0, false);
    let result = run(&with_slot(link_ix(&REFEREE, &REFERRER), 1, link));
    assert_refused_untouched(&result, BrotError::NotWritable);
}

#[test]
fn link_refuses_a_look_alike_a_non_canonical_or_another_referees_link() {
    let non_canonical_link = non_canonical(&[REFERRAL_SEED, REFEREE.as_ref()]);
    let others_link = link_of(&key(0x54)).0;
    for address in [key(0x99), non_canonical_link, others_link] {
        let result = link_with(1, AccountMeta::new(address, false), Account::default());
        assert_refused(&result, BrotError::PdaMismatch);
        assert_eq!(referee_lamports(&result, &REFEREE), REFEREE_FUNDS);
    }
}

#[test]
fn link_refuses_another_programs_account_or_a_system_account_with_data_at_the_link() {
    let world = world_at_now();
    let link = link_of(&REFEREE).0;
    let foreign = Account::new(world.rent(96), 96, &OTHER_PROGRAM);
    let accounts = with(link_accounts(&REFEREE), link, foreign);
    let result = world.run(&link_ix(&REFEREE, &REFERRER), &accounts);
    assert_refused(&result, BrotError::WrongOwner);
    // A System account that carries data cannot be allocated again: refused, never overwritten.
    let with_data = Account::new(world.rent(96), 96, &SYSTEM);
    let accounts = with(link_accounts(&REFEREE), link, with_data);
    let result = world.run(&link_ix(&REFEREE, &REFERRER), &accounts);
    assert_refused(&result, BrotError::AlreadyInitialized);
}

#[test]
fn link_refuses_a_look_alike_system_program() {
    let look_alike = AccountMeta::new_readonly(OTHER_PROGRAM, false);
    let result = link_with(2, look_alike, Account::default());
    assert_refused_untouched(&result, BrotError::WrongSystemProgram);
}

#[test]
fn link_refuses_wrong_event_accounts() {
    let authority = AccountMeta::new_readonly(key(0x98), false);
    let result = link_with(3, authority, Account::default());
    assert_refused_untouched(&result, BrotError::WrongEventAuthority);
    let program = AccountMeta::new_readonly(OTHER_PROGRAM, false);
    let result = link_with(4, program, Account::default());
    assert_refused_untouched(&result, BrotError::WrongProgramAccount);
}

#[test]
fn link_refuses_the_zero_referrer() {
    let zero = Pubkey::new_from_array([0; 32]);
    assert_refused_untouched(&run(&link_ix(&REFEREE, &zero)), BrotError::InvalidReferrer);
}

#[test]
fn link_refuses_the_referee_as_its_own_referrer() {
    assert_refused_untouched(
        &run(&link_ix(&REFEREE, &REFEREE)),
        BrotError::InvalidReferrer,
    );
}

#[test]
fn link_refuses_arguments_of_another_length_and_missing_accounts() {
    for length in [0usize, 31, 33] {
        let short_or_long = link_ix_with_data(&REFEREE, &vec![7u8; length]);
        assert_refused_untouched(&run(&short_or_long), BrotError::BadInstructionData);
    }
    let mut four = link_ix(&REFEREE, &REFERRER);
    four.accounts.truncate(4);
    let missing = ProgramResult::Failure(ProgramError::NotEnoughAccountKeys);
    assert_eq!(run(&four).program_result, missing);
}
