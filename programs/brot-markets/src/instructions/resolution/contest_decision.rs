//! Purpose: what the admin's decision at stage 2 of a contest may record (TP section 3.4.7; BP v0.0.4 part 1 section
//!          4.5): `Confirm` keeps the stored result and carries no void reason; `Void` records `Void` with a reason a
//!          team key may choose (`void_reason.rs`). Never an inverted outcome: no decision writes YES or NO.
//! Version: 0.0.1
//! Sprint: 14 (lane L14B, the two-stage dispute)
//!
//! Pure functions, so the host tests run every stored outcome against every decision and reason ("decide contest
//! never inverts"). Each refusal follows an `// X0.9 <id>` line (`scripts/checks-mutation.mjs`).

use crate::{
    error::BrotError,
    instructions::resolution::void_reason::team_may_choose,
    state::enums::{ContestDecision, Outcome, VoidReason},
};

/// The reason fits the decision: a `Confirm` names none (`ConfirmWithVoidReason`), so an admin cannot believe a
/// confirm refunds the opening fee; a `Void` names one a team key may choose (`VoidReasonNotForTeam`).
pub fn require_reason_fits(decision: ContestDecision, reason: VoidReason) -> Result<(), BrotError> {
    match decision {
        ContestDecision::Confirm => {
            // X0.9 decide_confirm_reason
            if reason != VoidReason::None {
                return Err(BrotError::ConfirmWithVoidReason);
            }
        }
        ContestDecision::Void => {
            // X0.9 decide_void_reason
            team_may_choose(reason)?;
        }
    }
    Ok(())
}

/// The outcome the decision records, given the stored one: `Confirm` keeps it (YES, NO, or an automatic void),
/// `Void` records `Void`. A campaign with no stored result has nothing to confirm or void
/// (`SnapshotInconsistent`; a contest opens only on a resolved campaign, so no instruction reaches it).
pub fn decided_outcome(stored: Outcome, decision: ContestDecision) -> Result<Outcome, BrotError> {
    match (stored, decision) {
        (Outcome::Unresolved, _) => Err(BrotError::SnapshotInconsistent),
        (kept, ContestDecision::Confirm) => Ok(kept),
        (_, ContestDecision::Void) => Ok(Outcome::Void),
    }
}
