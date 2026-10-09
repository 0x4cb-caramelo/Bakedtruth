//! Purpose: the host accounts of lane D's handler tests: a campaign that is finalized, its vault and the fee
//!          vault at their real PDAs, the config, and a `run` that calls a handler on them.
//! Version: 0.0.1
//! Sprint: 04 (lane D)

#![allow(dead_code)]

use brot_markets::{
    constants::{CAMPAIGN_SEED, CONFIG_SEED, EVENT_AUTHORITY, FEE_VAULT_SEED, VAULT_SEED},
    layout::{LeU64, ZeroCopy},
    state::{
        campaign::Campaign,
        config::GlobalConfig,
        enums::{SettleMode, Status},
        AccountTag, LAYOUT_VERSION,
    },
    ID,
};
use pinocchio::{AccountView, Address, ProgramResult};

pub use crate::host::{key, HostAccount, SYSTEM};

pub const CAMPAIGN_ID: u64 = 7;
pub const PRIZE: u64 = 900_000;
pub const OPENING: u64 = 100_000;
pub const CREATOR: Address = key(9);
pub const RENT_PAYER: Address = key(8);
pub const VAULT_LAMPORTS: u64 = 50_000_000;
pub const FEE_LAMPORTS: u64 = 20_000_000;

pub type Handler = fn(&Address, &mut [AccountView], &[u8]) -> ProgramResult;

/// The campaign's address and bump, and its vault's address and bump.
pub fn campaign_addresses() -> ((Address, u8), (Address, u8)) {
    let id = CAMPAIGN_ID.to_le_bytes();
    let (campaign, bump) = Address::find_program_address(&[CAMPAIGN_SEED, &id], &ID);
    let campaign_bytes: &[u8] = campaign.as_ref();
    (
        (campaign, bump),
        Address::find_program_address(&[VAULT_SEED, campaign_bytes], &ID),
    )
}

/// The fee vault's address and canonical bump.
pub fn fee_vault() -> (Address, u8) {
    Address::find_program_address(&[FEE_VAULT_SEED], &ID)
}

/// A campaign, settled as `Split` with a prize and an opening fee, every flag clear, then `edit`.
pub fn campaign(edit: impl FnOnce(&mut Campaign)) -> Vec<u8> {
    let ((_, bump), (_, vault_bump)) = campaign_addresses();
    let mut bytes = vec![0u8; Campaign::LEN];
    let c = Campaign::from_bytes_mut(&mut bytes).unwrap();
    (c.tag, c.version, c.bump, c.vault_bump) =
        (AccountTag::Campaign as u8, LAYOUT_VERSION, bump, vault_bump);
    (c.id, c.status, c.settle_mode) = (
        LeU64::new(CAMPAIGN_ID),
        Status::Settled as u8,
        SettleMode::Split as u8,
    );
    (c.prize_lamports, c.opening_fee_lamports) = (LeU64::new(PRIZE), LeU64::new(OPENING));
    (c.fee_total, c.creator_share_from_fee) = (LeU64::new(5_000), LeU64::new(1_200));
    (c.creator, c.rent_payer, c.first_baker) = (CREATOR, RENT_PAYER, key(3));
    c.fee_collected = 0;
    edit(c);
    bytes
}

/// The campaign's account, writable, owned by this program.
pub fn campaign_account(bytes: Vec<u8>) -> HostAccount {
    let ((address, _), _) = campaign_addresses();
    HostAccount::new(address, ID, &bytes).writable()
}

/// The vault and the fee vault, writable and holding their lamports.
pub fn vault_account() -> HostAccount {
    let (vault, _) = campaign_addresses().1;
    HostAccount::new(vault, ID, &[])
        .writable()
        .lamports(VAULT_LAMPORTS)
}

pub fn fee_vault_account() -> HostAccount {
    HostAccount::new(fee_vault().0, ID, &[])
        .writable()
        .lamports(FEE_LAMPORTS)
}

/// The event authority and this program, the two slots every emitting instruction ends with.
pub fn event_slots() -> [HostAccount; 2] {
    [
        HostAccount::new(EVENT_AUTHORITY, SYSTEM, &[]),
        HostAccount::new(ID, key(4), &[]),
    ]
}

/// A config with `fee_recipient` and the stored fee vault bump, at its real PDA.
pub fn config_account(fee_recipient: Address, fee_vault_bump: u8) -> HostAccount {
    let (config, bump) = Address::find_program_address(&[CONFIG_SEED], &ID);
    let mut data = vec![0u8; GlobalConfig::LEN];
    let c = GlobalConfig::from_bytes_mut(&mut data).unwrap();
    (c.tag, c.version, c.bump, c.admin) =
        (AccountTag::GlobalConfig as u8, LAYOUT_VERSION, bump, key(1));
    (c.fee_recipient, c.fee_vault_bump) = (fee_recipient, fee_vault_bump);
    HostAccount::new(config, ID, &data)
}

/// Calls `handler` on `accounts` with `data`; the views are rebuilt on each call over the same memory.
pub fn run(handler: Handler, accounts: &mut [HostAccount], data: &[u8]) -> ProgramResult {
    let mut views: Vec<AccountView> = accounts.iter_mut().map(HostAccount::view).collect();
    handler(&ID, &mut views, data)
}

/// The lamports of account `index`, read through a fresh view.
pub fn lamports(accounts: &mut [HostAccount], index: usize) -> u64 {
    accounts[index].view().lamports()
}

/// The stored campaign bytes of account `index`, read through a fresh view.
pub fn stored(accounts: &mut [HostAccount], index: usize) -> Vec<u8> {
    accounts[index].view().try_borrow().unwrap().to_vec()
}
