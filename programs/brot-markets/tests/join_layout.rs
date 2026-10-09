//! Purpose: the layout of the per-join account and the fields the join and the refund read from
//!          `Entry` and `Campaign` (founder decision, 2026-10-09: one `Join` per join, no cap).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze)

use brot_markets::layout::ZeroCopy;
use brot_markets::state::{campaign::Campaign, entry::Entry, join::Join, AccountTag};

#[test]
fn the_join_account_is_96_bytes_and_tagged_five() {
    assert_eq!(Join::LEN, 96);
    assert_eq!(Join::TAG as u8, 5);
    assert_eq!(
        AccountTag::Join as u8,
        5,
        "tag 4 stays reserved for ReferralLink"
    );
}

#[test]
fn the_entry_keeps_its_size_and_counts_its_joins_in_the_reserve() {
    assert_eq!(Entry::LEN, 100);
    assert_eq!(core::mem::offset_of!(Entry, join_count), 84);
}

#[test]
fn the_campaign_keeps_its_size_and_carries_its_minimum_entry() {
    assert_eq!(Campaign::LEN, 512);
    assert_eq!(core::mem::offset_of!(Campaign, min_entry_lamports), 456);
}
