//! Purpose: what the readers share: the outcome a reader decides and the reading behind it, the
//!          deadline test, the irreversible-fact table and row 3's minimum distance.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution); frozen at the sprint's opening

use pinocchio::{error::ProgramError, AccountView, Address};

use super::{ChainTime, ReadContext};
use crate::{
    constants::BPS_DENOMINATOR,
    error::BrotError,
    state::{
        campaign::Campaign,
        enums::{Outcome, VoidReason},
    },
};

/// The reading behind a recorded outcome, for the `CampaignResolved` event.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Reading {
    /// The value read, in the account's own units; zero when nothing could be read.
    pub observed: i128,
    /// The account it was read from.
    pub account: Address,
    /// Price kind only: the reading's publish time and posted slot; zero otherwise.
    pub publish_time: i64,
    pub posted_slot: u64,
}

impl Reading {
    /// A reading of a kind that has no publish time.
    pub fn of(account: &AccountView, observed: i128) -> Self {
        Self {
            observed,
            account: *account.address(),
            publish_time: 0,
            posted_slot: 0,
        }
    }
}

/// An outcome to record.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Decision {
    /// `Yes`, `No` or `Void`, never `Unresolved`.
    pub outcome: Outcome,
    /// `None` unless `outcome` is `Void`.
    pub void_reason: VoidReason,
    /// An irreversible fact found met only after the deadline: `No`, flagged (TP section 3.4.6).
    pub met_late: bool,
    pub reading: Reading,
}

impl Decision {
    pub fn yes(reading: Reading) -> Self {
        Self {
            outcome: Outcome::Yes,
            void_reason: VoidReason::None,
            met_late: false,
            reading,
        }
    }

    pub fn no(reading: Reading, met_late: bool) -> Self {
        Self {
            outcome: Outcome::No,
            void_reason: VoidReason::None,
            met_late,
            reading,
        }
    }

    pub fn void(reason: VoidReason, reading: Reading) -> Self {
        Self {
            outcome: Outcome::Void,
            void_reason: reason,
            met_late: false,
            reading,
        }
    }
}

/// A reader's answer when asked to resolve. `NotYet` makes `resolve_campaign` refuse with
/// `NotResolvableYet`; a reader may also refuse with an error of its own.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Resolution {
    NotYet,
    Decided(Decision),
}

/// True once the clock is past `deadline_at`. A fact met in the deadline's own second still
/// resolves YES, as in the frozen program ("a goal met in the deadline slot itself").
pub fn after_deadline(campaign: &Campaign, time: &ChainTime) -> bool {
    time.unix_timestamp > campaign.deadline_at.get()
}

/// The two irreversible facts (`SupplyAtMost`, `DammV2LockedAtLeast`), TP section 3.4.6: before
/// the deadline, met is YES and not met is `NotYet`; after it, NO, flagged `met_late` when met;
/// an unreadable account is refused before the deadline and voids (`UnreadableAccount`) after.
/// `read` is the reader's value of the metric account, or its error.
pub fn fact_resolution(
    read: Result<i128, ProgramError>,
    is_met: impl Fn(i128) -> bool,
    ctx: &ReadContext,
) -> Result<Resolution, ProgramError> {
    let after = after_deadline(ctx.campaign, &ctx.time);
    let value = match read {
        Ok(value) => value,
        Err(_) if after => {
            let reading = Reading::of(ctx.metric, 0);
            return Ok(Resolution::Decided(Decision::void(
                VoidReason::UnreadableAccount,
                reading,
            )));
        }
        Err(error) => return Err(error),
    };
    let reading = Reading::of(ctx.metric, value);
    Ok(match (is_met(value), after) {
        (true, false) => Resolution::Decided(Decision::yes(reading)),
        (false, false) => Resolution::NotYet,
        (met, true) => Resolution::Decided(Decision::no(reading, met)),
    })
}

/// Row 3's minimum distance from `value`: `|value| × bps / 10,000`, rounded up, and at least one
/// unit, in i128 with checked math. It divides before it multiplies (`q × bps + ⌈r × bps /
/// 10,000⌉`, with `|value| = q × 10,000 + r`), so no value an i128 holds overflows for any bps up
/// to 10,000; only `i128::MIN`, whose size an i128 cannot hold, is `MathOverflow`.
pub fn min_distance(value: i128, bps: u16) -> Result<i128, ProgramError> {
    let size = value.checked_abs().ok_or(BrotError::MathOverflow)?;
    let denominator = i128::from(BPS_DENOMINATOR);
    let bps = i128::from(bps);
    let whole = size
        .checked_div(denominator)
        .and_then(|q| q.checked_mul(bps))
        .ok_or(BrotError::MathOverflow)?;
    let part = size
        .checked_rem(denominator)
        .and_then(|r| r.checked_mul(bps))
        .and_then(|v| v.checked_add(denominator.checked_sub(1)?))
        .and_then(|v| v.checked_div(denominator))
        .ok_or(BrotError::MathOverflow)?;
    let distance = whole.checked_add(part).ok_or(BrotError::MathOverflow)?;
    Ok(distance.max(1))
}
