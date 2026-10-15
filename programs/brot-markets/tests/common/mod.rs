//! Purpose: a small seeded generator for the math property tests (xorshift64*): fixed seeds,
//!          reproducible runs, no dependency; plus the checked u128 helpers the oracles use.
//! Version: 0.0.2 (`books`: the campaign books of a snapshot input, S-8)
//! Sprint: 02 (pot core on Pinocchio), lane C; 16 (lane S8)
//!
//! Each test crate uses a subset of these helpers, hence the `dead_code` allowance. A failing
//! case prints its seed and index; rerunning the test replays it exactly.

#![allow(dead_code)]

pub mod books;
pub mod pots;

/// How many random cases a property test draws.
pub const CASES: usize = 20_000;
/// The state a zero seed is replaced with: zero is the one state xorshift never leaves.
const NONZERO: u64 = 0x9E37_79B9_7F4A_7C15;

/// xorshift64* (Vigna): 64 bits of state, period 2^64 − 1. Enough for test inputs.
pub struct Rng(u64);

impl Rng {
    pub fn new(seed: u64) -> Self {
        Rng(if seed == 0 { NONZERO } else { seed })
    }

    pub fn next_u64(&mut self) -> u64 {
        let mut x = self.0;
        x ^= x.wrapping_shr(12);
        x ^= x.wrapping_shl(25);
        x ^= x.wrapping_shr(27);
        self.0 = x;
        x.wrapping_mul(0x2545_F491_4F6C_DD1D)
    }

    /// Uniform in `0..n`, by multiply-high; `n` must be positive.
    pub fn below(&mut self, n: u64) -> u64 {
        assert!(n > 0, "below(0)");
        let wide = mul(u128::from(self.next_u64()), u128::from(n));
        u64::try_from(wide.checked_shr(64).unwrap()).unwrap()
    }

    /// Uniform in `lo..=hi`.
    pub fn between(&mut self, lo: u64, hi: u64) -> u64 {
        assert!(lo <= hi, "between({lo}, {hi})");
        match hi.checked_sub(lo).unwrap().checked_add(1) {
            Some(span) => lo.checked_add(self.below(span)).unwrap(),
            None => self.next_u64(),
        }
    }

    /// Uniform in `lo..=hi`, signed.
    pub fn between_i64(&mut self, lo: i64, hi: i64) -> i64 {
        assert!(lo <= hi, "between_i64({lo}, {hi})");
        let span = i128::from(hi).checked_sub(i128::from(lo)).unwrap();
        let offset = self.between(0, u64::try_from(span).unwrap());
        let value = i128::from(lo).checked_add(i128::from(offset)).unwrap();
        i64::try_from(value).unwrap()
    }

    /// A value of up to `max_bits` bits, the bit length drawn uniformly, so tiny and huge
    /// amounts are equally common: that is where rounding and overflow live.
    pub fn bits(&mut self, max_bits: u32) -> u64 {
        assert!(max_bits <= 64);
        let bits = u32::try_from(self.between(0, u64::from(max_bits))).unwrap();
        let Some(top_bit) = bits.checked_sub(1) else {
            return 0;
        };
        let low = self
            .next_u64()
            .checked_shr(63_u32.checked_sub(top_bit).unwrap());
        low.unwrap() | 1_u64.checked_shl(top_bit).unwrap()
    }

    /// Like `bits`, but never 0.
    pub fn positive_bits(&mut self, max_bits: u32) -> u64 {
        self.bits(max_bits).max(1)
    }

    /// True once in `n` draws, on average.
    pub fn one_in(&mut self, n: u64) -> bool {
        self.below(n) == 0
    }

    /// A rate in bps, `0..=max`, with the two ends drawn more often than chance.
    pub fn bps(&mut self, max: u16) -> u16 {
        match self.below(8) {
            0 => 0,
            1 => max,
            _ => u16::try_from(self.between(0, u64::from(max))).unwrap(),
        }
    }

    /// `total` cut at up to `max_parts − 1` random points: positive parts that sum to `total`.
    pub fn split(&mut self, total: u64, max_parts: u64) -> Vec<u64> {
        let parts = self.between(1, max_parts);
        let mut cuts: Vec<u64> = (1..parts).map(|_| self.between(0, total)).collect();
        cuts.extend([0, total]);
        cuts.sort_unstable();
        let parts = cuts
            .windows(2)
            .map(|pair| pair[1].checked_sub(pair[0]).unwrap());
        parts.filter(|part| *part > 0).collect()
    }
}

// Checked arithmetic for the oracles, which run in u128 so they can never wrap in silence.

pub fn add(a: u128, b: u128) -> u128 {
    a.checked_add(b).expect("oracle add overflowed")
}

pub fn sub(a: u128, b: u128) -> u128 {
    a.checked_sub(b).expect("oracle sub underflowed")
}

pub fn mul(a: u128, b: u128) -> u128 {
    a.checked_mul(b).expect("oracle mul overflowed")
}

pub fn div(a: u128, b: u128) -> u128 {
    a.checked_div(b).expect("oracle div by zero")
}

/// `x` widened, for oracles.
pub fn w(x: u64) -> u128 {
    u128::from(x)
}

/// `ceil(a ÷ b)`, written apart from the program's own helper.
pub fn div_ceil(a: u128, b: u128) -> u128 {
    let floor = div(a, b);
    if a.checked_rem(b).expect("oracle rem by zero") == 0 {
        floor
    } else {
        add(floor, 1)
    }
}

/// The literal reading of D-g, kept only as a test oracle (proposal section 2.4.4): when the 1%
/// does not fit in `P − fee + R`, all of it moves to Brot's fee, capped at the fee; otherwise it
/// comes from the pot. Returns (what the creator receives, what the winners split).
pub fn literal_reading(v: u64, p: u64, r: u64, fee: u64, share_bps: u16) -> (u128, u128) {
    let share = div(mul(add(w(v), w(p)), u128::from(share_bps)), 10_000);
    let room = add(sub(w(p), w(fee)), w(r));
    let pot = add(w(v), room);
    if share > room {
        (share.min(w(fee)), pot)
    } else {
        (share, sub(pot, share))
    }
}
