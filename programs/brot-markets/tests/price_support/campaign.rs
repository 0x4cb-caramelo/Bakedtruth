//! Purpose: a price campaign written in place for the host tests, and the join lock and
//!          resolution called through `readers` as the program calls them.
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane C

use brot_markets::{
    layout::ZeroCopy,
    readers::{outcome_knowable, try_resolve, ChainTime, ReadContext, Resolution},
    state::{
        campaign::Campaign,
        enums::{Direction, ReaderKind},
    },
};
use pinocchio::error::ProgramError;

use super::{DEADLINE, MAX_AGE, OPENS_AT};
use crate::opening_support::{btc_account, HostAccount, BTC_ACCOUNT, BTC_FEED};

/// The fields of a price campaign the readers read; every other field is zero.
#[derive(Clone, Copy, Debug)]
pub struct Terms {
    feed_id: [u8; 32],
    direction: u8,
    target: i128,
    exponent: i32,
    max_age: u32,
    opens_at: i64,
    deadline_at: i64,
}

impl Terms {
    /// A BTC/USD campaign towards `target`, exponent −8, `MAX_AGE`, `OPENS_AT` to `DEADLINE`.
    pub fn btc(direction: Direction, target: i128) -> Self {
        Self {
            feed_id: BTC_FEED,
            direction: direction as u8,
            target,
            exponent: -8,
            max_age: MAX_AGE,
            opens_at: OPENS_AT,
            deadline_at: DEADLINE,
        }
    }

    pub fn feed(mut self, feed_id: [u8; 32]) -> Self {
        self.feed_id = feed_id;
        self
    }

    /// A raw direction byte, so a test can store one no direction has.
    pub fn direction_byte(mut self, direction: u8) -> Self {
        self.direction = direction;
        self
    }

    pub fn exponent(mut self, exponent: i32) -> Self {
        self.exponent = exponent;
        self
    }

    pub fn max_age(mut self, max_age: u32) -> Self {
        self.max_age = max_age;
        self
    }

    pub fn window(mut self, opens_at: i64, deadline_at: i64) -> Self {
        self.opens_at = opens_at;
        self.deadline_at = deadline_at;
        self
    }

    /// The campaign's 512 bytes, as `user_open_campaign` would store these fields.
    pub fn bytes(&self) -> Vec<u8> {
        let mut data = vec![0u8; Campaign::LEN];
        let campaign = Campaign::from_bytes_mut(&mut data).expect("exact length");
        campaign.kind = ReaderKind::PriceTouch as u8;
        campaign.direction = self.direction;
        campaign.feed_id = self.feed_id;
        campaign.metric_account = BTC_ACCOUNT;
        campaign.target.set(self.target);
        campaign.price_exponent.set(self.exponent);
        campaign.max_age.set(self.max_age);
        campaign.opens_at.set(self.opens_at);
        campaign.deadline_at.set(self.deadline_at);
        data
    }
}

/// The cluster clock at `unix_timestamp` and `slot`.
pub fn at(unix_timestamp: i64, slot: u64) -> ChainTime {
    ChainTime {
        unix_timestamp,
        slot,
        epoch: 0,
    }
}

/// The join lock of `terms` on `metric` at `time`, through `readers::outcome_knowable`.
pub fn knowable(
    terms: &Terms,
    metric: &mut HostAccount,
    time: ChainTime,
) -> Result<bool, ProgramError> {
    let data = terms.bytes();
    let campaign = Campaign::from_bytes(&data).expect("exact length");
    let metric = metric.view();
    let context = ReadContext {
        metric: &metric,
        campaign,
        time,
        proof: None,
    };
    outcome_knowable(ReaderKind::PriceTouch, &context)
}

/// What the resolution's proof slot holds.
pub enum ProofSlot<'a> {
    /// No proof at all (`ReadContext::proof` is `None`).
    Missing,
    /// The metric account itself, as the TS kit passes it by default.
    Metric,
    Account(&'a mut HostAccount),
}

/// Resolution of `terms` with `metric` and `proof` at `time`, through `readers::try_resolve`.
pub fn resolve(
    terms: &Terms,
    metric: &mut HostAccount,
    proof: ProofSlot,
    time: ChainTime,
) -> Result<Resolution, ProgramError> {
    let data = terms.bytes();
    let campaign = Campaign::from_bytes(&data).expect("exact length");
    let metric = metric.view();
    let proof = match proof {
        ProofSlot::Missing => None,
        ProofSlot::Metric => Some(metric),
        ProofSlot::Account(account) => Some(account.view()),
    };
    let context = ReadContext {
        metric: &metric,
        campaign,
        time,
        proof: proof.as_ref(),
    };
    try_resolve(ReaderKind::PriceTouch, &context)
}

/// Resolution of `terms` at `time`, `proof` in the proof slot, the devnet sponsored BTC/USD
/// account as captured in the metric slot.
pub fn prove(
    terms: Terms,
    mut proof: HostAccount,
    time: ChainTime,
) -> Result<Resolution, ProgramError> {
    let slot = ProofSlot::Account(&mut proof);
    resolve(&terms, &mut btc_account(|_| ()), slot, time)
}
