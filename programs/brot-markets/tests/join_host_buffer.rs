//! Purpose: the proximity buffer at the join lock (question 7): the margin exactly, one unit inside
//!          and one unit outside, on both directions, and the one-unit floor of a tiny price.
//! Version: 0.0.1
//! Sprint: 04 (settlement and invariants), lane G

use brot_markets::{
    instructions::entries::join_rules::{buffer_refuses, JOIN_BUFFER_BPS},
    readers::{min_distance, price_touch::PriceReading},
    state::enums::Direction,
};

fn reading(price: i64, conf: u64) -> PriceReading {
    PriceReading {
        feed_id: [7; 32],
        price,
        conf,
        exponent: -8,
        publish_time: 1_000,
        posted_slot: 10,
    }
}

/// The margin the buffer uses at this price: 1% of it, rounded up (`min_distance`).
fn margin(price: i64) -> i128 {
    min_distance(i128::from(price), JOIN_BUFFER_BPS).expect("a positive price")
}

#[test]
fn the_margin_is_one_percent_of_the_price_rounded_up() {
    assert_eq!(JOIN_BUFFER_BPS, 100);
    assert_eq!(margin(100_000_000), 1_000_000);
    assert_eq!(margin(100_000_001), 1_000_001);
}

#[test]
fn an_above_edge_exactly_the_margin_from_the_target_is_outside_the_buffer() {
    let price = 100_000_000;
    let m = margin(price);
    let target = i128::from(price) + m;
    assert_eq!(
        buffer_refuses(&reading(price, 0), Direction::Above, target),
        Ok(false)
    );
}

#[test]
fn an_above_edge_one_unit_inside_the_margin_is_refused() {
    let price = 100_000_000;
    let target = i128::from(price) + margin(price) - 1;
    assert_eq!(
        buffer_refuses(&reading(price, 0), Direction::Above, target),
        Ok(true)
    );
}

#[test]
fn an_above_edge_one_unit_outside_the_margin_is_accepted() {
    let price = 100_000_000;
    let target = i128::from(price) + margin(price) + 1;
    assert_eq!(
        buffer_refuses(&reading(price, 0), Direction::Above, target),
        Ok(false)
    );
}

#[test]
fn the_above_edge_counts_the_confidence_band() {
    // The edge is price + conf: a band of 500 000 moves the edge into the buffer of a target that
    // the bare price would clear.
    let price = 100_000_000;
    let target = i128::from(price) + margin(price) + 1;
    assert_eq!(
        buffer_refuses(&reading(price, 0), Direction::Above, target),
        Ok(false)
    );
    assert_eq!(
        buffer_refuses(&reading(price, 500_000), Direction::Above, target),
        Ok(true)
    );
}

#[test]
fn a_below_edge_exactly_the_margin_from_the_target_is_outside_the_buffer() {
    let price = 100_000_000;
    let target = i128::from(price) - margin(price);
    assert_eq!(
        buffer_refuses(&reading(price, 0), Direction::Below, target),
        Ok(false)
    );
}

#[test]
fn a_below_edge_one_unit_inside_the_margin_is_refused() {
    let price = 100_000_000;
    let target = i128::from(price) - margin(price) + 1;
    assert_eq!(
        buffer_refuses(&reading(price, 0), Direction::Below, target),
        Ok(true)
    );
}

#[test]
fn a_below_edge_one_unit_outside_the_margin_is_accepted() {
    let price = 100_000_000;
    let target = i128::from(price) - margin(price) - 1;
    assert_eq!(
        buffer_refuses(&reading(price, 0), Direction::Below, target),
        Ok(false)
    );
}

#[test]
fn the_below_edge_counts_the_confidence_band() {
    let price = 100_000_000;
    let target = i128::from(price) - margin(price) - 1;
    assert_eq!(
        buffer_refuses(&reading(price, 0), Direction::Below, target),
        Ok(false)
    );
    assert_eq!(
        buffer_refuses(&reading(price, 500_000), Direction::Below, target),
        Ok(true)
    );
}

#[test]
fn a_tiny_price_still_keeps_one_unit_of_margin() {
    // 1% of 50 is 0.5, rounded up to one unit: a gap of 0 is inside, a gap of 1 is outside.
    assert_eq!(margin(50), 1);
    assert_eq!(
        buffer_refuses(&reading(50, 0), Direction::Above, 50),
        Ok(true)
    );
    assert_eq!(
        buffer_refuses(&reading(50, 0), Direction::Above, 51),
        Ok(false)
    );
}

#[test]
fn a_band_already_past_the_target_is_refused_by_the_buffer_too() {
    // The join lock refuses such a band first (`OutcomeKnowable`); the buffer also says no.
    assert_eq!(
        buffer_refuses(&reading(100, 0), Direction::Above, 50),
        Ok(true)
    );
    assert_eq!(
        buffer_refuses(&reading(100, 0), Direction::Below, 150),
        Ok(true)
    );
}
