//! Purpose: what the fact readers share, on its own: `fact_resolution`'s table (TP section 3.4.6),
//!          `min_distance` (row 3, C45) and `after_deadline`, with the deadline's own second and
//!          the overflow edges.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution), lane A

mod opening_support;
mod readers_support;

use brot_markets::{
    error::BrotError::*,
    layout::ZeroCopy,
    readers::{
        after_deadline, fact_resolution, min_distance, Decision,
        Resolution::{self, Decided, NotYet},
    },
    state::{campaign::Campaign, enums::VoidReason},
};
use opening_support::{err, HostAccount, NOW};
use pinocchio::{error::ProgramError, Address};
use readers_support::*;

/// Any account: the table reads only its address, for the reading.
const METRIC: Address = Address::new_from_array([7; 32]);
/// `(i128::MAX − 9,999) / 100`: one more and `|value| × 100 + 9,999` passes `i128::MAX`.
const EDGE: i128 = (i128::MAX - 9_999) / 100;

/// `fact_resolution` with the reader's `read`, met when the value is at least 10, the clock at
/// `now` and the deadline at `DEADLINE`.
fn table(read: Res<i128>, now: i64) -> Res<Resolution> {
    let account = &mut HostAccount::new(METRIC, brot_markets::ID, &[]);
    with_campaign(account, 0, now, |c| fact_resolution(read, |v| v >= 10, c))
}

/// `after_deadline` for a campaign whose deadline is `deadline`, the clock at `now`.
fn past(deadline: i64, now: i64) -> bool {
    let mut bytes = [0u8; 512];
    let campaign = Campaign::from_bytes_mut(&mut bytes).unwrap();
    campaign.deadline_at.set(deadline);
    after_deadline(campaign, &at(now))
}

#[test]
fn the_resolution_table_of_the_irreversible_facts() {
    let yes = |value| Ok(Decided(Decision::yes(reading(METRIC, value))));
    let no = |value, late| Ok(Decided(Decision::no(reading(METRIC, value), late)));
    let unreadable = Decision::void(VoidReason::UnreadableAccount, reading(METRIC, 0));
    let (void, refusal) = (Ok(Decided(unreadable)), refused(ReaderBadLayout));
    let bad = || Err(err(ReaderBadLayout));
    let (min, max) = (i128::MIN, i128::MAX);
    let rows: [(Res<i128>, i64, Res<Resolution>); 13] = [
        // Met up to the deadline's own second: YES.
        (Ok(10), i64::MIN, yes(10)),
        (Ok(11), NOW, yes(11)),
        (Ok(10), DEADLINE, yes(10)),
        // Not met up to then: not yet.
        (Ok(9), NOW, Ok(NotYet)),
        (Ok(9), DEADLINE, Ok(NotYet)),
        // After it: NO, flagged `met_late` when met.
        (Ok(10), AFTER, no(10, true)),
        (Ok(max), i64::MAX, no(max, true)),
        (Ok(9), AFTER, no(9, false)),
        (Ok(min), AFTER, no(min, false)),
        // Unreadable: the reader's error up to the deadline, then void.
        (bad(), NOW, refusal.clone()),
        (bad(), DEADLINE, refusal),
        (bad(), AFTER, void.clone()),
        (bad(), i64::MAX, void),
    ];
    for (read, now, expected) in rows {
        let label = format!("{read:?} at {now}");
        assert_eq!(table(read, now), expected, "{label}");
    }
}

#[test]
fn a_reader_error_passes_through_unchanged_until_the_deadline() {
    let errors = [
        err(ReaderWrongOwner),
        err(MathOverflow),
        ProgramError::AccountBorrowFailed,
    ];
    let void = Decision::void(VoidReason::UnreadableAccount, reading(METRIC, 0));
    for error in errors {
        let before = table(Err(error.clone()), DEADLINE);
        assert_eq!(before, Err(error.clone()), "{error:?}");
        assert_eq!(table(Err(error), AFTER), Ok(Decided(void)));
    }
}

#[test]
fn met_late_is_set_only_after_the_deadline_and_only_when_met() {
    for (read, now) in [(10, NOW), (9, NOW), (10, DEADLINE), (9, AFTER), (10, AFTER)] {
        let flagged = match table(Ok(read), now) {
            Ok(Decided(decision)) => decision.met_late,
            Ok(NotYet) => false,
            Err(error) => panic!("{error:?}"),
        };
        assert_eq!(flagged, read >= 10 && now > DEADLINE, "{read} at {now}");
    }
}

#[test]
fn the_deadline_is_past_only_after_its_own_second() {
    let rows = [
        (DEADLINE, NOW, false),
        (DEADLINE, DEADLINE, false),
        (DEADLINE, AFTER, true),
        (i64::MAX, i64::MAX, false),
        (i64::MIN, i64::MIN, false),
        (i64::MIN, i64::MAX, true),
        (i64::MAX, i64::MIN, false),
        (0, -1, false),
    ];
    for (deadline, now, expected) in rows {
        assert_eq!(past(deadline, now), expected, "{deadline}, {now}");
    }
}

#[test]
fn min_distance_is_the_bps_of_the_value_rounded_up_and_at_least_one_unit() {
    let rows: [(i128, u16, i128); 15] = [
        (0, 100, 1),
        (1, 100, 1),
        (100, 100, 1),
        (101, 100, 2),
        (10_000, 100, 100),
        (10_001, 100, 101),
        (1_000_000, 100, 10_000),
        (1_000_001, 100, 10_001),
        // The distance is from the value's size: a negative value measures the same.
        (-10_001, 100, 101),
        (-1, 100, 1),
        // No bps still means one unit, and 10,000 bps is the whole value.
        (0, 0, 1),
        (i128::MAX, 0, 1),
        (12_345, 10_000, 12_345),
        (10_000, u16::MAX, 65_535),
        (i128::from(u64::MAX), 100, 184_467_440_737_095_517),
    ];
    for (value, bps, expected) in rows {
        assert_eq!(min_distance(value, bps), Ok(expected), "{value}, {bps}");
    }
    // The largest value 100 bps measures.
    let edge = Ok(17_014_118_346_046_923_173_168_730_371_588_410);
    assert_eq!(min_distance(EDGE, 100), edge);
}

#[test]
fn min_distance_overflows_into_an_error_never_a_panic() {
    let rows: [(i128, u16); 5] = [
        (i128::MIN, 0),
        (i128::MIN, 100),
        (i128::MAX, 1),
        (add(EDGE, 1), 100),
        (i128::MAX, u16::MAX),
    ];
    for (value, bps) in rows {
        assert_eq!(min_distance(value, bps), refused(MathOverflow), "{value}");
    }
}
