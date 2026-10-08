//! Purpose: every account check Anchor used to make, written by hand in one place (TP section
//!          3.4.17). Each check returns its own error and has a negative test that fails when
//!          the check is removed (T24, X0.9).
//! Version: 0.0.4
//! Sprint: 02 (pot core on Pinocchio); signatures frozen at the sprint's opening, bodies by lane A
//!
//! Order inside an instruction (contract for every handler): arguments (exact length), then the
//! per-slot flags (`signer`, `writable`), then `distinct` for the pairs that must differ, then
//! `system_program` and `event_accounts`, then the account loads (`owned_by`, `len`, `tag`,
//! `pda`), then roles and business rules, then the effects (creation, transfers, writes), then
//! the event. One exception: the join creates a baker's first `Entry` before its last rule, the
//! return estimate; a refusal reverts both. Pinocchio checks none of this by itself.
//!
//! Each refusal follows an `// X0.9 <name>` line: `scripts/checks-mutation.mjs` puts an early
//! return right after it, rebuilds the program and shows that the check's tests then fail.

use pinocchio::{
    cpi::{Seed, Signer},
    error::ProgramError,
    AccountView, Address, ProgramResult,
};
use pinocchio_system::create_account_with_minimum_balance_signed as create_or_top_up;

use crate::{
    constants::{BPF_LOADER_UPGRADEABLE_ID, EVENT_AUTHORITY},
    error::BrotError,
    state::{AccountTag, LAYOUT_VERSION},
};

/// `UpgradeableLoaderState::ProgramData`, the bincode enum tag a ProgramData account starts with.
const PROGRAM_DATA_TAG: u32 = 3;

/// `Ok` when `holds`, else `error`: the one shape every check below returns.
fn require(holds: bool, error: BrotError) -> ProgramResult {
    if holds {
        Ok(())
    } else {
        Err(error.into())
    }
}

/// The account belongs to `owner` ([`BrotError::WrongOwner`](crate::error::BrotError::WrongOwner)).
/// Run on every account the program treats as its own, before any byte of it is read.
pub fn owned_by(account: &AccountView, owner: &Address) -> ProgramResult {
    // X0.9 owned_by
    require(account.owned_by(owner), BrotError::WrongOwner)
}

/// The slot signed the transaction (`MissingSignature`).
pub fn signer(account: &AccountView) -> ProgramResult {
    // X0.9 signer
    require(account.is_signer(), BrotError::MissingSignature)
}

/// The slot is writable (`NotWritable`).
pub fn writable(account: &AccountView) -> ProgramResult {
    // X0.9 writable
    require(account.is_writable(), BrotError::NotWritable)
}

/// The data is exactly `expected` bytes (`WrongLength`), before any field is read.
pub fn len(data: &[u8], expected: usize) -> ProgramResult {
    // X0.9 len
    require(data.len() == expected, BrotError::WrongLength)
}

/// Byte 0 is `expected` (`WrongTag`, which a zeroed account also gets) and byte 1 is
/// [`crate::state::LAYOUT_VERSION`] (`WrongLayoutVersion`).
pub fn tag(data: &[u8], expected: AccountTag) -> ProgramResult {
    // X0.9 tag
    require(data.first() == Some(&(expected as u8)), BrotError::WrongTag)?;
    // X0.9 tag_version
    let version_ok = data.get(1) == Some(&LAYOUT_VERSION);
    require(version_ok, BrotError::WrongLayoutVersion)
}

/// The account's address is the PDA of `seeds` and the stored `bump` under `program_id`
/// (`PdaMismatch`). Re-derives with the bump the account recorded at creation.
pub fn pda<const N: usize>(
    account: &AccountView,
    seeds: &[&[u8]; N],
    bump: u8,
    program_id: &Address,
) -> ProgramResult {
    pda_address(account.address(), seeds, bump, program_id)
}

/// [`pda`] on an address, for callers that hold the account's data mutably borrowed. One hash and
/// no curve check: the bump was stored at creation, at the canonical off-curve address.
pub fn pda_address<const N: usize>(
    address: &Address,
    seeds: &[&[u8]; N],
    bump: u8,
    program_id: &Address,
) -> ProgramResult {
    // X0.9 pda
    let derived = Address::derive_address(seeds, Some(bump), program_id);
    require(derived == *address, BrotError::PdaMismatch)
}

/// At creation: the account's address is the canonical PDA of `seeds` (the highest valid bump),
/// returned for storing (`PdaMismatch` otherwise). A non-canonical bump would let a second
/// account exist for the same seeds and defeat the retry guard (T17).
pub fn canonical_pda(
    account: &AccountView,
    seeds: &[&[u8]],
    program_id: &Address,
) -> Result<u8, ProgramError> {
    let (canonical, bump) =
        Address::try_find_program_address(seeds, program_id).ok_or(BrotError::PdaMismatch)?;
    // X0.9 canonical_pda
    require(*account.address() == canonical, BrotError::PdaMismatch)?;
    Ok(bump)
}

/// The slot holds the System Program (`WrongSystemProgram`), before any System Program CPI.
pub fn system_program(account: &AccountView) -> ProgramResult {
    // X0.9 system_program
    let is_system = *account.address() == pinocchio_system::ID;
    require(is_system, BrotError::WrongSystemProgram)
}

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

/// Creates a program-owned PDA with `space` bytes and its rent-exempt minimum, paid by `payer`,
/// signed with `signer_seeds` (the PDA's seeds and bump). If anyone funded the address in
/// advance, tops it up to the minimum, then `allocate` and `assign`, instead of failing. Never
/// re-initialises: an address the program already owns is refused with `AlreadyInitialized`.
/// Guards no PDA of this program can meet: another owner, `WrongOwner`; data, `AlreadyInitialized`.
pub fn create_pda_account(
    payer: &AccountView,
    account: &AccountView,
    space: usize,
    program_id: &Address,
    signer_seeds: &[Seed],
) -> ProgramResult {
    // X0.9 create_pda_account
    require(!account.owned_by(program_id), BrotError::AlreadyInitialized)?;
    let system_owned = account.owned_by(&pinocchio_system::ID);
    require(system_owned, BrotError::WrongOwner)?;
    require(account.is_data_empty(), BrotError::AlreadyInitialized)?;
    let signers = [Signer::from(signer_seeds)];
    // Same runtime account (the helper wants `&mut`): create, or top up, `allocate` and `assign`.
    let mut target = *account;
    create_or_top_up(&mut target, space, program_id, payer, None, &signers)
}

/// Two slots that must hold different accounts do (`DuplicateAccount`) [NEW]. Lamport moves
/// between program accounts are plain balance edits, so one account in two slots could corrupt
/// the bookkeeping silently. Equal addresses are one account: Pinocchio aliases a repeated slot.
pub fn distinct(a: &AccountView, b: &AccountView) -> ProgramResult {
    // X0.9 distinct
    require(a.address() != b.address(), BrotError::DuplicateAccount)
}

/// The two trailing slots every event-emitting instruction carries (T4): this program's event
/// authority (`WrongEventAuthority`) and this program itself (`WrongProgramAccount`).
pub fn event_accounts(
    event_authority: &AccountView,
    program: &AccountView,
    program_id: &Address,
) -> ProgramResult {
    // X0.9 event_accounts
    let authority_ok = *event_authority.address() == EVENT_AUTHORITY;
    require(authority_ok, BrotError::WrongEventAuthority)?;
    // X0.9 event_program
    let is_program = program.address() == program_id;
    require(is_program, BrotError::WrongProgramAccount)
}
