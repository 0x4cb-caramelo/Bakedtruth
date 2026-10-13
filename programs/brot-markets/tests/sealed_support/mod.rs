//! Purpose: what the sealed entry's Mollusk tests share (Sprint 15): a paid BTC/USD campaign at its PDA in any
//!          state, its vault, a sponsor's `SealedFee`, the fee vault, the captured devnet SOL/USD and BTC/USD
//!          accounts at their sponsored addresses, and the slots of `sponsor_join_campaign`, `settle_sealed_fee`
//!          and `close_campaign` in the IDL's order. A test crate that declares this module declares `world`
//!          (`checks_support/mollusk.rs`) first.
//! Version: 0.0.1
//! Sprint: 15 (lane L15)

#![allow(dead_code)]

use brot_markets::{
    constants::{
        CAMPAIGN_SEED, ENTRY_SEED, EVENT_AUTHORITY, JOIN_SEED, SEALED_FEE_SEED, VAULT_SEED,
    },
    instructions::{entries::sponsor_join_campaign::SponsorJoinArgs, ix},
    layout::{LeI128, LeI32, LeI64, LeU16, LeU32, LeU64, ZeroCopy},
    state::{
        campaign::Campaign,
        enums::{Direction, ReaderKind, Status},
        sealed_fee::SealedFee,
        AccountTag, LAYOUT_VERSION,
    },
    ID,
};
use mollusk_svm::program::{create_program_account_loader_v3, keyed_account_for_system_program};
use pinocchio::address::address;
use solana_account::Account;
use solana_instruction::{AccountMeta, Instruction};
use solana_pubkey::Pubkey;

use crate::world::{key, Accounts, World, SOL, SYSTEM};

pub const CAMPAIGN_ID: u64 = 15;
pub const SPONSOR: Pubkey = key(0x5A);
pub const CREATOR: Pubkey = key(0xC0);
/// The opening's prize and fee in the campaign's books, and in its vault.
pub const PRIZE: u64 = 4 * SOL;
pub const OPENING_FEE: u64 = SOL / 2;
/// The captured devnet updates (tests/fixtures; never edited) and their sponsored addresses.
pub const SOL_USD: &[u8] = include_bytes!("../../../../tests/fixtures/pyth-sol-usd-devnet.bin");
pub const BTC_USD: &[u8] = include_bytes!("../../../../tests/fixtures/pyth-btc-usd-devnet.bin");
pub const SOL_USD_ACCOUNT: Pubkey = address!("7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE");
pub const BTC_USD_ACCOUNT: Pubkey = address!("APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5");
const RECEIVER: Pubkey = address!("rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp");
const BTC_FEED: [u8; 32] = [
    0xe6, 0x2d, 0xf6, 0xc8, 0xb4, 0xa8, 0x5f, 0xe1, 0xa6, 0x7d, 0xb4, 0x4d, 0xc1, 0x2d, 0xe5, 0xdb,
    0x33, 0x0f, 0x7a, 0xc6, 0x6b, 0x72, 0xdc, 0x65, 0x8a, 0xfe, 0xdf, 0x0f, 0x4a, 0x41, 0x5b, 0x43,
];
/// Seven seconds after the fixtures' publish time: both are fresh.
pub const NOW: i64 = 1_791_216_180;
pub const DAY: i64 = 86_400;
/// The SOL/USD price a charge reads: the captured price less its confidence (exponent −8).
pub const SOL_CHARGED: i64 = 11_921_844_516 - 655_484;

pub fn pda(seeds: &[&[u8]]) -> (Pubkey, u8) {
    Pubkey::find_program_address(seeds, &ID)
}
pub fn campaign_address() -> (Pubkey, u8) {
    pda(&[CAMPAIGN_SEED, &CAMPAIGN_ID.to_le_bytes()])
}
pub fn vault_address() -> (Pubkey, u8) {
    pda(&[VAULT_SEED, campaign_address().0.as_ref()])
}
pub fn sealed_fee_address(sponsor: &Pubkey) -> (Pubkey, u8) {
    pda(&[
        SEALED_FEE_SEED,
        campaign_address().0.as_ref(),
        sponsor.as_ref(),
    ])
}

