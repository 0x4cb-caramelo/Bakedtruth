//! Purpose: entries: a baker joins a campaign with SOL (TP section 3.4.3) until the outcome is
//!          knowable (the join lock, BR-06), and each join leaves a `Join` record that the refund
//!          reads (question 7).
//! Version: 0.0.4
//! Sprint: 02 (pot core on Pinocchio); the join lock in 03; the join record, buffer and refund reads in 04

pub mod entry_account;
pub mod join_campaign;
mod join_lock;
pub mod join_record;
pub mod join_rules;
