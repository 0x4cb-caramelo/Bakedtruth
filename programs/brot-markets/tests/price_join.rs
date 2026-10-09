//! Purpose: the join lock of a price campaign (BR-06) on the host: `readers::outcome_knowable` on
//!          the sponsored account, each refusal with its own error, the freshness bounds at their
//!          edges (age, clock lead, posted slot) and the touch at its boundary in both directions.
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane C. `user_join_campaign` (lane E) runs the lock in
//!         LiteSVM after the SBF build.

mod opening_support;
mod price_support;

use brot_markets::{
    error::BrotError::*,
    readers::ChainTime,
    state::enums::Direction::{self, Above, Below},
};
use opening_support::*;
use pinocchio::error::ProgramError;
use price_support::*;

/// A clock slot, and the posted-slot bound of the devnet `max_age` (120 s at 100 ms a slot).
const SLOT: u64 = 10_000;
const SLOT_BOUND: u64 = 1_200;

fn btc(direction: Direction) -> Terms {
    let target = if direction == Above {
        ABOVE_TARGET
    } else {
        BELOW_TARGET
    };
    Terms::btc(direction, target)
}

/// The join at `time` on the sponsored BTC/USD account changed by `update`.
fn join_at(terms: Terms, update: Update, time: ChainTime) -> Result<bool, ProgramError> {
    knowable(&terms, &mut account(BTC_ACCOUNT, BTC, update), time)
}

/// The join at `NOW`, slot 0.
fn join(terms: Terms, update: Update) -> Result<bool, ProgramError> {
    join_at(terms, update, at(NOW, 0))
}

#[test]
fn a_fresh_price_far_from_the_target_keeps_entries_open() {
    assert_eq!(join(btc(Above), Update::captured()), Ok(false));
    assert_eq!(join(btc(Below), Update::captured()), Ok(false));
}

#[test]
fn the_reader_refuses_what_is_not_a_full_update_of_the_feed() {
    for (mut metric, error) in malformed(BTC_ACCOUNT, Update::captured()) {
        let joined = knowable(&btc(Above), &mut metric, at(NOW, 0));
        assert_eq!(joined, refused(error), "{error:?}");
    }
}

#[test]
fn an_exponent_other_than_the_one_stored_at_opening_is_refused() {
    let rescaled = Update::captured().exponent(-7);
    assert_eq!(join(btc(Above), rescaled), refused(PriceExponentChanged));
    let stored_other = btc(Above).exponent(-9);
    assert_eq!(
        join(stored_other, Update::captured()),
        refused(PriceExponentChanged)
    );
    // Checked before the age: a stale price in another scale names the scale.
    let stale = Update::at(published(-200)).exponent(-7);
    assert_eq!(join(btc(Above), stale), refused(PriceExponentChanged));
}

#[test]
fn the_price_may_be_exactly_max_age_old_and_not_one_second_more() {
    // NOW is PUBLISHED + 7: a publish time 113 s earlier is 120 s old, 114 s earlier is 121 s.
    assert_eq!(join(btc(Above), Update::at(published(-113))), Ok(false));
    let older = join(btc(Above), Update::at(published(-114)));
    assert_eq!(older, refused(JoinPriceStale));
    // At the 30 s floor (Q4).
    let floor = btc(Above).max_age(30);
    assert_eq!(join(floor, Update::at(after(NOW, -30))), Ok(false));
    assert_eq!(
        join(floor, Update::at(after(NOW, -31))),
        refused(JoinPriceStale)
    );
}

#[test]
fn a_publish_time_up_to_sixty_seconds_ahead_of_the_clock_is_fresh_and_no_more() {
    assert_eq!(join(btc(Above), Update::at(after(NOW, 60))), Ok(false));
    let further = join(btc(Above), Update::at(after(NOW, 61)));
    assert_eq!(further, refused(JoinPriceStale));
}