/// A paid BTC/USD campaign above 110% of the captured price, `Open`, nothing joined; then `edit`.
pub fn campaign_data(edit: impl FnOnce(&mut Campaign)) -> Vec<u8> {
    let ((_, bump), (_, vault_bump)) = (campaign_address(), vault_address());
    let mut data = vec![0u8; Campaign::LEN];
    let c = Campaign::from_bytes_mut(&mut data).expect("exact length");
    (c.tag, c.version, c.bump, c.vault_bump) =
        (AccountTag::Campaign as u8, LAYOUT_VERSION, bump, vault_bump);
    (c.kind, c.direction, c.status) = (
        ReaderKind::PriceTouch as u8,
        Direction::Above as u8,
        Status::Open as u8,
    );
    (c.id, c.creator, c.rent_payer) = (LeU64::new(CAMPAIGN_ID), CREATOR, CREATOR);
    (c.template_version, c.creator_share_bps) = (LeU16::new(1), LeU16::new(100));
    (c.fee_bps, c.one_sided_fee_bps) = (LeU16::new(1_000), LeU16::new(100));
    (c.feed_id, c.metric_account) = (BTC_FEED, BTC_USD_ACCOUNT);
    c.target = LeI128::new(9_373_357_187_557);
    (c.price_exponent, c.max_age) = (LeI32::new(-8), LeU32::new(120));
    c.opens_at = LeI64::new(NOW - DAY);
    c.entries_close_at = LeI64::new(NOW + 5 * DAY);
    c.deadline_at = LeI64::new(NOW + 6 * DAY);
    (c.opening_usd, c.prize_lamports) = (LeU64::new(500), LeU64::new(PRIZE));
    c.opening_fee_lamports = LeU64::new(OPENING_FEE);
    (c.event_seq, c.min_entry_lamports) = (LeU64::new(1), LeU64::new(10_000_000));
    edit(c);
    data
}

/// `sponsor`'s SealedFee holding `fee`, as one sealed entry of US$500 leaves it; then `edit`.
pub fn sealed_fee_data(sponsor: &Pubkey, fee: u64, edit: impl FnOnce(&mut SealedFee)) -> Vec<u8> {
    let mut data = vec![0u8; SealedFee::LEN];
    let s = SealedFee::from_bytes_mut(&mut data).expect("exact length");
    (s.tag, s.version) = (AccountTag::SealedFee as u8, LAYOUT_VERSION);
    (s.bump, s.campaign, s.sponsor) = (
        sealed_fee_address(sponsor).1,
        campaign_address().0,
        *sponsor,
    );
    let entry = fee.checked_mul(9).expect("the entry part of a 90/10 split");
    (s.fee_lamports, s.entry_lamports) = (LeU64::new(fee), LeU64::new(entry));
    (s.usd_total, s.sealed_count) = (LeU64::new(500), LeU32::new(1));
    edit(s);
    data
}

/// `parts` added with checked math (the crate denies unchecked arithmetic in its tests too).
pub fn sum(parts: &[u64]) -> u64 {
    parts
        .iter()
        .try_fold(0u64, |total, part| total.checked_add(*part))
        .expect("lamports")
}

/// An account the program owns holding `data`, with its rent and `extra` lamports.
pub fn funded(world: &World, data: Vec<u8>, extra: u64) -> Account {
    let mut account = world.owned(data);
    account.lamports = account.lamports.checked_add(extra).expect("lamports");
    account
}

/// A wallet holding `lamports`.
pub fn wallet(lamports: u64) -> Account {
    Account::new(lamports, 0, &SYSTEM)
}

/// A captured Pyth update owned by the receiver.
fn price(world: &World, bytes: &[u8]) -> Account {
    let mut account = world.owned(bytes.to_vec());
    account.owner = RECEIVER;
    account
}

fn writable(address: Pubkey) -> AccountMeta {
    AccountMeta::new(address, false)
}

fn instruction(discriminator: u8, args: &[u8], mut accounts: Vec<AccountMeta>) -> Instruction {
    accounts.push(AccountMeta::new_readonly(EVENT_AUTHORITY, false));
    accounts.push(AccountMeta::new_readonly(ID, false));
    let data = [&[discriminator], args].concat();
    Instruction {
        program_id: ID,
        accounts,
        data,
    }
}

fn event_accounts() -> Accounts {
    let program = create_program_account_loader_v3(&ID);
    vec![(EVENT_AUTHORITY, Account::default()), (ID, program)]
}

