//! Purpose: what the fact readers' host tests share: a campaign built from zeroed bytes, the
//!          reader contexts over runtime-shaped accounts (`opening_support::HostAccount`), broken
//!          copies of a captured account, and the two batteries both readers pass: every broken
//!          copy refused, and the irreversible-fact table on a real account.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution), lane A
// Each test file that includes this module uses only part of it.
#![allow(dead_code)]

use brot_markets::{
    error::BrotError,
    layout::ZeroCopy,
    readers::{
        outcome_knowable, try_resolve, validate_at_creation, ChainTime, CreationContext,
        CreationReading, Decision, ReadContext, Reading,
        Resolution::{self, Decided, NotYet},
    },
    state::{
        campaign::Campaign,
        enums::{Direction, ReaderKind, VoidReason},
    },
};
use pinocchio::{error::ProgramError, Address};

use crate::opening_support::{err, HostAccount, NOW};

/// What a reader call returns.
pub type Res<T> = Result<T, ProgramError>;

/// The campaigns' deadline: seven days after the clock the tests open at (`NOW`).
pub const DEADLINE: i64 = NOW + 7 * 86_400;
/// One second past it: the first moment `after_deadline` is true.
pub const AFTER: i64 = DEADLINE + 1;

/// The cluster at `unix_timestamp`; the fact readers read neither slot nor epoch.
pub fn at(unix_timestamp: i64) -> ChainTime {
    ChainTime {
        unix_timestamp,
        slot: 1,
        epoch: 0,
    }
}

/// The reading a fact decision carries: the value read from `account`, no publish time.
pub fn reading(account: Address, observed: i128) -> Reading {
    Reading {
        observed,
        account,
        publish_time: 0,
        posted_slot: 0,
    }
}

/// A refusal with the program's `error`, whatever the call returns when it succeeds.
pub fn refused<T>(error: BrotError) -> Res<T> {
    Err(err(error))
}

/// Rows 2 and 3 for `kind` on `account`, with the arguments a fact campaign passes: no feed,
/// direction 0, epoch 0, the deadline seven days away, the clock at `NOW`.
pub fn open(kind: ReaderKind, account: &mut HostAccount, target: i128) -> Res<CreationReading> {
    let view = account.view();
    let context = CreationContext {
        metric: &view,
        feed_id: &[0; 32],
        direction: Direction::Above,
        target,
        max_age: 0,
        epoch: 0,
        deadline_at: DEADLINE,
        time: at(NOW),
        curve_config: None,
    };
    validate_at_creation(kind, &context)
}

/// Runs `read` over a campaign on `account` with `target` and `DEADLINE`, the clock at `now`.
/// The campaign is zeroed bytes with those two fields set: the readers read nothing else.
pub fn with_campaign<R>(
    account: &mut HostAccount,
    target: i128,
    now: i64,
    read: impl FnOnce(&ReadContext) -> R,
) -> R {
    let view = account.view();
    let mut bytes = [0u8; 512];
    let campaign = Campaign::from_bytes_mut(&mut bytes).expect("a campaign is 512 bytes");
    campaign.target.set(target);
    campaign.deadline_at.set(DEADLINE);
    let (metric, time, proof) = (&view, at(now), None);
    read(&ReadContext {
        metric,
        campaign,
        time,
        proof,
    })
}

/// The join lock of `kind` on `account`, the clock at `NOW`.
pub fn knowable(kind: ReaderKind, account: &mut HostAccount, target: i128) -> Res<bool> {
    with_campaign(account, target, NOW, |c| outcome_knowable(kind, c))
}

/// Resolution of `kind` on `account`, the clock at `now`.
pub fn resolve(kind: ReaderKind, acc: &mut HostAccount, target: i128, now: i64) -> Res<Resolution> {
    with_campaign(acc, target, now, |c| try_resolve(kind, c))
}

