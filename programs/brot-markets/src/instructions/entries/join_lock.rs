//! Purpose: the join lock (BR-06): a join is refused once the campaign's reader says the outcome
//!          is knowable (`OutcomeKnowable`), and with the reader's own error when it cannot read
//!          the campaign's metric account as its kind requires.
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane E
//!
//! What each reader answers is its own (`readers/`, TP section 3.4.8). The price kind reads the
//! sponsored account, Full, of the campaign's feed, with the exponent stored at opening
//! (`PriceExponentChanged`), at most `max_age` old, at most 60 s ahead of the clock and posted
//! within the slot bound (`JoinPriceStale`), and knows the outcome once price ± confidence
//! reaches the target in the campaign's direction. `SupplyAtMost` knows it once the supply is at
//! or below the target, `DammV2LockedAtLeast` once the locked liquidity reaches the target, and
//! the two epoch kinds once the measured epoch has started. A join never offers a YES proof.

use pinocchio::{AccountView, ProgramResult};

use crate::{
    error::BrotError,
    readers::{self, ChainTime, ReadContext},
    state::{campaign::Campaign, enums::ReaderKind},
};

/// Refuses the join unless the outcome is still open. `metric` is the campaign's
/// `metric_account`, whose address the caller has already compared; `time` is the clock the
/// caller read for the entry close, so one read serves both.
pub(super) fn require_outcome_open(
    metric: &AccountView,
    campaign: &Campaign,
    time: ChainTime,
) -> ProgramResult {
    let kind = ReaderKind::try_from(campaign.kind)?;
    let ctx = ReadContext {
        metric,
        campaign,
        time,
        proof: None,
    };
    if readers::outcome_knowable(kind, &ctx)? {
        return Err(BrotError::OutcomeKnowable.into());
    }
    Ok(())
}
