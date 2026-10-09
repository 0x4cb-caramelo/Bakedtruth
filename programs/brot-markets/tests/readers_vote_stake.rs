//! Purpose: `StakeAtLeast` on the captured mainnet vote account: Agave's version tags and sizes
//!          (every truncation, stretched, zeroed, unknown tags), the owner first, rows 2 and 3 at
//!          their edges with the host's stake, and every arm of resolution.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution), lane B

mod epoch_support;

use brot_markets::{
    error::BrotError::*,
    readers::vote_stake::{
        epoch_stake, parse_vote_account, read_vote_account, set_host_epoch_stake, VoteVersion,
        VOTE_STATE_1_14_11_LEN, VOTE_STATE_LEN,
    },
    state::enums::{
        ReaderKind,
        VoidReason::{MissedWindow, UnreadableAccount},
    },
};
use epoch_support::*;

const KIND: ReaderKind = ReaderKind::StakeAtLeast;
/// A test stake for the captured account: 15 million SOL.
const STAKE: u64 = 15_000_000 * SOL;

/// The captured bytes with the version tag set to `tag`.
fn tagged(tag: u32) -> Vec<u8> {
    edited(VOTE, |data| data[..4].copy_from_slice(&tag.to_le_bytes()))
}

/// The captured bytes with `range` zeroed.
fn zeroed(bytes: Vec<u8>, range: core::ops::Range<usize>) -> Vec<u8> {
    edited(&bytes, |data| data[range].fill(0))
}

#[test]
fn reads_each_initialized_version_at_its_own_size_only() {
    // The captured account: a V4 of 3,762 bytes.
    same(VOTE.len(), VOTE_STATE_LEN);
    same(&VOTE[..4], &[3, 0, 0, 0][..]);
    same(parse_vote_account(VOTE), Ok(VoteVersion::V4));
    same(read_vote_account(&vote(|_| {}).view()), Ok(VoteVersion::V4));
    same(parse_vote_account(&tagged(2)), Ok(VoteVersion::V3));
    let v1 = tagged(1)[..VOTE_STATE_1_14_11_LEN].to_vec();
    same(parse_vote_account(&v1), Ok(VoteVersion::V1_14_11));
    // A tag at another version's size.
    let bad = Err(ReaderBadLayout);
    same(parse_vote_account(&tagged(1)), bad);
    same(parse_vote_account(&VOTE[..VOTE_STATE_1_14_11_LEN]), bad);
    // Uninitialized: the fields before `prior_voters` all zero. A V4 is always initialized.
    same(parse_vote_account(&zeroed(v1, 4..86)), bad);
    same(parse_vote_account(&zeroed(tagged(2), 4..118)), bad);
    let v4 = zeroed(VOTE.to_vec(), 4..118);
    same(parse_vote_account(&v4), Ok(VoteVersion::V4));
}

#[test]
fn refuses_zeros_unknown_tags_every_other_size_and_other_owners() {
    let bad = Err(ReaderBadLayout);
    for tag in [0u32, 4, 0xFFFF_FFFF] {
        same(parse_vote_account(&tagged(tag)), bad);
    }
    same(parse_vote_account(&[0; VOTE_STATE_LEN]), bad);
    for len in 0..VOTE.len() {
        same(parse_vote_account(&VOTE[..len]), bad);
    }
    for extra in [1usize, 100] {
        let len = VOTE.len().checked_add(extra).unwrap();
        same(parse_vote_account(&edited(VOTE, |d| d.resize(len, 0))), bad);
    }
    // The owner is checked before any byte.
    let read = |mut metric: HostAccount| read_vote_account(&metric.view());
    let other = |bytes| read(HostAccount::new(VOTE_ACCOUNT, SYSTEM_PROGRAM, bytes));
    same(other(VOTE), refused(ReaderWrongOwner));
    same(other(&[]), refused(ReaderWrongOwner));
    let empty = HostAccount::new(VOTE_ACCOUNT, VOTE_PROGRAM_ID, &[]);
    same(read(empty), refused(ReaderBadLayout));
}

