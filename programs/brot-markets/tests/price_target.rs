//! Purpose: row 3 of TP section 3.4.10 for the price kind, at both ends, on the host: a target
//!          already touched, too close to the band or out of reach is refused with its own error,
//!          through `readers::validate_at_creation` on the captured accounts and through
//!          `check_target` across price magnitudes; each bound itself opens.
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane C. Until this sprint only the near end existed, and a
//!         `Below` target of 1 opened.

mod opening_support;
mod price_support;

use brot_markets::{
    error::BrotError::{self, *},
    readers::price_touch::{check_target, read_price_update, PriceReading},
    state::enums::Direction::{self, Above, Below},
};
use opening_support::*;
use price_support::*;

/// The devnet BTC/USD fixture's bounds (price 8,521,233,806,870, confidence 774,205,661, 1% is
/// 85,212,338,069 rounded up): the band's edges, the nearest targets 1% past them, the far ones.
const ABOVE_EDGE: i128 = 8_522_008_012_531;
const ABOVE_NEAREST: i128 = 8_607_220_350_600;
const ABOVE_FARTHEST: i128 = 85_212_338_068_700;
const BELOW_EDGE: i128 = 8_520_459_601_209;
const BELOW_NEAREST: i128 = 8_435_247_263_140;
const BELOW_FARTHEST: i128 = 852_123_380_687;

/// A BTC/USD campaign on the devnet sponsored account, fresh at `NOW`.
fn btc(direction: Direction, target: i128) -> Opened {
    let mut metric = btc_account(|_| ());
    open(&mut metric, &BTC_FEED, (direction, target), at(NOW, 0))
}

#[test]
fn a_target_touched_too_close_or_out_of_reach_is_refused_at_both_ends() {
    let refusals: [(Direction, i128, BrotError); 11] = [
        (Above, ABOVE_EDGE, TargetAlreadyTouched),
        (Above, 1, TargetAlreadyTouched),
        (Above, ABOVE_EDGE + 1, TargetTooClose),
        (Above, ABOVE_NEAREST - 1, TargetTooClose),
        (Above, ABOVE_FARTHEST + 1, TargetUnreachable),
        (Above, i128::MAX, TargetUnreachable),
        (Below, BELOW_EDGE, TargetAlreadyTouched),
        (Below, ABOVE_TARGET, TargetAlreadyTouched),
        (Below, BELOW_EDGE - 1, TargetTooClose),
        (Below, BELOW_NEAREST + 1, TargetTooClose),
        (Below, BELOW_FARTHEST - 1, TargetUnreachable),
    ];
    for (direction, target, error) in refusals {
        assert_eq!(
            btc(direction, target),
            refused(error),
            "{direction:?} {target}"
        );
    }
}

#[test]
fn each_bound_itself_opens() {
    let bounds = [
        (Above, ABOVE_NEAREST),
        (Above, ABOVE_FARTHEST),
        (Below, BELOW_NEAREST),
        (Below, BELOW_FARTHEST),
    ];
    for (direction, target) in bounds {
        assert_eq!(btc(direction, target), OPENED, "{direction:?} {target}");
    }
}

#[test]
fn a_below_target_at_or_under_zero_never_opens() {
    // Until Sprint 03 a `Below` target of 1 opened: no realistic move decides it.
    for target in [1, 0, -1, i128::MIN] {
        assert_eq!(btc(Below, target), refused(TargetUnreachable), "{target}");
    }
}

#[test]
fn the_far_bound_of_below_rounds_up_so_it_stays_within_tenfold() {
    // SOL/USD 11,921,844,516 / 10 is 1,192,184,451.6: 1,192,184,452 opens, one less is too far.
    let mut sol = sol_account(|_| ());
    let time = at(NOW, 0);
    let on_bound = open(&mut sol, &SOL_FEED, (Below, 1_192_184_452), time);
    assert_eq!(on_bound, OPENED);
    let past = open(&mut sol, &SOL_FEED, (Below, 1_192_184_451), time);
    assert_eq!(past, refused(TargetUnreachable));
}

