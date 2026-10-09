//! Purpose: what the epoch kinds' host tests share: the captured pools and vote account, a clock
//!          in a mainnet epoch, a `Campaign`, the reader calls and the expected outcomes.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution), lane B

// Each test file that includes this module uses only part of it.
#![allow(dead_code, unused_imports)]

#[path = "../opening_support/mod.rs"]
mod opening_support;

use brot_markets::{
    error::BrotError,
    layout::{LeI128, LeI64, LeU64, ZeroCopy},
    readers::{
        self, epoch::EpochSchedule, ChainTime, CreationContext, CreationReading, Decision,
        ReadContext, Reading, Resolution,
    },
    state::{
        campaign::Campaign,
        enums::{Direction, ReaderKind, VoidReason},
        AccountTag, LAYOUT_VERSION,
    },
};
use pinocchio::{address::address, error::ProgramError, Address};

pub use brot_markets::constants::{STAKE_POOL_PROGRAM_ID, VOTE_PROGRAM_ID};
pub use opening_support::{err, HostAccount, NOW, SYSTEM_PROGRAM};

// Real mainnet accounts (scripts/capture-fixtures.ts); the files are never edited.
pub const JITOSOL: &[u8] = include_bytes!("../../../../tests/fixtures/stakepool-jitosol.bin");
pub const BSOL: &[u8] = include_bytes!("../../../../tests/fixtures/stakepool-bsol.bin");
pub const VOTE: &[u8] = include_bytes!("../../../../tests/fixtures/vote-mainnet-top.bin");
pub const JITOSOL_POOL: Address = address!("Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb");
pub const BSOL_POOL: Address = address!("stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi");
pub const VOTE_ACCOUNT: Address = address!("CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1");
pub const TOKEN_PROGRAM: Address = address!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

/// Where the pool's fields are when every option is unset (JitoSOL and bSOL), as the frozen tests
/// read them, and where the walk then ends.
pub const POOL_MINT: usize = 162;
pub const TOTAL_LAMPORTS: usize = 258;
pub const LAST_UPDATE_EPOCH: usize = 274;
pub const LAST_EPOCH_TOTAL: usize = 427;
pub const WALK_END: usize = 435;

pub const DAY: i64 = 86_400;
pub const SOL: u64 = 1_000_000_000;

/// `assert_eq!` that reports the caller's line, so a table of cases needs no labels.
#[track_caller]
pub fn same<T: PartialEq + core::fmt::Debug>(found: T, expected: T) {
    assert_eq!(found, expected);
}

pub fn u64_at(data: &[u8], at: usize) -> u64 {
    u64::from_le_bytes(data[at..][..8].try_into().unwrap())
}

pub fn set_u64(data: &mut [u8], at: usize, value: u64) {
    data[at..][..8].copy_from_slice(&value.to_le_bytes());
}

/// `NOW` moved by `seconds`.
pub fn at(seconds: i64) -> i64 {
    NOW.checked_add(seconds).unwrap()
}

/// The clock `into` slots into `epoch` on mainnet's schedule, at `unix_timestamp`.
pub fn clock_at(epoch: u64, into: u64, unix_timestamp: i64) -> ChainTime {
    let first = EpochSchedule::MAINNET.first_slot(epoch).unwrap();
    let slot = first.checked_add(into).unwrap();
    ChainTime {
        unix_timestamp,
        slot,
        epoch,
    }
}

/// The clock 100,000 slots into `epoch`, at `unix`.
pub fn clock(epoch: u64, unix: i64) -> ChainTime {
    clock_at(epoch, 100_000, unix)
}

/// A copy of `bytes`, edited.
pub fn edited(bytes: &[u8], edit: impl FnOnce(&mut Vec<u8>)) -> Vec<u8> {
    let mut data = bytes.to_vec();
    edit(&mut data);
    data
}

/// The JitoSOL pool under its owner, edited.
pub fn jito(edit: impl FnOnce(&mut Vec<u8>)) -> HostAccount {
    HostAccount::new(JITOSOL_POOL, STAKE_POOL_PROGRAM_ID, &edited(JITOSOL, edit))
}

