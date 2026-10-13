//! Purpose: the instructions that decide a campaign's outcome: `resolve_campaign` (Sprint 03), and
//!          the team's acts inside the review window: confirming, voiding and contesting (Sprint 04);
//!          the contest's re-read and the admin's decision (Sprint 14).
//! Version: 0.0.6
//! Sprint: 04 (lane A adds the window rules and the helpers the team instructions share); the
//!         scaffold of Sprints 14–15 (2026-10-13) adds `reread_campaign` and `admin_decide_contest`;
//!         Sprint 14 (lane L14B) adds the contest's rules, its re-read comparison and its decision

pub mod admin_decide_contest;
pub mod contest_decision;
pub mod contest_reread;
pub mod contest_rules;
pub mod reread_campaign;
pub mod resolve_campaign;
pub mod team_confirm_result;
pub mod team_open_contest;
pub mod team_shared;
pub mod team_void_campaign;
pub mod void_reason;
pub mod window;
