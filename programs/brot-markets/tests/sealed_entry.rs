//! Purpose: `sponsor_join_campaign` on the program's SBF binary in Mollusk (Sprint 15): a sealed entry of US$500 at
//!          the captured SOL/USD price puts its 90% in the vault and holds its 10% in a new SealedFee; the floor and
//!          `max_lamports` refuse with their own codes; a SealedFee slot that is another slot, or a SealedFee that
//!          names another campaign or sponsor, is refused before anything moves. X0.9 reruns the refusals with each
//!          check removed.
//! Version: 0.0.1
//! Sprint: 15 (lane L15). Runs after the SBF build (`BROT_MARKETS_SO`, else target/deploy).

mod sealed_support;
#[allow(unused_imports)]
#[path = "checks_support/mollusk.rs"]
mod world;

use brot_markets::{
    error::BrotError,
    layout::ZeroCopy,
    math::opening::{opening_paid_lamports, split_opening},
    state::{campaign::Campaign, sealed_fee::SealedFee, AccountTag},
    ID,
};
use mollusk_svm::result::InstructionResult;
use sealed_support::*;
use solana_account::Account;
use world::{after, assert_ok, assert_refused, key, World, SOL};

/// What US$500 costs at the captured SOL/USD price, split 90/10 (`math/opening.rs`).
fn charge(usd: u64) -> (u64, u64, u64) {
    let paid = opening_paid_lamports(usd, SOL_CHARGED, -8).unwrap();
    let split = split_opening(paid, 9_000).unwrap();
    (paid, split.prize, split.fee)
}

/// The sponsor's sealed entry of `usd`, at most `max` lamports, its SealedFee slot holding `sealed_fee`.
fn sealed_entry(usd: u64, max: u64, sealed_fee: Account) -> InstructionResult {
    let mut world = World::new();
    let accounts = sponsor_join_accounts(&mut world, sealed_fee);
    world.run(&sponsor_join_ix(&world, usd, max), &accounts)
}

#[test]
fn a_sealed_entry_holds_its_fee_in_a_new_sealed_fee_and_puts_its_entry_in_the_vault() {
    let (paid, entry, fee) = charge(500);
    let result = sealed_entry(500, paid, Account::default());
    assert_ok(&result);
    let world = World::new();
    let vault = after(&result, &vault_address().0).lamports;
    assert_eq!(vault, sum(&[world.rent(0), PRIZE, OPENING_FEE, entry]));
    let sealed = after(&result, &sealed_fee_address(&SPONSOR).0);
    assert_eq!(
        (sealed.owner, sealed.lamports),
        (ID, sum(&[world.rent(SealedFee::LEN), fee]))
    );
    let s = SealedFee::from_bytes(&sealed.data).unwrap();
    assert_eq!(
        (s.tag, s.campaign, s.sponsor),
        (AccountTag::SealedFee as u8, campaign_address().0, SPONSOR)
    );
    let totals = (
        s.fee_lamports.get(),
        s.entry_lamports.get(),
        s.usd_total.get(),
        s.sealed_count.get(),
    );
    assert_eq!(totals, (fee, entry, 500, 1));
    let c = Campaign::from_bytes(&after(&result, &campaign_address().0).data).unwrap();
    assert_eq!(
        (
            c.pool_yes.get(),
            c.sealed_fees_open.get(),
            c.entries_open.get()
        ),
        (entry, 1, 1)
    );
    assert_eq!(c.event_seq.get(), 3); // EntryAdded and SealedFeeHeld after the opening's one.
}

#[test]
fn sealed_floor_refuses_an_entry_below_the_config_opening_fee() {
    assert_refused(
        &sealed_entry(499, 100 * SOL, Account::default()),
        BrotError::SealedEntryBelowFloor,
    );
    assert_refused(
        &sealed_entry(0, 100 * SOL, Account::default()),
        BrotError::SealedEntryBelowFloor,
    );
}

#[test]
fn sealed_max_lamports_refuses_an_entry_above_its_bound() {
    let (paid, _, _) = charge(500);
    let over = sealed_entry(500, paid.checked_sub(1).unwrap(), Account::default());
    assert_refused(&over, BrotError::SealedEntryAboveMaxLamports);
}

#[test]
fn sealed_fee_distinct_refuses_a_sealed_fee_slot_that_is_another_slot() {
    for slot in [0, 2, 3, 4, 6] {
        let mut world = World::new();
        let accounts = sponsor_join_accounts(&mut world, Account::default());
        let mut ix = sponsor_join_ix(&world, 500, 100 * SOL);
        ix.accounts[8].pubkey = ix.accounts[slot].pubkey;
        assert_refused(&world.run(&ix, &accounts), BrotError::DuplicateAccount);
    }
}

#[test]
fn sealed_fee_keys_refuse_a_sealed_fee_that_names_another_campaign_or_sponsor() {
    let world = World::new();
    let edits: [fn(&mut SealedFee); 2] = [|s| s.campaign = key(0x0C), |s| s.sponsor = key(0x0D)];
    for edit in edits {
        let crafted = funded(&world, sealed_fee_data(&SPONSOR, 0, edit), 0);
        assert_refused(
            &sealed_entry(500, 100 * SOL, crafted),
            BrotError::SealedFeeMismatch,
        );
    }
}
