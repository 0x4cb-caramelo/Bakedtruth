//! Purpose: the baker's `Entry` at a join: created at its canonical PDA on the first join, rent
//!          paid by the baker, and checked against the campaign, the baker and the total the
//!          client signed on every later join (T10).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio), lane E
//!
//! One `Entry` per baker and campaign holds both sides (Q3). Nothing here moves lamports besides
//! the rent of a new entry; the join deposits the entry itself and bookkeeps it.

use pinocchio::{account::RefMut, cpi::Seed, error::ProgramError, AccountView, Address};

use crate::{
    checks,
    constants::ENTRY_SEED,
    error::BrotError,
    layout::ZeroCopy,
    state::{self, entry::Entry},
};

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
