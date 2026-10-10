//! Purpose: the instructions that settle a campaign after its outcome: the snapshot, the payouts to
//!          people and Brot's fee, the prize, the close and the sweep (TP section 3.4.3).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze: stubs; bodies by lanes C and D)

pub mod bookkeeping;
pub mod close_campaign;
pub mod collect_fee;
pub mod finalize_campaign;
pub mod rules;
pub mod settle_creator_share;
pub mod settle_entry;
pub mod settle_prize;
pub mod snapshot;
pub mod sweep_fees;
pub mod tally_late_joins;
