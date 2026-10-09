//! Purpose: the class of each `VoidReason` (TP section 3.4.7, P-4): a house failure refunds the 10%
//!          opening fee, an outside cause keeps it; which reasons a team key may choose; and the
//!          outcome a team void may record (an automatic void is confirmed, never inverted).
//! Version: 0.0.1
//! Sprint: 04 (lane A)

use crate::{
    error::BrotError,
    state::enums::{Outcome, VoidReason},
};

/// A house failure: the opening fee goes back to whoever opened (`MissedWindow`, `TeamHouseFailure`).
pub fn is_house_failure(reason: VoidReason) -> bool {
    matches!(
        reason,
        VoidReason::MissedWindow | VoidReason::TeamHouseFailure
    )
}

/// The reasons a team key may choose (`VoidReasonNotForTeam` otherwise). `None` is not a void, and
/// `UnreadableAccount` is the reader's own finding about an account, which no person records.
/// `StaleFeed` and `MissedWindow` are the manual voids Sprint 03 left to the team.
pub fn team_may_choose(reason: VoidReason) -> Result<(), BrotError> {
    match reason {
        VoidReason::MissedWindow
        | VoidReason::StaleFeed
        | VoidReason::TeamHouseFailure
        | VoidReason::TeamOutsideCause => Ok(()),
        VoidReason::None | VoidReason::UnreadableAccount => Err(BrotError::VoidReasonNotForTeam),
    }
}

/// The outcome a team void records, given the stored one: `Void` for a YES or NO result, and
/// `AutomaticVoidNotInvertible` for a campaign that `resolve_campaign` already voided. A team key
/// confirms an automatic void (`team_confirm_result`) and changes nothing else about it.
pub fn team_void_outcome(stored: Outcome) -> Result<Outcome, BrotError> {
    match stored {
        Outcome::Yes | Outcome::No => Ok(Outcome::Void),
        Outcome::Void => Err(BrotError::AutomaticVoidNotInvertible),
        Outcome::Unresolved => Err(BrotError::TeamKeyOutsideReview),
    }
}
