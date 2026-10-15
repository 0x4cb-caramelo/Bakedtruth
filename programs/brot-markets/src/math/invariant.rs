//! Purpose: the in-program assertion of TP section 3.4.13: the vault's lamport change across an
//!          instruction equals the change the bookkeeping makes. A lamport sent by hand to the vault
//!          never refuses a join (it is outside the instruction); a lamport the bookkeeping does not
//!          explain is refused (`InvariantViolated`).
//! Version: 0.0.4 (S-8: a `Split` snapshot's totals, then its fee and `distributable`, pinned to the campaign's books)
//! Sprint: 04 (contract freeze; called at the end of `user_open_campaign` and `user_join_campaign`;
//!         lane B adds `check_snapshot`, the sums of the settlement snapshot, called by finalize); 16 (lane S8)
//!
//! `booked_in` is every lamport the instruction moved into the vault, including the rent it funded
//! when it created the vault; `booked_out` is every lamport it moved out.

use super::snapshot::{Snapshot, SnapshotInput};
use crate::{
    constants::BPS_DENOMINATOR,
    error::BrotError,
    state::enums::{Outcome, SettleMode},
};

/// The campaign's own books at finalize, read from its fields apart from the snapshot's input (S-8): the stored
/// outcome, each pool with its late part inside it, the house fee rate copied at opening and the prize.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Books {
    pub outcome: Outcome,
    pub pool_yes: u64,
    pub pool_no: u64,
    pub late_yes: u64,
    pub late_no: u64,
    pub fee_bps: u16,
    pub prize: u64,
}

/// `vault_after − vault_before == booked_in − booked_out`, in `i128` with checked math.
pub fn vault_change_matches(
    vault_before: u64,
    vault_after: u64,
    booked_in: u64,
    booked_out: u64,
) -> Result<(), BrotError> {
    let change = i128::from(vault_after)
        .checked_sub(i128::from(vault_before))
        .ok_or(BrotError::MathOverflow)?;
    let booked = i128::from(booked_in)
        .checked_sub(i128::from(booked_out))
        .ok_or(BrotError::MathOverflow)?;
    if change == booked {
        Ok(())
    } else {
        Err(BrotError::InvariantViolated)
    }
}

/// The snapshot's own sums close (I3′, TP section 3.4.16). Money in the vault is
/// `yes + no + late + prize + opening`; the snapshot must share all of it out:
///
/// - `Split`: `distributable + creator share + Brot's share + late refunds` (`distributable` holds the
///   winners and their dust; Brot's share includes the opening fee); its two totals are the campaign's books
///   (`split_totals_are_the_books`), and its fee and `distributable` follow from them (`split_fee_is_the_rate`,
///   `split_distributable_closes`).
/// - `Refund`: every entry and late entry back whole, plus `to_opener` and `brot_keeps`.
/// - `OneSided`: the prize to the opener, the opening fee to Brot, nothing else booked. The one-sided
///   fees are taken per entry at settlement, so their sum is checked when the vault is closed, not here.
///
/// Field disagreements are `SnapshotInconsistent`; a sum that does not close is `InvariantViolated`.
pub fn check_snapshot(
    books: &Books,
    input: &SnapshotInput,
    snap: &Snapshot,
) -> Result<(), BrotError> {
    let late = add_all(&[u128::from(input.late_yes), u128::from(input.late_no)])?;
    let entries = add_all(&[u128::from(input.yes_total), u128::from(input.no_total)])?;
    let total_in = add_all(&[
        entries,
        late,
        u128::from(input.prize),
        u128::from(input.opening_fee),
    ])?;
    let from_fee = snap.creator_share_from_fee;
    if snap.from_pot.checked_add(from_fee) != Some(snap.creator_share)
        || from_fee > snap.fee_total
        || u128::from(snap.refunded_late) != late
        || (input.creator_is_team && snap.creator_share != 0)
    {
        return Err(BrotError::SnapshotInconsistent);
    }
    match snap.mode {
        SettleMode::Split => {
            split_totals_are_the_books(books, snap)?;
            let out = add_all(&[
                u128::from(snap.distributable),
                u128::from(snap.creator_share),
                u128::from(snap.brot_keeps),
                late,
            ])?;
            close(out == total_in)?;
            split_fee_is_the_rate(books, snap)?;
            split_distributable_closes(books, snap)
        }
        SettleMode::Refund => {
            let out = add_all(&[
                entries,
                late,
                u128::from(snap.to_opener),
                u128::from(snap.brot_keeps),
            ])?;
            close(out == total_in)
        }
        SettleMode::OneSided => {
            let shape = snap.to_opener == input.prize
                && snap.brot_keeps == input.opening_fee
                && snap.distributable == 0
                && snap.creator_share == 0
                && snap.fee_total == 0;
            if shape {
                Ok(())
            } else {
                Err(BrotError::SnapshotInconsistent)
            }
        }
        SettleMode::Unset => Err(BrotError::SnapshotInconsistent),
    }
}

