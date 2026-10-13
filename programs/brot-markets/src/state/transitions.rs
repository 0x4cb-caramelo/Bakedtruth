//! Purpose: the transition table of TP section 3.4.2 as one function. Every instruction that moves a
//!          campaign's status calls `transition` first, so a transition outside the table is refused
//!          with `IllegalTransition`, and the table lives in one place.
//! Version: 0.0.3 (comments only: the stage-2 edge's two users, after the founder's answer to D2)
//! Sprint: 04 (contract freeze); 14 (the lead's addendum, 2026-10-13: a contested campaign with no
//!         entry leaves `Contested` straight to `Settled`, as an `InReview` one does)
//!
//! Sprint 14's exits from `Contested` (a same re-read, the admin's decision, the stage-2 lapse) all
//! end in the finalize snapshot, which goes to `Settled` when no entry is open.

use crate::{error::BrotError, state::enums::Status};

/// `Ok` for the edges of TP section 3.4.2, `IllegalTransition` for every other pair.
pub fn transition(from: Status, to: Status) -> Result<(), BrotError> {
    match (from, to) {
        // resolve_campaign (Sprint 03)
        (Status::Open, Status::InReview)
        // team_confirm_result, finalize_campaign, team_void_campaign; team_open_contest enters Contested
        | (Status::InReview, Status::Settling)
        | (Status::InReview, Status::Contested)
        // reread_campaign (a same reading, after stage 1's 24 hours), admin_decide_contest and the lapse
        // (finalize_campaign) to Settling; Contested to Contested is stage 1 to stage 2: a different re-read,
        // or a team key's escalation (team_open_contest on a contest at stage 1, D2 of 2026-10-13)
        | (Status::Contested, Status::Settling)
        | (Status::Contested, Status::Contested)
        // finalize_snapshot with no entry at all: nothing will ever be settled (used only there, with
        // entries_open == 0), from the window or from a contest; without the second edge a contested
        // campaign with no entry could never leave Contested, its prize and opening fee frozen
        | (Status::InReview, Status::Settled)
        | (Status::Contested, Status::Settled)
        // settle_entry, the last one
        | (Status::Settling, Status::Settled) => Ok(()),
        _ => Err(BrotError::IllegalTransition),
    }
}
