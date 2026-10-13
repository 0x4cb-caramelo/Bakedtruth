//! Purpose: `settle_sealed_fee` and the close rule of the sealed entry on the program's SBF binary in Mollusk
//!          (Sprint 15): the fee goes to the sponsor on a void the house caused and to the fee vault on every other
//!          outcome, the rent always to the sponsor, lamports sent by hand to the fee vault; the account closes and
//!          the campaign's count goes down; each refusal with its own error, before anything moves; and
//!          `close_campaign` waits for every held fee. X0.9 reruns the refusals with each check removed.
//! Version: 0.0.1
//! Sprint: 15 (lane L15). Runs after the SBF build (`BROT_MARKETS_SO`, else target/deploy).

mod sealed_support;
#[allow(unused_imports)]
#[path = "checks_support/mollusk.rs"]
mod world;

use brot_markets::{
    error::BrotError,
    layout::{LeU32, LeU64, ZeroCopy},
    state::{
        campaign::Campaign,
        enums::{SettleMode, Status, VoidReason},
        sealed_fee::SealedFee,
    },
};
use mollusk_svm::result::InstructionResult;
use sealed_support::*;
use solana_account::Account;
use world::{after, assert_ok, assert_refused, key, with, World, SOL, SYSTEM};

const FEE: u64 = 400_000_000;

/// The campaign finalized with `mode` and `reason`, one SealedFee open.
fn finalized(mode: SettleMode, reason: VoidReason) -> Vec<u8> {
    campaign_data(|c| {
        (c.status, c.settle_mode, c.void_reason) =
            (Status::Settling as u8, mode as u8, reason as u8);
        c.sealed_fees_open = LeU32::new(1);
    })
}

/// `settle_sealed_fee` on the sponsor's SealedFee (holding the fee and `extra` lamports) of `campaign`.
fn settle(world: &World, campaign: Vec<u8>, extra: u64) -> InstructionResult {
    let sealed_fee = funded(world, sealed_fee_data(&SPONSOR, FEE, |_| {}), FEE + extra);
    let ix = settle_ix(world, sealed_fee_address(&SPONSOR).0, SPONSOR);
    world.run(&ix, &settle_accounts(world, sealed_fee, campaign))
}

/// What the sponsor and the fee vault gained, and the closed SealedFee's lamports and owner.
fn gains(world: &World, result: &InstructionResult) -> (u64, u64, u64, bool) {
    assert_ok(result);
    let sponsor = after(result, &SPONSOR).lamports.checked_sub(SOL).unwrap();
    let fee_vault = after(result, &world.fee_vault).lamports;
    let fee_vault = fee_vault.checked_sub(world.rent(0)).unwrap();
    let sealed = after(result, &sealed_fee_address(&SPONSOR).0);
    (
        sponsor,
        fee_vault,
        sealed.lamports,
        sealed.owner == SYSTEM && sealed.data.is_empty(),
    )
}

#[test]
fn the_fee_goes_to_the_sponsor_only_on_a_void_the_house_caused() {
    let world = World::new();
    let rent = world.rent(SealedFee::LEN);
    let cases = [
        (SettleMode::Split, VoidReason::None, false),
        (SettleMode::OneSided, VoidReason::None, false),
        (SettleMode::Refund, VoidReason::UnreadableAccount, false),
        (SettleMode::Refund, VoidReason::StaleFeed, false),
        (SettleMode::Refund, VoidReason::TeamOutsideCause, false),
        (SettleMode::Refund, VoidReason::MissedWindow, true),
        (SettleMode::Refund, VoidReason::TeamHouseFailure, true),
    ];
    for (mode, reason, refunded) in cases {
        let result = settle(&world, finalized(mode, reason), 0);
        let expected = if refunded {
            (rent + FEE, 0)
        } else {
            (rent, FEE)
        };
        let (sponsor, fee_vault, left, closed) = gains(&world, &result);
        assert_eq!((sponsor, fee_vault), expected, "{mode:?} {reason:?}");
        assert_eq!((left, closed), (0, true), "{mode:?} {reason:?}");
        let c = Campaign::from_bytes(&after(&result, &campaign_address().0).data).unwrap();
        assert_eq!((c.sealed_fees_open.get(), c.event_seq.get()), (0, 2));
    }
}

