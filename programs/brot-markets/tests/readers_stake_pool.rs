//! Purpose: `StakePoolTvlAtLeast` on the captured JitoSOL and bSOL pools: the walk's values at the
//!          frozen offsets and past set options, every refusal of the bytes (owner, account type,
//!          tags, truncation), rows 2 and 3 at their edges, and every arm of resolution.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution), lane B. Ports tests of pred-provable's `resolver.rs`:
//!         Copyright (c) 2026 Ronaldo Pereira, MIT License (LICENSE at the repository root).

mod epoch_support;

use brot_markets::{
    error::BrotError::*,
    readers::stake_pool::{parse_stake_pool, read_stake_pool},
    state::enums::{
        ReaderKind,
        VoidReason::{MissedWindow, UnreadableAccount},
    },
};
use epoch_support::*;

const KIND: ReaderKind = ReaderKind::StakePoolTvlAtLeast;
/// The seven options of the layout: the tag's offset when all are unset, a set tag, the payload.
const OPTIONS: [(usize, u8, usize); 7] = [
    (346, 2, 16), // next_epoch_fee: FutureEpoch<Fee>
    (347, 1, 32), // preferred_deposit_validator_vote_address: Option<Pubkey>
    (348, 1, 32), // preferred_withdraw_validator_vote_address
    (381, 1, 16), // next_stake_withdrawal_fee
    (383, 1, 32), // sol_deposit_authority
    (401, 1, 32), // sol_withdraw_authority
    (418, 2, 16), // next_sol_withdrawal_fee
];

/// The epoch of both pools' last update when captured: the clock's epoch at their openings.
const UPDATED: u64 = 1_047;

/// JitoSOL's walked bytes with the `options` set: each tag, then its payload.
fn with_options(options: &[(usize, u8, usize)]) -> Vec<u8> {
    let mut out = Vec::new();
    for (at, byte) in JITOSOL[..WALK_END].iter().enumerate() {
        out.push(*byte);
        if let Some((_, tag, len)) = options.iter().find(|option| option.0 == at) {
            *out.last_mut().unwrap() = *tag;
            out.resize(out.len().checked_add(*len).unwrap(), 0x5A);
        }
    }
    out
}

#[test]
fn decodes_both_pools_at_the_offsets_the_frozen_tests_use() {
    for bytes in [JITOSOL, BSOL] {
        let pool = parse_stake_pool(bytes).unwrap();
        same(&pool.pool_mint[..], &bytes[POOL_MINT..][..32]);
        same(pool.total_lamports, u64_at(bytes, TOTAL_LAMPORTS));
        same(pool.last_update_epoch, u64_at(bytes, LAST_UPDATE_EPOCH));
        let snapshot = u64_at(bytes, LAST_EPOCH_TOTAL);
        same(pool.last_epoch_total_lamports, snapshot);
        same(pool.last_update_epoch, UPDATED);
    }
    // The two orders of the totals: JitoSOL's current total is the higher, bSOL's snapshot is.
    assert!(u64_at(JITOSOL, TOTAL_LAMPORTS) > u64_at(JITOSOL, LAST_EPOCH_TOTAL));
    assert!(u64_at(BSOL, LAST_EPOCH_TOTAL) > u64_at(BSOL, TOTAL_LAMPORTS));
}

#[test]
fn the_walk_follows_set_options_to_the_end_of_the_largest_layout() {
    // The frozen test's case: a pending next_epoch_fee (+16), a set sol_deposit_authority (+32).
    let moved = with_options(&[(346, 1, 16), (383, 1, 32)]);
    let snapshot = parse_stake_pool(&moved).unwrap().last_epoch_total_lamports;
    same(snapshot, u64_at(JITOSOL, LAST_EPOCH_TOTAL));
    same(&moved[475..483], &JITOSOL[427..435]);
    // Every option set: the largest layout fills exactly the 611 bytes the program allocates.
    let full = with_options(&OPTIONS);
    same(full.len(), JITOSOL.len());
    same(parse_stake_pool(&full), parse_stake_pool(JITOSOL));
    for len in 0..full.len() {
        same(parse_stake_pool(&full[..len]), Err(ReaderBadLayout));
    }
}

#[test]
fn refuses_other_owners_types_tags_zeros_and_every_truncation() {
    for account_type in [0u8, 2, 3, 0xFF] {
        let data = edited(JITOSOL, |data| data[0] = account_type);
        same(parse_stake_pool(&data), Err(ReaderBadLayout));
    }
    // FutureEpoch<Fee> tags are 0, 1 or 2; Option<Pubkey> tags 0 or 1.
    for (at, _, len) in OPTIONS {
        let data = edited(JITOSOL, |data| data[at] = if len == 16 { 3 } else { 2 });
        same(parse_stake_pool(&data), Err(ReaderBadLayout));
    }
    let bad = Err(ReaderBadLayout);
    same(parse_stake_pool(&[0; 611]), bad);
    // Every truncation fails; bytes past the walk are not read.
    for bytes in [JITOSOL, BSOL] {
        let whole = parse_stake_pool(bytes);
        for len in 0..bytes.len() {
            let expected = if len < WALK_END { bad } else { whole };
            same(parse_stake_pool(&bytes[..len]), expected);
        }
        for extra in [1usize, 100] {
            let len = bytes.len().checked_add(extra).unwrap();
            let longer = edited(bytes, |d| d.resize(len, 0xFF));
            same(parse_stake_pool(&longer), whole);
        }
    }
    // The owner is checked before any byte.
    let read = |mut pool: HostAccount| read_stake_pool(&pool.view());
    let other = |bytes| read(HostAccount::new(JITOSOL_POOL, TOKEN_PROGRAM, bytes));
    same(other(JITOSOL), refused(ReaderWrongOwner));
    same(other(&[]), refused(ReaderWrongOwner));
    let empty = HostAccount::new(JITOSOL_POOL, STAKE_POOL_PROGRAM_ID, &[]);
    same(read(empty), refused(ReaderBadLayout));
    same(read(jito(|_| {})), Ok(parse_stake_pool(JITOSOL).unwrap()));
}

