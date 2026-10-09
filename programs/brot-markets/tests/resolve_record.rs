//! Purpose: `resolve_campaign` on the host: what `record::write` stores and emits for a reader's
//!          decision (the result group only, checked math, `Unresolved` refused), and the
//!          handler's refusals in their order up to the clock, which the host lacks (X0.7).
//! Version: 0.0.1
//! Sprint: 03 (readers and resolution), lane D. The whole path, readers and event included, runs
//!         in LiteSVM (tests/brot/resolve-*.test.ts) after the SBF build.

#[path = "checks_support/host.rs"]
mod host;

use core::mem::offset_of;

use brot_markets::{
    constants::{CAMPAIGN_SEED, EVENT_AUTHORITY, REVIEW_WINDOW_SECONDS},
    error::BrotError::{self, *},
    events::CampaignResolved,
    instructions::resolution::resolve_campaign::{record, resolve_campaign},
    layout::{LeI128, LeI64, LeU64, ZeroCopy},
    readers::{ChainTime, Decision, Reading},
    state::{campaign::Campaign, enums::*, AccountTag, LAYOUT_VERSION},
    ID,
};
use host::{key, HostAccount, SYSTEM};
use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

const NOW: i64 = 1_791_216_180;
const LATER: i64 = NOW + REVIEW_WINDOW_SECONDS;
const TIME: ChainTime = ChainTime {
    unix_timestamp: NOW,
    slot: 452_305_000,
    epoch: 1_047,
};
const METRIC: Address = key(2);
/// A reading of `METRIC`, as the four kinds without a publish time report it.
const READING: Reading = Reading {
    observed: 900_000,
    account: METRIC,
    publish_time: 0,
    posted_slot: 0,
};
const STATUS: usize = offset_of!(Campaign, status);
const KIND: usize = offset_of!(Campaign, kind);

/// A campaign of `kind` whose other bytes are all 0xA5, so a stray write shows, with `event_seq`.
fn patterned(kind: ReaderKind, event_seq: u64) -> Vec<u8> {
    let mut bytes = vec![0xA5; Campaign::LEN];
    let campaign = Campaign::from_bytes_mut(&mut bytes).unwrap();
    (campaign.kind, campaign.status) = (kind as u8, Status::Open as u8);
    campaign.event_seq = LeU64::new(event_seq);
    bytes
}

/// What `write` must leave of `patterned(PriceTouch, seq)` for `d`, byte for byte: `InReview` (1),
/// its fields at `NOW`, the window to `LATER`, `event_seq` one higher, nothing else changed.
fn resolved(seq: u64, d: &Decision) -> Vec<u8> {
    let mut bytes = patterned(ReaderKind::PriceTouch, seq.checked_add(1).unwrap());
    let c = Campaign::from_bytes_mut(&mut bytes).unwrap();
    (c.status, c.outcome, c.void_reason) = (1, d.outcome as u8, d.void_reason as u8);
    (c.met_late, c.observed_value) = (u8::from(d.met_late), LeI128::new(d.reading.observed));
    (c.resolved_at, c.review_ends_at) = (LeI64::new(NOW), LeI64::new(LATER));
    c.publish_time = LeI64::new(d.reading.publish_time);
    bytes
}

type Recorded = (Result<CampaignResolved, ProgramError>, Vec<u8>);

/// `record::write` on `patterned(PriceTouch, seq)` at `key(1)`: the result and the bytes after.
fn record(decision: &Decision, time: ChainTime, seq: u64) -> Recorded {
    let mut bytes = patterned(ReaderKind::PriceTouch, seq);
    let campaign = Campaign::from_bytes_mut(&mut bytes).unwrap();
    let result = record::write(&key(1), campaign, decision, &time);
    (result, bytes)
}

#[test]
fn a_stale_feed_void_stores_the_result_and_emits_the_reading_behind_it() {
    let mut reading = READING;
    (reading.observed, reading.account) = (-8_521_233_806_870, key(7));
    (reading.publish_time, reading.posted_slot) = (1_791_215_000, 452_304_000);
    let decision = Decision::void(VoidReason::StaleFeed, reading);
    let (result, after) = record(&decision, TIME, 41);
    assert_eq!(after, resolved(41, &decision));
    let expected = CampaignResolved {
        campaign: key(1),
        seq: LeU64::new(41),
        kind: ReaderKind::PriceTouch as u8,
        outcome: Outcome::Void as u8,
        void_reason: VoidReason::StaleFeed as u8,
        met_late: 0,
        observed_value: LeI128::new(-8_521_233_806_870),
        read_account: key(7),
        publish_time: LeI64::new(1_791_215_000),
        posted_slot: LeU64::new(452_304_000),
        resolved_at: LeI64::new(NOW),
        review_ends_at: LeI64::new(LATER),
        slot: LeU64::new(452_305_000),
        epoch: LeU64::new(1_047),
    };
    assert_eq!(result.unwrap().as_bytes(), expected.as_bytes());
}