#[test]
fn lamports_sent_by_hand_go_to_the_fee_vault() {
    let world = World::new();
    let rent = world.rent(SealedFee::LEN);
    let refund = settle(
        &world,
        finalized(SettleMode::Refund, VoidReason::MissedWindow),
        7 * SOL,
    );
    assert_eq!(gains(&world, &refund), (rent + FEE, 7 * SOL, 0, true));
    let split = settle(
        &world,
        finalized(SettleMode::Split, VoidReason::None),
        7 * SOL,
    );
    assert_eq!(gains(&world, &split), (rent, FEE + 7 * SOL, 0, true));
}

#[test]
fn sealed_fee_finalized_refuses_a_campaign_not_finalized() {
    let world = World::new();
    for status in [Status::Open, Status::InReview, Status::Contested] {
        let campaign = campaign_data(|c| {
            c.status = status as u8;
            c.sealed_fees_open = LeU32::new(1);
        });
        assert_refused(&settle(&world, campaign, 0), BrotError::NotFinalized);
    }
}

#[test]
fn sealed_fee_campaign_refuses_a_sealed_fee_of_another_campaign() {
    let world = World::new();
    let other = funded(
        &world,
        sealed_fee_data(&SPONSOR, FEE, |s| s.campaign = key(0x0C)),
        FEE,
    );
    let ix = settle_ix(&world, sealed_fee_address(&SPONSOR).0, SPONSOR);
    let accounts = settle_accounts(
        &world,
        other,
        finalized(SettleMode::Split, VoidReason::None),
    );
    assert_refused(&world.run(&ix, &accounts), BrotError::SealedFeeMismatch);
}

#[test]
fn sealed_fee_sponsor_refuses_another_wallet() {
    let world = World::new();
    let thief = key(0x7F);
    let sealed_fee = funded(&world, sealed_fee_data(&SPONSOR, FEE, |_| {}), FEE);
    let ix = settle_ix(&world, sealed_fee_address(&SPONSOR).0, thief);
    let campaign = finalized(SettleMode::Refund, VoidReason::MissedWindow);
    let accounts = with(
        settle_accounts(&world, sealed_fee, campaign),
        thief,
        wallet(SOL),
    );
    assert_refused(&world.run(&ix, &accounts), BrotError::WrongSponsor);
}

#[test]
fn sealed_fee_settled_refuses_a_closed_sealed_fee() {
    let world = World::new();
    let ix = settle_ix(&world, sealed_fee_address(&SPONSOR).0, SPONSOR);
    let campaign = finalized(SettleMode::Split, VoidReason::None);
    for closed in [Account::default(), wallet(SOL)] {
        let accounts = settle_accounts(&world, closed, campaign.clone());
        assert_refused(&world.run(&ix, &accounts), BrotError::AlreadySettled);
    }
}

#[test]
fn settle_sealed_fee_refuses_its_sealed_fee_in_another_slot() {
    let world = World::new();
    let sealed = sealed_fee_address(&SPONSOR).0;
    let accounts = || {
        let account = funded(&world, sealed_fee_data(&SPONSOR, FEE, |_| {}), FEE);
        settle_accounts(
            &world,
            account,
            finalized(SettleMode::Split, VoidReason::None),
        )
    };
    for slot in [1, 2, 3] {
        let mut ix = settle_ix(&world, sealed, SPONSOR);
        ix.accounts[slot].pubkey = sealed;
        assert_refused(&world.run(&ix, &accounts()), BrotError::DuplicateAccount);
    }
}

#[test]
fn sealed_fees_open_keeps_the_campaign_from_closing() {
    let world = World::new();
    let settled = |open: u32| {
        campaign_data(|c| {
            (c.status, c.settle_mode) = (Status::Settled as u8, SettleMode::Split as u8);
            (c.fee_collected, c.prize_settled, c.creator_share_settled) = (1, 1, 1);
            (c.prize_lamports, c.opening_fee_lamports) = (LeU64::new(0), LeU64::new(0));
            c.sealed_fees_open = LeU32::new(open);
        })
    };
    let held = world.run(&close_ix(&world), &close_accounts(&world, settled(1)));
    assert_refused(&held, BrotError::SealedFeesOpen);
    let closed = world.run(&close_ix(&world), &close_accounts(&world, settled(0)));
    assert_ok(&closed);
    assert_eq!(after(&closed, &campaign_address().0).lamports, 0);
}
