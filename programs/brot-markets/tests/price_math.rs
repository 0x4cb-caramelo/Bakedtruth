//! Purpose: the price rules on extreme readings, on the host: a negative price, the largest
//!          confidence, exponents of +5 and −30, publish times and slots at the ends of their
//!          types. Every rule gives an answer or a refusal, never a panic, and none refuses a
//!          good price.
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane C

mod opening_support;
mod price_support;

use brot_markets::{
    error::BrotError::*,
    readers::{
        price_touch::{
            band_crosses_target, band_reaches_target, check_fresh_and_tight, check_target,
            posted_within, published_within, read_price_update, PriceReading, PriceRefusal,
        },
        CreationReading, Resolution,
    },
    state::enums::Direction::{self, Above, Below},
};
use opening_support::*;
use price_support::*;

const PRICES: [i64; 7] = [i64::MIN, -1_000_000, -1, 0, 1, 1_000_000, i64::MAX];
const CONFS: [u64; 4] = [0, 1, u64::MAX / 2, u64::MAX];
const TIMES: [i64; 5] = [i64::MIN, -1, 0, PUBLISHED, i64::MAX];
/// The price whose whole band (the fixture's confidence) reaches `ABOVE_TARGET`.
const TOUCH: i128 = ABOVE_TARGET + BTC_CONF;

fn reading(price: i64, conf: u64) -> PriceReading {
    let captured = read_price_update(&RECEIVER, BTC, &BTC_FEED).unwrap();
    PriceReading {
        price,
        conf,
        ..captured
    }
}

/// Rows 2 to 4 for a BTC/USD campaign on `metric` at `NOW` (slot 0).
fn open_btc(metric: &mut HostAccount, direction: Direction, target: i128) -> Opened {
    open(metric, &BTC_FEED, (direction, target), at(NOW, 0))
}

#[test]
fn every_rule_answers_any_reading_without_a_panic() {
    let targets = [
        i128::MIN,
        i128::from(i64::MIN),
        -1,
        0,
        1,
        i128::from(u64::MAX),
        i128::MAX,
    ];
    let readings = PRICES.map(|p| CONFS.map(|c| (p, c)));
    for (price, conf) in readings.into_iter().flatten() {
        let r = reading(price, conf);
        for (direction, target) in [Above, Below].iter().flat_map(|d| targets.map(|t| (*d, t))) {
            // The band tests widen to i128, where i64 ± u64 cannot overflow.
            assert!(band_reaches_target(&r, direction, target).is_ok());
            assert!(band_crosses_target(&r, direction, target).is_ok());
            assert_ne!(check_target(&r, direction, target), refused(MathOverflow));
        }
        for now in TIMES {
            match check_fresh_and_tight(&r, now, u32::MAX, u16::MAX) {
                Ok(()) => assert!(price > 0, "{price} at {now}"),
                Err(PriceRefusal::NonPositive) => assert!(price <= 0, "{price} at {now}"),
                Err(_) => {}
            }
        }
    }
}

#[test]
fn a_negative_price_is_refused_at_opening_and_as_a_proof() {
    let negative = reading(-1, 0);
    let checked = check_fresh_and_tight(&negative, PUBLISHED, 120, 50);
    assert_eq!(checked, Err(PriceRefusal::NonPositive));
    let mut metric = account(BTC_ACCOUNT, BTC, Update::captured().price(-1));
    let opened = open_btc(&mut metric, Below, 1_000);
    assert_eq!(opened, refused(PriceNonPositive));
    // A signed negative price would be across any `Below` target; it is refused as a proof in
    // both directions instead, with the same error as the opening (Sprint 03 review).
    let proof = || account(PROOF_ACCOUNT, BTC, Update::at(NOW).price(-1));
    let below = prove(Terms::btc(Below, BELOW_TARGET), proof(), at(NOW, 0));
    assert_eq!(below, refused(PriceNonPositive));
    let above = prove(Terms::btc(Above, ABOVE_TARGET), proof(), at(NOW, 0));
    assert_eq!(above, refused(PriceNonPositive));
}

#[test]
fn the_largest_confidence_never_proves_and_never_opens() {
    let wide = reading(i64::MAX, u64::MAX);
    let checked = check_fresh_and_tight(&wide, PUBLISHED, 120, 50);
    assert_eq!(checked, Err(PriceRefusal::ConfidenceTooWide));
    // The band covers every target row 3 lets the price name: touched at opening, never across.
    for (direction, target) in [
        (Above, 1),
        (Above, i128::from(i64::MAX)),
        (Below, 922_337_203_685_477_581),
        (Below, i128::from(i64::MAX)),
    ] {
        let row_3 = check_target(&wide, direction, target);
        assert_eq!(row_3, refused(TargetAlreadyTouched), "{target}");
        assert_eq!(band_crosses_target(&wide, direction, target), Ok(false));
    }
    let proof = account(PROOF_ACCOUNT, BTC, Update::at(NOW).conf(u64::MAX));
    let resolved = prove(Terms::btc(Below, BELOW_TARGET), proof, at(NOW, 0));
    assert_eq!(resolved, refused(ProofDoesNotTouch));
}

