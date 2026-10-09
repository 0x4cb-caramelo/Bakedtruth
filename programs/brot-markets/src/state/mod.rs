//! Purpose: the accounts the program owns: their type tags, layout version and the one loader
//!          that runs the owner, length, tag and PDA checks before any field is read.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio)
//!
//! Every account the program owns starts with a one-byte tag and a one-byte layout version, has a
//! fixed little-endian layout read in place, and ends with a reserved area for later sprints (TP
//! section 3.4.1). The vaults hold no data at all: they are checked by owner and PDA only.

pub mod campaign;
pub mod config;
pub mod entry;
pub mod enums;
pub mod transitions;

use pinocchio::{
    account::{Ref, RefMut},
    error::ProgramError,
    AccountView, Address,
};

use crate::{checks, error::BrotError, layout::ZeroCopy};

/// The type of an account the program owns, in its first byte. `0` is never written, so a zeroed
/// account fails the tag check. `ReferralLink` (4) arrives in Sprint 14.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum AccountTag {
    GlobalConfig = 1,
    Campaign = 2,
    Entry = 3,
}

/// The layout version every Sprint 02 account is written with.
pub const LAYOUT_VERSION: u8 = 1;

/// An account layout with a tag. `seeds` and `bump` let the loader re-derive the address.
pub trait AccountState: ZeroCopy {
    const TAG: AccountTag;
    /// The bump stored in the account, used to re-derive its address (TP section 3.4.17).
    fn bump(&self) -> u8;
}

/// Loads an account the program owns for reading: owner, exact length, tag and version, then
/// the PDA re-derived from `seeds` and the stored bump. Nothing is read before these pass.
pub fn load<'a, T: AccountState, const N: usize>(
    account: &'a AccountView,
    seeds: &[&[u8]; N],
    program_id: &Address,
) -> Result<Ref<'a, T>, ProgramError> {
    checks::owned_by(account, program_id)?;
    let data = account.try_borrow()?;
    checks::len(&data, T::LEN)?;
    checks::tag(&data, T::TAG)?;
    let state = Ref::try_map(data, |bytes| {
        T::from_bytes(bytes).ok_or(BrotError::WrongLength)
    })
    .map_err(|(_, error)| ProgramError::from(error))?;
    checks::pda(account, seeds, state.bump(), program_id)?;
    Ok(state)
}

/// [`load`] for writing: the slot must also be writable.
pub fn load_mut<'a, T: AccountState, const N: usize>(
    account: &'a mut AccountView,
    seeds: &[&[u8]; N],
    program_id: &Address,
) -> Result<RefMut<'a, T>, ProgramError> {
    checks::writable(account)?;
    checks::owned_by(account, program_id)?;
    let address = *account.address();
    let data = account.try_borrow_mut()?;
    checks::len(&data, T::LEN)?;
    checks::tag(&data, T::TAG)?;
    let state = RefMut::try_map(data, |bytes| {
        T::from_bytes_mut(bytes).ok_or(BrotError::WrongLength)
    })
    .map_err(|(_, error)| ProgramError::from(error))?;
    checks::pda_address(&address, seeds, state.bump(), program_id)?;
    Ok(state)
}

/// Writes the tag and layout version of a freshly created account and returns its view. The
/// account must have just been created by `checks::create_pda_account` with `T::LEN` bytes. An
/// account that already carries a tag or a version is refused (`AlreadyInitialized`), whatever
/// the caller checked before: no account is ever initialised twice.
pub fn init<'a, T: AccountState>(
    account: &'a mut AccountView,
) -> Result<RefMut<'a, T>, ProgramError> {
    let mut data = account.try_borrow_mut()?;
    checks::len(&data, T::LEN)?;
    match data.get_mut(..2) {
        Some(head) if head.iter().all(|byte| *byte == 0) => {
            head.copy_from_slice(&[T::TAG as u8, LAYOUT_VERSION]);
        }
        _ => return Err(BrotError::AlreadyInitialized.into()),
    }
    RefMut::try_map(data, |bytes| {
        T::from_bytes_mut(bytes).ok_or(BrotError::WrongLength)
    })
    .map_err(|(_, error)| ProgramError::from(error))
}
