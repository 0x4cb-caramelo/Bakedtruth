//! Purpose: `StakeAtLeast`: YES if a vote account's stake in the measured epoch, read by
//!          `sol_get_epoch_stake`, reaches the target. Closed at opening until a devnet YES.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution); signatures frozen at the sprint's opening, bodies by lane B
//!
//! Ported from pred-provable's `resolver.rs`: Copyright (c) 2026 Ronaldo Pereira, MIT License
//! (LICENSE at the repository root).
//!
//! Owner the Vote program and a vote account's layout; the stake comes from the syscall, which
//! answers for the current epoch only, so the reading is taken while the clock is in the
//! measured epoch, and a missed epoch voids (`MissedWindow`).
//!
//! The layout is Agave's `VoteStateVersions::is_correct_size_and_initialized`
//! (solana-vote-interface 4.0.4, `state/vote_state_*.rs`), with the version tag (u32 LE at 0)
//! matched to its size: 1 `V1_14_11`, 3,731 bytes, the 82 bytes after the tag not all zero; 2
//! `V3`, 3,762 bytes, the 114 bytes after the tag not all zero; 3 `V4`, 3,762 bytes, always
//! initialized (SIMD-0185). Tag 0 (`V0_23_5`, which Agave no longer deserializes, and every
//! zeroed account) and any other tag are refused, and so is any other size. The vote program
//! creates accounts at exactly these sizes (`check_vote_account_length`, solana-vote-program
//! 3.1.14). The captured mainnet account is a 3,762-byte `V4`.
//!
//! The stake is the account's delegated stake for the whole current epoch, so any slot of the
//! epoch reads the same and the caller cannot pick a moment (the frozen program's reading). A
//! host build has no syscall: a thread-local value a test sets answers, zero by default.

use pinocchio::{error::ProgramError, AccountView};

use super::{
    after_deadline, cursor::Cursor, epoch, min_distance, CreationContext, CreationReading,
    Decision, ReadContext, Reading, Resolution,
};
use crate::{
    constants::{MIN_DISTANCE_BPS_STAKE, VOTE_PROGRAM_ID},
    error::BrotError,
    state::enums::VoidReason,
};

/// `VoteState1_14_11::size_of()`.
pub const VOTE_STATE_1_14_11_LEN: usize = 3_731;
/// `VoteStateV3::size_of()`, which `VoteStateV4::size_of()` keeps.
pub const VOTE_STATE_LEN: usize = 3_762;
/// The end of Agave's initialization test: the 4-byte tag, then the bytes before `prior_voters`
/// (`DEFAULT_PRIOR_VOTERS_OFFSET`, 82 for `V1_14_11` and 114 for `V3`).
const V1_14_11_INITIALIZED_END: usize = 86;
const V3_INITIALIZED_END: usize = 118;
const TAG_LEN: usize = 4;

/// The vote state a vote account holds, by its version tag.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum VoteVersion {
    V1_14_11,
    V3,
    V4,
}

/// A vote account's bytes: a known version at its size, initialized (`ReaderBadLayout`).
pub fn parse_vote_account(data: &[u8]) -> Result<VoteVersion, BrotError> {
    let (version, len, initialized_end) = match Cursor::new(data).u32()? {
        1 => (
            VoteVersion::V1_14_11,
            VOTE_STATE_1_14_11_LEN,
            Some(V1_14_11_INITIALIZED_END),
        ),
        2 => (VoteVersion::V3, VOTE_STATE_LEN, Some(V3_INITIALIZED_END)),
        3 => (VoteVersion::V4, VOTE_STATE_LEN, None),
        _ => return Err(BrotError::ReaderBadLayout),
    };
    if data.len() != len {
        return Err(BrotError::ReaderBadLayout);
    }
    if let Some(end) = initialized_end {
        let fields = data.get(TAG_LEN..end).ok_or(BrotError::ReaderBadLayout)?;
        if fields.iter().all(|byte| *byte == 0) {
            return Err(BrotError::ReaderBadLayout);
        }
    }
    Ok(version)
}

/// The vote account, owner first: no byte of an account the Vote program does not own is read.
pub fn read_vote_account(account: &AccountView) -> Result<VoteVersion, ProgramError> {
    if !account.owned_by(&VOTE_PROGRAM_ID) {
        return Err(BrotError::ReaderWrongOwner.into());
    }
    let data = account.try_borrow()?;
    Ok(parse_vote_account(&data)?)
}

