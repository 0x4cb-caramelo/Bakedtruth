//! Purpose: the in-program assertion of TP section 3.4.13: the vault's lamport change across an
//!          instruction equals the change the bookkeeping makes. A lamport sent by hand to the vault
//!          never refuses a join (it is outside the instruction); a lamport the bookkeeping does not
//!          explain is refused (`InvariantViolated`).
//! Version: 0.0.2
//! Sprint: 04 (contract freeze; called at the end of `user_open_campaign` and `user_join_campaign`;
//!         lane B adds `check_snapshot`, the sums of the settlement snapshot, called by finalize)
//!
//! `booked_in` is every lamport the instruction moved into the vault, including the rent it funded
//! when it created the vault; `booked_out` is every lamport it moved out.

use super::snapshot::{Snapshot, SnapshotInput};
use crate::{error::BrotError, state::enums::SettleMode};

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
///   winners and their dust; Brot's share includes the opening fee).
/// - `Refund`: every entry and late entry back whole, plus `to_opener` and `brot_keeps`.
/// - `OneSided`: the prize to the opener, the opening fee to Brot, nothing else booked. The one-sided
///   fees are taken per entry at settlement, so their sum is checked when the vault is closed, not here.
///
/// Field disagreements are `SnapshotInconsistent`; a sum that does not close is `InvariantViolated`.
pub fn check_snapshot(input: &SnapshotInput, snap: &Snapshot) -> Result<(), BrotError> {
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
            let out = add_all(&[
                u128::from(snap.distributable),
                u128::from(snap.creator_share),
                u128::from(snap.brot_keeps),
                late,
            ])?;
            close(out == total_in)
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
