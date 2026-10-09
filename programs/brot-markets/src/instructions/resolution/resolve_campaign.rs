//! Purpose: `resolve_campaign`: any wallet records the outcome the campaign's reader reads, at
//!          the top level only, and opens the six-hour review window (TP sections 3.4.2, 3.4.6).
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution); accounts frozen at the sprint's opening, body by lane D
//!
//! Order: no arguments; `checks::top_level`; the slots; the campaign (`Open`, its locked metric
//! account); the reader's `try_resolve` (`NotYet` is `NotResolvableYet`); then `InReview`, the
//! outcome, `observed_value`, `met_late` or the void reason, `resolved_at`, `review_ends_at =
//! now + REVIEW_WINDOW_SECONDS`, and `CampaignResolved` with the next `seq`.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{error::BrotError, instructions::no_args};

pub fn resolve_campaign(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [campaign, metric_account, proof_account, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let _ = (
        program_id,
        campaign,
        metric_account,
        proof_account,
        event_authority,
        program,
    );
    Err(BrotError::ReaderNotReady.into())
}
