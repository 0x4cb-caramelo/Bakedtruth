//! Purpose: Brot's fee on the losing side and the one-sided fee per entry (P1 sections 3.3 and
//!          3.5; TP section 3.4.16). Both round up.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio): the parts the join's `min_return_bps` estimate needs;
//!         Sprint 04 completes the file for settlement.

use crate::error::BrotError;

/// `ceil(losing_total × fee_bps ÷ 10,000)`.
pub fn house_fee(losing_total: u64, fee_bps: u16) -> Result<u64, BrotError> {
    let _ = (losing_total, fee_bps);
    todo!("Sprint 02 lane C")
}

/// `ceil(entry × one_sided_fee_bps ÷ 10,000)`, or 0 when the entry is the first baker's (Q3).
pub fn one_sided_fee(entry: u64, one_sided_fee_bps: u16, is_first: bool) -> Result<u64, BrotError> {
    let _ = (entry, one_sided_fee_bps, is_first);
    todo!("Sprint 02 lane C")
}