/// Every broken copy of `data` a reader must refuse: each proper prefix (the empty one
/// included), the bytes stretched by 1 and by 100 zero bytes, and as many zero bytes.
pub fn broken_copies(data: &[u8]) -> Vec<(String, Vec<u8>)> {
    let cut = |len: usize| (format!("cut to {len} bytes"), data[..len].to_vec());
    let mut copies: Vec<(String, Vec<u8>)> = (0..data.len()).map(cut).collect();
    for extra in [1, 100] {
        let mut stretched = data.to_vec();
        stretched.resize(data.len().checked_add(extra).unwrap(), 0);
        copies.push((format!("stretched by {extra}"), stretched));
    }
    copies.push(("all zero".to_string(), vec![0; data.len()]));
    copies
}

/// `data` with `bytes` written at `at`.
pub fn patched(data: &[u8], at: usize, bytes: &[u8]) -> Vec<u8> {
    let mut copy = data.to_vec();
    copy[at..][..bytes.len()].copy_from_slice(bytes);
    copy
}

/// `a + b` and `a − b`, checked: the crate's lints deny unchecked arithmetic in tests too.
pub fn add(a: i128, b: i128) -> i128 {
    a.checked_add(b).unwrap()
}

pub fn sub(a: i128, b: i128) -> i128 {
    a.checked_sub(b).unwrap()
}

/// Every broken copy of `fixture`, held at `address` by `owner`, is refused with `error` by the
/// byte reader `read` and by each of the three reader methods; after the deadline it voids as
/// `UnreadableAccount`. Nothing panics.
pub fn assert_refuses_broken_copies(
    kind: ReaderKind,
    (address, owner): (Address, Address),
    fixture: &[u8],
    error: BrotError,
    read: impl Fn(&Address, &[u8]) -> Result<(), BrotError>,
) {
    let void = Decision::void(VoidReason::UnreadableAccount, reading(address, 0));
    for (name, bytes) in broken_copies(fixture) {
        let account = || HostAccount::new(address, owner, &bytes);
        assert_eq!(read(&owner, &bytes), Err(error), "{name}");
        assert_eq!(open(kind, &mut account(), 1), refused(error), "{name}");
        assert_eq!(knowable(kind, &mut account(), 1), refused(error), "{name}");
        let before = resolve(kind, &mut account(), 1, NOW);
        assert_eq!(before, refused(error), "{name}");
        let after = resolve(kind, &mut account(), 1, AFTER);
        assert_eq!(after, Ok(Decided(void)), "{name}");
    }
}

/// The join lock and the irreversible-fact table (TP section 3.4.6) on `account()`, whose reader
/// reads `value` at `address`: a target of `value` is met, `unmet` is not. Up to the deadline's
/// own second, met is YES (and locks joining) and not met waits; after it, NO, flagged `met_late`
/// when met. `gone()` is the same account unreadable (`error`): refused, then void.
pub fn assert_fact_table(
    kind: ReaderKind,
    (address, value, unmet): (Address, i128, i128),
    account: impl Fn() -> HostAccount,
    gone: impl Fn() -> HostAccount,
    error: BrotError,
) {
    let read = reading(address, value);
    assert_eq!(knowable(kind, &mut account(), value), Ok(true));
    assert_eq!(knowable(kind, &mut account(), unmet), Ok(false));
    assert_eq!(knowable(kind, &mut gone(), value), refused(error));
    for now in [NOW, DEADLINE] {
        let yes = Ok(Decided(Decision::yes(read)));
        assert_eq!(resolve(kind, &mut account(), value, now), yes, "{now}");
        let waits = resolve(kind, &mut account(), unmet, now);
        assert_eq!(waits, Ok(NotYet), "{now}");
        let unreadable = resolve(kind, &mut gone(), value, now);
        assert_eq!(unreadable, refused(error), "{now}");
    }
    let late = Ok(Decided(Decision::no(read, true)));
    assert_eq!(resolve(kind, &mut account(), value, AFTER), late);
    let never = Ok(Decided(Decision::no(read, false)));
    assert_eq!(resolve(kind, &mut account(), unmet, AFTER), never);
    let void = Decision::void(VoidReason::UnreadableAccount, reading(address, 0));
    assert_eq!(resolve(kind, &mut gone(), value, AFTER), Ok(Decided(void)));
}
