//! Purpose: the cap on a campaign's payouts from its own snapshot (F4 of the pre-freeze review; I3′, I4, I5): what
//!          `paid_out_total` may reach, with the one-sided fees taken on the way, before a payout instruction ends.
//!          `VaultWatch::check` asserts it at the end of every instruction that pays from a campaign's vault.
//! Version: 0.0.1
//! Sprint: 16 (lane L16P, the review's follow-ups)
//!
//! The bound is what the snapshot shares out to the entries and the creator, so no settlement the program produces
//! can reach past it (the exact sums are `math/snapshot.rs`'s and `settlement/rules.rs`'s):
//! - `Split`: each winner gets `floor(early × distributable ÷ V)` and the early winning parts add up to V, so the
//!   winners share at most `distributable`; every late part comes back whole (`late_yes + late_no`); the creator is
//!   paid `creator_share` once, from the losing pot and from the fee. No one-sided fee is taken.
//! - `OneSided`: each entry gets its early part less its fee, plus its late part, and the fee stays in the vault:
//!   payouts and fees add up to both pools exactly. No creator share (I12).
//! - `Refund`: each entry back whole: both pools. No fee, no creator share.
//!
//! The prize, Brot's fee and the opening fee leave through their own flags (`settle_prize`, `collect_fee`), and a
//! reserved creator share left to `close_campaign` is in `creator_share`: none of them is in `paid_out_total`.

use crate::{
    error::BrotError,
    state::{campaign::Campaign, enums::SettleMode},
};

/// The most `paid_out_total + one_sided_fees` can reach under the campaign's snapshot (module documentation).
pub fn payout_cap(c: &Campaign) -> Result<u64, BrotError> {
    let cap = match SettleMode::try_from(c.settle_mode)? {
        SettleMode::Split => [c.late_yes.get(), c.late_no.get(), c.creator_share.get()]
            .iter()
            .try_fold(c.distributable.get(), |sum, &part| sum.checked_add(part)),
        SettleMode::OneSided | SettleMode::Refund => c.pool_yes.get().checked_add(c.pool_no.get()),
        SettleMode::Unset => return Err(BrotError::NotFinalized),
    };
    cap.ok_or(BrotError::MathOverflow)
}

/// The campaign's payouts so far, with the one-sided fees taken on the way, are within `payout_cap`
/// (`PaidOutAboveSnapshot`).
pub fn require_within_snapshot(c: &Campaign) -> Result<(), BrotError> {
    let paid = c
        .paid_out_total
        .get()
        .checked_add(c.one_sided_fees.get())
        .ok_or(BrotError::MathOverflow)?;
    let cap = payout_cap(c)?;
    // X0.9 paid_out_within_snapshot
    if paid > cap {
        return Err(BrotError::PaidOutAboveSnapshot);
    }
    Ok(())
}
