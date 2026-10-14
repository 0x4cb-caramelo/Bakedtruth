//! Purpose: G-2 of the audit package (Sprint 16) on the host: each in-program assertion of TP section 3.4.13 refuses
//!          a planted mismatch. A move whose two sides end with other balances than it wrote (the same account on
//!          both sides: `moved_exactly`); a paying instruction whose vault moved by another amount than its books
//!          (`VaultWatch`: the payouts, the fee and prize flags, a reserve); a close whose vault holds less than its
//!          books still owe, or whose reserve is outside them (`books_held`, `require_books_covered`; since the
//!          review's F5 the vault's whole balance is compared, its rent coming back from above the books).
//! Version: 0.0.2 (F5: the close compares the vault itself with the books)
//! Sprint: 16 (lane L16P, the pre-freeze hardening and the review's follow-ups)

#[path = "checks_support/host.rs"]
mod host;

use brot_markets::{
    error::BrotError,
    instructions::settlement::{
        bookkeeping::{books_held, pay_from_vault, require_books_covered, VaultWatch},
        collect_fee::{amount, moves::move_lamports},
    },
    layout::{LeU64, ZeroCopy},
    state::{campaign::Campaign, enums::SettleMode},
};
use host::{key, HostAccount, SYSTEM};
use pinocchio::Address;

const ID: Address = Address::new_from_array([9; 32]);
const VIOLATED: Result<(), BrotError> = Err(BrotError::InvariantViolated);
/// What `collect_fee` keeps of `finalized`'s split: the fee less the creator's part of it, plus the opening fee.
const KEPT: u64 = 100 - 10 + 50;
/// What the books of the settled split in the close test still hold: 6,550 in, 6,300 paid, `KEPT` collected.
const HELD: u64 = 6_550 - 6_300 - KEPT;

/// A finalized campaign in `mode`: 4,000 on YES and 2,000 on NO, a 500 prize, a 50 opening fee, a fee of 100 of
/// which 10 went to the creator; a split shares out 5,000 to the winners and 90 to the creator (the payout cap, F4,
/// is then 5,090, above every payout these tests book).
fn finalized(buf: &mut Vec<u8>, mode: SettleMode) -> &mut Campaign {
    buf.clear();
    buf.resize(<Campaign as ZeroCopy>::LEN, 0);
    let c = Campaign::from_bytes_mut(buf).unwrap();
    c.settle_mode = mode as u8;
    c.pool_yes = LeU64::new(4_000);
    c.pool_no = LeU64::new(2_000);
    c.prize_lamports = LeU64::new(500);
    c.opening_fee_lamports = LeU64::new(50);
    c.fee_total = LeU64::new(100);
    c.creator_share_from_fee = LeU64::new(10);
    if mode == SettleMode::Split {
        c.distributable = LeU64::new(5_000);
        c.creator_share = LeU64::new(90);
    }
    c
}

#[test]
fn prefreeze_vault_watch_refuses_a_payout_the_books_do_not_record() {
    let mut buf = Vec::new();
    let c = finalized(&mut buf, SettleMode::Split);
    let mut vault = HostAccount::new(key(1), ID, &[])
        .writable()
        .lamports(10_000);
    let mut v = vault.view();
    let watch = VaultWatch::start(&v, c).unwrap();
    // `settle_entry`'s shape: the vault pays 700 and `paid_out_total` records 699.
    v.set_lamports(9_300);
    c.paid_out_total = LeU64::new(699);
    assert_eq!(watch.check(&v, c), VIOLATED);
    // A record the vault did not follow: the books say 700 left, the vault paid nothing.
    v.set_lamports(10_000);
    c.paid_out_total = LeU64::new(700);
    assert_eq!(watch.check(&v, c), VIOLATED);
    // As booked.
    v.set_lamports(9_300);
    assert_eq!(watch.check(&v, c), Ok(()));
}

