//! Purpose: entries: a baker joins a campaign with SOL (TP section 3.4.3) until the outcome is
//!          knowable (the join lock, BR-06), and each join leaves a `Join` record that the refund
//!          reads (question 7); a sponsor's sealed entry (Sprint 15).
//! Version: 0.0.7
//! Sprint: 02 (pot core on Pinocchio); the join lock in 03; the join record, buffer and refund reads in 04;
//!         `sponsor_join_campaign` (scaffold of Sprints 14–15, 2026-10-13); 15 (lane L15): the join's
//!         slots and core, shared by both joins

pub mod entry_account;
pub mod join_campaign;
mod join_core;
mod join_lock;
pub mod join_record;
pub mod join_rules;
mod join_slots;
pub mod join_tally;
pub mod sealed_charge;
pub mod sealed_fee_account;
pub mod sponsor_join_campaign;