#[test]
fn yes_and_a_late_no_store_their_outcome_and_flag() {
    let yes = Decision::yes(READING);
    let (result, after) = record(&yes, TIME, 0);
    assert_eq!(after, resolved(0, &yes));
    let event = result.unwrap();
    let published = (event.publish_time.get(), event.posted_slot.get());
    assert_eq!((event.seq.get(), event.outcome, event.met_late), (0, 1, 0));
    assert_eq!((event.read_account, published), (METRIC, (0, 0)));
    let late_no = Decision::no(READING, true);
    let (result, after) = record(&late_no, TIME, 5);
    assert_eq!(after, resolved(5, &late_no));
    let event = result.unwrap();
    assert_eq!((event.seq.get(), event.outcome, event.met_late), (5, 2, 1));
}

#[test]
fn an_overflow_or_an_unresolved_decision_writes_nothing() {
    let mut late = TIME;
    late.unix_timestamp = i64::MAX;
    let yes = Decision::yes(READING);
    let mut unresolved = yes;
    unresolved.outcome = Outcome::Unresolved;
    let cases = [
        (yes, late, 0, MathOverflow),
        (yes, TIME, u64::MAX, MathOverflow),
        (unresolved, TIME, 0, NotResolvableYet),
    ];
    for (decision, time, seq, error) in cases {
        let (result, after) = record(&decision, time, seq);
        assert_eq!(result.err(), Some(ProgramError::from(error)));
        assert_eq!(after, patterned(ReaderKind::PriceTouch, seq));
    }
}

/// One slot of the handler: address, owner, data, writable.
type Slot = (Address, Address, Vec<u8>, bool);
/// The instruction data and the slots of one call.
type Call = (Vec<u8>, Vec<Slot>);
/// A change to a call, the campaign's bytes being `c.1[0].2`.
type Tamper = fn(&mut Call);
const NOT_OPEN: Tamper = |c| c.1[0].2[STATUS] = Status::Settled as u8;
const OTHER_METRIC: Tamper = |c| c.1[1].0 = key(9);
const UNKNOWN_KIND: Tamper = |c| c.1[0].2[KIND] = 5;

/// The handler, on host accounts, for an `Open` supply campaign that passes, after `tampers`.
fn resolve_with(tampers: &[Tamper]) -> ProgramResult {
    let id = 7u64;
    let (address, bump) = Address::find_program_address(&[CAMPAIGN_SEED, &id.to_le_bytes()], &ID);
    let mut bytes = patterned(ReaderKind::SupplyAtMost, 0);
    let c = Campaign::from_bytes_mut(&mut bytes).unwrap();
    (c.tag, c.version, c.bump) = (AccountTag::Campaign as u8, LAYOUT_VERSION, bump);
    (c.id, c.metric_account) = (LeU64::new(id), METRIC);
    let mut call: Call = (Vec::new(), vec![(address, ID, bytes, true)]);
    call.1.push((METRIC, SYSTEM, vec![0; 82], false));
    call.1.push((key(3), SYSTEM, Vec::new(), false));
    call.1.push((EVENT_AUTHORITY, SYSTEM, Vec::new(), false));
    call.1.push((ID, key(4), Vec::new(), false));
    tampers.iter().for_each(|tamper| tamper(&mut call));
    let host = |slot: &Slot| match slot.3 {
        true => HostAccount::new(slot.0, slot.1, &slot.2).writable(),
        false => HostAccount::new(slot.0, slot.1, &slot.2),
    };
    let mut accounts: Vec<HostAccount> = call.1.iter().map(host).collect();
    let mut views: Vec<AccountView> = accounts.iter_mut().map(HostAccount::view).collect();
    resolve_campaign(&ID, &mut views, &call.0)
}

/// `tampers` make the handler refuse with `error`.
#[track_caller]
fn refuses(tampers: &[Tamper], error: BrotError) {
    assert_eq!(resolve_with(tampers), Err(error.into()));
}

#[test]
fn the_handler_refuses_in_its_order_then_reads_the_clock() {
    refuses(&[|c| c.0 = vec![0]], BadInstructionData);
    let short = resolve_with(&[|c| c.1.truncate(4)]);
    assert_eq!(short, Err(ProgramError::NotEnoughAccountKeys));
    refuses(&[|c| c.1[0].3 = false], NotWritable);
    refuses(&[|c| c.1[3].0 = key(5)], WrongEventAuthority);
    refuses(&[|c| c.1[4].0 = key(6)], WrongProgramAccount);
    refuses(&[|c| c.1[0].1 = SYSTEM], WrongOwner);
    refuses(&[|c| c.1[0].2.push(0)], WrongLength);
    refuses(&[|c| c.1[0].2[0] = AccountTag::Entry as u8], WrongTag);
    refuses(&[|c| c.1[0].2[1] = 2], WrongLayoutVersion);
    refuses(&[|c| c.1[0].0 = key(8)], PdaMismatch);
    refuses(&[NOT_OPEN], CampaignNotOpen);
    refuses(&[OTHER_METRIC], MetricAccountMismatch);
    refuses(&[UNKNOWN_KIND], UnknownReaderKind);
    // The status before the metric slot, and the metric slot before the kind.
    refuses(&[NOT_OPEN, OTHER_METRIC, UNKNOWN_KIND], CampaignNotOpen);
    refuses(&[OTHER_METRIC, UNKNOWN_KIND], MetricAccountMismatch);
    // Every check passed: the next step is the clock, a sysvar the host does not have.
    assert_eq!(resolve_with(&[]), Err(ProgramError::UnsupportedSysvar));
}
