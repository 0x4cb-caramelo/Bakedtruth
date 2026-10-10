//! Purpose: the late-entry refund (TP section 3.4.16; founder answer 7, 2026-10-09): the part of a
//!          baker's joins made at or after the YES proof's `publish_time` comes back whole. Pure; the
//!          campaign's snapshot and `settle_entry` both call it.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze; lane G reads the joins and adds `Split`, which keeps the sides apart)
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

/// A baker's joins split by side and by time: `early_*` before the proof's `publish_time`, `late_*`
/// at or after it. The payout needs the early amount of the winning side and the refund needs the
/// late amount of both sides, which `split_late` cannot tell apart. Built one join at a time, so no
/// slice of joins is needed on chain.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Split {
    pub early_yes: u64,
    pub early_no: u64,
    pub late_yes: u64,
    pub late_no: u64,
}

impl Split {
    /// Adds one join of one side (`yes` for YES) at `publish_time`. Checked math.
    pub fn add(&mut self, yes: bool, join: Join, publish_time: i64) -> Result<(), BrotError> {
        let late = join.joined_at >= publish_time;
        let slot = match (yes, late) {
            (true, false) => &mut self.early_yes,
            (false, false) => &mut self.early_no,
            (true, true) => &mut self.late_yes,
            (false, true) => &mut self.late_no,
        };
        *slot = slot
            .checked_add(join.amount)
            .ok_or(BrotError::MathOverflow)?;
        Ok(())
    }

    /// The early amounts of both sides: what `split_late` returns as its first value.
    pub fn early(&self) -> Result<u64, BrotError> {
        self.early_yes
            .checked_add(self.early_no)
            .ok_or(BrotError::MathOverflow)
    }

    /// The late amounts of both sides: what `split_late` returns as its second value.
    pub fn late(&self) -> Result<u64, BrotError> {
        self.late_yes
            .checked_add(self.late_no)
            .ok_or(BrotError::MathOverflow)
    }

    /// Every lamport the baker's joins added.
    pub fn total(&self) -> Result<u64, BrotError> {
        self.early()?
            .checked_add(self.late()?)
            .ok_or(BrotError::MathOverflow)
    }
}
