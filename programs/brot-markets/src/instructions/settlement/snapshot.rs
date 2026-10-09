//! Purpose: `finalize_snapshot`, the shared snapshot of a reviewed campaign: the totals, the mode,
//!          the creator share and the open count, run by `team_confirm_result` and `finalize_campaign`
//!          (TP section 3.4.3). Stub until lane C lands the body.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze; the body is lane C's)

use crate::{
    error::BrotError,
    state::{campaign::Campaign, config::GlobalConfig},
};

/// Stub: refused with `UnknownInstruction` until lane C lands the body.
pub fn finalize_snapshot(
    campaign: &mut Campaign,
    config: &mut GlobalConfig,
) -> Result<(), BrotError> {
    let _ = (campaign, config);
    Err(BrotError::UnknownInstruction)
}
