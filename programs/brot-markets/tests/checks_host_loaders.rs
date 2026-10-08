//! Purpose: the frozen loaders of `state` running the `checks` module on the host: owner,
//!          exact length, tag and version, then the PDA from the stored bump, each failure with its
//!          own error, and the campaign address re-derived from the id the account carries (T24).
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane A

#[path = "checks_support/host.rs"]
mod host;

use brot_markets::{
    constants::CAMPAIGN_SEED,
    error::BrotError,
    layout::ZeroCopy,
    state::{campaign::Campaign, config::GlobalConfig, AccountTag, LAYOUT_VERSION},
    ID,
};
use host::{config_data, config_pda, key, HostAccount, SYSTEM};
use pinocchio::{error::ProgramError, Address};

fn code(error: BrotError) -> Option<ProgramError> {
    Some(ProgramError::from(error))
}

#[test]
fn the_config_loader_runs_owner_length_tag_and_pda_in_order() {
    let (address, bump) = config_pda();
    let data = config_data(bump, key(1));
    let load = |address: Address, owner: Address, data: &[u8]| -> Option<ProgramError> {
        let mut account = HostAccount::new(address, owner, data);
        GlobalConfig::load(&account.view(), &ID).err()
    };
    assert_eq!(load(address, ID, &data), None);
    assert_eq!(load(address, SYSTEM, &data), code(BrotError::WrongOwner));
    assert_eq!(
        load(address, ID, &data[..399]),
        code(BrotError::WrongLength)
    );
    assert_eq!(load(address, ID, &[]), code(BrotError::WrongLength));
    assert_eq!(load(address, ID, &[0; 400]), code(BrotError::WrongTag));
    let mut version_two = data.clone();
    version_two[1] = 2;
    let wrong_version = code(BrotError::WrongLayoutVersion);
    assert_eq!(load(address, ID, &version_two), wrong_version);
    assert_eq!(load(key(7), ID, &data), code(BrotError::PdaMismatch));
    let mut other_bump = data.clone();
    other_bump[2] = bump.wrapping_sub(1);
    assert_eq!(load(address, ID, &other_bump), code(BrotError::PdaMismatch));
    // Read-only, the same account cannot be loaded for writing.
    let mut read_only = HostAccount::new(address, ID, &data);
    let result = GlobalConfig::load_mut(&mut read_only.view(), &ID).err();
    assert_eq!(result, code(BrotError::NotWritable));
    let mut writable = HostAccount::new(address, ID, &data).writable();
    assert!(GlobalConfig::load_mut(&mut writable.view(), &ID).is_ok());
}

#[test]
fn the_campaign_loader_rederives_the_address_from_the_stored_id() {
    let id = 42u64.to_le_bytes();
    let (address, bump) = Address::find_program_address(&[CAMPAIGN_SEED, &id], &ID);
    let mut data = vec![0u8; Campaign::LEN];
    let campaign = Campaign::from_bytes_mut(&mut data).expect("exact length");
    campaign.tag = AccountTag::Campaign as u8;
    campaign.version = LAYOUT_VERSION;
    campaign.bump = bump;
    campaign.id.set(42);
    let mut real = HostAccount::new(address, ID, &data).writable();
    assert!(Campaign::load_mut(&mut real.view(), &ID).is_ok());
    assert!(Campaign::load(&real.view(), 42, &ID).is_ok());
    let mismatch = code(BrotError::PdaMismatch);
    assert_eq!(Campaign::load(&real.view(), 43, &ID).err(), mismatch);
    // The same bytes anywhere else: the id they carry derives the real address, not this one.
    let mut look_alike = HostAccount::new(key(8), ID, &data).writable();
    let result = Campaign::load_mut(&mut look_alike.view(), &ID).err();
    assert_eq!(result, mismatch);
    // A config in a campaign slot fails on its length before its tag is read.
    let (config_address, config_bump) = config_pda();
    let config = config_data(config_bump, key(1));
    let mut wrong_type = HostAccount::new(config_address, ID, &config).writable();
    let result = Campaign::load_mut(&mut wrong_type.view(), &ID).err();
    assert_eq!(result, code(BrotError::WrongLength));
}
