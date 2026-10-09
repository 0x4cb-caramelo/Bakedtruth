//! Purpose: lane D's write of `publish_time` at resolution, on the host: the YES proof's publish time for a
//!          price campaign, zero for the other kinds, and the rest of the record unchanged (Sprint 03 record).
//! Version: 0.0.1
//! Sprint: 04 (lane D)

use brot_markets::{
    instructions::resolution::resolve_campaign::record::{stored_publish_time, write},
    layout::{LeI64, LeU64, ZeroCopy},
    readers::{ChainTime, Decision, Reading},
    state::{campaign::Campaign, enums::*},
};
use pinocchio::Address;

const TIME: ChainTime = ChainTime {
    unix_timestamp: 1_791_216_180,
    slot: 452_305_000,
    epoch: 1_047,
};
const PROOF_PUBLISHED: i64 = 1_791_216_100;

fn decision(publish_time: i64) -> Decision {
    Decision::yes(Reading {
        observed: 900_000,
        account: Address::new_from_array([2; 32]),
        publish_time,
        posted_slot: 452_304_990,
    })
}

fn open(kind: ReaderKind) -> Vec<u8> {
    let mut bytes = vec![0u8; Campaign::LEN];
    let c = Campaign::from_bytes_mut(&mut bytes).unwrap();
    (c.kind, c.status) = (kind as u8, Status::Open as u8);
    c.event_seq = LeU64::new(4);
    bytes
}

#[test]
fn settle_d_price_campaign_records_the_proofs_publish_time() {
    let mut bytes = open(ReaderKind::PriceTouch);
    let c = Campaign::from_bytes_mut(&mut bytes).unwrap();
    let event = write(
        &Address::new_from_array([1; 32]),
        c,
        &decision(PROOF_PUBLISHED),
        &TIME,
    )
    .unwrap();
    assert_eq!(c.publish_time, LeI64::new(PROOF_PUBLISHED));
    assert_eq!(event.publish_time, LeI64::new(PROOF_PUBLISHED));
    assert_eq!(c.status, Status::InReview as u8);
}

#[test]
fn settle_d_other_kinds_store_zero_publish_time() {
    for kind in [
        ReaderKind::SupplyAtMost,
        ReaderKind::StakeAtLeast,
        ReaderKind::DammV2LockedAtLeast,
    ] {
        let mut bytes = open(kind);
        let c = Campaign::from_bytes_mut(&mut bytes).unwrap();
        write(
            &Address::new_from_array([1; 32]),
            c,
            &decision(PROOF_PUBLISHED),
            &TIME,
        )
        .unwrap();
        assert_eq!(c.publish_time, LeI64::new(0), "kind {}", kind as u8);
    }
    assert_eq!(
        stored_publish_time(ReaderKind::PriceTouch as u8, &decision(7)),
        7
    );
    assert_eq!(
        stored_publish_time(ReaderKind::StakePoolTvlAtLeast as u8, &decision(7)),
        0
    );
}