/// `settle_sealed_fee` on `sponsor`'s SealedFee of the campaign, its fee vault the world's.
pub fn settle_ix(world: &World, sealed_fee: Pubkey, sponsor: Pubkey) -> Instruction {
    let slots = [sealed_fee, campaign_address().0, sponsor, world.fee_vault];
    instruction(ix::SETTLE_SEALED_FEE, &[], slots.map(writable).to_vec())
}

/// The accounts of `settle_ix` for `SPONSOR`: the SealedFee, the campaign's bytes, the sponsor's wallet and the fee
/// vault, each at its address.
pub fn settle_accounts(world: &World, sealed_fee: Account, campaign: Vec<u8>) -> Accounts {
    let mut accounts = vec![
        (sealed_fee_address(&SPONSOR).0, sealed_fee),
        (campaign_address().0, world.owned(campaign)),
        (SPONSOR, wallet(SOL)),
        (world.fee_vault, world.owned(Vec::new())),
    ];
    accounts.extend(event_accounts());
    accounts
}

/// `close_campaign` with the creator as the rent payer.
pub fn close_ix(world: &World) -> Instruction {
    let slots = [
        campaign_address().0,
        vault_address().0,
        CREATOR,
        world.fee_vault,
    ];
    instruction(ix::CLOSE_CAMPAIGN, &[], slots.map(writable).to_vec())
}

pub fn close_accounts(world: &World, campaign: Vec<u8>) -> Accounts {
    let mut accounts = vec![
        (campaign_address().0, world.owned(campaign)),
        (vault_address().0, world.owned(Vec::new())),
        (CREATOR, wallet(SOL)),
        (world.fee_vault, world.owned(Vec::new())),
    ];
    accounts.extend(event_accounts());
    accounts
}

/// `sponsor_join_campaign` by `SPONSOR`: YES, `entry_usd` at most `max_lamports`, its first entry.
pub fn sponsor_join_ix(world: &World, entry_usd: u64, max_lamports: u64) -> Instruction {
    let args = SponsorJoinArgs {
        side: 0,
        entry_usd: LeU64::new(entry_usd),
        max_lamports: LeU64::new(max_lamports),
        min_return_bps: LeU32::new(0),
        expected_entry_total: LeU64::new(0),
    };
    let accounts = vec![
        AccountMeta::new(SPONSOR, true),
        AccountMeta::new_readonly(world.config, false),
        writable(campaign_address().0),
        writable(vault_address().0),
        writable(entry_address()),
        AccountMeta::new_readonly(BTC_USD_ACCOUNT, false),
        writable(join_address()),
        AccountMeta::new_readonly(SOL_USD_ACCOUNT, false),
        writable(sealed_fee_address(&SPONSOR).0),
        AccountMeta::new_readonly(SYSTEM, false),
    ];
    instruction(ix::SPONSOR_JOIN_CAMPAIGN, args.as_bytes(), accounts)
}

pub fn entry_address() -> Pubkey {
    pda(&[ENTRY_SEED, campaign_address().0.as_ref(), SPONSOR.as_ref()]).0
}
pub fn join_address() -> Pubkey {
    pda(&[
        JOIN_SEED,
        campaign_address().0.as_ref(),
        SPONSOR.as_ref(),
        &0u32.to_le_bytes(),
    ])
    .0
}

/// The accounts of `sponsor_join_ix` on the open campaign, the clock seven seconds after the captured prices.
pub fn sponsor_join_accounts(world: &mut World, sealed_fee: Account) -> Accounts {
    world.mollusk.sysvars.clock.unix_timestamp = NOW;
    let mut accounts = vec![
        (SPONSOR, wallet(1_000 * SOL)),
        (world.config, world.owned(world.config_data())),
        (campaign_address().0, world.owned(campaign_data(|_| {}))),
        (
            vault_address().0,
            funded(world, Vec::new(), PRIZE + OPENING_FEE),
        ),
        (entry_address(), Account::default()),
        (BTC_USD_ACCOUNT, price(world, BTC_USD)),
        (join_address(), Account::default()),
        (SOL_USD_ACCOUNT, price(world, SOL_USD)),
        (sealed_fee_address(&SPONSOR).0, sealed_fee),
        keyed_account_for_system_program(),
    ];
    accounts.extend(event_accounts());
    accounts
}
