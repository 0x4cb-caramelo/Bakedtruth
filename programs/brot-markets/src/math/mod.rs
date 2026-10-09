//! Purpose: the money and schedule math as pure functions: the opening conversion, the entry
//!          close, the fee and the creator share (TP section 3.4.16).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); signatures frozen at the sprint's opening, bodies by lane C
//!
//! Amounts are u64 lamports; intermediate products are u128 with checked math. Fees round up,
//! payouts and the share round down, and the opening rounds toward Brot. Every error is
//! `BrotError::MathOverflow` unless a function documents another. Each function will also
//! generate the vectors the SDK's TypeScript mirror must match (X0.3, Sprints 04 and 05).
//! `rounding` holds the multiply-divide every formula shares, so each direction is written once.

pub mod fees;
pub mod invariant;
pub mod opening;
pub mod payout;
pub mod refund;
pub mod rounding;
pub mod schedule;
