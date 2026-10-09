//! Purpose: a price campaign's YES proof on the host: `readers::try_resolve` up to the deadline
//!          plus 60 s, the proof at any address, each refusal with its own error (a non-positive
//!          price among them), the window, the 60 s age, the clock lead and the posted-slot bound
//!          at their edges, and the crossing of the target at equality in both directions.
//! Version: 0.0.2
//! Sprint: 03 (readers and resolution), lane C. `resolve_campaign` (lane D) runs the proof in
//!         LiteSVM after the SBF build (tests/brot/price-proof.test.ts).

mod opening_support;
mod price_support;

use brot_markets::{
    error::BrotError::*,
    readers::Resolution,
    state::enums::Direction::{Above, Below},
};
use opening_support::*;
use pinocchio::error::ProgramError;
use price_support::*;

/// The lowest price whose whole band (the fixture's confidence) reaches `ABOVE_TARGET`, and the
/// highest whose whole band reaches `BELOW_TARGET`.
const TOUCH: i128 = ABOVE_TARGET + BTC_CONF;
const TOUCH_BELOW: i128 = BELOW_TARGET - BTC_CONF;
/// A day into the campaign, inside the window.
const DAY_ONE: i64 = OPENS_AT + 86_400;

type Resolved = Result<Resolution, ProgramError>;

/// The `Above` campaign at `clock` (slot 0), offered a BTC/USD update at `PROOF_ACCOUNT`.
fn prove_above(update: Update, clock: i64) -> Resolved {
    let proof = account(PROOF_ACCOUNT, BTC, update);
    prove(Terms::btc(Above, ABOVE_TARGET), proof, at(clock, 0))
}

/// A touching update published at `published`.
fn touch(published: i64) -> Update {
    Update::at(published).price(TOUCH)
}

/// A YES read from `PROOF_ACCOUNT`, with the fixture's posted slot.
fn yes_at(published: i64, price: i128) -> Resolved {
    yes(read(PROOF_ACCOUNT, published, price, BTC_POSTED_SLOT))
}

/// No proof at all, at `clock`.
fn without_proof(clock: i64) -> Resolved {
    let terms = Terms::btc(Above, ABOVE_TARGET);
    resolve(
        &terms,
        &mut btc_account(|_| ()),
        ProofSlot::Missing,
        at(clock, 0),
    )
}

#[test]
fn a_proof_at_any_address_inside_the_window_resolves_yes() {
    let published = after(DAY_ONE, -10);
    let proved = prove_above(touch(published), DAY_ONE);
    assert_eq!(proved, yes_at(published, TOUCH));
}

#[test]
fn the_sponsored_account_itself_can_be_the_proof() {
    let published = after(DAY_ONE, -10);
    let mut metric = account(BTC_ACCOUNT, BTC, touch(published));
    let terms = Terms::btc(Above, ABOVE_TARGET);
    let proved = resolve(&terms, &mut metric, ProofSlot::Metric, at(DAY_ONE, 0));
    assert_eq!(
        proved,
        yes(read(BTC_ACCOUNT, published, TOUCH, BTC_POSTED_SLOT))
    );
}

#[test]
fn without_a_proof_nothing_is_recorded_until_the_window_closes() {
    for clock in [OPENS_AT, DAY_ONE, DEADLINE, after(DEADLINE, 60)] {
        assert_eq!(without_proof(clock), Ok(Resolution::NotYet), "at {clock}");
    }
    // One second later the sponsored account decides.
    let closed = without_proof(after(DEADLINE, 61));
    assert!(matches!(closed, Ok(Resolution::Decided(_))), "{closed:?}");
}

#[test]
fn the_window_runs_from_opens_at_to_the_deadline_both_included() {
    let (early, late) = (after(OPENS_AT, 10), after(DEADLINE, 30));
    let before = prove_above(touch(after(OPENS_AT, -1)), early);
    assert_eq!(before, refused(ProofOutsideWindow));
    assert_eq!(prove_above(touch(OPENS_AT), early), yes_at(OPENS_AT, TOUCH));
    let past = prove_above(touch(after(DEADLINE, 1)), late);
    assert_eq!(past, refused(ProofOutsideWindow));
    assert_eq!(prove_above(touch(DEADLINE), late), yes_at(DEADLINE, TOUCH));
    // The last YES there can be: the deadline's own second, proven 60 s later.
    let last = prove_above(touch(DEADLINE), after(DEADLINE, 60));
    assert_eq!(last, yes_at(DEADLINE, TOUCH));
}

#[test]
fn a_proof_sixty_seconds_old_counts_and_sixty_one_does_not() {
    let sixty = after(DAY_ONE, -60);
    assert_eq!(prove_above(touch(sixty), DAY_ONE), yes_at(sixty, TOUCH));
    let older = prove_above(touch(after(DAY_ONE, -61)), DAY_ONE);
    assert_eq!(older, refused(ProofStale));
    // Why NO can wait: at D + 60 a touch one second before the deadline is already too old.
    let closing = prove_above(touch(after(DEADLINE, -1)), after(DEADLINE, 60));
    assert_eq!(closing, refused(ProofStale));
}

