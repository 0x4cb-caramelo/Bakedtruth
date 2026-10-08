//! Purpose: every account check Anchor used to make, written by hand in one place (TP section
//!          3.4.17). Each check returns its own error and has a negative test that fails when
//!          the check is removed (T24, X0.9).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); signatures frozen at the sprint's opening, bodies by lane A
//!
//! Order inside an instruction (contract for every handler): arguments (exact length), then the
//! per-slot flags (`signer`, `writable`), then `distinct` for the pairs that must differ, then
//! `system_program` and `event_accounts`, then the account loads (`owned_by`, `len`, `tag`,
//! `pda`), then roles and business rules, then the effects (creation, transfers, writes), then
//! the event. Pinocchio checks none of this by itself.

use pinocchio::{cpi::Seed, error::ProgramError, AccountView, Address, ProgramResult};

use crate::state::AccountTag;

/// The account belongs to `owner` ([`BrotError::WrongOwner`](crate::error::BrotError::WrongOwner)).
/// Run on every account the program treats as its own, before any byte of it is read.
pub fn owned_by(account: &AccountView, owner: &Address) -> ProgramResult {
    let _ = (account, owner);
    todo!("Sprint 02 lane A")
}

/// The slot signed the transaction (`MissingSignature`).
pub fn signer(account: &AccountView) -> ProgramResult {
    let _ = account;
    todo!("Sprint 02 lane A")
}

/// The slot is writable (`NotWritable`).
pub fn writable(account: &AccountView) -> ProgramResult {
    let _ = account;
    todo!("Sprint 02 lane A")
}

/// The data is exactly `expected` bytes (`WrongLength`), before any field is read.
pub fn len(data: &[u8], expected: usize) -> ProgramResult {
    let _ = (data, expected);
    todo!("Sprint 02 lane A")
}

/// Byte 0 is `expected` (`WrongTag`, which a zeroed account also gets) and byte 1 is
/// [`crate::state::LAYOUT_VERSION`] (`WrongLayoutVersion`).
pub fn tag(data: &[u8], expected: AccountTag) -> ProgramResult {
    let _ = (data, expected);
    todo!("Sprint 02 lane A")
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

/// [`pda`] on an address, for callers that hold the account's data mutably borrowed.
pub fn pda_address<const N: usize>(
    address: &Address,
    seeds: &[&[u8]; N],
    bump: u8,
    program_id: &Address,
) -> ProgramResult {
    let _ = (address, seeds, bump, program_id);
    todo!("Sprint 02 lane A")
}

/// At creation: the account's address is the canonical PDA of `seeds` (the highest valid bump),
/// returned for storing (`PdaMismatch` otherwise). A non-canonical bump would let a second
/// account exist for the same seeds and defeat the retry guard (T17).
pub fn canonical_pda(
    account: &AccountView,
    seeds: &[&[u8]],
    program_id: &Address,
) -> Result<u8, ProgramError> {
    let _ = (account, seeds, program_id);
    todo!("Sprint 02 lane A")
}

/// The slot holds the System Program (`WrongSystemProgram`), before any System Program CPI.
pub fn system_program(account: &AccountView) -> ProgramResult {
    let _ = account;
    todo!("Sprint 02 lane A")
}

/// Initialisation only: `program_data` is this program's ProgramData account (owned by the
/// upgradeable loader, at the PDA of `program_id`, with an upgrade authority set;
/// `WrongProgramData` otherwise) and its upgrade authority is `authority`
/// (`UpgradeAuthorityMismatch`). The caller checks separately that `authority` signed.
pub fn upgrade_authority(
    program_data: &AccountView,
    program_id: &Address,
    authority: &AccountView,
) -> ProgramResult {
    let _ = (program_data, program_id, authority);
    todo!("Sprint 02 lane A")
}

/// Creates a program-owned PDA with `space` bytes and its rent-exempt minimum, paid by `payer`,
/// signed with `signer_seeds` (the PDA's seeds and bump). If anyone funded the address in
/// advance, tops it up to the minimum, then `allocate` and `assign`, instead of failing. Never
/// re-initialises: an address the program already owns is refused with `AlreadyInitialized`.
pub fn create_pda_account(
    payer: &AccountView,
    account: &AccountView,
    space: usize,
    program_id: &Address,
    signer_seeds: &[Seed],
) -> ProgramResult {
    let _ = (payer, account, space, program_id, signer_seeds);
    todo!("Sprint 02 lane A")
}

/// Two slots that must hold different accounts do (`DuplicateAccount`) [NEW]. Lamport moves
/// between program accounts are plain balance edits, so one account in two slots could corrupt
/// the bookkeeping silently.
pub fn distinct(a: &AccountView, b: &AccountView) -> ProgramResult {
    let _ = (a, b);
    todo!("Sprint 02 lane A")
}

/// The two trailing slots every event-emitting instruction carries (T4): this program's event
/// authority (`WrongEventAuthority`) and this program itself (`WrongProgramAccount`).
pub fn event_accounts(
    event_authority: &AccountView,
    program: &AccountView,
    program_id: &Address,
) -> ProgramResult {
    let _ = (event_authority, program, program_id);
    todo!("Sprint 02 lane A")
}
