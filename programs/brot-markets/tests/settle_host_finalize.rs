//! Host tests of `finalize_snapshot` (lane C) on campaign and config bytes: its refusals, the late totals that
//! leave V and P, the transition, and the open count for a paid campaign only (I7).

use brot_markets::{
    error::BrotError,
    instructions::settlement::snapshot::finalize_snapshot,
    layout::{LeI64, LeU32, LeU64, ZeroCopy},
    state::{
        campaign::Campaign,
        config::GlobalConfig,
        enums::{Outcome, ReaderKind, SettleMode, Status, VoidReason},
    },
};

const YES: u8 = Outcome::Yes as u8;
const NO: u8 = Outcome::No as u8;
const VOID: u8 = Outcome::Void as u8;

/// A zeroed campaign in `InReview` with a YES outcome, both pools of 6 and 4 SOL, 1 SOL of YES late.
fn campaign(buf: &mut Vec<u8>) -> &mut Campaign {
    buf.clear();
    buf.resize(<Campaign as ZeroCopy>::LEN, 0);
    let c = Campaign::from_bytes_mut(buf).unwrap();
    c.status = Status::InReview as u8;
    c.outcome = YES;
    c.pool_yes = LeU64::new(6_000_000_000);
    c.pool_no = LeU64::new(4_000_000_000);
    c.late_yes = LeU64::new(1_000_000_000);
    c.entries_open = LeU32::new(1);
    c.publish_time = LeI64::new(1_700_000_000);
    c.fee_bps = brot_markets::layout::LeU16::new(1000);
    c.one_sided_fee_bps = brot_markets::layout::LeU16::new(100);
    c.creator_share_bps = brot_markets::layout::LeU16::new(100);
    c.creator_is_team = 0;
    c
}

fn config(buf: &mut Vec<u8>, open: u32) -> &mut GlobalConfig {
    buf.clear();
    buf.resize(<GlobalConfig as ZeroCopy>::LEN, 0);
    let g = GlobalConfig::from_bytes_mut(buf).unwrap();
    g.open_campaigns = LeU32::new(open);
    g
}

#[test]
fn settle_host_finalize_refuses_while_an_entry_is_untallied() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    c.entries_untallied = LeU32::new(1);
    let g = config(&mut gb, 1);
    assert_eq!(finalize_snapshot(c, g), Err(BrotError::NotTallied));
    assert_eq!(c.status, Status::InReview as u8);
}

#[test]
fn settle_host_finalize_refuses_a_price_yes_without_publish_time() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    c.publish_time = LeI64::new(0);
    let g = config(&mut gb, 1);
    assert_eq!(finalize_snapshot(c, g), Err(BrotError::NoProofTime));
    assert_eq!(c.status, Status::InReview as u8);
}

#[test]
fn settle_host_finalize_a_non_price_yes_without_publish_time_finalizes() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    c.publish_time = LeI64::new(0);
    c.kind = ReaderKind::SupplyAtMost as u8;
    let g = config(&mut gb, 1);
    finalize_snapshot(c, g).unwrap();
    assert_eq!(c.status, Status::Settling as u8);
}

#[test]
fn settle_host_finalize_a_price_no_without_publish_time_finalizes() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    c.publish_time = LeI64::new(0);
    c.outcome = NO;
    let g = config(&mut gb, 1);
    finalize_snapshot(c, g).unwrap();
    assert_eq!(c.settle_mode, SettleMode::Split as u8);
    assert_eq!(c.status, Status::Settling as u8);
}

#[test]
fn settle_host_finalize_a_campaign_with_no_entries_goes_straight_to_settled() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    c.entries_open = LeU32::new(0);
    c.pool_yes = LeU64::new(0);
    c.pool_no = LeU64::new(0);
    c.late_yes = LeU64::new(0);
    c.publish_time = LeI64::new(0);
    c.kind = ReaderKind::SupplyAtMost as u8;
    let g = config(&mut gb, 1);
    finalize_snapshot(c, g).unwrap();
    assert_eq!(c.status, Status::Settled as u8);
    assert_eq!(c.settle_mode, SettleMode::Refund as u8);
    assert_eq!(c.creator_share.get(), 0);
    assert_eq!(g.open_campaigns.get(), 0);
}

#[test]
fn settle_host_finalize_split_takes_the_late_totals_out_of_v_and_p() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    let g = config(&mut gb, 3);
    finalize_snapshot(c, g).unwrap();
    assert_eq!(c.settle_mode, SettleMode::Split as u8);
    assert_eq!(c.winning_total.get(), 5_000_000_000);
    assert_eq!(c.losing_total.get(), 4_000_000_000);
    assert_eq!(c.status, Status::Settling as u8);
    assert_eq!(g.open_campaigns.get(), 2);
}

#[test]
fn settle_host_finalize_team_campaign_does_not_touch_the_open_count() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    c.creator_is_team = 1;
    c.creator_share_bps = brot_markets::layout::LeU16::new(0);
    let g = config(&mut gb, 0);
    finalize_snapshot(c, g).unwrap();
    assert_eq!(g.open_campaigns.get(), 0);
    assert_eq!(c.creator_share.get(), 0);
}

#[test]
fn settle_host_finalize_a_paid_campaign_with_no_open_count_is_refused() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    let g = config(&mut gb, 0);
    assert_eq!(finalize_snapshot(c, g), Err(BrotError::InvariantViolated));
    assert_eq!(c.status, Status::InReview as u8);
}

#[test]
fn settle_host_finalize_twice_is_an_illegal_transition() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    let g = config(&mut gb, 2);
    finalize_snapshot(c, g).unwrap();
    assert_eq!(finalize_snapshot(c, g), Err(BrotError::IllegalTransition));
    assert_eq!(g.open_campaigns.get(), 1);
}

#[test]
fn settle_host_finalize_void_needs_no_proof_time_and_refunds() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    c.publish_time = LeI64::new(0);
    c.outcome = VOID;
    c.void_reason = VoidReason::MissedWindow as u8;
    let g = config(&mut gb, 1);
    finalize_snapshot(c, g).unwrap();
    assert_eq!(c.settle_mode, SettleMode::Refund as u8);
    assert_eq!(c.creator_share.get(), 0);
}

#[test]
fn settle_host_finalize_a_void_with_no_reason_is_inconsistent() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    c.outcome = VOID;
    c.void_reason = VoidReason::None as u8;
    let g = config(&mut gb, 1);
    assert_eq!(
        finalize_snapshot(c, g),
        Err(BrotError::SnapshotInconsistent)
    );
}

#[test]
fn settle_host_finalize_no_outcome_is_refused() {
    let (mut cb, mut gb) = (Vec::new(), Vec::new());
    let c = campaign(&mut cb);
    c.outcome = NO + 10;
    let g = config(&mut gb, 1);
    assert_eq!(finalize_snapshot(c, g), Err(BrotError::BadAccountData));
}
