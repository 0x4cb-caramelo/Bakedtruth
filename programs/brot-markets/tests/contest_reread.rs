//! Purpose: the re-read's comparison and acts on the host (Sprint 14, lane L14B): "the same reading" is the stored
//!          outcome, void reason, `met_late` and observed value exactly, and a reader that refuses is a different
//!          reading; `reread_act`, the one place a comparison becomes an act (D2, open), pays the same reading and
//!          escalates any difference; stage 2 opens for 48 hours from the re-read, or from stage 1's deadline when the
//!          re-read is late (review fix F3), without touching the result.
//! Version: 0.0.2
//! Sprint: 14 (lane L14B)

use brot_markets::{
    constants::CONTEST_STAGE2_SECONDS,
    error::BrotError::MathOverflow,
    instructions::resolution::contest_reread::{
        open_stage2, reread_act, reread_event, same_reading, RereadAct, StoredResult,
    },
    layout::{LeI128, LeI64, LeU64, ZeroCopy},
    readers::{Decision, Reading},
    state::{
        campaign::Campaign,
        enums::{ContestStage, Outcome, Status, VoidReason},
    },
};
use pinocchio::Address;

const NOW: i64 = 1_791_216_180;
const OBSERVED: i128 = 2_000_000;

fn reading(observed: i128, publish_time: i64) -> Reading {
    Reading {
        observed,
        account: Address::new_from_array([3; 32]),
        publish_time,
        posted_slot: 7,
    }
}

/// A NO recorded with `OBSERVED`, not met late.
fn stored_no() -> StoredResult {
    StoredResult {
        outcome: Outcome::No as u8,
        void_reason: VoidReason::None as u8,
        met_late: 0,
        observed_value: OBSERVED,
    }
}

/// A campaign contested at stage 1, `event_seq` 5, holding the stored NO.
fn contested() -> Vec<u8> {
    let mut bytes = vec![0u8; Campaign::LEN];
    let c = Campaign::from_bytes_mut(&mut bytes).unwrap();
    (c.status, c.contest_stage) = (Status::Contested as u8, ContestStage::Stage1 as u8);
    (c.outcome, c.observed_value) = (Outcome::No as u8, LeI128::new(OBSERVED));
    (c.event_seq, c.contest_ends_at) = (LeU64::new(5), LeI64::new(NOW));
    bytes
}

#[test]
fn contest_reread_same_reading_is_the_stored_result_exactly() {
    let stored = stored_no();
    let same = Decision::no(reading(OBSERVED, 0), false);
    assert!(same_reading(&stored, Some(&same)));
    // The publish time and the account read are evidence, not the result.
    assert!(same_reading(
        &stored,
        Some(&Decision::no(reading(OBSERVED, 99), false))
    ));
    let bytes = contested();
    assert_eq!(
        StoredResult::of(Campaign::from_bytes(&bytes).unwrap()),
        stored
    );
}

#[test]
fn contest_reread_any_field_that_differs_is_a_different_reading() {
    let stored = stored_no();
    let moved = Decision::no(reading(OBSERVED - 1, 0), false);
    let late = Decision::no(reading(OBSERVED, 0), true);
    let yes = Decision::yes(reading(OBSERVED, 0));
    let void = Decision::void(VoidReason::UnreadableAccount, reading(OBSERVED, 0));
    for different in [moved, late, yes, void] {
        assert!(!same_reading(&stored, Some(&different)), "{different:?}");
    }
    // A reader that refuses, or cannot decide now, read nothing the same.
    assert!(!same_reading(&stored, None));
    // A stored void re-read as the same void, nothing observed.
    let unreadable = StoredResult {
        outcome: Outcome::Void as u8,
        void_reason: VoidReason::UnreadableAccount as u8,
        met_late: 0,
        observed_value: 0,
    };
    let again = Decision::void(VoidReason::UnreadableAccount, reading(0, 0));
    assert!(same_reading(&unreadable, Some(&again)));
    let other = Decision::void(VoidReason::MissedWindow, reading(0, 0));
    assert!(!same_reading(&unreadable, Some(&other)));
}

#[test]
fn contest_reread_act_pays_the_same_reading_and_escalates_a_different_one() {
    // The D2 hook (open with the founder): today the same reading pays at once.
    assert_eq!(reread_act(true), RereadAct::Pay);
    assert_eq!(reread_act(false), RereadAct::Escalate);
}

