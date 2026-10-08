//! Purpose: row 7 of TP section 3.4.10 on the host up to the conversion, each refusal with its
//!          own error (X0.7): who must pay, the US$ floor, the SOL/USD account derived from the
//!          config, its freshness and confidence; and the free team opening that never reads it.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane D. The conversion, `max_lamports` and the 90/10 split
//!         run in LiteSVM (tests/brot/open-campaign-paid.test.ts), after the SBF build.

mod common;

use brot_markets::{
    error::BrotError,
    instructions::campaigns::open_campaign::payment::{charge, Payment},
    layout::{LeU16, LeU32, LeU64},
    state::config::CreationParams,
};
use common::*;
use pinocchio::error::ProgramError;

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

/// `charge` for `opening_usd`, priced on `sol_usd`, with a generous `max_lamports` (10 SOL).
fn pay(is_team: bool, opening_usd: u64, mut sol_usd: HostAccount) -> Result<Payment, ProgramError> {
    let view = sol_usd.view();
    charge(&params(), is_team, opening_usd, 10_000_000_000, &view, NOW)
}

/// The SOL/USD account with one i64 field changed.
fn sol_with(at: usize, value: i64) -> HostAccount {
    sol_account(|data| set_i64(data, at, value))
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
    // The right address under the pre-upgrade receiver: the reader's own error.
    let legacy = HostAccount::price(SOL_ACCOUNT, LEGACY_RECEIVER, SOL_LEGACY, |_| ());
    assert_eq!(
        pay(false, 500, legacy),
        Err(err(BrotError::ReaderWrongOwner))
    );
    let partial = sol_account(|data| data[VERIFICATION] = 0);
    assert_eq!(
        pay(false, 500, partial),
        Err(err(BrotError::PriceNotFullyVerified))
    );
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
