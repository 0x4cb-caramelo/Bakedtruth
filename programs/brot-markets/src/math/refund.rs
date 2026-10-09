//! Purpose: the late-entry refund (TP section 3.4.16; founder answer 7, 2026-10-09): the part of a
//!          baker's joins made at or after the YES proof's `publish_time` comes back whole. Pure; the
//!          campaign's snapshot and `settle_entry` both call it.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze, lane G records the joins it reads)
//!
//! How an `Entry` keeps its joins is a storage decision, recorded in the session log (the refund
//! needs each join's time, and the `Entry` has 16 reserved bytes). The rule is fixed here.

use crate::error::BrotError;

/// One join of a baker on one side: when it landed (Unix seconds) and how many lamports it added.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Join {
    pub joined_at: i64,
    pub amount: u64,
}

/// `(early, late)`: the amounts joined before `publish_time`, and at or after it. The two add up to
/// the total of `joins` (`MathOverflow` otherwise), so no lamport is lost or counted twice.
pub fn split_late(joins: &[Join], publish_time: i64) -> Result<(u64, u64), BrotError> {
    let mut early: u64 = 0;
    let mut late: u64 = 0;
    for join in joins {
        let slot = if join.joined_at >= publish_time {
            &mut late
        } else {
            &mut early
        };
        *slot = slot
            .checked_add(join.amount)
            .ok_or(BrotError::MathOverflow)?;
    }
    Ok((early, late))
}
