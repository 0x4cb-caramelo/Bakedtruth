//! Purpose: the close helper (`checks::close_account`) and the paying check (`checks::paying_vault`) on
//!          the host: refusals change nothing; a closed account is the System Program's and empty, so
//!          every later owner and tag check refuses it. The same-transaction revival is tested in LiteSVM
//!          by the first instruction that closes an account (lane D, `close_campaign`).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze)

#[path = "checks_support/host.rs"]
mod host;

use brot_markets::{checks, error::BrotError, state::AccountTag};
use host::HostAccount;
use pinocchio::Address;

const ID: Address = Address::new_from_array([9; 32]);
const SYSTEM: [u8; 32] = [0; 32];

fn key(n: u8) -> Address {
    Address::new_from_array([n; 32])
}

#[test]
fn a_foreign_account_is_refused_and_untouched() {
    let mut vault = HostAccount::new(key(1), key(5), &[1, 2, 3])
        .writable()
        .lamports(50);
    let mut view = vault.view();
    let result = checks::close_account(&mut view, &ID);
    assert_eq!(result, Err(BrotError::WrongOwner.into()));
    assert_eq!(view.lamports(), 50);
    assert_eq!(view.data_len(), 3);
}

#[test]
fn an_account_still_holding_lamports_is_refused_and_untouched() {
    let mut account = HostAccount::new(key(2), ID, &[7; 16])
        .writable()
        .lamports(1);
    let mut view = account.view();
    assert_eq!(
        checks::close_account(&mut view, &ID),
        Err(BrotError::AccountNotEmpty.into())
    );
    assert_eq!(view.lamports(), 1);
    assert_eq!(view.data_len(), 16);
    assert_eq!(view.owner().as_array(), ID.as_array());
}

#[test]
fn a_closed_account_is_empty_and_the_system_programs() {
    let mut account = HostAccount::new(key(3), ID, &[7; 16])
        .writable()
        .lamports(0);
    let mut view = account.view();
    checks::close_account(&mut view, &ID).expect("empty, owned: closes");
    assert_eq!(view.lamports(), 0);
    assert_eq!(view.data_len(), 0);
    assert_eq!(view.owner().as_array(), &SYSTEM);
    assert!(view.is_data_empty());
}

#[test]
fn a_closed_then_revived_account_fails_the_owner_and_the_tag_checks() {
    // A revived account is funded again and owned by the System Program with no data: the program's
    // owner check refuses it before any byte is read, and the tag check refuses an empty account too.
    let mut account = HostAccount::new(key(4), ID, &[2, 1, 0, 0])
        .writable()
        .lamports(0);
    let mut view = account.view();
    checks::close_account(&mut view, &ID).expect("closes");
    assert_eq!(
        checks::owned_by(&view, &ID),
        Err(BrotError::WrongOwner.into())
    );
    assert_eq!(
        checks::tag(&[], AccountTag::Campaign),
        Err(BrotError::WrongTag.into())
    );
    // A closed account cannot be closed twice: it is no longer the program's.
    assert_eq!(
        checks::close_account(&mut view, &ID),
        Err(BrotError::WrongOwner.into())
    );
}

#[test]
fn the_vault_must_belong_to_the_program_and_no_recipient_may_be_it() {
    let mut vault = HostAccount::new(key(10), ID, &[]).writable();
    let mut wallet = HostAccount::new(key(11), SYSTEM.into(), &[]).writable();
    let mut same = HostAccount::new(key(10), ID, &[]).writable();
    let vault_view = vault.view();
    let wallet_view = wallet.view();
    let same_view = same.view();
    assert!(checks::paying_vault(&vault_view, &ID, &[&wallet_view]).is_ok());
    assert_eq!(
        checks::paying_vault(&vault_view, &ID, &[&wallet_view, &same_view]),
        Err(BrotError::DuplicateAccount.into())
    );
    let mut foreign = HostAccount::new(key(12), key(5), &[]).writable();
    let foreign_view = foreign.view();
    assert_eq!(
        checks::paying_vault(&foreign_view, &ID, &[&wallet_view]),
        Err(BrotError::WrongOwner.into())
    );
}
