//! Purpose: the `Join` record's fields as the join writes them, the checked read of joins from
//!          account bytes, and the refund split of those joins against `split_late` (question 7).
//! Version: 0.0.1
//! Sprint: 04 (settlement and invariants), lane G

use brot_markets::{
    error::BrotError,
    instructions::entries::join_record::record_from_bytes,
    layout::ZeroCopy,
    math::refund::{split_late, Join as RefundJoin, Split},
    state::{join::Join, AccountTag, LAYOUT_VERSION},
};
use pinocchio::Address;

fn campaign() -> Address {
    Address::new_from_array([1; 32])
}

fn baker() -> Address {
    Address::new_from_array([2; 32])
}

/// The 96 bytes a join writes: tag, version, bump, side, campaign, baker, index, joined_at, amount.
fn bytes(side: u8, index: u32, joined_at: i64, amount: u64) -> [u8; Join::LEN] {
    let mut data = [0u8; Join::LEN];
    let join = Join::from_bytes_mut(&mut data).expect("exact length");
    join.tag = AccountTag::Join as u8;
    join.version = LAYOUT_VERSION;
    join.bump = 254;
    join.side = side;
    join.campaign = campaign();
    join.baker = baker();
    join.index.set(index);
    join.joined_at.set(joined_at);
    join.amount.set(amount);
    data
}

#[test]
fn a_written_join_reads_back_its_side_time_amount_and_bump() {
    let data = bytes(1, 3, -42, 9_000);
    let record = record_from_bytes(&data, &campaign(), &baker(), 3).expect("a join of this baker");
    assert!(!record.yes, "side 1 is NO");
    assert_eq!(record.joined_at, -42);
    assert_eq!(record.amount, 9_000);
    assert_eq!(record.bump, 254);
    assert_eq!(data[..3], [5, 1, 254], "tag 5, version 1, then the bump");
}

#[test]
fn a_join_of_another_campaign_or_baker_or_position_is_refused() {
    let data = bytes(0, 0, 10, 1);
    let other = Address::new_from_array([9; 32]);
    assert_eq!(
        record_from_bytes(&data, &other, &baker(), 0).map_err(|_| BrotError::JoinAccountsMismatch),
        Err(BrotError::JoinAccountsMismatch)
    );
    assert_eq!(
        record_from_bytes(&data, &campaign(), &other, 0)
            .map_err(|_| BrotError::JoinAccountsMismatch),
        Err(BrotError::JoinAccountsMismatch)
    );
    assert_eq!(
        record_from_bytes(&data, &campaign(), &baker(), 1)
            .map_err(|_| BrotError::JoinAccountsMismatch),
        Err(BrotError::JoinAccountsMismatch)
    );
}

#[test]
fn a_wrong_tag_a_wrong_version_or_a_short_account_is_refused() {
    let mut wrong_tag = bytes(0, 0, 10, 1);
    wrong_tag[0] = 3;
    assert!(record_from_bytes(&wrong_tag, &campaign(), &baker(), 0).is_err());
    let mut wrong_version = bytes(0, 0, 10, 1);
    wrong_version[1] = 2;
    assert!(record_from_bytes(&wrong_version, &campaign(), &baker(), 0).is_err());
    let short = bytes(0, 0, 10, 1);
    assert!(record_from_bytes(&short[..95], &campaign(), &baker(), 0).is_err());
}

#[test]
fn the_split_of_joins_read_from_bytes_agrees_with_split_late() {
    // Three joins read back from their bytes: before, at and after the proof's publish time 100.
    let accounts = [
        bytes(0, 0, 99, 10),
        bytes(1, 1, 100, 20),
        bytes(0, 2, 150, 40),
    ];
    let mut split = Split::default();
    let mut joins = Vec::new();
    for (index, data) in accounts.iter().enumerate() {
        let index = u32::try_from(index).expect("three joins");
        let record = record_from_bytes(data, &campaign(), &baker(), index).expect("in order");
        let join = RefundJoin {
            joined_at: record.joined_at,
            amount: record.amount,
        };
        split.add(record.yes, join, 100).expect("small sums");
        joins.push(join);
    }
    assert_eq!(split_late(&joins, 100), Ok((10, 60)));
    assert_eq!(split.early(), Ok(10));
    assert_eq!(split.late(), Ok(60));
    assert_eq!(split.early_yes, 10);
    assert_eq!(split.late_no, 20);
    assert_eq!(split.late_yes, 40);
    assert_eq!(split.total(), Ok(70));
}

#[test]
fn a_side_split_keeps_each_side_apart_and_checks_its_sum() {
    let mut split = Split::default();
    split
        .add(
            true,
            RefundJoin {
                joined_at: 1,
                amount: 5,
            },
            10,
        )
        .expect("early yes");
    split
        .add(
            false,
            RefundJoin {
                joined_at: 1,
                amount: 7,
            },
            10,
        )
        .expect("early no");
    split
        .add(
            true,
            RefundJoin {
                joined_at: 10,
                amount: 11,
            },
            10,
        )
        .expect("late yes");
    assert_eq!(
        (
            split.early_yes,
            split.early_no,
            split.late_yes,
            split.late_no
        ),
        (5, 7, 11, 0)
    );
    let mut full = Split {
        early_yes: u64::MAX,
        ..Split::default()
    };
    assert_eq!(
        full.add(
            true,
            RefundJoin {
                joined_at: 1,
                amount: 1
            },
            10
        ),
        Err(BrotError::MathOverflow)
    );
    full.early_yes = 0;
    full.late_no = u64::MAX;
    assert_eq!(full.total(), Ok(u64::MAX));
    assert_eq!(
        full.add(
            false,
            RefundJoin {
                joined_at: 99,
                amount: 1
            },
            10
        ),
        Err(BrotError::MathOverflow)
    );
}
