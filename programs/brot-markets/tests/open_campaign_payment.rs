//! Purpose: row 7 of TP section 3.4.10 on the host up to the conversion, each refusal with its
//!          own error (X0.7): who must pay, the US$ floor, the SOL/USD account derived from the
//!          config, the four reader refusals under row 7's own codes, its freshness by time and by
//!          slot, its confidence; and the free team opening that never reads it.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio), lane D; 03 (row 7's codes and the slot bound), lane F. The
//!         conversion, `max_lamports` and the 90/10 split run in LiteSVM
//!         (tests/brot/open-campaign-paid.test.ts), after the SBF build.

mod opening_support;

use brot_markets::{
    error::BrotError,
    instructions::campaigns::open_campaign::payment::{charge, sol_usd_read, Payment},
    layout::{LeU16, LeU32, LeU64},
    readers::ChainTime,
    state::config::CreationParams,
};
use opening_support::*;
use pinocchio::error::ProgramError;

/// Offset of `posted_slot` in a `PriceUpdateV2`.
const POSTED_SLOT: usize = 125;
/// The clock's slot: 18 slots (7 s at 400 ms) after the SOL/USD fixture's, 507,785,464.
const SLOT: u64 = 507_785_482;
/// The slot bound of the devnet `max_price_age` (120 s): `ceil(120 × 1,000 ÷ MIN_SLOT_MS)`.
const SLOT_BOUND: u64 = 1_200;

type Paid = Result<Payment, ProgramError>;

/// The founder's values with the [AC] devnet bounds (`DEFAULT_PARAMS` in tests/brot/flows.ts).
fn params() -> CreationParams {
    CreationParams {
        opening_fee_usd: LeU64::new(500),
        opening_prize_bps: LeU16::new(9_000),
        fee_bps: LeU16::new(1_000),
        one_sided_fee_bps: LeU16::new(100),
        creator_share_bps: LeU16::new(100),
        max_open_campaigns: LeU32::new(1_000),
        min_entry_lamports: LeU64::new(10_000_000),
        sol_usd_feed_id: SOL_FEED,
        max_price_age: LeU32::new(120),
        max_price_conf_bps: LeU16::new(50),
        campaign_max_age: LeU32::new(120),
    }
}

/// `charge` for `usd`, priced on `sol_usd` at `NOW` and `slot`, with 10 SOL of `max_lamports`.
fn pay_at(slot: u64, team: bool, usd: u64, mut sol_usd: HostAccount) -> Paid {
    let time = ChainTime {
        unix_timestamp: NOW,
        slot,
        epoch: 0,
    };
    charge(&params(), team, usd, 10_000_000_000, &sol_usd.view(), &time)
}

/// `pay_at` at the clock's `SLOT`.
fn pay(team: bool, usd: u64, sol_usd: HostAccount) -> Paid {
    pay_at(SLOT, team, usd, sol_usd)
}

/// The SOL/USD account with one i64 field changed.
fn sol_with(at: usize, value: i64) -> HostAccount {
    sol_account(|data| set_i64(data, at, value))
}

/// The SOL/USD account posted at `slot`.
fn sol_posted_at(slot: u64) -> HostAccount {
    sol_account(|data| data[POSTED_SLOT..][..8].copy_from_slice(&slot.to_le_bytes()))
}

#[test]
fn a_team_key_without_opening_usd_pays_nothing_and_reads_no_price() {
    // Not even a price account: the slot is neither checked nor read (P-3).
    let anything = HostAccount::new(SYSTEM_PROGRAM, SYSTEM_PROGRAM, &[]);
    assert_eq!(pay(true, 0, anything), Ok(Payment::default()));
    let stale = sol_with(PUBLISH_TIME, published(-1_000));
    assert_eq!(pay(true, 0, stale), Ok(Payment::default()));
}

#[test]
fn any_other_signer_pays_at_least_the_opening_fee() {
    let below = Err(err(BrotError::OpeningUsdBelowFee));
    assert_eq!(pay(false, 0, sol_account(|_| ())), below);
    assert_eq!(pay(false, 499, sol_account(|_| ())), below);
    // A team key that adds a prize pays like any wallet, from the same floor [AC].
    assert_eq!(pay(true, 1, sol_account(|_| ())), below);
    assert_eq!(pay(true, 499, sol_account(|_| ())), below);
}

#[test]
fn the_price_comes_only_from_the_configs_sponsored_sol_usd_account() {
    let mismatch = Err(err(BrotError::SolUsdAccountMismatch));
    // BTC/USD in the SOL/USD slot, and SOL/USD's own bytes at another address.
    assert_eq!(pay(false, 500, btc_account(|_| ())), mismatch);
    let elsewhere = HostAccount::price(BTC_ACCOUNT, RECEIVER, SOL, |_| ());
    assert_eq!(pay(false, 500, elsewhere), mismatch);
    assert!(pay(false, 500, sol_account(|_| ())).is_ok());
}

