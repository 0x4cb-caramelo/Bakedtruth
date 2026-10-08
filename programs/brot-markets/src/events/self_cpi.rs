//! Purpose: how an event leaves the program: `emit` sends it to this program by self-CPI, signed
//!          by the event-authority PDA, and the event handler accepts only that signature (T4).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio), lane F
//!
//! The runtime looks for the callee of a CPI among the caller's instruction accounts, so every
//! emitting instruction carries this program in its last slot; without it the CPI fails with
//! `MissingAccount` (measured on day one). The event authority's address and bump are constants
//! (`constants.rs`, checked against the derivation by a host test), so neither side derives it.

use pinocchio::{
    cpi::{invoke_signed, Seed, Signer},
    error::ProgramError,
    instruction::{InstructionAccount, InstructionView},
    AccountView, Address, ProgramResult,
};

use super::{Event, EVENT_IX_TAG};
use crate::{
    checks,
    constants::{EVENT_AUTHORITY, EVENT_AUTHORITY_BUMP, EVENT_AUTHORITY_SEED},
    error::BrotError,
};

/// Bytes before the payload in an event's instruction data: `EVENT_IX_TAG` and the discriminator.
const HEADER_LEN: usize = 2;
/// The largest event payload (`ConfigChanged`). A larger event fails the build in `event_data`.
const MAX_EVENT_LEN: usize = 360;
/// The stack buffer an event's instruction data is written into.
pub const EVENT_BUFFER_LEN: usize = HEADER_LEN + MAX_EVENT_LEN;

/// Emits `event` by self-CPI: an instruction to this program with data
/// `[EVENT_IX_TAG, E::DISCRIMINATOR, event bytes]` whose only account is the event authority,
/// signing through its seeds (`EVENT_AUTHORITY_SEED`, `EVENT_AUTHORITY_BUMP`). The caller passes
/// its two trailing slots; `checks::event_accounts` verifies them first.
pub fn emit<E: Event>(
    event: &E,
    event_authority: &AccountView,
    program: &AccountView,
    program_id: &Address,
) -> ProgramResult {
    checks::event_accounts(event_authority, program, program_id)?;
    let mut buffer = [0u8; EVENT_BUFFER_LEN];
    let data = event_data(event, &mut buffer)?;
    let accounts = [InstructionAccount::readonly_signer(&EVENT_AUTHORITY)];
    let instruction = InstructionView {
        program_id,
        accounts: &accounts,
        data,
    };
    let bump = [EVENT_AUTHORITY_BUMP];
    let seeds = [Seed::from(EVENT_AUTHORITY_SEED), Seed::from(&bump)];
    invoke_signed(&instruction, &[event_authority], &[Signer::from(&seeds)])
}

/// Writes `[EVENT_IX_TAG, E::DISCRIMINATOR, event bytes]` at the start of `buffer` and returns
/// that part: the data of the event instruction, exactly `2 + E::LEN` bytes.
pub fn event_data<'a, E: Event>(
    event: &E,
    buffer: &'a mut [u8; EVENT_BUFFER_LEN],
) -> Result<&'a [u8], ProgramError> {
    // Evaluated at compile time for each event type, so an event too large for the buffer
    // fails the build instead of the transaction.
    let len = const {
        assert!(E::LEN <= MAX_EVENT_LEN, "an event outgrew emit's buffer");
        HEADER_LEN + E::LEN
    };
    // Never `None`: the assertion above keeps `len` within the buffer.
    let data = buffer.get_mut(..len).ok_or(ProgramError::InvalidArgument)?;
    let (header, payload) = data.split_at_mut(HEADER_LEN);
    header.copy_from_slice(&[EVENT_IX_TAG, E::DISCRIMINATOR]);
    payload.copy_from_slice(event.as_bytes());
    Ok(data)
}

/// The handler of `EVENT_IX_TAG`: succeeds only when its first account is the event authority
/// and signed, which only this program can bring about, through `emit`. Anything else, a
/// top-level call included, is `WrongEventAuthority`. The data is not read: it is the event,
/// kept in the transaction for indexers.
pub fn process_event_instruction(accounts: &[AccountView]) -> ProgramResult {
    match accounts.first() {
        Some(authority) if authority.is_signer() && authority.address() == &EVENT_AUTHORITY => {
            Ok(())
        }
        _ => Err(BrotError::WrongEventAuthority.into()),
    }
}
