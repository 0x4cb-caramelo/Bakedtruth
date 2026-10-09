//! Purpose: what the snapshot vector generator shares: the seeded generator, the amounts and rates it
//!          draws (zeros, values near `u64::MAX`, rates above 100%), and the printing of refusals and
//!          modes, so the rows read the same in every file.
//! Version: 0.0.1
//! Sprint: 05 (SDK and the devnet cycle)

pub mod other_rows;
pub mod snapshot_rows;

use brot_markets::{error::BrotError, state::enums::SettleMode};

/// The same 64-bit linear congruential generator as `math_vectors.rs`.
pub struct Lcg(pub u64);

impl Lcg {
    /// A value in `0..n` (`n` ≥ 1).
    pub fn below(&mut self, n: u64) -> u64 {
        self.0 = self
            .0
            .wrapping_mul(6_364_136_223_846_793_005)
            .wrapping_add(1_442_695_040_888_963_407);
        (self.0 >> 11).checked_rem(n).unwrap_or(0)
    }

    pub fn below_u16(&mut self, n: u64) -> u16 {
        u16::try_from(self.below(n)).unwrap_or(0)
    }

    /// True one time in `one_in`.
    pub fn coin(&mut self, one_in: u64) -> bool {
        self.below(one_in) == 0
    }

    /// An amount: usually up to 10^12 lamports, zero one time in six, near `u64::MAX` one in forty.
    pub fn amount(&mut self) -> u64 {
        if self.coin(6) {
            0
        } else if self.coin(40) {
            u64::MAX.saturating_sub(self.below(1_000_000))
        } else {
            self.below(1_000_000_000_000)
        }
    }

    /// An amount that is never zero.
    pub fn positive(&mut self) -> u64 {
        self.below(1_000_000_000_000).saturating_add(1)
    }

    /// A rate in bps: up to `max` usually, above 100% one time in fifty (a refusal).
    pub fn bps(&mut self, max: u64) -> u16 {
        if self.coin(50) {
            10_000u16
                .saturating_add(self.below_u16(500))
                .saturating_add(1)
        } else {
            self.below_u16(max.saturating_add(1))
        }
    }

    /// A small signed step, `-3..=3`, to land on either side of a threshold.
    pub fn step(&mut self) -> i128 {
        i128::from(self.below(7)).saturating_sub(3)
    }
}

/// A refusal, printed in place of the output.
pub fn err(error: BrotError) -> String {
    format!("ERR:{error:?}")
}

/// A settle mode by its variant name, as the TypeScript enum names it.
pub fn mode_name(mode: SettleMode) -> &'static str {
    match mode {
        SettleMode::Unset => "Unset",
        SettleMode::Split => "Split",
        SettleMode::OneSided => "OneSided",
        SettleMode::Refund => "Refund",
    }
}
