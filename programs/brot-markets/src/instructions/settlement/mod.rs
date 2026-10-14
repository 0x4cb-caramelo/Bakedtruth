//! Purpose: the instructions that settle a campaign after its outcome: the snapshot, the payouts to
//!          people and Brot's fee, the prize, the close and the sweep (TP section 3.4.3); a sponsor's
//!          held fee (Sprint 15).
//! Version: 0.0.3
//! Sprint: 04 (contract freeze: stubs; bodies by lanes C and D); `settle_sealed_fee` (scaffold of
//!         Sprints 14–15, 2026-10-13); `payout_cap` (Sprint 16, the pre-freeze review's F4)

pub mod bookkeeping;
pub mod close_campaign;
pub mod collect_fee;
pub mod finalize_campaign;
pub mod payout_cap;
pub mod rules;
pub mod settle_creator_share;
pub mod settle_entry;
pub mod settle_prize;
pub mod settle_sealed_fee;
pub mod snapshot;
pub mod sweep_fees;
pub mod tally_late_joins;
