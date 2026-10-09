//! Purpose: the `StakeAtLeast` YES path on the program's SBF binary in Mollusk, which LiteSVM's
//!          npm package cannot show (its `sol_get_epoch_stake` reads zero): an open campaign, the
//!          captured vote account and Mollusk's epoch stake give YES at the target, NO one
//!          lamport short, `MissedWindow` once the epoch is over, and nothing before it.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution), lane B
//!
//! The sprint named the `litesvm` crate's `set_epoch_stake`. The integrator chose Mollusk 0.14,
//! already pinned, instead: `mollusk.epoch_stake`, a map from vote account to stake, answers the
//! same syscall without a new dependency. Runs after the SBF build, like `checks_mollusk.rs`
//! (`BROT_MARKETS_SO`, else `target/deploy/brot_markets.so`).

// The world re-exports the checks' instruction builders, which this file does not use.
#[allow(unused_imports)]
#[path = "checks_support/mollusk.rs"]
mod world;

use brot_markets::{
    constants::{CAMPAIGN_SEED, EVENT_AUTHORITY, VAULT_SEED, VOTE_PROGRAM_ID},
    error::BrotError,
    instructions::ix,
    layout::{LeI128, LeI64, LeU16, LeU64, ZeroCopy},
    state::{
        campaign::Campaign,
        enums::{Outcome, ReaderKind, Status, VoidReason},
        AccountTag, LAYOUT_VERSION,
    },
    ID,
};
use mollusk_svm::{program::create_program_account_loader_v3, result::InstructionResult};
use solana_account::Account;
use solana_instruction::{AccountMeta, Instruction};
use solana_pubkey::Pubkey;
use world::{after, assert_ok, assert_refused, key, World, SOL};

/// The captured mainnet vote account (tests/fixtures/index.json), 3,762 bytes, a `V4`.
const VOTE: &[u8] = include_bytes!("../../../tests/fixtures/vote-mainnet-top.bin");
const VOTE_ACCOUNT: Pubkey =
    pinocchio::address::address!("CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1");
const CAMPAIGN_ID: u64 = 7;
/// The measured epoch, and its first slot on Mollusk's schedule (432,000 slots, no warmup).
const EPOCH: u64 = 1_048;
const SLOTS_PER_EPOCH: u64 = 432_000;
const TARGET: u64 = 15_000_000 * SOL;
const NOW: i64 = 1_791_216_180;
const DAY: i64 = 86_400;

/// A `StakeAtLeast` campaign on the vote account as a free team opening writes it two days ago,
/// `Open`, measuring `EPOCH`, its deadline five days from now.
fn campaign_account(world: &World) -> (Pubkey, Account) {
    let (address, bump) =
        Pubkey::find_program_address(&[CAMPAIGN_SEED, &CAMPAIGN_ID.to_le_bytes()], &ID);
    let (_, vault_bump) = Pubkey::find_program_address(&[VAULT_SEED, address.as_ref()], &ID);
    let mut data = vec![0u8; Campaign::LEN];
    let c = Campaign::from_bytes_mut(&mut data).expect("exact length");
    c.tag = AccountTag::Campaign as u8;
    c.version = LAYOUT_VERSION;
    c.bump = bump;
    c.vault_bump = vault_bump;
    c.kind = ReaderKind::StakeAtLeast as u8;
    c.status = Status::Open as u8;
    c.outcome = Outcome::Unresolved as u8;
    c.creator_is_team = 1;
    c.id = LeU64::new(CAMPAIGN_ID);
    c.creator = key(0xC0);
    c.rent_payer = key(0xC0);
    c.template_version = LeU16::new(1);
    c.fee_bps = LeU16::new(1_000);
    c.one_sided_fee_bps = LeU16::new(100);
    c.metric_account = VOTE_ACCOUNT;
    c.target = LeI128::new(i128::from(TARGET));
    c.opens_at = LeI64::new(NOW - 2 * DAY);
    c.entries_close_at = LeI64::new(NOW + 4 * DAY);
    c.deadline_at = LeI64::new(NOW + 5 * DAY);
    c.event_seq = LeU64::new(1);
    c.epoch = LeU64::new(EPOCH);
    (address, world.owned(data))
}

