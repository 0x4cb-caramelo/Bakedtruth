//! Purpose: the loaders of `Campaign`: the one place that re-derives a campaign's address from its
//!          stored id, after the slot, owner and length checks, before any field is read.
//! Version: 0.0.1
//! Sprint: 04 (split out of `campaign.rs` to make room)

use pinocchio::{
    account::{Ref, RefMut},
    error::ProgramError,
    AccountView, Address,
};

use super::Campaign;
use crate::constants::CAMPAIGN_SEED;

impl Campaign {
    /// Loads a campaign for reading; the address is re-derived from `id` and compared.
    pub fn load<'a>(
        account: &'a AccountView,
        id: u64,
        program_id: &Address,
    ) -> Result<Ref<'a, Self>, ProgramError> {
        crate::state::load(account, &[CAMPAIGN_SEED, &id.to_le_bytes()], program_id)
    }

    /// Loads a campaign for writing; the address is re-derived from its stored id and compared.
    pub fn load_mut<'a>(
        account: &'a mut AccountView,
        program_id: &Address,
    ) -> Result<RefMut<'a, Self>, ProgramError> {
        // Slot and owner first: no byte is read from an account the program does not own.
        crate::checks::writable(account)?;
        crate::checks::owned_by(account, program_id)?;
        let id = stored_id(account)?;
        crate::state::load_mut(account, &[CAMPAIGN_SEED, &id.to_le_bytes()], program_id)
    }
}

/// The stored `id` of a campaign the program owns; trusted once `load_mut` re-derives the address.
fn stored_id(account: &AccountView) -> Result<u64, ProgramError> {
    let data = account.try_borrow()?;
    crate::checks::len(&data, <Campaign as crate::layout::ZeroCopy>::LEN)?;
    let bytes = data
        .get(16..24)
        .and_then(|slice| <[u8; 8]>::try_from(slice).ok())
        .ok_or(crate::error::BrotError::WrongLength)?;
    Ok(u64::from_le_bytes(bytes))
}