#[test]
fn the_readers_refusals_of_the_sol_usd_account_have_row_7s_own_codes() {
    // The right address under the pre-upgrade receiver.
    let legacy = HostAccount::price(SOL_ACCOUNT, LEGACY_RECEIVER, SOL_LEGACY, |_| ());
    let wrong_owner = Err(err(BrotError::SolUsdWrongOwner));
    assert_eq!(pay(false, 500, legacy), wrong_owner);
    // One byte short, one byte long, and the discriminator of another account.
    let short = HostAccount::new(SOL_ACCOUNT, RECEIVER, &SOL[..133]);
    let mut longer = SOL.to_vec();
    longer.push(0);
    let long = HostAccount::new(SOL_ACCOUNT, RECEIVER, &longer);
    let renamed = sol_account(|data| data[0] ^= 1);
    for account in [short, long, renamed] {
        assert_eq!(
            pay(false, 500, account),
            Err(err(BrotError::SolUsdBadLayout))
        );
    }
    let partial = sol_account(|data| data[VERIFICATION] = 0);
    let not_full = Err(err(BrotError::SolUsdNotFullyVerified));
    assert_eq!(pay(false, 500, partial), not_full);
    // BTC/USD's bytes at the SOL/USD address: the sponsored address, another feed.
    let btc_bytes = HostAccount::price(SOL_ACCOUNT, RECEIVER, BTC, |_| ());
    let wrong_feed = Err(err(BrotError::SolUsdWrongFeed));
    assert_eq!(pay(false, 500, btc_bytes), wrong_feed);
}

#[test]
fn row_7_renames_only_the_four_reader_refusals() {
    let renamed = [
        (BrotError::ReaderWrongOwner, BrotError::SolUsdWrongOwner),
        (BrotError::ReaderBadLayout, BrotError::SolUsdBadLayout),
        (
            BrotError::PriceNotFullyVerified,
            BrotError::SolUsdNotFullyVerified,
        ),
        (BrotError::PriceWrongFeed, BrotError::SolUsdWrongFeed),
    ];
    for (reader, row_7) in renamed {
        assert_eq!(sol_usd_read(reader), row_7);
    }
    for other in [BrotError::MathOverflow, BrotError::SolUsdStale] {
        assert_eq!(sol_usd_read(other), other);
    }
}

#[test]
fn a_stale_a_non_positive_and_a_wide_sol_usd_price_have_their_own_errors() {
    // NOW is PUBLISHED + 7: 114 s earlier is 121 s old, one past the devnet `max_price_age`.
    let stale = sol_with(PUBLISH_TIME, published(-114));
    assert_eq!(pay(false, 500, stale), Err(err(BrotError::SolUsdStale)));
    let zero = sol_with(PRICE, 0);
    assert_eq!(
        pay(false, 500, zero),
        Err(err(BrotError::SolUsdPriceNonPositive))
    );
    // 0.5% of 11,921,844,516 is 59,609,222.58.
    let wide = sol_with(CONF, 59_609_223);
    assert_eq!(
        pay(false, 500, wide),
        Err(err(BrotError::SolUsdConfidenceTooWide))
    );
    // Once the team adds a prize it pays like any wallet: a stale price stops it too [AC].
    let stale = sol_with(PUBLISH_TIME, published(-114));
    assert_eq!(pay(true, 500, stale), Err(err(BrotError::SolUsdStale)));
}

#[test]
fn a_sol_usd_price_posted_too_many_slots_ago_is_stale_whatever_its_publish_time() {
    // The fixture is fresh by time (7 s); only its posted slot moves.
    let posted = |lag: u64| SLOT.checked_sub(lag).unwrap();
    assert!(pay(false, 500, sol_posted_at(posted(SLOT_BOUND))).is_ok());
    let stale = Err(err(BrotError::SolUsdStale));
    let one_past = SLOT_BOUND.checked_add(1).unwrap();
    assert_eq!(pay(false, 500, sol_posted_at(posted(one_past))), stale);
    // A clock that reads a slot far past the posting, with the account untouched.
    let far = SLOT.checked_add(10_000).unwrap();
    assert_eq!(pay_at(far, false, 500, sol_account(|_| ())), stale);
    // A posted slot ahead of the clock's, which no cluster writes, counts as posted now.
    let ahead = SLOT.checked_add(5).unwrap();
    assert!(pay(false, 500, sol_posted_at(ahead)).is_ok());
    // A free team opening reads no slot either.
    assert_eq!(
        pay_at(far, true, 0, sol_account(|_| ())),
        Ok(Payment::default())
    );
}