/// `vote`'s stake in the current epoch, zero for an account with none (SIMD-0133).
#[cfg(target_os = "solana")]
pub fn epoch_stake(vote: &AccountView) -> u64 {
    // SAFETY: the pointer names the 32 bytes of the address, which outlive the call; the syscall
    // only reads them and returns a value.
    unsafe { pinocchio::syscalls::sol_get_epoch_stake(vote.address().as_array().as_ptr()) }
}

/// `vote`'s stake in the current epoch: on a host build, the value a test set on this thread
/// for this address, else zero.
#[cfg(not(target_os = "solana"))]
pub fn epoch_stake(vote: &AccountView) -> u64 {
    let (address, stake) = HOST_STAKE.with(core::cell::Cell::get);
    if address == vote.address().to_bytes() {
        stake
    } else {
        0
    }
}

#[cfg(not(target_os = "solana"))]
std::thread_local! {
    static HOST_STAKE: core::cell::Cell<([u8; 32], u64)> =
        const { core::cell::Cell::new(([0; 32], 0)) };
}

/// Host builds only, for tests: on this thread, `epoch_stake` answers `stake` for `vote`.
#[cfg(not(target_os = "solana"))]
pub fn set_host_epoch_stake(vote: &pinocchio::Address, stake: u64) {
    HOST_STAKE.with(|cell| cell.set((vote.to_bytes(), stake)));
}

/// Rows 2 and 3 for this kind, and row 5's epoch rule: a vote account (`ReaderWrongOwner`,
/// `ReaderBadLayout`), the measured epoch ahead and starting before the deadline, and a target
/// above the stake now by at least `MIN_DISTANCE_BPS_STAKE` of it. The opening keeps the kind
/// closed (row 1) unless the `stake-at-least` feature is built.
pub fn validate_at_creation(ctx: &CreationContext) -> Result<CreationReading, ProgramError> {
    read_vote_account(ctx.metric)?;
    epoch::check_epoch_for_opening(ctx)?;
    let current = i128::from(epoch_stake(ctx.metric));
    if ctx.target <= current {
        return Err(BrotError::TargetAlreadyTouched.into());
    }
    let nearest = current
        .checked_add(min_distance(current, MIN_DISTANCE_BPS_STAKE)?)
        .ok_or(BrotError::MathOverflow)?;
    if ctx.target < nearest {
        return Err(BrotError::TargetTooClose.into());
    }
    Ok(CreationReading::default())
}

/// The join lock: the measured epoch has started. Nothing is read: the stake the syscall gives
/// in an epoch is the one saved at the epoch's first block (Agave 3.1.8,
/// `Bank::current_epoch_stakes`), and delegations change it only from the next epoch.
pub fn outcome_knowable(ctx: &ReadContext) -> Result<bool, ProgramError> {
    Ok(ctx.time.epoch >= ctx.campaign.epoch.get())
}

/// Resolution for this kind (TP section 3.4.6), the measured epoch E: before E, `NotYet`, or
/// `MissedWindow` once the deadline has passed; in E, the account is read (unreadable: refused
/// before the deadline, `UnreadableAccount` after it), then YES if the stake reaches the target,
/// else NO, before or after the deadline; after E the syscall can no longer answer for E:
/// `MissedWindow`.
pub fn try_resolve(ctx: &ReadContext) -> Result<Resolution, ProgramError> {
    let measured = ctx.campaign.epoch.get();
    let after = after_deadline(ctx.campaign, &ctx.time);
    if ctx.time.epoch > measured || (ctx.time.epoch < measured && after) {
        return Ok(void(ctx, VoidReason::MissedWindow));
    }
    if ctx.time.epoch < measured {
        return Ok(Resolution::NotYet);
    }
    match read_vote_account(ctx.metric) {
        Ok(_) => {}
        Err(_) if after => return Ok(void(ctx, VoidReason::UnreadableAccount)),
        Err(error) => return Err(error),
    }
    let stake = i128::from(epoch_stake(ctx.metric));
    let reading = Reading::of(ctx.metric, stake);
    Ok(Resolution::Decided(if stake >= ctx.campaign.target.get() {
        Decision::yes(reading)
    } else {
        Decision::no(reading, false)
    }))
}

/// A void with nothing read for the epoch: `observed` is zero.
fn void(ctx: &ReadContext, reason: VoidReason) -> Resolution {
    Resolution::Decided(Decision::void(reason, Reading::of(ctx.metric, 0)))
}
