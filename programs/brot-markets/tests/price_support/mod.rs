//! Purpose: what the price kind's host tests share: the captured mainnet Pyth accounts next to the
//!          devnet ones of `opening_support`, changes to an update's fields made in memory, every
//!          malformed account the reader refuses, and (in `campaign.rs` and `opening.rs`) a price
//!          campaign written in place with the readers' calls.
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane C
//!
//! A test crate that declares this module declares `opening_support` first: the accounts here are
//! its `HostAccount`s, laid out as the runtime lays them out. Each crate uses part of it, hence the
//! allowances.
#![allow(dead_code, unused_imports)]

mod campaign;
mod opening;
mod outcome;

pub use campaign::*;
pub use opening::*;
pub use outcome::*;

use brot_markets::error::BrotError::{self, *};
use pinocchio::Address;

use crate::opening_support::{
    set_i64, HostAccount, BTC, CONF, LEGACY_RECEIVER, NOW, PRICE, PUBLISH_TIME, RECEIVER, SOL,
    SYSTEM_PROGRAM, VERIFICATION,
};

// Real mainnet accounts (scripts/capture-fixtures.ts pyth), at the same sponsored addresses.
pub const SOL_MAINNET: &[u8] =
    include_bytes!("../../../../tests/fixtures/pyth-sol-usd-mainnet.bin");
pub const BTC_MAINNET: &[u8] =
    include_bytes!("../../../../tests/fixtures/pyth-btc-usd-mainnet.bin");
/// Both mainnet fixtures: publish time and posted slot; the BTC/USD price and confidence.
pub const MAINNET_PUBLISHED: i64 = 1_791_515_877;
pub const MAINNET_POSTED_SLOT: u64 = 454_743_011;
pub const BTC_MAINNET_PRICE: i128 = 8_206_475_000_000;
pub const BTC_MAINNET_CONF: i128 = 2_805_000_000;

/// The devnet BTC/USD fixture: price, confidence (exponent −8) and posted slot.
pub const BTC_PRICE: i128 = 8_521_233_806_870;
pub const BTC_CONF: i128 = 774_205_661;
pub const BTC_POSTED_SLOT: u64 = 507_785_465;
/// 110% and 90% of the devnet BTC/USD price: targets far from touched.
pub const ABOVE_TARGET: i128 = 9_373_357_187_557;
pub const BELOW_TARGET: i128 = 7_669_110_426_183;

/// Offsets of the `PriceUpdateV2` fields `opening_support` does not name.
pub const EXPONENT: usize = 89;
pub const POSTED_SLOT: usize = 125;

/// An address nobody derives: a `post_update` account offered as a YES proof.
pub const PROOF_ACCOUNT: Address = Address::new_from_array([0x7a; 32]);

/// The devnet `campaign_max_age`, and the campaigns' window: opened at `NOW`, seven days long.
pub const MAX_AGE: u32 = 120;
pub const OPENS_AT: i64 = NOW;
pub const DEADLINE: i64 = NOW + 7 * 86_400;

/// Changes to a captured update's fields, applied to a copy of its bytes.
#[derive(Clone, Copy, Debug, Default)]
pub struct Update {
    published: Option<i64>,
    price: Option<i64>,
    conf: Option<u64>,
    exponent: Option<i32>,
    posted_slot: Option<u64>,
}

impl Update {
    /// The update as captured.
    pub fn captured() -> Self {
        Self::default()
    }

    /// Published at `time`.
    pub fn at(time: i64) -> Self {
        Self {
            published: Some(time),
            ..Self::default()
        }
    }

    pub fn price(mut self, price: i128) -> Self {
        self.price = Some(i64::try_from(price).unwrap());
        self
    }

    pub fn conf(mut self, conf: u64) -> Self {
        self.conf = Some(conf);
        self
    }

    pub fn exponent(mut self, exponent: i32) -> Self {
        self.exponent = Some(exponent);
        self
    }

    pub fn slot(mut self, posted_slot: u64) -> Self {
        self.posted_slot = Some(posted_slot);
        self
    }

    pub fn apply(self, data: &mut [u8]) {
        if let Some(time) = self.published {
            set_i64(data, PUBLISH_TIME, time);
        }
        if let Some(price) = self.price {
            set_i64(data, PRICE, price);
        }
        if let Some(conf) = self.conf {
            data[CONF..][..8].copy_from_slice(&conf.to_le_bytes());
        }
        if let Some(exponent) = self.exponent {
            data[EXPONENT..][..4].copy_from_slice(&exponent.to_le_bytes());
        }
        if let Some(slot) = self.posted_slot {
            data[POSTED_SLOT..][..8].copy_from_slice(&slot.to_le_bytes());
        }
    }
}

/// A captured update at `address`, owned by the upgraded receiver, with `update` applied.
pub fn account(address: Address, fixture: &[u8], update: Update) -> HostAccount {
    HostAccount::price(address, RECEIVER, fixture, |data| update.apply(data))
}

/// `seconds` after `time`, without unchecked arithmetic.
pub fn after(time: i64, seconds: i64) -> i64 {
    time.checked_add(seconds).unwrap()
}

/// Every account at `address` the reader refuses for BTC/USD, built from the captured update
/// changed by `update`, with the reader's error: another owner (the pre-upgrade receiver, this
/// program, the System Program once closed), a partial verification, cut, stretched, zeroed, and
/// a real update of another feed.
pub fn malformed(address: Address, update: Update) -> Vec<(HostAccount, BrotError)> {
    let changed = |fixture: &[u8]| {
        let mut data = fixture.to_vec();
        update.apply(&mut data);
        data
    };
    let btc = changed(BTC);
    let mut partial = btc.clone();
    partial[VERIFICATION] = 0;
    let mut longer = btc.clone();
    longer.push(0);
    let at = |owner: Address, data: &[u8]| HostAccount::new(address, owner, data);
    vec![
        (at(LEGACY_RECEIVER, &btc), ReaderWrongOwner),
        (at(brot_markets::ID, &btc), ReaderWrongOwner),
        (at(SYSTEM_PROGRAM, &[]), ReaderWrongOwner),
        (at(RECEIVER, &partial), PriceNotFullyVerified),
        (at(RECEIVER, &btc[..133]), ReaderBadLayout),
        (at(RECEIVER, &longer), ReaderBadLayout),
        (at(RECEIVER, &[0u8; 134]), ReaderBadLayout),
        (at(RECEIVER, &changed(SOL)), PriceWrongFeed),
    ]
}