#[test]
fn contest_reread_stage_two_opens_for_48_hours_and_keeps_the_result() {
    let mut bytes = contested();
    let before = bytes.clone();
    let c = Campaign::from_bytes_mut(&mut bytes).unwrap();
    assert_eq!(open_stage2(c, NOW), Ok(5));
    assert_eq!(c.contest_stage, ContestStage::Stage2 as u8);
    assert_eq!(
        c.contest_ends_at.get(),
        NOW.checked_add(CONTEST_STAGE2_SECONDS).unwrap()
    );
    assert_eq!(c.event_seq.get(), 6);
    assert_eq!(
        (c.status, c.outcome),
        (Status::Contested as u8, Outcome::No as u8)
    );
    // Only the stage, its deadline and the event number moved.
    let changed: Vec<usize> = (0..bytes.len())
        .filter(|&i| bytes[i] != before[i])
        .collect();
    assert!(
        changed
            .iter()
            .all(|&i| MAY_CHANGE.iter().any(|r| r.contains(&i))),
        "{changed:?}"
    );
}

const STAGE_AT: usize = core::mem::offset_of!(Campaign, contest_stage);
const ENDS_AT: usize = core::mem::offset_of!(Campaign, contest_ends_at);
const SEQ_AT: usize = core::mem::offset_of!(Campaign, event_seq);
/// The bytes stage 2's opening may write: the stage, its deadline (i64) and the event number (u64).
const MAY_CHANGE: [core::ops::Range<usize>; 3] = [
    STAGE_AT..STAGE_AT + 1,
    ENDS_AT..ENDS_AT + 8,
    SEQ_AT..SEQ_AT + 8,
];

#[test]
fn contest_reread_stage_two_deadline_overflow_writes_nothing() {
    let mut bytes = contested();
    Campaign::from_bytes_mut(&mut bytes)
        .unwrap()
        .contest_ends_at = LeI64::new(i64::MAX);
    let before = bytes.clone();
    let c = Campaign::from_bytes_mut(&mut bytes).unwrap();
    assert_eq!(open_stage2(c, i64::MAX), Err(MathOverflow));
    assert_eq!(bytes, before);
}

#[test]
fn contest_reread_late_starts_stage_two_from_stage_one_deadline() {
    // Review fix F3: a re-read a week after stage 1's deadline (here `NOW`) adds nothing: stage 2 still ends 48 hours
    // after that deadline, already past, so only the lapse remains. An early re-read counts from itself.
    let mut bytes = contested();
    let c = Campaign::from_bytes_mut(&mut bytes).unwrap();
    assert_eq!(open_stage2(c, NOW + 7 * 86_400), Ok(5));
    assert_eq!(c.contest_ends_at.get(), NOW + CONTEST_STAGE2_SECONDS);
    let mut early = contested();
    let c = Campaign::from_bytes_mut(&mut early).unwrap();
    assert_eq!(open_stage2(c, NOW - 600), Ok(5));
    assert_eq!(c.contest_ends_at.get(), NOW - 600 + CONTEST_STAGE2_SECONDS);
}

#[test]
fn contest_reread_event_reports_what_was_read_now() {
    let bytes = contested();
    let c = Campaign::from_bytes(&bytes).unwrap();
    let key = Address::new_from_array([1; 32]);
    let read = Decision::yes(reading(OBSERVED + 5, NOW - 30));
    let event = reread_event(key, c, Some(&read), false, 9);
    assert_eq!(
        (event.seq.get(), event.same, event.outcome),
        (9, 0, Outcome::Yes as u8)
    );
    assert_eq!(
        (event.observed_value.get(), event.publish_time.get()),
        (OBSERVED + 5, NOW - 30)
    );
    assert_eq!(
        (event.contest_stage, event.contest_ends_at.get()),
        (ContestStage::Stage1 as u8, NOW)
    );
    // Nothing decided: Unresolved, no reason, nothing read.
    let refused = reread_event(key, c, None, false, 9);
    assert_eq!(
        (refused.outcome, refused.void_reason, refused.met_late),
        (0, 0, 0)
    );
    assert_eq!(
        (refused.observed_value.get(), refused.publish_time.get()),
        (0, 0)
    );
}
