//! Purpose: rows 2 to 4 of an opening for the price kind's host tests: `readers::
//!          validate_at_creation` on a runtime-shaped account, with the devnet `campaign_max_age`.
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane C

use brot_markets::{
    readers::{validate_at_creation, ChainTime, CreationContext, CreationReading},
    state::enums::{Direction, ReaderKind},
};
use pinocchio::error::ProgramError;

use super::{DEADLINE, MAX_AGE};
use crate::opening_support::HostAccount;

/// What the opening's reader returns.
pub type Opened = Result<CreationReading, ProgramError>;
/// A price campaign opened on a feed published with exponent −8, as both captured feeds are.
pub const OPENED: Opened = Ok(CreationReading { price_exponent: -8 });

/// Rows 2 to 4 for `kind` on `metric` at `time`, towards `aim` on `feed_id`, with the devnet
/// `campaign_max_age` (120 s) and a deadline seven days after `NOW`.
pub fn open_kind(
    kind: ReaderKind,
    metric: &mut HostAccount,
    feed_id: &[u8; 32],
    aim: (Direction, i128),
    time: ChainTime,
) -> Opened {
    let view = metric.view();
    let (direction, target) = aim;
    let context = CreationContext {
        metric: &view,
        feed_id,
        direction,
        target,
        max_age: MAX_AGE,
        epoch: 0,
        deadline_at: DEADLINE,
        time,
        curve_config: None,
    };
    validate_at_creation(kind, &context)
}

/// Rows 2 to 4 for a price campaign.
pub fn open(
    metric: &mut HostAccount,
    feed_id: &[u8; 32],
    aim: (Direction, i128),
    time: ChainTime,
) -> Opened {
    open_kind(ReaderKind::PriceTouch, metric, feed_id, aim, time)
}
