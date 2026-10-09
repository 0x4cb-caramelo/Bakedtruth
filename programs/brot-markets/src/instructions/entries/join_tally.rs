//! Purpose: the tally of one join (`tally_late_joins`): reads the join at its index, returns the rent to the
//!          baker and closes the account, and reports which side it was on and whether it was late.
//! Version: 0.0.1
//! Sprint: 04 (contract amendment 2026-10-09), lane G
//!
//! The campaign and entry totals are the caller's (`settlement/tally_late_joins.rs`). The rent comes back
//! first, because `checks::close_account` refuses an account that still holds lamports.

use pinocchio::{error::ProgramError, AccountView, Address};

use super::join_record::read_join;
use crate::{checks, error::BrotError};

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
    publish_time: i64,
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
        late: record.joined_at >= publish_time,
        amount: record.amount,
    })
}