#[test]
fn the_host_stake_answers_for_its_own_address_only() {
    let fresh = std::thread::spawn(|| epoch_stake(&vote(|_| {}).view()));
    same(fresh.join().unwrap(), 0); // zero on a thread where no test set it
    set_host_epoch_stake(&VOTE_ACCOUNT, STAKE);
    same(epoch_stake(&vote(|_| {}).view()), STAKE);
    let mut elsewhere = HostAccount::new(TOKEN_PROGRAM, VOTE_PROGRAM_ID, VOTE);
    same(epoch_stake(&elsewhere.view()), 0);
}

#[test]
fn opens_one_minimum_distance_above_the_stake_now() {
    set_host_epoch_stake(&VOTE_ACCOUNT, STAKE);
    let (mut metric, week, time) = (vote(|_| {}), at(7 * DAY), clock(1_047, NOW));
    let mut open = |target| validate(KIND, &mut metric, target, 1_048, week, time);
    // Row 3 [AC]: 1% of the stake now; STAKE is a multiple of 100.
    let current = i128::from(STAKE);
    let nearest = current.checked_add(current / 100).unwrap();
    let below = nearest.checked_sub(1).unwrap();
    same(open(nearest), Ok(Default::default()));
    same(open(below), refused(TargetTooClose));
    same(open(current), refused(TargetAlreadyTouched));
    same(open(0), refused(TargetUnreachable));
    same(open(-1), refused(TargetUnreachable));
    // No stake at all: the nearest target is one lamport.
    set_host_epoch_stake(&VOTE_ACCOUNT, 0);
    same(open(1), Ok(Default::default()));
    same(open(0), refused(TargetUnreachable));
}

#[test]
fn opening_reads_the_account_then_the_epoch() {
    let open = |mut metric: HostAccount, measured: u64| {
        let (target, week, time) = (i128::from(u64::MAX), at(7 * DAY), clock(1_047, NOW));
        validate(KIND, &mut metric, target, measured, week, time)
    };
    let fresh = || vote(|_| {});
    same(open(fresh(), 1_048), Ok(Default::default()));
    same(open(fresh(), 1_047), refused(EpochAlreadyStarted));
    same(open(fresh(), 1_046), refused(EpochAlreadyStarted));
    same(open(fresh(), 1_100), refused(EpochAfterDeadline));
    same(open(vote(|d| d.fill(0)), 1_047), refused(ReaderBadLayout));
    let other = HostAccount::new(VOTE_ACCOUNT, SYSTEM_PROGRAM, VOTE);
    same(open(other, 1_047), refused(ReaderWrongOwner));
}

#[test]
fn resolution_table() {
    let v = VOTE_ACCOUNT;
    let (before, e, after) = (1_047, 1_048, 1_049);
    let (target, below) = (i128::from(STAKE), STAKE.checked_sub(1).unwrap());
    let late = at(7 * DAY + 1);
    let c = campaign(KIND, &v, target, e, at(7 * DAY));
    let run = |epoch, unix, stake, mut metric: HostAccount| {
        set_host_epoch_stake(&v, stake);
        resolve(&mut metric, &c, clock(epoch, unix))
    };
    let (fresh, zero) = (|| vote(|_| {}), || vote(|d| d.fill(0)));
    let other = || HostAccount::new(v, SYSTEM_PROGRAM, VOTE);
    same(run(before, NOW, STAKE, fresh()), NOT_YET);
    same(run(before, late, STAKE, fresh()), void(&v, MissedWindow));
    same(run(e, NOW, STAKE, fresh()), yes(&v, target));
    same(run(e, late, STAKE, fresh()), yes(&v, target)); // fixed for the epoch
    same(run(e, NOW, below, fresh()), no(&v, i128::from(below)));
    same(run(e, NOW, STAKE, other()), refused(ReaderWrongOwner));
    same(run(e, NOW, STAKE, zero()), refused(ReaderBadLayout));
    same(run(e, late, STAKE, other()), void(&v, UnreadableAccount));
    same(run(after, NOW, STAKE, fresh()), void(&v, MissedWindow));
    same(run(after, late, STAKE, zero()), void(&v, MissedWindow));
    // Only the campaign's own account's stake is read.
    set_host_epoch_stake(&TOKEN_PROGRAM, STAKE);
    same(resolve(&mut fresh(), &c, clock(e, NOW)), no(&v, 0));
}
