//! Purpose: `user_link_referrer` on the program's SBF binary in Mollusk: the link it writes (tag,
//!          version, canonical bump, referee, referrer, the clock's time and slot) with the referee's
//!          rent; written once (a second link is refused, to any referrer); an address funded in
//!          advance topped up instead of blocking the link; and the signature that stops a wallet
//!          from linking someone else whose address was funded in advance (T24, X0.9).
//! Version: 0.0.1
//! Sprint: 14 (referral), lane L14A. Runs after the SBF build, like `checks_mollusk.rs`.

#[path = "referral_support/mod.rs"]
mod referral;
// The world re-exports the checks' instruction builders, which this file does not use.
#[allow(unused_imports)]
#[path = "checks_support/mollusk.rs"]
mod world;

use brot_markets::{
    error::BrotError,
    layout::ZeroCopy,
    state::{referral::ReferralLink, AccountTag, LAYOUT_VERSION},
};
use referral::{
    assert_no_link, link_accounts, link_after, link_ix, link_of, referee_lamports, world_at_now,
    NOW, REFEREE, REFEREE_FUNDS, REFERRER, SLOT,
};
use solana_account::Account;
use solana_instruction::AccountMeta;
use world::{after, assert_ok, assert_refused, key, with, with_slot, SYSTEM};

#[test]
fn link_records_the_referrer_once_with_the_referees_rent() {
    let world = world_at_now();
    let result = world.run(&link_ix(&REFEREE, &REFERRER), &link_accounts(&REFEREE));
    assert_ok(&result);
    let data = link_after(&result, &REFEREE);
    let link = ReferralLink::from_bytes(&data).expect("exact length");
    let (_, bump) = link_of(&REFEREE);
    let head = (link.tag, link.version, link.bump);
    assert_eq!(head, (AccountTag::ReferralLink as u8, LAYOUT_VERSION, bump));
    assert_eq!((link.referee, link.referrer), (REFEREE, REFERRER));
    assert_eq!((link.linked_at.get(), link.linked_slot.get()), (NOW, SLOT));
    assert_eq!(link._reserved, [0u8; 13]);
    // The link holds exactly its rent-exempt minimum, and the referee paid it.
    let rent = world.rent(ReferralLink::LEN);
    let link_lamports = after(&result, &link_of(&REFEREE).0).lamports;
    assert_eq!(link_lamports, rent);
    let left = REFEREE_FUNDS.checked_sub(rent).unwrap();
    assert_eq!(referee_lamports(&result, &REFEREE), left);
}

#[test]
fn link_refuses_a_second_link_to_any_referrer() {
    let world = world_at_now();
    let first = world.run(&link_ix(&REFEREE, &REFERRER), &link_accounts(&REFEREE));
    assert_ok(&first);
    let kept = link_after(&first, &REFEREE);
    for referrer in [REFERRER, key(0x53)] {
        let again = world.run(&link_ix(&REFEREE, &referrer), &first.resulting_accounts);
        assert_refused(&again, BrotError::AlreadyInitialized);
        assert_eq!(link_after(&again, &REFEREE), kept);
    }
}

#[test]
fn link_tops_up_a_link_funded_in_advance() {
    let world = world_at_now();
    let rent = world.rent(ReferralLink::LEN);
    // One lamport, below the minimum: the referee pays the rest.
    let funded = Account::new(1, 0, &SYSTEM);
    let accounts = with(link_accounts(&REFEREE), link_of(&REFEREE).0, funded);
    let result = world.run(&link_ix(&REFEREE, &REFERRER), &accounts);
    assert_ok(&result);
    assert_eq!(
        link_after(&result, &REFEREE)[0],
        AccountTag::ReferralLink as u8
    );
    assert_eq!(after(&result, &link_of(&REFEREE).0).lamports, rent);
    let paid = rent.checked_sub(1).unwrap();
    let left = REFEREE_FUNDS.checked_sub(paid).unwrap();
    assert_eq!(referee_lamports(&result, &REFEREE), left);
    // Twice the minimum: the referee pays nothing, and the surplus stays in the link.
    let twice = rent.checked_mul(2).unwrap();
    let funded = Account::new(twice, 0, &SYSTEM);
    let accounts = with(link_accounts(&REFEREE), link_of(&REFEREE).0, funded);
    let result = world.run(&link_ix(&REFEREE, &REFERRER), &accounts);
    assert_ok(&result);
    let data = link_after(&result, &REFEREE);
    let link = ReferralLink::from_bytes(&data).expect("exact length");
    assert_eq!((link.referee, link.referrer), (REFEREE, REFERRER));
    assert_eq!(after(&result, &link_of(&REFEREE).0).lamports, twice);
    assert_eq!(referee_lamports(&result, &REFEREE), REFEREE_FUNDS);
}

#[test]
fn link_refuses_an_unsigned_referee_whose_link_was_funded_in_advance() {
    // Funded in advance, the link needs no lamport from the referee: the signature is all that
    // stops any wallet from naming the referee's address and choosing its referrer.
    let world = world_at_now();
    let rent = world.rent(ReferralLink::LEN);
    let accounts = with(
        link_accounts(&REFEREE),
        link_of(&REFEREE).0,
        Account::new(rent, 0, &SYSTEM),
    );
    let unsigned = with_slot(
        link_ix(&REFEREE, &REFERRER),
        0,
        AccountMeta::new(REFEREE, false),
    );
    let result = world.run(&unsigned, &accounts);
    assert_refused(&result, BrotError::MissingSignature);
    assert_no_link(&result, &REFEREE);
    assert_eq!(referee_lamports(&result, &REFEREE), REFEREE_FUNDS);
}

#[test]
fn link_records_another_referees_link_apart() {
    // Two referees naming the same referrer: two links, each at its own address, each paid by its
    // own referee.
    let world = world_at_now();
    let other = key(0x54);
    let first = world.run(&link_ix(&REFEREE, &REFERRER), &link_accounts(&REFEREE));
    assert_ok(&first);
    let mut accounts = first.resulting_accounts.clone();
    for (address, account) in link_accounts(&other).into_iter().take(2) {
        accounts = with(accounts, address, account);
    }
    let second = world.run(&link_ix(&other, &REFERRER), &accounts);
    assert_ok(&second);
    let data = link_after(&second, &other);
    let link = ReferralLink::from_bytes(&data).expect("exact length");
    assert_eq!((link.referee, link.referrer), (other, REFERRER));
    let kept = link_after(&first, &REFEREE);
    assert_eq!(link_after(&second, &REFEREE), kept);
}
