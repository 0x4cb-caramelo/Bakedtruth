//! Purpose: the instructions that decide a campaign's outcome: `resolve_campaign` (Sprint 03), and
//!          the team's acts inside the review window: confirming, voiding and contesting (Sprint 04).
//! Version: 0.0.4
//! Sprint: 04 (lane A adds the window rules and the helpers the team instructions share)

pub mod resolve_campaign;
pub mod team_confirm_result;
pub mod team_open_contest;
pub mod team_shared;
pub mod team_void_campaign;
pub mod void_reason;
pub mod window;