#[test]
fn prefreeze_vault_watch_refuses_a_flag_the_vault_did_not_follow() {
    let mut buf = Vec::new();
    let c = finalized(&mut buf, SettleMode::Split);
    assert_eq!(amount::kept(c).unwrap().amount, KEPT);
    let mut vault = HostAccount::new(key(1), ID, &[])
        .writable()
        .lamports(10_000);
    let mut v = vault.view();
    // `collect_fee`: setting the flag books `kept` out; the vault moved one lamport less.
    let watch = VaultWatch::start(&v, c).unwrap();
    c.fee_collected = 1;
    v.set_lamports(10_000 - KEPT + 1);
    assert_eq!(watch.check(&v, c), VIOLATED);
    v.set_lamports(10_000 - KEPT);
    assert_eq!(watch.check(&v, c), Ok(()));

    // `settle_prize` on a one-sided pot: setting the flag books the prize out; the vault did not move.
    let mut buf = Vec::new();
    let c = finalized(&mut buf, SettleMode::OneSided);
    let watch = VaultWatch::start(&v, c).unwrap();
    c.prize_settled = 1;
    assert_eq!(watch.check(&v, c), VIOLATED);
    v.set_lamports(10_000 - KEPT - 500);
    assert_eq!(watch.check(&v, c), Ok(()));
}

#[test]
fn prefreeze_vault_watch_counts_changes_and_a_reserve_stays_in_the_vault() {
    let mut buf = Vec::new();
    let c = finalized(&mut buf, SettleMode::Split);
    c.paid_out_total = LeU64::new(1_000);
    // 777 lamports sent by hand before the instruction are in the start balance: a payout as booked passes.
    let mut vault = HostAccount::new(key(1), ID, &[]).writable().lamports(9_777);
    let mut v = vault.view();
    let watch = VaultWatch::start(&v, c).unwrap();
    v.set_lamports(9_477);
    c.paid_out_total = LeU64::new(1_300);
    assert_eq!(watch.check(&v, c), Ok(()));
    // A reserved creator share stays in the vault and books nothing out: the vault must not move.
    let watch = VaultWatch::start(&v, c).unwrap();
    c.creator_share_reserved = LeU64::new(90);
    assert_eq!(watch.check(&v, c), Ok(()));
    v.set_lamports(9_387);
    assert_eq!(watch.check(&v, c), VIOLATED);
    // Books that go backwards are refused too.
    c.paid_out_total = LeU64::new(1_299);
    assert_eq!(watch.check(&v, c), VIOLATED);
}

#[test]
fn prefreeze_vault_move_refuses_the_same_account_on_both_sides() {
    // Both sides one account: it would end with the credit, not the debit (100 lamports out of nothing).
    let mut same = HostAccount::new(key(2), ID, &[]).writable().lamports(1_000);
    let (mut from, mut to) = (same.view(), same.view());
    assert_eq!(
        move_lamports(&mut from, &mut to, 100),
        Err(BrotError::InvariantViolated.into())
    );
    let mut same = HostAccount::new(key(3), ID, &[]).writable().lamports(1_000);
    let (mut vault, mut to) = (same.view(), same.view());
    assert_eq!(
        pay_from_vault(&mut vault, &mut to, 100),
        Err(BrotError::InvariantViolated.into())
    );
    // Two accounts: each side moves by exactly the amount.
    let mut a = HostAccount::new(key(4), ID, &[]).writable().lamports(1_000);
    let mut b = HostAccount::new(key(5), SYSTEM, &[]).writable().lamports(5);
    let (mut from, mut to) = (a.view(), b.view());
    move_lamports(&mut from, &mut to, 100).unwrap();
    pay_from_vault(&mut from, &mut to, 50).unwrap();
    assert_eq!((from.lamports(), to.lamports()), (850, 155));
}

#[test]
fn prefreeze_close_refuses_a_vault_below_what_the_books_hold() {
    let mut buf = Vec::new();
    let c = finalized(&mut buf, SettleMode::Split);
    // Settled: 6,550 in; 6,300 paid to the entries and the creator, 140 collected; the prize is in the split.
    c.paid_out_total = LeU64::new(6_300);
    c.fee_collected = 1;
    c.prize_settled = 1;
    c.creator_share_reserved = LeU64::new(90);
    assert_eq!(books_held(c), Ok(HELD));
    // The vault holds the dust and the reserve, or more (its rent, SOL sent by hand).
    assert_eq!(require_books_covered(HELD, HELD, 90), Ok(()));
    assert_eq!(require_books_covered(HELD + 5, HELD, 90), Ok(()));
    // One lamport short of the books, or a reserve larger than what they hold.
    assert_eq!(require_books_covered(HELD - 1, HELD, 90), VIOLATED);
    assert_eq!(require_books_covered(HELD, HELD, HELD + 1), VIOLATED);
    // Books that paid out more than they took in.
    c.paid_out_total = LeU64::new(6_500);
    assert_eq!(books_held(c), VIOLATED.map(|()| 0));
}
