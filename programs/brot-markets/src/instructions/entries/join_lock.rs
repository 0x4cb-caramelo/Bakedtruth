//! Purpose: the join lock (BR-06) and the proximity buffer (question 7): a join is refused once the
//!          campaign's reader says the outcome is knowable (`OutcomeKnowable`), and with the reader's
//!          own error when it cannot read the metric account; for a price campaign it is also refused
//!          while the sponsored band edge is within `JOIN_BUFFER_BPS` of the target (`JoinBufferRefused`).
//! Version: 0.0.2
//! Sprint: 03 (readers and resolution), lane E; 04 (the buffer), lane G
//!
//! What each reader answers is its own (`readers/`, TP section 3.4.8). The price kind reads the
//! sponsored account, Full, of the campaign's feed, with the exponent stored at opening
//! (`PriceExponentChanged`), at most `max_age` old, at most 60 s ahead of the clock and posted
//! within the slot bound (`JoinPriceStale`), and knows the outcome once price ± confidence
//! reaches the target in the campaign's direction. `SupplyAtMost` knows it once the supply is at
//! or below the target, `DammV2LockedAtLeast` once the locked liquidity reaches the target, and
//! the two epoch kinds once the measured epoch has started. A join never offers a YES proof.
//!
//! Outcome of the buffer and the refund, for each case the sprint changes (lane G):
//!
//! | Case | Before | After | Reason |
//! |---|---|---|---|
//! | A join whose band edge is within the buffer of the target, not yet touching | Accepted | Refused, `JoinBufferRefused` | The touch may already have happened off-chain and not reached the sponsored account (question 7) |
//! | A join with the band edge exactly the buffer away from the target | Accepted | Accepted | The margin is outside the buffer: a gap equal to it passes |
//! | A join one unit inside the buffer | Accepted | Refused | The gap is less than the margin |
//! | A join after the YES proof's `publish_time`, on the winning side | Paid as a winner | Refunded whole (`split_late`) | Joined at or after the proof's publish time: it neither wins nor loses (question 7) |
//! | A join before the YES proof's `publish_time` | Paid as a winner | Paid as a winner (unchanged) | Before the proof's publish time: `split_late` counts it early |
//! | A join with less than the campaign's minimum | Refused by the config's minimum | Refused, `BelowCampaignMinEntry` | Question 5: the campaign's own minimum, copied at opening |
//!
//! Residual gap, stated on purpose: a move that crosses the target inside one publisher interval
//! and is not shown near the target before it, is not caught by the buffer; a join in that window
//! before the proof's `publish_time` is still paid. The margin's reasoning is in `join_rules.rs`.

use pinocchio::{AccountView, ProgramResult};

use super::join_rules::buffer_refuses;
use crate::{
    error::BrotError,
    readers::{self, ChainTime, ReadContext},
    state::{
        campaign::Campaign,
        enums::{Direction, ReaderKind},
    },
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
    if kind == ReaderKind::PriceTouch {
        require_clear_of_buffer(metric, campaign)?;
    }
    Ok(())
}

/// The proximity buffer for a price campaign. The reader has just read the same account as Full,
/// fresh, with the stored exponent (`outcome_knowable`), so this read only takes the band.
fn require_clear_of_buffer(metric: &AccountView, campaign: &Campaign) -> ProgramResult {
    let reading = readers::price_touch::read_price_account(metric, &campaign.feed_id)?;
    let direction =
        Direction::try_from(campaign.direction).map_err(|_| BrotError::BadAccountData)?;
    if buffer_refuses(&reading, direction, campaign.target.get())? {
        return Err(BrotError::JoinBufferRefused.into());
    }
    Ok(())
}