/// S-8 (the third review): a `Split` snapshot's totals are the campaign's books, apart from the input the snapshot was
/// taken on. `winning_total` is the pool of the side the stored outcome names less its late part, `losing_total` the
/// other side's, each subtracted as `settlement/snapshot.rs` subtracts it. `settle_entry` pays `early × D ÷ V` and the
/// cap counts `distributable`, so both would pass a snapshot taken on other totals; it is refused here, before it is
/// stored (`SnapshotInconsistent`). A finalized campaign is never checked again, so this cannot freeze one.
fn split_totals_are_the_books(books: &Books, snap: &Snapshot) -> Result<(), BrotError> {
    let yes = books.pool_yes.checked_sub(books.late_yes);
    let no = books.pool_no.checked_sub(books.late_no);
    let booked = match books.outcome {
        Outcome::Yes => yes.zip(no),
        Outcome::No => no.zip(yes),
        Outcome::Unresolved | Outcome::Void => None,
    };
    // X0.9 snapshot_split_totals
    if booked != Some((snap.winning_total, snap.losing_total)) {
        return Err(BrotError::SnapshotInconsistent);
    }
    Ok(())
}

/// L-2 of the S-8 review: `fee_total` is Brot's fee on `losing_total` at the campaign's rate,
/// `⌈P × fee_bps ÷ 10,000⌉` (`math/fees.rs`), checked without a division: `P × fee_bps ≤ fee × 10,000 < P × fee_bps +
/// 10,000` (`SnapshotInconsistent`).
fn split_fee_is_the_rate(books: &Books, snap: &Snapshot) -> Result<(), BrotError> {
    let denominator = u128::from(BPS_DENOMINATOR);
    let due = u128::from(snap.losing_total)
        .checked_mul(u128::from(books.fee_bps))
        .ok_or(BrotError::MathOverflow)?;
    let charged = u128::from(snap.fee_total)
        .checked_mul(denominator)
        .ok_or(BrotError::MathOverflow)?;
    let ceiling = due
        .checked_add(denominator)
        .ok_or(BrotError::MathOverflow)?;
    // X0.9 snapshot_split_fee
    if charged < due || charged >= ceiling {
        return Err(BrotError::SnapshotInconsistent);
    }
    Ok(())
}

/// L-2 of the S-8 review: `distributable` is `math/payout.rs`'s `V + P − fee − from_pot + R`, with the stored fee and
/// `from_pot` and the campaign's prize, summed without a subtraction: `distributable + fee + from_pot = V + P + R`.
/// Brot's share is not stored (`collect_fee` takes it from `fee_total`), so a lamport moved from it into
/// `distributable` would close the sums above and leave the vault short at the end (`SnapshotInconsistent`).
fn split_distributable_closes(books: &Books, snap: &Snapshot) -> Result<(), BrotError> {
    let stored = add_all(&[
        u128::from(snap.distributable),
        u128::from(snap.fee_total),
        u128::from(snap.from_pot),
    ])?;
    let booked = add_all(&[
        u128::from(snap.winning_total),
        u128::from(snap.losing_total),
        u128::from(books.prize),
    ])?;
    // X0.9 snapshot_split_distributable
    if stored != booked {
        return Err(BrotError::SnapshotInconsistent);
    }
    Ok(())
}

/// The sum of `parts` in u128, refused if it overflows.
fn add_all(parts: &[u128]) -> Result<u128, BrotError> {
    parts.iter().try_fold(0u128, |sum, &part| {
        sum.checked_add(part).ok_or(BrotError::MathOverflow)
    })
}

fn close(holds: bool) -> Result<(), BrotError> {
    if holds {
        Ok(())
    } else {
        Err(BrotError::InvariantViolated)
    }
}
