//! Purpose: the tally of one join (`tally_late_joins`): reads the join at its index, returns the rent to the
//!          baker and closes the account, and reports which side it was on and whether it was late.
//! Version: 0.0.2
//! Sprint: 04 (contract amendment 2026-10-09), lane G
//!
//! Decision (founder to read): a join is late only on a YES price campaign. The late refund is defined
//! against a YES proof's publish time, so a NO outcome, a void, or a non-price kind has no late joins: every
//! lamport of their joins is early (`LateRule::is_late`).
//!
//! The campaign and entry totals are the caller's (`settlement/tally_late_joins.rs`). The rent comes back
//! first, because `checks::close_account` refuses an account that still holds lamports.

use pinocchio::{error::ProgramError, AccountView, Address};

use super::join_record::read_join;
use crate::{
    checks,
    error::BrotError,
    state::enums::{Outcome, ReaderKind},
};

/// When a join counts as late: only on a campaign whose outcome is YES and whose kind is the price kind,
/// at or after the YES proof's publish time (inclusive).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct LateRule {
    /// True only for a YES outcome on the price kind.
    pub yes_price: bool,
    pub publish_time: i64,
}

impl LateRule {
    /// The rule for a campaign's stored outcome and kind bytes.
    pub fn of(outcome: u8, kind: u8, publish_time: i64) -> Self {
        let yes_price = outcome == Outcome::Yes as u8 && kind == ReaderKind::PriceTouch as u8;
        Self {
            yes_price,
            publish_time,
        }
    }

    /// True when a join at `joined_at` is late under this rule.
    pub fn is_late(&self, joined_at: i64) -> bool {
        self.yes_price && joined_at >= self.publish_time
    }
}

/// What tallying one join adds: its side, whether it is late (joined at or after the proof's publish time), and
/// its amount.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Tallied {
    pub yes: bool,
    pub late: bool,
    pub amount: u64,
}

/// Reads the join at `index` (owner, bytes, campaign, baker and PDA, all checked by `read_join`), moves its
/// lamports to `baker`, and closes it.
pub fn tally_join(
    join: &mut AccountView,
    baker: &mut AccountView,
    campaign: &Address,
    baker_key: &Address,
    index: u32,
    rule: LateRule,
    program_id: &Address,
) -> Result<Tallied, ProgramError> {
    let record = read_join(join, campaign, baker_key, index, program_id)?;
    let rent = join.lamports();
    let credited = baker
        .lamports()
        .checked_add(rent)
        .ok_or(BrotError::MathOverflow)?;
    baker.set_lamports(credited);
    join.set_lamports(0);
    checks::close_account(join, program_id)?;
    Ok(Tallied {
        yes: record.yes,
        late: rule.is_late(record.joined_at),
        amount: record.amount,
    })
}