#[test]
fn the_posted_slot_may_lag_the_bound_of_max_age_and_not_one_slot_more() {
    let time = at(NOW, SLOT);
    let lag = |slots: u64| Update::captured().slot(SLOT.checked_sub(slots).unwrap());
    assert_eq!(join_at(btc(Above), lag(SLOT_BOUND), time), Ok(false));
    let one_more = join_at(btc(Above), lag(SLOT_BOUND + 1), time);
    assert_eq!(one_more, refused(JoinPriceStale));
    // A posted slot ahead of the clock counts as posted now (LiteSVM starts at slot 1).
    let ahead = Update::captured().slot(SLOT + 5);
    assert_eq!(join_at(btc(Above), ahead, time), Ok(false));
    // At the 30 s floor the bound is 300 slots.
    let floor = btc(Above).max_age(30);
    assert_eq!(join_at(floor, lag(300), time), Ok(false));
    assert_eq!(join_at(floor, lag(301), time), refused(JoinPriceStale));
}

#[test]
fn entries_lock_once_price_plus_confidence_reaches_an_above_target() {
    // The band's top on the target locks; one unit under it does not; past it, it holds.
    let on_edge = Update::captured().price(ABOVE_TARGET - BTC_CONF);
    assert_eq!(join(btc(Above), on_edge), Ok(true));
    let under = Update::captured().price(ABOVE_TARGET - BTC_CONF - 1);
    assert_eq!(join(btc(Above), under), Ok(false));
    let past = Update::captured().price(ABOVE_TARGET);
    assert_eq!(join(btc(Above), past), Ok(true));
}

#[test]
fn entries_lock_once_price_minus_confidence_reaches_a_below_target() {
    let on_edge = Update::captured().price(BELOW_TARGET + BTC_CONF);
    assert_eq!(join(btc(Below), on_edge), Ok(true));
    let over = Update::captured().price(BELOW_TARGET + BTC_CONF + 1);
    assert_eq!(join(btc(Below), over), Ok(false));
}

#[test]
fn a_wide_band_locks_sooner_and_a_negative_price_still_answers() {
    // Confidence is not bounded at the join: a wider band only reaches the target sooner.
    assert_eq!(
        join(btc(Above), Update::captured().conf(u64::MAX)),
        Ok(true)
    );
    // A negative price never reaches an `Above` target and has crossed a `Below` one.
    assert_eq!(join(btc(Above), Update::captured().price(-1)), Ok(false));
    assert_eq!(join(btc(Below), Update::captured().price(-1)), Ok(true));
}

#[test]
fn a_stored_direction_byte_that_names_no_direction_is_bad_account_data() {
    let corrupt = btc(Above).direction_byte(2);
    assert_eq!(join(corrupt, Update::captured()), refused(BadAccountData));
}

#[test]
fn the_mainnet_accounts_answer_as_captured() {
    let time = at(after(MAINNET_PUBLISHED, 7), 0);
    let btc_campaign = Terms::btc(Above, 9_027_122_500_000);
    let mut btc = account(BTC_ACCOUNT, BTC_MAINNET, Update::captured());
    assert_eq!(knowable(&btc_campaign, &mut btc, time), Ok(false));
    let sol_campaign = Terms::btc(Below, 9_900_071_202).feed(SOL_FEED);
    let mut sol = account(SOL_ACCOUNT, SOL_MAINNET, Update::captured());
    assert_eq!(knowable(&sol_campaign, &mut sol, time), Ok(false));
    // Their posted slot against the bound of 120 s.
    const BOUND: u64 = MAINNET_POSTED_SLOT + SLOT_BOUND;
    let on_bound = at(after(MAINNET_PUBLISHED, 7), BOUND);
    assert_eq!(knowable(&btc_campaign, &mut btc, on_bound), Ok(false));
    let past = at(after(MAINNET_PUBLISHED, 7), BOUND + 1);
    assert_eq!(
        knowable(&btc_campaign, &mut btc, past),
        refused(JoinPriceStale)
    );
}