#[test]
fn the_mainnet_accounts_bound_their_targets_as_captured() {
    // 82,064.75 US$ ± 28.05: the band reaches 82,092.80; 1% of the price is 820.6475.
    let time = at(after(MAINNET_PUBLISHED, 7), 0);
    let mut metric = account(BTC_ACCOUNT, BTC_MAINNET, Update::captured());
    let mut mainnet = |aim: (Direction, i128)| open(&mut metric, &BTC_FEED, aim, time);
    let cases: [(Direction, i128, Opened); 8] = [
        (Above, 8_209_280_000_000, refused(TargetAlreadyTouched)),
        (Above, 8_291_344_749_999, refused(TargetTooClose)),
        (Above, 8_291_344_750_000, OPENED),
        (Above, 82_064_750_000_001, refused(TargetUnreachable)),
        (Below, 8_121_605_250_001, refused(TargetTooClose)),
        (Below, 8_121_605_250_000, OPENED),
        (Below, 820_647_500_000, OPENED),
        (Below, 820_647_499_999, refused(TargetUnreachable)),
    ];
    for (direction, target, expected) in cases {
        assert_eq!(
            mainnet((direction, target)),
            expected,
            "{direction:?} {target}"
        );
    }
}

#[test]
fn each_bound_opens_across_price_magnitudes() {
    let prices = [
        1,
        7,
        10,
        15,
        99,
        100,
        101,
        12_345,
        11_921_844_516,
        i64::MAX / 10,
        i64::MAX,
    ];
    for price in prices {
        let p = i128::from(price);
        // The widest confidence row 4 lets through (0.5%), and none.
        let widest = u64::try_from(p.checked_mul(50).unwrap() / 10_000).unwrap();
        for conf in [0, widest] {
            check_magnitude(price, conf);
        }
    }
}

/// Row 3's bounds for `price` and `conf`, worked out here independently of the program.
fn check_magnitude(price: i64, conf: u64) {
    let reading = PriceReading {
        price,
        conf,
        ..read_price_update(&RECEIVER, BTC, &BTC_FEED).unwrap()
    };
    let row_3 = |direction: Direction, target: i128| check_target(&reading, direction, target);
    let (p, c) = (i128::from(price), i128::from(conf));
    let d = (p.checked_mul(100).unwrap().checked_add(9_999).unwrap() / 10_000).max(1);
    let band = c.checked_add(d).unwrap();
    // One unit nearer than the nearest bound is too close, or touched when the distance is 1.
    let near_miss = if d > 1 {
        TargetTooClose
    } else {
        TargetAlreadyTouched
    };
    let case = format!("{price} ± {conf}");
    // `Above`: from price + conf + d to price × 10.
    let (nearest, farthest) = (p.checked_add(band).unwrap(), p.checked_mul(10).unwrap());
    assert_eq!(row_3(Above, nearest), Ok(()), "{case}");
    assert_eq!(row_3(Above, farthest), Ok(()), "{case}");
    let past = row_3(Above, farthest.checked_add(1).unwrap());
    assert_eq!(past, refused(TargetUnreachable), "{case}");
    let short = row_3(Above, nearest.checked_sub(1).unwrap());
    assert_eq!(short, refused(near_miss), "{case}");
    // `Below`: from ceil(price / 10) to price − conf − d, when that range is not empty.
    let (farthest, nearest) = (p.checked_add(9).unwrap() / 10, p.checked_sub(band).unwrap());
    if farthest > nearest {
        assert!(
            row_3(Below, farthest).is_err(),
            "{case}: no `Below` target exists"
        );
        return;
    }
    assert_eq!(row_3(Below, farthest), Ok(()), "{case}");
    assert_eq!(row_3(Below, nearest), Ok(()), "{case}");
    let past = row_3(Below, farthest.checked_sub(1).unwrap());
    assert_eq!(past, refused(TargetUnreachable), "{case}");
    let short = row_3(Below, nearest.checked_add(1).unwrap());
    assert_eq!(short, refused(near_miss), "{case}");
}