#[test]
fn opens_one_minimum_distance_above_the_higher_total_of_both_pools() {
    let (week, time) = (at(7 * DAY), clock(UPDATED, NOW));
    let measured = UPDATED + 1;
    for (pool_at, bytes) in [(JITOSOL_POOL, JITOSOL), (BSOL_POOL, BSOL)] {
        let mut pool = HostAccount::new(pool_at, STAKE_POOL_PROGRAM_ID, bytes);
        let mut open = |target| validate(KIND, &mut pool, target, measured, week, time);
        let total = u64_at(bytes, TOTAL_LAMPORTS);
        let snapshot = u64_at(bytes, LAST_EPOCH_TOTAL);
        let current = i128::from(total.max(snapshot));
        // Row 3 [AC]: 1% of the current value, rounded up.
        let hundredfold = current.checked_mul(100).unwrap();
        let distance = hundredfold.checked_add(9_999).unwrap() / 10_000;
        let nearest = current.checked_add(distance).unwrap();
        let below = nearest.checked_sub(1).unwrap();
        same(open(nearest), Ok(Default::default()));
        same(open(below), refused(TargetTooClose));
        same(open(current), refused(TargetAlreadyTouched));
        // Between the two totals: met by the higher one.
        let between = i128::from(total.min(snapshot)).checked_add(1).unwrap();
        same(open(between), refused(TargetAlreadyTouched));
        same(open(0), refused(TargetUnreachable));
        same(open(-1), refused(TargetUnreachable));
    }
}

#[test]
fn opening_refuses_a_started_epoch_a_stopped_pool_and_other_accounts() {
    let (epoch, next, second, third) = (UPDATED, UPDATED + 1, UPDATED + 2, UPDATED + 3);
    let open = |mut pool: HostAccount, measured: u64, now_epoch: u64| {
        let (target, week, time) = (i128::from(u64::MAX), at(7 * DAY), clock(now_epoch, NOW));
        validate(KIND, &mut pool, target, measured, week, time)
    };
    let fresh = || jito(|_| {});
    same(open(fresh(), epoch, epoch), refused(EpochAlreadyStarted));
    // One epoch behind the clock, the pool can still write the snapshot; two behind, it stopped.
    same(open(fresh(), second, next), Ok(Default::default()));
    same(open(fresh(), third, second), refused(StakePoolNotUpdating));
    // The account is read first, before the epoch rule.
    let list = jito(|d| d[0] = 2);
    same(open(list, epoch, epoch), refused(ReaderBadLayout));
    let truncated = jito(|d| d.truncate(434));
    same(open(truncated, next, epoch), refused(ReaderBadLayout));
    let other = HostAccount::new(JITOSOL_POOL, TOKEN_PROGRAM, JITOSOL);
    same(open(other, epoch, epoch), refused(ReaderWrongOwner));
}

#[test]
fn resolution_table() {
    let p = JITOSOL_POOL;
    let (before, e, after) = (UPDATED, UPDATED + 1, UPDATED + 2);
    let current = u64_at(JITOSOL, TOTAL_LAMPORTS).max(u64_at(JITOSOL, LAST_EPOCH_TOTAL));
    let goal = current.checked_add(1_000 * SOL).unwrap();
    let short = goal.checked_sub(1).unwrap();
    let (g, s) = (i128::from(goal), i128::from(short));
    let late = at(7 * DAY + 1);
    let c = campaign(KIND, &p, g, e, at(7 * DAY));
    let run = |epoch, unix, mut pool: HostAccount| resolve(&mut pool, &c, clock(epoch, unix));
    let other = || HostAccount::new(p, TOKEN_PROGRAM, JITOSOL);
    let flash = |d: &mut Vec<u8>| {
        snapshot(e, short)(d);
        set_u64(d, TOTAL_LAMPORTS, u64::MAX);
    };
    same(run(before, NOW, jito(|_| {})), NOT_YET);
    same(run(before, NOW, jito(snapshot(e, goal))), NOT_YET); // not possible on chain
    same(run(before, late, jito(|_| {})), void(&p, MissedWindow));
    same(run(e, NOW, jito(|_| {})), NOT_YET); // no update of E yet
    same(run(e, late, jito(|_| {})), NOT_YET); // the update may still come in E
    same(run(e, NOW, jito(snapshot(e, goal))), yes(&p, g));
    same(run(e, NOW, jito(snapshot(e, short))), no(&p, s));
    same(run(e, NOW, jito(flash)), no(&p, s)); // total_lamports is never read
    same(run(after, late, jito(snapshot(e, goal))), yes(&p, g)); // E's snapshot, read late
    same(run(after, NOW, jito(snapshot(e, short))), no(&p, s));
    let overwritten = || jito(snapshot(after, goal));
    same(run(after, NOW, overwritten()), void(&p, MissedWindow));
    same(run(e, NOW, overwritten()), void(&p, MissedWindow)); // not possible on chain
    same(run(after, NOW, jito(|_| {})), void(&p, MissedWindow)); // never written
    same(run(e, NOW, other()), refused(ReaderWrongOwner));
    same(run(e, NOW, jito(|d| d[0] = 2)), refused(ReaderBadLayout));
    same(run(e, late, other()), void(&p, UnreadableAccount));
    let truncated = jito(|d| d.truncate(434));
    same(run(after, NOW, truncated), void(&p, UnreadableAccount));
}
