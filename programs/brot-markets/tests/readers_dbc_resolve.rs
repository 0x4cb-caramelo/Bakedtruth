//! Purpose: the graduation kind's join lock and resolution (`DbcGraduated`, TP section 3.4.6's
//!          stamped row) on the captured Meteora DBC pools and on copies whose curve completed at a
//!          chosen second: entries lock once the curve completes and not before; a curve completed
//!          by the deadline is YES however late the resolution; a later stamp, or none, is NO
//!          flagged `met_late`; a curve still open is NO; an unreadable pool voids.
//! Version: 0.0.1
//! Sprint: after 05 (the sixth kind, `DbcGraduated`)

mod dbc_support;
mod opening_support;
mod readers_support;

use brot_markets::{
    constants::SPL_TOKEN_PROGRAM_ID,
    error::BrotError::*,
    readers::{
        Decision,
        Resolution::{Decided, NotYet},
    },
    state::enums::VoidReason,
};
use dbc_support::*;
use opening_support::{HostAccount, NOW};
use readers_support::*;

/// Resolution and the join lock never read this kind's target; the tests pass 85 SOL.
const TARGET: i128 = 85_000_000_000;
/// A day and ninety days past the deadline's first second; one lamport short of 85 SOL; the first
/// stamp an i64 cannot hold.
const DAY_AFTER: i64 = AFTER + 86_400;
const MUCH_LATER: i64 = AFTER + 90 * 86_400;
const ALMOST: u64 = THRESHOLD_85 - 1;
const BEYOND_I64: u64 = 1 << 63;

/// A stamp as the pool writes it, from a Unix second.
fn stamp(second: i64) -> u64 {
    u64::try_from(second).unwrap()
}

/// What the stage-0 pool records once its curve completed with 85 SOL raised.
fn graduated(met_late: Option<bool>) -> Decision {
    let read = reading(STAGE0_AT, 85_000_000_000);
    met_late.map_or(Decision::yes(read), |late| Decision::no(read, late))
}

#[test]
fn the_join_lock_closes_once_the_curve_completes_and_not_before() {
    let pools = [(STAGE0_AT, STAGE0, false), (STAGE1_AT, STAGE1, true)];
    let pools = pools
        .into_iter()
        .chain([(STAGE2_AT, STAGE2, true), (STAGE3_AT, STAGE3, true)]);
    for (address, data, locked) in pools {
        assert_eq!(knowable(KIND, &mut dbc(address, data), TARGET), Ok(locked));
    }
    // One lamport short of the threshold, still on the curve: entries stay open (M-6).
    let almost = &mut dbc(STAGE0_AT, &pool_with(STAGE0, 0, 0, ALMOST));
    assert_eq!(knowable(KIND, almost, TARGET), Ok(false));
    for stage in 1..=3 {
        let pool = &mut graduated_at(stage, stamp(NOW));
        assert_eq!(knowable(KIND, pool, TARGET), Ok(true), "{stage}");
    }
}

#[test]
fn on_the_curve_it_waits_until_the_deadline_then_records_no() {
    let curve = || dbc(STAGE0_AT, STAGE0);
    for now in [NOW, DEADLINE] {
        assert_eq!(
            resolve(KIND, &mut curve(), TARGET, now),
            Ok(NotYet),
            "{now}"
        );
    }
    let no = Decision::no(reading(STAGE0_AT, 19_457_897), false);
    assert_eq!(resolve(KIND, &mut curve(), TARGET, AFTER), Ok(Decided(no)));
}

#[test]
fn completed_by_the_deadline_is_yes_however_late_the_resolution() {
    let yes = Ok(Decided(graduated(None)));
    for at in [NOW, DEADLINE] {
        for stage in 1..=3 {
            for now in [NOW.max(at), DEADLINE, AFTER, MUCH_LATER] {
                let pool = &mut graduated_at(stage, stamp(at));
                assert_eq!(resolve(KIND, pool, TARGET, now), yes, "{stage} {at} {now}");
            }
        }
    }
    // The captured graduated pools, stamped in 2025 and 2026: YES before and after the deadline.
    let pools = [
        (STAGE1_AT, STAGE1, STAGE1_RAISED),
        (STAGE2_AT, STAGE2, STAGE2_RAISED),
    ];
    for (address, data, raised) in pools
        .into_iter()
        .chain([(STAGE3_AT, STAGE3, STAGE3_RAISED)])
    {
        let yes = Ok(Decided(Decision::yes(reading(address, i128::from(raised)))));
        for now in [NOW, AFTER] {
            assert_eq!(resolve(KIND, &mut dbc(address, data), TARGET, now), yes);
        }
    }
}

#[test]
fn completed_after_the_deadline_or_with_no_stamp_is_no_flagged_met_late() {
    let late = Ok(Decided(graduated(Some(true))));
    for at in [stamp(AFTER), stamp(DAY_AFTER), BEYOND_I64, u64::MAX, 0] {
        let pool = &mut graduated_at(2, at);
        assert_eq!(resolve(KIND, pool, TARGET, AFTER), late, "{at}");
    }
    // Up to the deadline, a completed curve is YES whatever it stamped: it completed by now.
    for at in [0, stamp(AFTER)] {
        let pool = &mut graduated_at(1, at);
        assert_eq!(
            resolve(KIND, pool, TARGET, DEADLINE),
            Ok(Decided(graduated(None)))
        );
    }
}

#[test]
fn an_unreadable_pool_is_refused_up_to_the_deadline_and_void_after() {
    let gone = || HostAccount::new(STAGE0_AT, SPL_TOKEN_PROGRAM_ID, STAGE0);
    let cut = || dbc(STAGE0_AT, &STAGE0[..423]);
    for now in [NOW, DEADLINE] {
        assert_eq!(
            resolve(KIND, &mut gone(), TARGET, now),
            refused(ReaderWrongOwner)
        );
        assert_eq!(
            resolve(KIND, &mut cut(), TARGET, now),
            refused(ReaderBadLayout)
        );
    }
    let void = Decision::void(VoidReason::UnreadableAccount, reading(STAGE0_AT, 0));
    assert_eq!(resolve(KIND, &mut gone(), TARGET, AFTER), Ok(Decided(void)));
    assert_eq!(resolve(KIND, &mut cut(), TARGET, AFTER), Ok(Decided(void)));
}
