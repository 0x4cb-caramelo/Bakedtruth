//! Purpose: a price campaign after its proof window on the host: NO from the sponsored account,
//!          the stale-feed void (D7) at `deadline − max(max_age, 600 s)` ± 1 s, an update after
//!          the deadline, the unreadable-account void (a changed exponent included); past the
//!          window the proof slot is not read.
//! Version: 0.0.2
//! Sprint: 03 (readers and resolution), lane C. The exact `StaleFeed` test [AC] is documented in
//!         programs/brot-markets/src/readers/price_touch/proof.rs.

mod opening_support;
mod price_support;

use brot_markets::{
    constants::STALE_FEED_MIN_SECONDS,
    readers::{Reading, Resolution},
    state::enums::{
        Direction::Above,
        VoidReason::{StaleFeed, UnreadableAccount},
    },
};
use opening_support::*;
use pinocchio::error::ProgramError;
use price_support::*;

/// The first second after the proof window.
const CLOSED: i64 = DEADLINE + 61;

type Resolved = Result<Resolution, ProgramError>;

fn above() -> Terms {
    Terms::btc(Above, ABOVE_TARGET)
}

/// Resolution of `terms` right after the window, the sponsored account changed by `update`.
fn closed(terms: Terms, update: Update) -> Resolved {
    let mut metric = account(BTC_ACCOUNT, BTC, update);
    resolve(&terms, &mut metric, ProofSlot::Missing, at(CLOSED, 0))
}

/// What the sponsored account reads as when published at `published`.
fn sponsored(published: i64) -> Reading {
    read(BTC_ACCOUNT, published, BTC_PRICE, BTC_POSTED_SLOT)
}

#[test]
fn a_feed_fresh_at_the_deadline_resolves_no() {
    let published = after(DEADLINE, -10);
    assert_eq!(
        closed(above(), Update::at(published)),
        no(sponsored(published))
    );
}

#[test]
fn a_feed_older_than_the_deadline_minus_the_stale_floor_voids_as_stale() {
    // The devnet max_age (120 s) is under the floor: the floor decides.
    let edge = after(DEADLINE, -i64::from(STALE_FEED_MIN_SECONDS));
    assert_eq!(closed(above(), Update::at(edge)), no(sponsored(edge)));
    let older = after(edge, -1);
    let voided = void(StaleFeed, sponsored(older));
    assert_eq!(closed(above(), Update::at(older)), voided);
}

#[test]
fn one_missed_heartbeat_near_max_age_is_not_a_stale_feed() {
    // Devnet publishes every 62 to 64 s; a campaign at the 30 s max_age floor read in an update
    // gap must still answer NO (Sprint 03 review).
    let floor = above().max_age(30);
    for gap in [31, 64, 128, 599] {
        let published = after(DEADLINE, -gap);
        assert_eq!(
            closed(floor, Update::at(published)),
            no(sponsored(published)),
            "{gap}"
        );
    }
}

#[test]
fn the_stale_test_follows_a_max_age_above_the_floor() {
    let long = above().max_age(3_600);
    let edge = after(DEADLINE, -3_600);
    assert_eq!(closed(long, Update::at(edge)), no(sponsored(edge)));
    let older = after(DEADLINE, -3_601);
    let voided = void(StaleFeed, sponsored(older));
    assert_eq!(closed(long, Update::at(older)), voided);
}

#[test]
fn an_update_at_or_after_the_deadline_records_no() {
    // In the deadline's own second the feed was fresh.
    assert_eq!(
        closed(above(), Update::at(DEADLINE)),
        no(sponsored(DEADLINE))
    );
    // After it, the last update before the deadline is out of sight: NO, which the team may void
    // within the review window from the indexer's feed history (TP section 3.4.6).
    let later = after(DEADLINE, 1);
    assert_eq!(closed(above(), Update::at(later)), no(sponsored(later)));
}

#[test]
fn publish_times_at_the_ends_of_i64_still_answer() {
    let far_ahead = closed(above(), Update::at(i64::MAX));
    assert_eq!(far_ahead, no(sponsored(i64::MAX)));
    let far_behind = closed(above(), Update::at(i64::MIN));
    assert_eq!(far_behind, void(StaleFeed, sponsored(i64::MIN)));
}

#[test]
fn an_unreadable_sponsored_account_voids_with_nothing_observed() {
    // Each account the reader refuses (owner, closed, partial, size, zeroed, another feed).
    let nothing = void(UnreadableAccount, read(BTC_ACCOUNT, 0, 0, 0));
    let fresh = Update::at(after(DEADLINE, -10));
    for (mut metric, error) in malformed(BTC_ACCOUNT, fresh) {
        let resolved = resolve(&above(), &mut metric, ProofSlot::Missing, at(CLOSED, 0));
        assert_eq!(resolved, nothing, "{error:?}");
    }
}

