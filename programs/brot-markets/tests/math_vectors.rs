//! Purpose: the committed math vectors (X0.3, the Rust half): 12,000 rows from a fixed seed over the
//!          house fee, the creator share, the distributable pot, the split payout, the one-sided fee
//!          and the opening conversion, each with its result or its refusal. Sprint 05's TypeScript
//!          replay reads the same file.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze, lane B)
//!
//! The test regenerates the rows and compares them with `tests/vectors/math-vectors.csv`, so the
//! file cannot drift from the code. `REGEN_MATH_VECTORS=1 cargo test ...` rewrites it.

use std::fmt::{Debug, Write as _};

use brot_markets::{
    error::BrotError,
    math::{
        fees::{house_fee, one_sided_fee},
        opening::{opening_paid_lamports, split_opening},
        payout::{creator_share, distributable, split_payout},
    },
};

const SEED: u64 = 0x5EED_0404;
const PATH: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/../../tests/vectors/math-vectors.csv"
);

/// A 64-bit linear congruential generator: small, fixed, and the same on every platform.
struct Lcg(u64);

impl Lcg {
    /// A value in `0..n` (`n` ≥ 1).
    fn below(&mut self, n: u64) -> u64 {
        self.0 = self
            .0
            .wrapping_mul(6_364_136_223_846_793_005)
            .wrapping_add(1_442_695_040_888_963_407);
        (self.0 >> 11).checked_rem(n).unwrap_or(0)
    }

    /// A value in `0..n` as a `u16`, for a basis-point input.
    fn below_u16(&mut self, n: u64) -> u16 {
        u16::try_from(self.below(n)).unwrap_or(0)
    }
}

/// The value, or `ERR:<refusal>`, so a refusal is part of the vector.
fn show<T: Debug>(result: Result<T, BrotError>) -> String {
    match result {
        Ok(value) => format!("{value:?}"),
        Err(error) => format!("ERR:{error:?}"),
    }
}

fn split_rows(rng: &mut Lcg, out: &mut String) {
    for _ in 0..6_000 {
        let winning = rng.below(1_000_000_000_000).checked_add(1).unwrap_or(1);
        let losing = rng.below(1_000_000_000_000).checked_add(1).unwrap_or(1);
        let prize = rng.below(10_000_000_000);
        let fee_bps = rng.below_u16(1_001);
        let creator_bps = rng.below_u16(101);
        let fee = house_fee(losing, fee_bps);
        let share = fee.and_then(|fee| creator_share(winning, losing, prize, fee, creator_bps));
        let dist = match (fee, share) {
            (Ok(fee), Ok(share)) => distributable(winning, losing, prize, fee, share.from_pot),
            (Err(error), _) | (_, Err(error)) => Err(error),
        };
        if let (Ok(fee), Ok(share), Ok(dist)) = (fee, share, dist) {
            // The rule's own bounds, checked on every row the generator writes.
            let base = u128::from(winning)
                .checked_add(u128::from(losing))
                .expect("bounded inputs");
            let cap = base
                .checked_mul(u128::from(creator_bps))
                .expect("bounded inputs")
                / 10_000;
            assert!(u128::from(share.from_pot) <= cap && share.from_fee <= fee);
            assert!(dist >= winning);
        }
        let _ = writeln!(
            out,
            "split,{winning};{losing};{prize};{fee_bps};{creator_bps},{};{};{}",
            show(fee),
            show(share.map(|s| (s.from_pot, s.from_fee))),
            show(dist),
        );
    }
}

fn payout_rows(rng: &mut Lcg, out: &mut String) {
    for _ in 0..2_000 {
        let winning = rng.below(1_000_000_000_000).checked_add(1).unwrap_or(1);
        // One row in four is an entry above its winning side: a refusal (`PayoutExceedsSnapshot`).
        let entry = if rng.below(4) == 0 {
            winning.saturating_add(rng.below(1_000))
        } else {
            rng.below(winning.saturating_add(1))
        };
        let dist = rng.below(2_000_000_000_000);
        let _ = writeln!(
            out,
            "payout,{entry};{dist};{winning},{}",
            show(split_payout(entry, dist, winning)),
        );
    }
}

fn one_sided_rows(rng: &mut Lcg, out: &mut String) {
    for _ in 0..2_000 {
        let entry = rng.below(1_000_000_000_000);
        // Up to 10,500 bps: rates above 10,000 are refusals.
        let bps = rng.below_u16(10_501);
        let first = rng.below(2) == 1;
        let _ = writeln!(
            out,
            "one_sided,{entry};{bps};{first},{}",
            show(one_sided_fee(entry, bps, first))
        );
    }
}

fn opening_rows(rng: &mut Lcg, out: &mut String) {
    for _ in 0..2_000 {
        let usd = rng.below(5_000).checked_add(1).unwrap_or(1);
        let price =
            i64::try_from(rng.below(1_000_000_000_000).checked_add(1).unwrap_or(1)).unwrap_or(1);
        let exponent = i32::try_from(rng.below(19))
            .unwrap_or(0)
            .checked_neg()
            .unwrap_or(0);
        let prize_bps = 9_000u16.saturating_add(rng.below_u16(1_001));
        let paid = opening_paid_lamports(usd, price, exponent);
        let split = paid.and_then(|paid| split_opening(paid, prize_bps));
        let _ = writeln!(
            out,
            "opening,{usd};{price};{exponent};{prize_bps},{}",
            show(split.map(|s| (s.paid, s.prize, s.fee))),
        );
    }
}

fn generate() -> String {
    let mut rng = Lcg(SEED);
    let mut out = String::from("kind,inputs,outputs\n");
    split_rows(&mut rng, &mut out);
    payout_rows(&mut rng, &mut out);
    one_sided_rows(&mut rng, &mut out);
    opening_rows(&mut rng, &mut out);
    out
}

#[test]
fn the_committed_vectors_are_the_code_s_output() {
    let generated = generate();
    assert!(
        generated.lines().count() > 10_000,
        "X0.3 needs at least 10,000 vectors"
    );
    if std::env::var_os("REGEN_MATH_VECTORS").is_some() {
        std::fs::write(PATH, &generated).expect("write the vectors");
    }
    let committed =
        std::fs::read_to_string(PATH).expect("tests/vectors/math-vectors.csv is committed");
    assert!(
        committed == generated,
        "the vectors drifted from the code; regenerate and review the diff"
    );
}