#[test]
fn a_proof_up_to_sixty_seconds_ahead_of_the_clock_counts_and_no_more() {
    let ahead = after(DAY_ONE, 60);
    assert_eq!(prove_above(touch(ahead), DAY_ONE), yes_at(ahead, TOUCH));
    let further = prove_above(touch(after(DAY_ONE, 61)), DAY_ONE);
    assert_eq!(further, refused(ProofStale));
}

#[test]
fn the_proof_must_be_posted_within_six_hundred_slots() {
    // 60 s at the shortest slot (100 ms) is 600 slots; a slot ahead of the clock counts as now.
    let terms = Terms::btc(Above, ABOVE_TARGET);
    let posted = |slot: u64| account(PROOF_ACCOUNT, BTC, touch(DAY_ONE).slot(slot));
    let time = at(DAY_ONE, 10_000);
    for slot in [9_400, 10_005] {
        let proved = prove(terms, posted(slot), time);
        assert_eq!(proved, yes(read(PROOF_ACCOUNT, DAY_ONE, TOUCH, slot)));
    }
    assert_eq!(prove(terms, posted(9_399), time), refused(ProofStale));
}

#[test]
fn the_whole_band_must_reach_the_target_in_either_direction() {
    let not_touching = refused(ProofDoesNotTouch);
    let price = |price: i128| Update::at(DAY_ONE).price(price);
    assert_eq!(prove_above(price(TOUCH - 1), DAY_ONE), not_touching);
    // The price itself on the target, its band reaching across: not a proof.
    assert_eq!(prove_above(price(ABOVE_TARGET), DAY_ONE), not_touching);
    let below = Terms::btc(Below, BELOW_TARGET);
    let proof = |price: i128| account(PROOF_ACCOUNT, BTC, Update::at(DAY_ONE).price(price));
    let proved = prove(below, proof(TOUCH_BELOW), at(DAY_ONE, 0));
    assert_eq!(proved, yes_at(DAY_ONE, TOUCH_BELOW));
    let over = prove(below, proof(TOUCH_BELOW + 1), at(DAY_ONE, 0));
    assert_eq!(over, not_touching);
}

#[test]
fn the_reader_refuses_a_proof_that_is_not_a_full_update_of_the_feed() {
    // Each malformed copy of a touching update, the last a real update of another feed.
    for (proof, error) in malformed(PROOF_ACCOUNT, touch(DAY_ONE)) {
        let proved = prove(Terms::btc(Above, ABOVE_TARGET), proof, at(DAY_ONE, 0));
        assert_eq!(proved, refused(error), "{error:?}");
    }
}

#[test]
fn a_zero_or_negative_price_is_no_proof_in_either_direction() {
    // A `Below` campaign is the one such a price would otherwise prove (Sprint 03 review).
    let below = Terms::btc(Below, BELOW_TARGET);
    for price in [0, -1, i128::from(i64::MIN)] {
        let proof = account(PROOF_ACCOUNT, BTC, Update::at(DAY_ONE).price(price));
        let proved = prove(below, proof, at(DAY_ONE, 0));
        assert_eq!(proved, refused(PriceNonPositive), "{price}");
        let proved = prove_above(Update::at(DAY_ONE).price(price), DAY_ONE);
        assert_eq!(proved, refused(PriceNonPositive), "{price}");
    }
}

#[test]
fn the_refusals_come_in_order_scale_sign_window_age_touch() {
    // Another exponent, published long before the window: the scale is named first.
    let rescaled = prove_above(touch(0).exponent(-7), DAY_ONE);
    assert_eq!(rescaled, refused(PriceExponentChanged));
    // A zero price outside the window: the sign before the window.
    let zero = prove_above(Update::at(0).price(0), DAY_ONE);
    assert_eq!(zero, refused(PriceNonPositive));
    // Outside the window and too old: the window. Too old and not touching: the age.
    let before = prove_above(touch(after(OPENS_AT, -1)), DAY_ONE);
    assert_eq!(before, refused(ProofOutsideWindow));
    let old = prove_above(Update::at(after(DAY_ONE, -61)), DAY_ONE);
    assert_eq!(old, refused(ProofStale));
}

#[test]
fn the_captured_mainnet_update_proves_a_below_campaign_at_any_address() {
    // Opened on the devnet price (85,212.34 US$) towards 83,000 US$; the mainnet update, three and
    // a half days later, reads 82,064.75 US$ ± 28.05: its whole band is under the target.
    let below = Terms::btc(Below, 8_300_000_000_000);
    let captured = || account(PROOF_ACCOUNT, BTC_MAINNET, Update::captured());
    let time = at(after(MAINNET_PUBLISHED, 30), 0);
    assert_eq!(
        prove(below, captured(), time),
        yes(mainnet_btc(PROOF_ACCOUNT))
    );
    // The same bytes do not prove an `Above` campaign.
    let above = Terms::btc(Above, ABOVE_TARGET);
    assert_eq!(prove(above, captured(), time), refused(ProofDoesNotTouch));
}