/// `resolve_campaign` with the clock 100,000 slots into `epoch` and `stake` for the vote account.
fn resolve_at(epoch: u64, stake: u64) -> (InstructionResult, Pubkey) {
    let mut world = World::new();
    let clock = &mut world.mollusk.sysvars.clock;
    clock.epoch = epoch;
    clock.leader_schedule_epoch = epoch.checked_add(1).unwrap();
    clock.slot = epoch
        .checked_mul(SLOTS_PER_EPOCH)
        .unwrap()
        .checked_add(100_000)
        .unwrap();
    clock.unix_timestamp = NOW;
    world.mollusk.epoch_stake.insert(VOTE_ACCOUNT, stake);
    let (campaign, account) = campaign_account(&world);
    let vote = Account {
        lamports: world.rent(VOTE.len()),
        data: VOTE.to_vec(),
        owner: VOTE_PROGRAM_ID,
        executable: false,
        rent_epoch: 0,
    };
    // Slots: campaign, metric, proof (the metric again: other kinds do not read it), events.
    let instruction = Instruction {
        program_id: ID,
        accounts: vec![
            AccountMeta::new(campaign, false),
            AccountMeta::new_readonly(VOTE_ACCOUNT, false),
            AccountMeta::new_readonly(VOTE_ACCOUNT, false),
            AccountMeta::new_readonly(EVENT_AUTHORITY, false),
            AccountMeta::new_readonly(ID, false),
        ],
        data: vec![ix::RESOLVE_CAMPAIGN],
    };
    let accounts = vec![
        (campaign, account),
        (VOTE_ACCOUNT, vote),
        (EVENT_AUTHORITY, Account::default()),
        (ID, create_program_account_loader_v3(&ID)),
    ];
    (world.run(&instruction, &accounts), campaign)
}

/// The campaign's status, outcome, void reason and observed value after a resolution.
fn recorded(result: &InstructionResult, campaign: &Pubkey) -> (u8, u8, u8, i128) {
    assert_ok(result);
    let data = &after(result, campaign).data;
    let c = Campaign::from_bytes(data).expect("exact length");
    (c.status, c.outcome, c.void_reason, c.observed_value.get())
}

#[test]
fn the_stake_at_the_target_in_the_measured_epoch_resolves_yes() {
    let (result, campaign) = resolve_at(EPOCH, TARGET);
    let (status, outcome, reason, observed) = recorded(&result, &campaign);
    assert_eq!(
        (status, outcome),
        (Status::InReview as u8, Outcome::Yes as u8)
    );
    assert_eq!(reason, VoidReason::None as u8);
    assert_eq!(observed, i128::from(TARGET));
}

#[test]
fn one_lamport_short_resolves_no() {
    let short = TARGET.checked_sub(1).unwrap();
    let (result, campaign) = resolve_at(EPOCH, short);
    let (status, outcome, reason, observed) = recorded(&result, &campaign);
    assert_eq!(
        (status, outcome),
        (Status::InReview as u8, Outcome::No as u8)
    );
    assert_eq!(reason, VoidReason::None as u8);
    assert_eq!(observed, i128::from(short));
}

#[test]
fn past_the_measured_epoch_the_window_is_missed_whatever_the_stake() {
    let next = EPOCH.checked_add(1).unwrap();
    let (result, campaign) = resolve_at(next, TARGET);
    let (status, outcome, reason, observed) = recorded(&result, &campaign);
    assert_eq!(
        (status, outcome),
        (Status::InReview as u8, Outcome::Void as u8)
    );
    assert_eq!(reason, VoidReason::MissedWindow as u8);
    assert_eq!(observed, 0);
}

#[test]
fn before_the_measured_epoch_nothing_can_be_recorded() {
    let previous = EPOCH.checked_sub(1).unwrap();
    let (result, _) = resolve_at(previous, TARGET);
    assert_refused(&result, BrotError::NotResolvableYet);
}