/// The captured vote account under the Vote program, edited.
pub fn vote(edit: impl FnOnce(&mut Vec<u8>)) -> HostAccount {
    HostAccount::new(VOTE_ACCOUNT, VOTE_PROGRAM_ID, &edited(VOTE, edit))
}

/// The pool's first update of `epoch`: it stamps the epoch and keeps `value` as the snapshot.
pub fn snapshot(epoch: u64, value: u64) -> impl FnOnce(&mut Vec<u8>) {
    move |data| {
        set_u64(data, LAST_UPDATE_EPOCH, epoch);
        set_u64(data, LAST_EPOCH_TOTAL, value);
    }
}

/// An open campaign of `kind` on `metric`, measuring `epoch`, with its target and deadline.
pub fn campaign(kind: ReaderKind, metric: &Address, target: i128, epoch: u64, end: i64) -> Vec<u8> {
    let mut data = vec![0u8; Campaign::LEN];
    let c = Campaign::from_bytes_mut(&mut data).unwrap();
    c.tag = AccountTag::Campaign as u8;
    c.version = LAYOUT_VERSION;
    c.kind = kind as u8;
    c.metric_account = *metric;
    c.target = LeI128::new(target);
    c.epoch = LeU64::new(epoch);
    c.opens_at = LeI64::new(NOW);
    c.deadline_at = LeI64::new(end);
    data
}

/// `validate_at_creation` for `kind` on `metric`, through the dispatcher.
pub fn validate(
    kind: ReaderKind,
    metric: &mut HostAccount,
    target: i128,
    epoch: u64,
    deadline_at: i64,
    time: ChainTime,
) -> Result<CreationReading, ProgramError> {
    let view = metric.view();
    let (feed_id, direction, max_age) = (&[0; 32], Direction::Above, 0);
    let context = CreationContext {
        metric: &view,
        feed_id,
        direction,
        target,
        max_age,
        epoch,
        deadline_at,
        time,
    };
    readers::validate_at_creation(kind, &context)
}

type Call<T> = fn(ReaderKind, &ReadContext) -> Result<T, ProgramError>;

/// Calls `call` for the campaign `c` on `m` at time `t`, through the dispatcher.
fn read<T>(m: &mut HostAccount, c: &[u8], t: ChainTime, call: Call<T>) -> Result<T, ProgramError> {
    let (view, campaign) = (m.view(), Campaign::from_bytes(c).unwrap());
    let kind = ReaderKind::try_from(campaign.kind).unwrap();
    let context = ReadContext {
        metric: &view,
        campaign,
        time: t,
        proof: None,
    };
    call(kind, &context)
}

pub fn resolve(m: &mut HostAccount, c: &[u8], time: ChainTime) -> Result<Resolution, ProgramError> {
    read(m, c, time, readers::try_resolve)
}

pub fn knowable(m: &mut HostAccount, c: &[u8], time: ChainTime) -> Result<bool, ProgramError> {
    read(m, c, time, readers::outcome_knowable)
}

/// The reading an epoch kind reports: `observed` from `account`, no publish time.
pub fn reading(account: &Address, observed: i128) -> Reading {
    let mut host = HostAccount::new(*account, SYSTEM_PROGRAM, &[]);
    Reading::of(&host.view(), observed)
}

fn decided(decision: Decision) -> Result<Resolution, ProgramError> {
    Ok(Resolution::Decided(decision))
}

pub fn yes(account: &Address, observed: i128) -> Result<Resolution, ProgramError> {
    decided(Decision::yes(reading(account, observed)))
}

pub fn no(account: &Address, observed: i128) -> Result<Resolution, ProgramError> {
    decided(Decision::no(reading(account, observed), false))
}

/// A void reports nothing read: `observed` is zero.
pub fn void(account: &Address, reason: VoidReason) -> Result<Resolution, ProgramError> {
    decided(Decision::void(reason, reading(account, 0)))
}

pub const NOT_YET: Result<Resolution, ProgramError> = Ok(Resolution::NotYet);

pub fn refused<T>(error: BrotError) -> Result<T, ProgramError> {
    Err(err(error))
}
