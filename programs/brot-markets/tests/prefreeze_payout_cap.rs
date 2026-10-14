//! Purpose: F4 of the pre-freeze review (Sprint 16) on the host: the payout cap from the snapshot
//!          (`settlement/payout_cap.rs`). A split's payouts reach at most the distributable amount, every late part
//!          and the creator share; a one-sided pot's payouts and fees, or a refund's payouts, at most both pools; one
//!          lamport above is `PaidOutAboveSnapshot`, and a campaign with no snapshot has no cap (`NotFinalized`).
//! Version: 0.0.1
//! Sprint: 16 (lane L16P, the review's follow-ups)

use brot_markets::{
    error::BrotError,
    instructions::settlement::payout_cap::{payout_cap, require_within_snapshot},
    layout::{LeU64, ZeroCopy},
    state::{campaign::Campaign, enums::SettleMode},
};

const ABOVE: Result<(), BrotError> = Err(BrotError::PaidOutAboveSnapshot);
/// Both pools of every campaign here: 4,000 on YES (300 of it late) and 2,000 on NO (200 late).
const POOLS: u64 = 4_000 + 2_000;
/// A split's cap: 5,100 distributable to the winners, the 500 late lamports back whole, a 90 creator share.
const SPLIT_CAP: u64 = 5_100 + 300 + 200 + 90;

fn campaign(buf: &mut Vec<u8>, mode: SettleMode) -> &mut Campaign {
    buf.clear();
    buf.resize(<Campaign as ZeroCopy>::LEN, 0);
    let c = Campaign::from_bytes_mut(buf).unwrap();
    c.settle_mode = mode as u8;
    c.pool_yes = LeU64::new(4_000);
    c.pool_no = LeU64::new(2_000);
    c.late_yes = LeU64::new(300);
    c.late_no = LeU64::new(200);
    c.distributable = LeU64::new(5_100);
    c.creator_share = LeU64::new(90);
    c
}

#[test]
fn prefreeze_payout_cap_split_counts_distributable_late_parts_and_the_creator_share() {
    let mut buf = Vec::new();
    let c = campaign(&mut buf, SettleMode::Split);
    assert_eq!(payout_cap(c), Ok(SPLIT_CAP));
    c.paid_out_total = LeU64::new(SPLIT_CAP);
    assert_eq!(require_within_snapshot(c), Ok(()));
    c.paid_out_total = LeU64::new(SPLIT_CAP + 1);
    assert_eq!(require_within_snapshot(c), ABOVE);
}

#[test]
fn prefreeze_payout_cap_one_sided_and_refund_count_payouts_and_fees_against_both_pools() {
    let mut buf = Vec::new();
    let c = campaign(&mut buf, SettleMode::OneSided);
    assert_eq!(payout_cap(c), Ok(POOLS));
    // Every entry back less its 1% fee, the fees kept: payouts and fees are both pools exactly.
    c.paid_out_total = LeU64::new(POOLS - 60);
    c.one_sided_fees = LeU64::new(60);
    assert_eq!(require_within_snapshot(c), Ok(()));
    c.one_sided_fees = LeU64::new(61);
    assert_eq!(require_within_snapshot(c), ABOVE);

    let mut buf = Vec::new();
    let c = campaign(&mut buf, SettleMode::Refund);
    c.paid_out_total = LeU64::new(POOLS);
    assert_eq!(require_within_snapshot(c), Ok(()));
    c.paid_out_total = LeU64::new(POOLS + 1);
    assert_eq!(require_within_snapshot(c), ABOVE);
}

#[test]
fn prefreeze_payout_cap_needs_a_snapshot() {
    let mut buf = Vec::new();
    let c = campaign(&mut buf, SettleMode::Unset);
    assert_eq!(payout_cap(c), Err(BrotError::NotFinalized));
    assert_eq!(require_within_snapshot(c), Err(BrotError::NotFinalized));
}