#[test]
fn an_exponent_of_plus_five_or_minus_thirty_is_kept_and_compared() {
    for exponent in [5, -30] {
        // The opening stores whatever scale the feed publishes in...
        let mut metric = account(BTC_ACCOUNT, BTC, Update::captured().exponent(exponent));
        let stored = Ok(CreationReading {
            price_exponent: exponent,
        });
        assert_eq!(open_btc(&mut metric, Above, ABOVE_TARGET), stored);
        // ...and every later read must be in that same scale.
        let terms = Terms::btc(Above, ABOVE_TARGET).exponent(exponent);
        assert_eq!(knowable(&terms, &mut metric, at(NOW, 0)), Ok(false));
        let touch = Update::at(NOW).price(TOUCH).exponent(exponent);
        let reading = read(PROOF_ACCOUNT, NOW, TOUCH, BTC_POSTED_SLOT);
        let proved = prove(terms, account(PROOF_ACCOUNT, BTC, touch), at(NOW, 0));
        assert_eq!(proved, yes(reading), "{exponent}");
        let joined = knowable(&terms, &mut btc_account(|_| ()), at(NOW, 0));
        assert_eq!(joined, refused(PriceExponentChanged));
        let usual_proof = account(PROOF_ACCOUNT, BTC, touch.exponent(-8));
        let proved = prove(terms, usual_proof, at(NOW, 0));
        assert_eq!(proved, refused(PriceExponentChanged));
    }
}

#[test]
fn publish_times_at_the_ends_of_i64_give_an_answer() {
    let cases = [
        (i64::MIN, i64::MAX, u32::MAX, false),
        (i64::MAX, i64::MIN, u32::MAX, false),
        (i64::MAX, i64::MAX, 0, true),
        (i64::MIN, i64::MIN, 0, true),
        (i64::MAX, PUBLISHED, u32::MAX, false),
    ];
    for (published, now, max_age, fresh) in cases {
        let at_time = PriceReading {
            publish_time: published,
            ..reading(1, 0)
        };
        let answer = published_within(&at_time, now, max_age);
        assert_eq!(answer, fresh, "{published} at {now}");
    }
    // A price stamped far ahead never stays fresh; one far behind never was.
    for published in [i64::MIN, i64::MAX] {
        let mut metric = account(BTC_ACCOUNT, BTC, Update::at(published));
        let joined = knowable(&Terms::btc(Above, ABOVE_TARGET), &mut metric, at(NOW, 0));
        assert_eq!(joined, refused(JoinPriceStale));
        let opened = open_btc(&mut metric, Above, ABOVE_TARGET);
        assert_eq!(opened, refused(PriceStale));
    }
    // A campaign whose window spans all of i64 still resolves at its ends.
    let endless = Terms::btc(Above, ABOVE_TARGET).window(i64::MIN, i64::MAX);
    let proof = account(PROOF_ACCOUNT, BTC, Update::at(i64::MAX).price(TOUCH));
    let proved = prove(endless, proof, at(i64::MAX, 0));
    let last = read(PROOF_ACCOUNT, i64::MAX, TOUCH, BTC_POSTED_SLOT);
    assert_eq!(proved, yes(last));
    let mut metric = btc_account(|_| ());
    let waiting = resolve(&endless, &mut metric, ProofSlot::Missing, at(i64::MIN, 0));
    assert_eq!(waiting, Ok(Resolution::NotYet));
}

#[test]
fn slots_at_the_ends_of_u64_give_an_answer() {
    let posted = |slot: u64| PriceReading {
        posted_slot: slot,
        ..reading(1, 0)
    };
    // u32::MAX seconds is 42,949,672,950 slots of 100 ms.
    const WIDEST: u64 = 42_949_672_950;
    assert!(posted_within(&posted(0), WIDEST, u32::MAX));
    assert!(!posted_within(&posted(0), WIDEST + 1, u32::MAX));
    assert!(!posted_within(&posted(0), u64::MAX, u32::MAX));
    assert!(posted_within(&posted(u64::MAX), 0, 0));
    assert!(posted_within(&posted(5), 5, 0));
    assert!(!posted_within(&posted(5), 6, 0));
}
