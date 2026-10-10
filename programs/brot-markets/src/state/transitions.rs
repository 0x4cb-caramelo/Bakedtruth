//! Purpose: the transition table of TP section 3.4.2 as one function. Every instruction that moves a
//!          campaign's status calls `transition` first, so a transition outside the table is refused
//!          with `IllegalTransition`, and the table lives in one place.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze)
//!
//! Sprint 14's exits from `Contested` are in the table because the table is the design; their
//! instructions stay disabled until then (founder, 2026-10-09), so no campaign leaves `Contested`.

use crate::{error::BrotError, state::enums::Status};

/// `Ok` for the edges of TP section 3.4.2, `IllegalTransition` for every other pair.
pub fn transition(from: Status, to: Status) -> Result<(), BrotError> {
    match (from, to) {
        // resolve_campaign (Sprint 03)
        (Status::Open, Status::InReview)
        // team_confirm_result, finalize_campaign, team_void_campaign; team_open_contest enters Contested
        | (Status::InReview, Status::Settling)
        | (Status::InReview, Status::Contested)
        // reread_campaign and admin_decide_contest (Sprint 14; disabled until then)
        | (Status::Contested, Status::Settling)
        | (Status::Contested, Status::Contested)
        // finalize_snapshot with no entry at all: nothing will ever be settled (used only there, with
        // entries_open == 0)
        | (Status::InReview, Status::Settled)
        // settle_entry, the last one
        | (Status::Settling, Status::Settled) => Ok(()),
        _ => Err(BrotError::IllegalTransition),
    }
}
