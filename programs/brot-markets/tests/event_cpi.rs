//! Purpose: the self-CPI events on the host (T4): the instruction data `emit` sends for each of
//!          the six events, and the handler that accepts only the event authority, signing. The
//!          CPI itself runs in LiteSVM (tests/brot/events.test.ts).
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane F

use brot_markets::{
    constants::EVENT_AUTHORITY,
    error::BrotError,
    events::{
        event_data, process_event_instruction, CampaignOpened, ConfigChanged, ConfigInitialized,
        EntriesPaused, EntriesResumed, EntryAdded, Event, EVENT_BUFFER_LEN, EVENT_IX_TAG,
    },
    layout::ZeroCopy,
};
use pinocchio::{
    account::{AccountView, RuntimeAccount, NOT_BORROWED},
    error::ProgramError,
    Address,
};

/// `[EVENT_IX_TAG, discriminator, payload]` for an event whose every byte differs from its
/// neighbour, so a shifted or truncated copy cannot pass.
fn assert_wire_format<E: Event>() {
    let payload: Vec<u8> = (0..E::LEN).map(|i| i.to_le_bytes()[0]).collect();
    let event = E::from_bytes(&payload).expect("the payload has the event's size");
    let mut buffer = [0u8; EVENT_BUFFER_LEN];
    let data = event_data(event, &mut buffer).expect("every event fits the buffer");
    assert_eq!(Some(data.len()), E::LEN.checked_add(2));
    assert_eq!(data[..2], [EVENT_IX_TAG, E::DISCRIMINATOR]);
    assert_eq!(&data[2..], &payload[..]);
}

#[test]
fn each_event_is_sent_as_tag_discriminator_and_its_bytes() {
    assert_wire_format::<ConfigInitialized>();
    assert_wire_format::<ConfigChanged>();
    assert_wire_format::<EntriesPaused>();
    assert_wire_format::<EntriesResumed>();
    assert_wire_format::<CampaignOpened>();
    assert_wire_format::<EntryAdded>();
}

#[test]
fn the_buffer_fits_the_largest_event_exactly() {
    assert_eq!(Some(EVENT_BUFFER_LEN), ConfigChanged::LEN.checked_add(2));
}

/// A data-less account as the entrypoint hands it to a handler.
fn runtime_account(address: Address, is_signer: bool) -> RuntimeAccount {
    RuntimeAccount {
        borrow_state: NOT_BORROWED,
        is_signer: u8::from(is_signer),
        is_writable: 0,
        executable: 0,
        padding: [0; 4],
        address,
        owner: Address::default(),
        lamports: 0,
        data_len: 0,
    }
}

fn handle(raw: &mut RuntimeAccount) -> Result<(), ProgramError> {
    // SAFETY: `raw` outlives the view and holds no data, which is all `data_len` 0 promises.
    let view = unsafe { AccountView::new_unchecked(raw) };
    process_event_instruction(&[view])
}

#[test]
fn the_event_handler_accepts_only_the_event_authority_signing() {
    let refused = Err(ProgramError::from(BrotError::WrongEventAuthority));
    assert_eq!(handle(&mut runtime_account(EVENT_AUTHORITY, true)), Ok(()));
    // A top-level call can name the authority but never sign for it.
    let unsigned = handle(&mut runtime_account(EVENT_AUTHORITY, false));
    assert_eq!(unsigned, refused);
    // Any other signer, a wallet included, is not the authority.
    let impostor = Address::new_from_array([7; 32]);
    assert_eq!(handle(&mut runtime_account(impostor, true)), refused);
    assert_eq!(process_event_instruction(&[]), refused);
}
