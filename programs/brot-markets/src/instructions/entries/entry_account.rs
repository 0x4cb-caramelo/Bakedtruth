//! Purpose: the baker's `Entry` at a join: created at its canonical PDA on the first join, rent
//!          paid by the baker, and checked against the campaign, the baker and the total the
//!          client signed on every later join (T10).
//! Version: 0.0.3
//! Sprint: 02 (pot core on Pinocchio), lane E; 04 (lane G: `read_joins`, the refund's reads)
//!
//! One `Entry` per baker and campaign holds both sides (Q3). Nothing here moves lamports besides
//! the rent of a new entry; the join deposits the entry itself and bookkeeps it.

use pinocchio::{account::RefMut, cpi::Seed, error::ProgramError, AccountView, Address};

use super::join_record::read_join;
use crate::{
    checks,
    constants::ENTRY_SEED,
    error::BrotError,
    layout::ZeroCopy,
    math::refund::Split,
    state::{self, entry::Entry},
};

/// The joins of one baker, read for the refund and the payout (lane G). `join_accounts` must be
/// every one of the baker's joins in index order: the k-th account is join `k`, so a join passed
/// twice or left out is `JoinAccountsMismatch`, and the sum of the joins must be the entry's
/// `entry_total` (`EntryTotalMismatch`). Each join is split at `publish_time` by side.
pub fn read_joins(
    join_accounts: &[AccountView],
    campaign: &Address,
    baker: &Address,
    join_count: u32,
    entry_total: u64,
    publish_time: i64,
    program_id: &Address,
) -> Result<Split, ProgramError> {
    if join_accounts.len() != usize::try_from(join_count).map_err(|_| BrotError::MathOverflow)? {
        return Err(BrotError::JoinAccountsMismatch.into());
    }
    let mut split = Split::default();
    for (position, account) in join_accounts.iter().enumerate() {
        let index = u32::try_from(position).map_err(|_| BrotError::MathOverflow)?;
        let record = read_join(account, campaign, baker, index, program_id)?;
        let join = crate::math::refund::Join {
            joined_at: record.joined_at,
            amount: record.amount,
        };
        split.add(record.yes, join, publish_time)?;
    }
    if split.total()? != entry_total {
        return Err(BrotError::EntryTotalMismatch.into());
    }
    Ok(split)
}

/// A later join: the program's `Entry` at `["entry", campaign, baker]`. The load re-derives that
/// address from this campaign and this baker, so another campaign's or another baker's entry
/// fails there as `PdaMismatch`; the stored keys are compared too (`EntryMismatch`), and the
/// entry's total must be the one the client signed (`EntryTotalMismatch`).
pub(super) fn load_entry<'a>(
    entry: &'a mut AccountView,
    campaign: &Address,
    baker: &Address,
    expected_total: u64,
    program_id: &Address,
) -> Result<RefMut<'a, Entry>, ProgramError> {
    let state = Entry::load_mut(entry, campaign, baker, program_id)?;
    if state.campaign != *campaign || state.baker != *baker {
        return Err(BrotError::EntryMismatch.into());
    }
    if state.total().ok_or(BrotError::MathOverflow)? != expected_total {
        return Err(BrotError::EntryTotalMismatch.into());
    }
    Ok(state)
}

/// The first join: the client must have signed a total of 0 (`EntryTotalMismatch`). The `Entry`
/// is created at the canonical PDA (`PdaMismatch` otherwise) with the baker paying its rent; an
/// address funded in advance is topped up instead (`checks::create_pda_account`). The new
/// account carries its tag, layout version, bump, campaign and baker; its amounts start at zero.
pub(super) fn create_entry<'a>(
    baker: &AccountView,
    entry: &'a mut AccountView,
    campaign: &Address,
    expected_total: u64,
    program_id: &Address,
) -> Result<RefMut<'a, Entry>, ProgramError> {
    if expected_total != 0 {
        return Err(BrotError::EntryTotalMismatch.into());
    }
    let baker_key = baker.address();
    let seeds: [&[u8]; 3] = [ENTRY_SEED, campaign.as_ref(), baker_key.as_ref()];
    let bump = checks::canonical_pda(entry, &seeds, program_id)?;
    let bump_seed = [bump];
    let signer_seeds = [
        Seed::from(ENTRY_SEED),
        Seed::from(campaign.as_array()),
        Seed::from(baker_key.as_array()),
        Seed::from(&bump_seed),
    ];
    checks::create_pda_account(baker, entry, Entry::LEN, program_id, &signer_seeds)?;
    let mut state = state::init::<Entry>(entry)?;
    state.bump = bump;
    state.campaign = *campaign;
    state.baker = *baker_key;
    Ok(state)
}
