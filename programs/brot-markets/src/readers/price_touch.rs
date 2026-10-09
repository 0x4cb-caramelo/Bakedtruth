//! Purpose: the price kind (`PriceTouch`) at the three moments a campaign reads its feed: the
//!          opening (rows 2 to 4, and row 3 at both ends), the join lock on the sponsored account,
//!          and resolution (the YES proof, then NO or the stale-feed void; TP section 3.4.8; D7).
//! Version: 0.0.6
//! Sprint: 01 (price reader proof); 02 (the opening checks); 03 (row 3 at both ends, the slot
//!         bound, the join lock, the YES proof and the stale-feed void), lane C
//!
//! The account is read by `price_update.rs`. The rules the three moments share are in
//! `price_touch/rules.rs`, row 3 in `price_touch/target.rs`, resolution in `price_touch/proof.rs`.
//! Joining accepts only the sponsored account, which only moves forward (the push oracle refuses
//! an older update), so a baker cannot choose an older price; a YES proof accepts any fully
//! verified account of the feed, so a newer update pushed into the sponsored account cannot erase
//! a touch (proposal section 2.5). A reading's `prev_publish_time` is Pythnet's previous
//! aggregate, not the account's previous write, and no rule reads it.

mod proof;
mod rules;
mod target;

use pinocchio::error::ProgramError;

use super::{CreationContext, CreationReading, ReadContext};
use crate::{
    constants::PRICE_CAMPAIGN_MAX_CONF_BPS,
    error::BrotError,
    state::{campaign::Campaign, enums::Direction},
};

pub use super::price_update::{
    read_price_account, read_price_update, sponsored_account, PriceReading,
    PRICE_UPDATE_V2_DISCRIMINATOR, PRICE_UPDATE_V2_LEN, PYTH_RECEIVER_ID,
};
pub use proof::try_resolve;
pub use rules::{
    band_crosses_target, band_reaches_target, check_fresh_and_tight, posted_within,
    published_within, PriceRefusal,
};
pub use target::check_target;

/// Rows 2 to 4 for the price kind, and row 3 at both ends. The metric account is the sponsored
/// account of `feed_id` (`MetricAccountMismatch`), compared before a byte is read; it reads as a
/// Full update of that feed (the reader's errors); it was posted within the slot bound of
/// `max_age` and published within `max_age` (`PriceStale`), with a positive price
/// (`PriceNonPositive`) and a confidence of at most 0.5% (`PriceConfidenceTooWide`); and the
/// target passes `check_target`. The slot bound runs first, so a stale price is `PriceStale`
/// whatever its value. The exponent is returned for the campaign to store.
pub fn validate_at_creation(ctx: &CreationContext) -> Result<CreationReading, ProgramError> {
    if *ctx.metric.address() != sponsored_account(ctx.feed_id)? {
        return Err(BrotError::MetricAccountMismatch.into());
    }
    let reading = read_price_account(ctx.metric, ctx.feed_id)?;
    if !posted_within(&reading, ctx.time.slot, ctx.max_age) {
        return Err(BrotError::PriceStale.into());
    }
    let now = ctx.time.unix_timestamp;
    check_fresh_and_tight(&reading, now, ctx.max_age, PRICE_CAMPAIGN_MAX_CONF_BPS).map_err(
        |refusal| match refusal {
            PriceRefusal::Stale => BrotError::PriceStale,
            PriceRefusal::NonPositive => BrotError::PriceNonPositive,
            PriceRefusal::ConfidenceTooWide => BrotError::PriceConfidenceTooWide,
        },
    )?;
    check_target(&reading, ctx.direction, ctx.target)?;
    Ok(CreationReading {
        price_exponent: reading.exponent,
    })
}

/// The join lock (BR-06). The caller has compared `ctx.metric` with `metric_account`, the
/// sponsored account the opening checked. It reads as a Full update of the campaign's feed (the
/// reader's errors), in the exponent stored at opening (`PriceExponentChanged`), published at most
/// the campaign's `max_age` before the clock and `MAX_PRICE_CLOCK_LEAD_SECONDS` after it, and
/// posted within the slot bound of `max_age` (`JoinPriceStale`). True when price ± confidence
/// reaches the target in the campaign's direction: the touch may have happened, so entries lock.
/// Confidence and sign are not checked here: a wide band locks sooner, never later.
pub fn outcome_knowable(ctx: &ReadContext) -> Result<bool, ProgramError> {
    let campaign = ctx.campaign;
    let reading = read_price_account(ctx.metric, &campaign.feed_id)?;
    if reading.exponent != campaign.price_exponent.get() {
        return Err(BrotError::PriceExponentChanged.into());
    }
    let max_age = campaign.max_age.get();
    let fresh = published_within(&reading, ctx.time.unix_timestamp, max_age)
        && posted_within(&reading, ctx.time.slot, max_age);
    if !fresh {
        return Err(BrotError::JoinPriceStale.into());
    }
    let direction = stored_direction(campaign)?;
    Ok(band_reaches_target(
        &reading,
        direction,
        campaign.target.get(),
    )?)
}

/// The campaign's stored direction. A byte no variant has is `BadAccountData`: it was stored, not
/// passed, so it is not the instruction's `InvalidDirection`.
fn stored_direction(campaign: &Campaign) -> Result<Direction, BrotError> {
    Direction::try_from(campaign.direction).map_err(|_| BrotError::BadAccountData)
}