#[test]
fn past_the_window_the_proof_slot_is_not_read() {
    let published = after(DEADLINE, -10);
    let mut metric = account(BTC_ACCOUNT, BTC, Update::at(published));
    // A valid touch offered too late is not a YES...
    let touching = Update::at(DEADLINE).price(ABOVE_TARGET + BTC_CONF);
    let mut proof = account(PROOF_ACCOUNT, BTC, touching);
    let slot = ProofSlot::Account(&mut proof);
    let resolved = resolve(&above(), &mut metric, slot, at(CLOSED, 0));
    assert_eq!(resolved, no(sponsored(published)));
    // ...and an account that is no price at all is not an error.
    let mut garbage = HostAccount::new(PROOF_ACCOUNT, SYSTEM_PROGRAM, &[]);
    let slot = ProofSlot::Account(&mut garbage);
    let resolved = resolve(&above(), &mut metric, slot, at(CLOSED, 0));
    assert_eq!(resolved, no(sponsored(published)));
}

#[test]
fn past_the_window_a_changed_exponent_voids_as_unreadable() {
    // Every proof of the window was refused with `PriceExponentChanged`; the sponsored account
    // in another scale cannot record the NO nobody could contest (Sprint 03 review).
    let published = after(DEADLINE, -10);
    let rescaled = closed(above(), Update::at(published).exponent(-7));
    assert_eq!(rescaled, void(UnreadableAccount, sponsored(published)));
    // The exponent is checked before the stale test: the void reason is the exponent's.
    let older = after(DEADLINE, -601);
    let rescaled = closed(above(), Update::at(older).exponent(5));
    assert_eq!(rescaled, void(UnreadableAccount, sponsored(older)));
}

#[test]
fn past_the_window_the_posted_slot_is_not_compared() {
    // NO does not depend on the posted slot: an ancient one still answers.
    let published = after(DEADLINE, -10);
    let mut metric = account(BTC_ACCOUNT, BTC, Update::at(published).slot(0));
    let resolved = resolve(
        &above(),
        &mut metric,
        ProofSlot::Missing,
        at(CLOSED, u64::MAX),
    );
    assert_eq!(resolved, no(read(BTC_ACCOUNT, published, BTC_PRICE, 0)));
}

#[test]
fn the_window_closes_one_second_after_the_deadline_plus_sixty() {
    let published = after(DEADLINE, -10);
    let mut metric = account(BTC_ACCOUNT, BTC, Update::at(published));
    let last = at(after(DEADLINE, 60), 0);
    let open = resolve(&above(), &mut metric, ProofSlot::Missing, last);
    assert_eq!(open, Ok(Resolution::NotYet));
    let resolved = resolve(&above(), &mut metric, ProofSlot::Missing, at(CLOSED, 0));
    assert_eq!(resolved, no(sponsored(published)));
}

#[test]
fn campaigns_left_on_the_captured_accounts_are_voided_as_stale() {
    // Opened when the mainnet BTC/USD update was fresh; read again after the window, as captured.
    let deadline = after(MAINNET_PUBLISHED, 7 * 86_400);
    let terms = Terms::btc(Above, 9_027_122_500_000).window(MAINNET_PUBLISHED, deadline);
    let mut metric = account(BTC_ACCOUNT, BTC_MAINNET, Update::captured());
    let time = at(after(deadline, 61), 0);
    let resolved = resolve(&terms, &mut metric, ProofSlot::Missing, time);
    assert_eq!(resolved, void(StaleFeed, mainnet_btc(BTC_ACCOUNT)));
    // The devnet sponsored account as captured, for a campaign opened on it.
    let resolved = closed(above(), Update::captured());
    assert_eq!(resolved, void(StaleFeed, sponsored(PUBLISHED)));
}

#[test]
fn any_publish_time_and_clock_give_an_outcome_never_a_refusal() {
    for published in [i64::MIN, -1, 0, PUBLISHED, DEADLINE, i64::MAX] {
        let mut metric = account(BTC_ACCOUNT, BTC, Update::at(published));
        let end = at(i64::MAX, u64::MAX);
        let resolved = resolve(&above(), &mut metric, ProofSlot::Missing, end);
        assert!(
            matches!(resolved, Ok(Resolution::Decided(_))),
            "{published}: {resolved:?}"
        );
    }
}
