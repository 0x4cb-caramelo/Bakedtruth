//! Purpose: the settlement snapshot, the one pure function finalize calls to turn a campaign's
//!          totals and its verdict into what it stores: the mode, the house fee, the creator share,
//!          `distributable` and what Brot keeps (TP section 3.4.16; P-1, P-2, P-4, I12).
//! Version: 0.0.1
//! Sprint: 04 (lane B; called by `finalize_campaign`)
//!
//! Mode: a void, or a pot with no entry at all, is `Refund`; a pot with entries on one side only is
//! `OneSided`; otherwise `Split`. `Split` is the P-2 reading of D-g (`math/payout.rs`).
//!
//! The totals are without the late entries (refunded whole by `math/refund.rs`); the prize and the
//! opening fee are the campaign's own. Money in the vault at finalize is
//! `yes + no + late + prize + opening`, and the snapshot shares it out (`math/invariant.rs`).
//! The one-sided fees are not in the snapshot: each entry pays its own fee at settlement, so the
//! total is known only once every entry is settled (see the report of lane B).

use super::{
    fees::house_fee,
    payout::{creator_share, distributable},
    rounding::checked_bps,
    void::{kept_opening_return, void_return, VoidClass},
};
use crate::{error::BrotError, state::enums::SettleMode};

/// The verdict the snapshot is taken on. `Void` carries the class that decides the opening fee.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Verdict {
    Yes,
    No,
    Void(VoidClass),
}

/// Everything the snapshot needs. Amounts are lamports; the rates are basis points.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct SnapshotInput {
    pub verdict: Verdict,
    /// The YES side's total, without its late entries.
    pub yes_total: u64,
    /// The NO side's total, without its late entries.
    pub no_total: u64,
    /// The YES side's late entries, refunded whole.
    pub late_yes: u64,
    /// The NO side's late entries, refunded whole.
    pub late_no: u64,
    pub prize: u64,
    pub opening_fee: u64,
    pub fee_bps: u16,
    /// The stored one-sided rate. Checked here; the per-entry fees are taken at settlement.
    pub one_sided_fee_bps: u16,
    pub creator_share_bps: u16,
    /// A team campaign has no creator share (I12).
    pub creator_is_team: bool,
}

/// What finalize stores. `winning_total` and `losing_total` are zero for a void, which refunds
/// both sides from their entries.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Snapshot {
    pub mode: SettleMode,
    pub winning_total: u64,
    pub losing_total: u64,
    pub refunded_late: u64,
    /// Brot's house fee on the losing side (`Split` only).
    pub fee_total: u64,
    /// `from_pot + from_fee`: what the creator is owed.
    pub creator_share: u64,
    /// The part of the creator share that came from the fee.
    pub creator_share_from_fee: u64,
    /// The part of the creator share that came from the losing pot.
    pub from_pot: u64,
    /// What the winners split (`Split` only; the prize is inside it).
    pub distributable: u64,
    /// What Brot keeps outright: in `Split` the fee not given to the creator plus the opening fee.
    pub brot_keeps: u64,
    /// What the opener gets back: the prize, and the opening fee on a house failure.
    pub to_opener: u64,
}

fn zero(mode: SettleMode, late: u64) -> Snapshot {
    Snapshot {
        mode,
        winning_total: 0,
        losing_total: 0,
        refunded_late: late,
        fee_total: 0,
        creator_share: 0,
        creator_share_from_fee: 0,
        from_pot: 0,
        distributable: 0,
        brot_keeps: 0,
        to_opener: 0,
    }
}

/// The P-2 `Split`: the fee, the creator share and what the winners split.
fn split(
    input: &SnapshotInput,
    late: u64,
    winning: u64,
    losing: u64,
) -> Result<Snapshot, BrotError> {
    let fee = house_fee(losing, input.fee_bps)?;
    let share = if input.creator_is_team {
        None
    } else {
        Some(creator_share(
            winning,
            losing,
            input.prize,
            fee,
            input.creator_share_bps,
        )?)
    };
    let (from_pot, from_fee) = share.map_or((0, 0), |s| (s.from_pot, s.from_fee));
    let pool = distributable(winning, losing, input.prize, fee, from_pot)?;
    let house_fee_kept = fee.checked_sub(from_fee).ok_or(BrotError::MathOverflow)?;
    let brot_keeps = house_fee_kept
        .checked_add(input.opening_fee)
        .ok_or(BrotError::MathOverflow)?;
    Ok(Snapshot {
        winning_total: winning,
        losing_total: losing,
        fee_total: fee,
        creator_share: from_pot
            .checked_add(from_fee)
            .ok_or(BrotError::MathOverflow)?,
        creator_share_from_fee: from_fee,
        from_pot,
        distributable: pool,
        brot_keeps,
        refunded_late: late,
        ..zero(SettleMode::Split, late)
    })
}

/// The snapshot of one campaign at finalize. `MathOverflow` for a rate above 100% or an amount that
/// does not fit; the totals themselves are never refused (an empty side is `OneSided`, not an error).
pub fn snapshot(input: SnapshotInput) -> Result<Snapshot, BrotError> {
    checked_bps(input.fee_bps)?;
    checked_bps(input.one_sided_fee_bps)?;
    checked_bps(input.creator_share_bps)?;
    let late = input
        .late_yes
        .checked_add(input.late_no)
        .ok_or(BrotError::MathOverflow)?;
    let entries = input
        .yes_total
        .checked_add(input.no_total)
        .ok_or(BrotError::MathOverflow)?;
    if entries == 0 {
        return Ok(refund_with(
            SettleMode::Refund,
            late,
            kept_opening_return(input.prize, input.opening_fee),
        ));
    }
    let (winning, losing) = match input.verdict {
        Verdict::Yes => (input.yes_total, input.no_total),
        Verdict::No => (input.no_total, input.yes_total),
        Verdict::Void(class) => {
            let ret = void_return(class, input.prize, input.opening_fee)?;
            return Ok(refund_with(SettleMode::Refund, late, ret));
        }
    };
    if winning == 0 || losing == 0 {
        // One side only: the entries come back net of their one-sided fees; no share (P-1).
        let ret = kept_opening_return(input.prize, input.opening_fee);
        return Ok(Snapshot {
            winning_total: winning,
            losing_total: losing,
            ..refund_with(SettleMode::OneSided, late, ret)
        });
    }
    split(&input, late, winning, losing)
}

fn refund_with(mode: SettleMode, late: u64, ret: super::void::OpenerReturn) -> Snapshot {
    Snapshot {
        to_opener: ret.to_opener,
        brot_keeps: ret.brot_keeps,
        ..zero(mode, late)
    }
}
