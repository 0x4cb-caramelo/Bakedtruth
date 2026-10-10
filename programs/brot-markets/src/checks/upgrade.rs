//! Purpose: `checks::upgrade_authority`, the one check that binds the config's first write to this
//!          program's upgrade authority (TP 3.4.17), with its own refusals and negative tests.
//! Version: 0.0.1
//! Sprint: 04 (split out of `checks.rs` to make room)

use pinocchio::{AccountView, Address, ProgramResult};

use super::require;
use crate::{constants::BPF_LOADER_UPGRADEABLE_ID, error::BrotError};

/// `UpgradeableLoaderState::ProgramData`, the bincode enum tag a ProgramData account starts with.
const PROGRAM_DATA_TAG: u32 = 3;

/// Initialisation only: `program_data` is this program's ProgramData account (loader-owned, at the
/// PDA of `program_id`, with an upgrade authority set; `WrongProgramData` otherwise) and that
/// authority is `authority` (`UpgradeAuthorityMismatch`). The caller checks that it signed.
pub fn upgrade_authority(
    program_data: &AccountView,
    program_id: &Address,
    authority: &AccountView,
) -> ProgramResult {
    // X0.9 upgrade_authority
    let loader = &BPF_LOADER_UPGRADEABLE_ID;
    require(program_data.owned_by(loader), BrotError::WrongProgramData)?;
    let (expected, _) = Address::try_find_program_address(&[program_id.as_ref()], loader)
        .ok_or(BrotError::WrongProgramData)?;
    let at_pda = *program_data.address() == expected;
    require(at_pda, BrotError::WrongProgramData)?;
    let data = program_data.try_borrow()?;
    let recorded = recorded_upgrade_authority(&data).ok_or(BrotError::WrongProgramData)?;
    // X0.9 upgrade_authority_key
    let matches = recorded == authority.address().as_array();
    require(matches, BrotError::UpgradeAuthorityMismatch)
}

/// The authority a ProgramData records (bincode: `u32` tag 3, `u64` slot, `Option<Pubkey>`);
/// `None` for another state, an immutable program or fewer than those 45 bytes.
fn recorded_upgrade_authority(data: &[u8]) -> Option<&[u8; 32]> {
    let state = u32::from_le_bytes(data.get(..4)?.try_into().ok()?);
    if state != PROGRAM_DATA_TAG || data.get(12) != Some(&1) {
        return None;
    }
    data.get(13..45)?.try_into().ok()
}
