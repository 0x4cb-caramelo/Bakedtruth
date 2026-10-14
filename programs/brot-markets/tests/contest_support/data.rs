//! Purpose: the accounts of the contest's Mollusk tests (Sprint 14, lane L14B): a paid `SupplyAtMost` campaign on a
//!          synthetic SPL mint, resolved NO after its deadline and in review (or contested at a stage), the config
//!          with the admin and one team key, a readable mint and an unreadable account at the mint's address.
//! Version: 0.0.1
//! Sprint: 14 (lane L14B)

use brot_markets::{
    constants::{CAMPAIGN_SEED, SPL_TOKEN_PROGRAM_ID, VAULT_SEED},
    layout::{LeI128, LeI64, LeU16, LeU32, LeU64, ZeroCopy},
    state::{
        campaign::Campaign,
        config::GlobalConfig,
        enums::{ContestStage, OperatingLevel, Outcome, ReaderKind, Status},
        AccountTag, LAYOUT_VERSION,
    },
    ID,
};
use solana_account::Account;
use solana_pubkey::Pubkey;

use crate::world::{key, World, SOL, SYSTEM};

pub const CAMPAIGN_ID: u64 = 41;
/// The clock the tests start at, and the campaign's times around it.
pub const NOW: i64 = 1_791_216_180;
pub const HOUR: i64 = 3_600;
pub const RESOLVED_AT: i64 = NOW - HOUR;
pub const REVIEW_ENDS: i64 = RESOLVED_AT + 6 * HOUR;
pub const DEADLINE: i64 = NOW - 2 * HOUR;
/// The mint read: its supply stays above the target, so the reading after the deadline is NO, not met.
pub const MINT: Pubkey = key(0x31);
pub const SUPPLY: u64 = 2_000_000;
pub const TARGET: i128 = 1_000_000;
/// A team key, and a wallet that is neither the admin nor a team key.
pub const TEAM: Pubkey = key(0x7E);
pub const STRANGER: Pubkey = key(0x55);
pub const EVENT_SEQ: u64 = 3;

/// The campaign's address and bump, and its vault's bump.
pub fn campaign_address() -> (Pubkey, u8, u8) {
    let (address, bump) =
        Pubkey::find_program_address(&[CAMPAIGN_SEED, &CAMPAIGN_ID.to_le_bytes()], &ID);
    let (_, vault_bump) = Pubkey::find_program_address(&[VAULT_SEED, address.as_ref()], &ID);
    (address, bump, vault_bump)
}

/// The campaign as `resolve_campaign` leaves it after a paid opening and two entries (2 SOL on YES, 1 SOL on NO,
/// tallied): NO, the supply observed, `InReview` with its window open at `NOW`; then `edit`.
pub fn campaign_data(edit: impl FnOnce(&mut Campaign)) -> Vec<u8> {
    let (_, bump, vault_bump) = campaign_address();
    let mut data = vec![0u8; Campaign::LEN];
    let c = Campaign::from_bytes_mut(&mut data).expect("exact length");
    (c.tag, c.version, c.bump, c.vault_bump) =
        (AccountTag::Campaign as u8, LAYOUT_VERSION, bump, vault_bump);
    (c.kind, c.status, c.outcome) = (
        ReaderKind::SupplyAtMost as u8,
        Status::InReview as u8,
        Outcome::No as u8,
    );
    (c.id, c.creator, c.rent_payer) = (LeU64::new(CAMPAIGN_ID), key(0xC0), key(0xC0));
    (c.template_version, c.creator_share_bps) = (LeU16::new(1), LeU16::new(100));
    (c.fee_bps, c.one_sided_fee_bps) = (LeU16::new(1_000), LeU16::new(100));
    (c.metric_account, c.target) = (MINT, LeI128::new(TARGET));
    c.opens_at = LeI64::new(NOW - 5 * 24 * HOUR);
    (c.entries_close_at, c.deadline_at) = (LeI64::new(DEADLINE - 24 * HOUR), LeI64::new(DEADLINE));
    (c.opening_usd, c.prize_lamports) = (LeU64::new(500), LeU64::new(4 * SOL));
    c.opening_fee_lamports = LeU64::new(SOL / 2);
    (c.pool_yes, c.pool_no, c.first_baker) = (LeU64::new(2 * SOL), LeU64::new(SOL), key(0xB1));
    (c.entries_open, c.event_seq) = (LeU32::new(2), LeU64::new(EVENT_SEQ));
    c.observed_value = LeI128::new(i128::from(SUPPLY));
    (c.resolved_at, c.review_ends_at) = (LeI64::new(RESOLVED_AT), LeI64::new(REVIEW_ENDS));
    edit(c);
    data
}

/// The campaign `Contested` at `stage`, its stage's deadline `ends_at`; then `edit`.
pub fn contested_data(
    stage: ContestStage,
    ends_at: i64,
    edit: impl FnOnce(&mut Campaign),
) -> Vec<u8> {
    campaign_data(|c| {
        (c.status, c.contest_stage) = (Status::Contested as u8, stage as u8);
        c.contest_ends_at = LeI64::new(ends_at);
        edit(c);
    })
}

/// The config of a fresh deployment with one team key (`TEAM`), one paid campaign open, at `level`.
pub fn config_data(world: &World, level: OperatingLevel) -> Vec<u8> {
    let mut data = world.config_data();
    let c = GlobalConfig::from_bytes_mut(&mut data).expect("exact length");
    (c.team_len, c.team[0]) = (1, TEAM);
    (c.open_campaigns, c.operating_level) = (LeU32::new(1), level as u8);
    data
}

/// A classic SPL Token mint holding `supply`, both authorities revoked, initialized.
pub fn mint(world: &World, supply: u64) -> Account {
    let mut data = vec![0u8; 82];
    data[36..44].copy_from_slice(&supply.to_le_bytes());
    data[45] = 1;
    Account {
        lamports: world.rent(data.len()),
        data,
        owner: SPL_TOKEN_PROGRAM_ID,
        executable: false,
        rent_epoch: 0,
    }
}

/// An account at the mint's address no reader can read: owned by the System Program, no data.
pub fn unreadable() -> Account {
    Account::new(SOL, 0, &SYSTEM)
}
