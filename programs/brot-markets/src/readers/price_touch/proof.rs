//! Purpose: resolution of a price campaign (TP section 3.4.6; D7): while the proof window is
//!          open only a YES proof records anything; after it, the sponsored account gives NO, or a
//!          void when the feed went stale before the deadline or cannot be read.
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane C
//!
//! The window. With D the campaign's `deadline_at`, up to D + `PROOF_DELAY_SECONDS` (60 s, Q4)
//! only a YES proof resolves: a price published inside `[opens_at, D]` and at most 60 s old. NO
//! waits, because during `(D, D + 60]` a touch just before the deadline can still be proven, so
//! nobody can record a NO in front of the keeper's YES. After D + 60 no proof can satisfy both
//! `publish_time <= D` and an age of at most 60 s, so the NO hides no provable YES. The proof's age
//! bound and the wait after the deadline are therefore the same constant, and must stay so.
//!
//! After the window (D7, the exact test [AC], C47). The proof slot is no longer read; the
//! sponsored account is. The push oracle refuses an older update (it declares
//! `UpdatesNotMonotonic`; Sprint 03 checks the behaviour on a live cluster), so that account only
//! moves forward: a `publish_time <= D` now means no update landed after the deadline, and the
//! last update before it is exactly `publish_time`. When that is older than `D - max_age`, the
//! feed was stale at the deadline and the campaign is voided (`StaleFeed`), not turned to NO: if
//! Pyth's sponsorship lapses, open campaigns must not all go to NO. Once an update has landed
//! after D, the program cannot see the last update before it (`prev_publish_time` is Pythnet's
//! previous aggregate, not the account's previous write), so it records NO, and the indexer's feed
//! history lets the team void within the review window (TP section 3.4.6). A fresh feed can never
//! be made to look stale: nobody can write an older update into the sponsored account. An
//! unreadable account voids (`UnreadableAccount`). The exponent is not compared on this path: NO
//! and the void do not depend on the price, which is recorded only as evidence.

use pinocchio::{error::ProgramError, AccountView};

use super::{
    band_crosses_target, posted_within, published_within, read_price_account, stored_direction,
    PriceReading,
};
use crate::{
    constants::PROOF_DELAY_SECONDS,
    error::BrotError,
    readers::{Decision, ReadContext, Reading, Resolution},
    state::enums::VoidReason,
};

/// Resolution for the price kind. Up to D + 60 s: `Yes` from a valid proof, `NotYet` without one
/// (`ctx.proof` is `None`), or the proof's refusal. After it: `No`, or `Void` (`StaleFeed`,
/// `UnreadableAccount`). Times are compared in i128, so no deadline can overflow the window.
pub fn try_resolve(ctx: &ReadContext) -> Result<Resolution, ProgramError> {
    let deadline = i128::from(ctx.campaign.deadline_at.get());
    let window_end = deadline
        .checked_add(i128::from(PROOF_DELAY_SECONDS))
        .ok_or(BrotError::MathOverflow)?;
    if i128::from(ctx.time.unix_timestamp) <= window_end {
        return match ctx.proof {
            Some(proof) => Ok(Resolution::Decided(Decision::yes(yes_proof(proof, ctx)?))),
            None => Ok(Resolution::NotYet),
        };
    }
    Ok(Resolution::Decided(after_window(ctx)?))
}

/// A YES proof: any fully verified `PriceUpdateV2` of the campaign's feed at any address, the
/// sponsored account or a `post_update` account (the reader's errors), in the exponent stored at
/// opening (`PriceExponentChanged`), published inside `[opens_at, deadline_at]`
/// (`ProofOutsideWindow`), at most 60 s before the clock and 60 s after it and posted within the
/// slot bound of 60 s (`ProofStale`), with the whole confidence band past the target in the
/// campaign's direction (`ProofDoesNotTouch`).
fn yes_proof(proof: &AccountView, ctx: &ReadContext) -> Result<Reading, ProgramError> {
    let campaign = ctx.campaign;
    let reading = read_price_account(proof, &campaign.feed_id)?;
    if reading.exponent != campaign.price_exponent.get() {
        return Err(BrotError::PriceExponentChanged.into());
    }
    let published = reading.publish_time;
    if published < campaign.opens_at.get() || published > campaign.deadline_at.get() {
        return Err(BrotError::ProofOutsideWindow.into());
    }
    let max_age = u32::try_from(PROOF_DELAY_SECONDS).map_err(|_| BrotError::MathOverflow)?;
    let fresh = published_within(&reading, ctx.time.unix_timestamp, max_age)
        && posted_within(&reading, ctx.time.slot, max_age);
    if !fresh {
        return Err(BrotError::ProofStale.into());
    }
    let direction = stored_direction(campaign)?;
    if !band_crosses_target(&reading, direction, campaign.target.get())? {
        return Err(BrotError::ProofDoesNotTouch.into());
    }
    Ok(evidence(proof, &reading))
}

/// After D + 60 s, from the sponsored account (module documentation): `Void(UnreadableAccount)`
/// when it cannot be read, with nothing observed; `Void(StaleFeed)` when `publish_time <= D` and
/// `publish_time < D - max_age`; otherwise `No`, never `met_late`. The second condition implies
/// the first (`max_age` is unsigned); the first is written out because it is what makes
/// `publish_time` the last update before the deadline.
fn after_window(ctx: &ReadContext) -> Result<Decision, ProgramError> {
    let campaign = ctx.campaign;
    let Ok(reading) = read_price_account(ctx.metric, &campaign.feed_id) else {
        let nothing = Reading::of(ctx.metric, 0);
        return Ok(Decision::void(VoidReason::UnreadableAccount, nothing));
    };
    let deadline = i128::from(campaign.deadline_at.get());
    let published = i128::from(reading.publish_time);
    let stale_before = deadline
        .checked_sub(i128::from(campaign.max_age.get()))
        .ok_or(BrotError::MathOverflow)?;
    let read = evidence(ctx.metric, &reading);
    if published <= deadline && published < stale_before {
        return Ok(Decision::void(VoidReason::StaleFeed, read));
    }
    Ok(Decision::no(read, false))
}

/// The reading behind a recorded outcome: the price, the account it was read from, its publish
/// time and posted slot, for `CampaignResolved` and the second read (proposal section 2.5).
fn evidence(account: &AccountView, reading: &PriceReading) -> Reading {
    Reading {
        observed: i128::from(reading.price),
        account: *account.address(),
        publish_time: reading.publish_time,
        posted_slot: reading.posted_slot,
    }
}
