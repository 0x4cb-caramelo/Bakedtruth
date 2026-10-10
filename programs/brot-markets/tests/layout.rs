//! Purpose: pins the program's frozen interface: account and argument sizes, event sizes, the
//!          event authority, the discriminators and the enum bytes. A change here is a change of
//!          contract and must be made on purpose (Sprint 02, Wave 0).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); the Sprint 03 contract (Wave 0) grows the opening's
//!         arguments and adds `resolve_campaign` and `CampaignResolved`

use brot_markets::{
    constants::{EVENT_AUTHORITY, EVENT_AUTHORITY_BUMP, EVENT_AUTHORITY_SEED},
    error::BrotError,
    events::{
        CampaignOpened, CampaignResolved, ConfigChanged, ConfigInitialized, EntriesPaused,
        EntriesResumed, EntryAdded, Event, EVENT_IX_TAG,
    },
    instructions::{
        admin::{
            initialize_config::InitializeConfigArgs, set_fee_recipient::SetFeeRecipientArgs,
            set_team::SetTeamArgs, transfer_admin::TransferAdminArgs,
        },
        campaigns::open_campaign::OpenCampaignArgs,
        entries::join_campaign::JoinCampaignArgs,
        ix,
    },
    layout::ZeroCopy,
    state::{
        campaign::Campaign,
        config::{CreationParams, GlobalConfig},
        entry::Entry,
        enums::{Direction, ReaderKind, Side},
    },
};
use pinocchio::Address;

#[test]
fn account_sizes_are_the_measured_ones() {
    // TP section 3.4.1 (T19): the sizes the rent is computed from.
    assert_eq!(GlobalConfig::LEN, 400);
    assert_eq!(Campaign::LEN, 512);
    assert_eq!(Entry::LEN, 116);
    assert_eq!(CreationParams::LEN, 70);
}

#[test]
fn argument_sizes_are_frozen() {
    assert_eq!(InitializeConfigArgs::LEN, 134);
    assert_eq!(SetTeamArgs::LEN, 161);
    assert_eq!(SetFeeRecipientArgs::LEN, 32);
    assert_eq!(TransferAdminArgs::LEN, 32);
    assert_eq!(OpenCampaignArgs::LEN, 94);
    assert_eq!(JoinCampaignArgs::LEN, 21);
}

#[test]
fn event_sizes_and_discriminators_are_frozen() {
    assert_eq!(ConfigInitialized::LEN, 166);
    assert_eq!(ConfigChanged::LEN, 360);
    assert_eq!(EntriesPaused::LEN, 32);
    assert_eq!(EntriesResumed::LEN, 32);
    assert_eq!(CampaignOpened::LEN, 263);
    assert_eq!(EntryAdded::LEN, 114);
    assert_eq!(CampaignResolved::LEN, 140);
    let discriminators = [
        ConfigInitialized::DISCRIMINATOR,
        ConfigChanged::DISCRIMINATOR,
        EntriesPaused::DISCRIMINATOR,
        EntriesResumed::DISCRIMINATOR,
        CampaignOpened::DISCRIMINATOR,
        EntryAdded::DISCRIMINATOR,
        CampaignResolved::DISCRIMINATOR,
    ];
    assert_eq!(discriminators, [0, 1, 2, 3, 4, 5, 6]);
}

#[test]
fn the_event_authority_constant_is_the_canonical_pda() {
    let (address, bump) = Address::find_program_address(&[EVENT_AUTHORITY_SEED], &brot_markets::ID);
    assert_eq!(address, EVENT_AUTHORITY);
    assert_eq!(bump, EVENT_AUTHORITY_BUMP);
}

#[test]
fn instruction_discriminators_follow_the_shank_enum_order() {
    let all = [
        ix::ADMIN_INITIALIZE_CONFIG,
        ix::ADMIN_SET_TEAM,
        ix::ADMIN_SET_CREATION_PARAMS,
        ix::ADMIN_SET_FEE_RECIPIENT,
        ix::ADMIN_TRANSFER_ADMIN,
        ix::ADMIN_ACCEPT_ADMIN,
        ix::TEAM_PAUSE_ENTRIES,
        ix::ADMIN_RESUME_ENTRIES,
        ix::USER_OPEN_CAMPAIGN,
        ix::USER_JOIN_CAMPAIGN,
        ix::RESOLVE_CAMPAIGN,
    ];
    assert_eq!(all, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert_eq!(ix::EMIT_EVENT, EVENT_IX_TAG);
    assert_eq!(EVENT_IX_TAG, 0xFF);
}

#[test]
fn enum_bytes_round_trip_and_refuse_the_rest() {
    for byte in 0..=4u8 {
        assert_eq!(ReaderKind::try_from(byte).unwrap() as u8, byte);
    }
    assert_eq!(ReaderKind::try_from(5), Err(BrotError::UnknownReaderKind));
    assert_eq!(Side::try_from(0), Ok(Side::Yes));
    assert_eq!(Side::try_from(1), Ok(Side::No));
    assert_eq!(Side::try_from(2), Err(BrotError::InvalidSide));
    assert_eq!(Direction::try_from(1), Ok(Direction::Below));
    assert_eq!(Direction::try_from(9), Err(BrotError::InvalidDirection));
}

#[test]
fn a_view_needs_the_exact_length() {
    let data = vec![0u8; Entry::LEN];
    assert!(Entry::from_bytes(&data).is_some());
    assert!(Entry::from_bytes(&data[..99]).is_none());
    let mut long = data.clone();
    long.push(0);
    assert!(Entry::from_bytes(&long).is_none());
}
