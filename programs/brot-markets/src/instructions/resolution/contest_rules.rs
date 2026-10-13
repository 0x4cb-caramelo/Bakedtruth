//! Purpose: the contest's rules (TP section 3.4.7; BP v0.0.4 part 1 section 4.5) as pure functions, each refusal with
//!          its own error: who opens a contest and when, the team's escalation to stage 2, the stage each act needs,
//!          the 24-hour wait a matching re-read keeps, stage 2's deadline, the lapse of either stage, the admin's role,
//!          and the offered proof's own errors. The three contest instructions and `finalize_campaign` call these;
//!          host tests check them without an account.
//! Version: 0.0.3 (the founder's answer to D2: the matching re-read's 24-hour wait and the team's escalation)
//! Sprint: 14 (lane L14B, the two-stage dispute)
//!
//! Each refusal follows an `// X0.9 <id>` line, as in `checks.rs`: `scripts/checks-mutation.mjs` returns early right
//! after it and shows the check's negative tests fail. A contest opens only once every entry is tallied: the tally
//! (`tally_late_joins`) runs only while a campaign is `InReview`, so a contest opened before it could never reach the
//! snapshot by any of its three exits (`NotTallied` there). The keeper therefore tallies before a contest can open.
//! The 78-hour bound holds with or without a keeper: a contest opens at most six hours after the resolution, stage 1
//! ends 24 hours later, and both stage 2's deadline (from a re-read or the team's escalation) and the lapse of an
//! unread stage 1 are at most 48 hours after that.

use pinocchio::{error::ProgramError, Address, ProgramResult};

use crate::{
    constants::CONTEST_STAGE2_SECONDS,
    error::BrotError,
    instructions::{
        admin::shared::require_admin,
        resolution::{team_shared::require_team_key, window::require_review},
    },
    state::{
        config::GlobalConfig,
        enums::{ContestStage, Status},
    },
};

/// The signer is one of the config's team keys (`NotTeamMember`): in the MVP only the team opens a contest.
pub fn require_contest_team_key(config: &GlobalConfig, signer: &Address) -> Result<(), BrotError> {
    // X0.9 contest_team_key
    require_team_key(config, signer)
}

/// A contest opens only while the campaign is `InReview` (`TeamKeyOutsideReview`), inside its six-hour window
/// (`ContestOutsideReview`): the window's own rule (`window.rs`).
pub fn require_contest_window(status: u8, now: i64, review_ends_at: i64) -> Result<(), BrotError> {
    // X0.9 contest_window
    require_review(status, now, review_ends_at, BrotError::ContestOutsideReview)
}

/// The team's escalation (D2, 2026-10-13): a team key sends a contest still at stage 1 to stage 2, before stage 1's
/// deadline. At stage 2 already, `WrongContestStage`; from stage 1's deadline on, `ContestDeadlinePassed` (a matching
/// re-read may pay from then, and a different one escalates by itself).
pub fn require_escalation(stage: u8, now: i64, contest_ends_at: i64) -> Result<(), BrotError> {
    // X0.9 escalate_stage
    if ContestStage::try_from(stage)? != ContestStage::Stage1 {
        return Err(BrotError::WrongContestStage);
    }
    // X0.9 escalate_deadline
    if now >= contest_ends_at {
        return Err(BrotError::ContestDeadlinePassed);
    }
    Ok(())
}

/// A matching re-read pays only from stage 1's deadline on, 24 hours after the contest opened (D2, 2026-10-13):
/// before it, `RereadBeforeTimelock`, so a team key still has that time to send the contest to the admin.
pub fn require_timelock_over(now: i64, stage1_ends_at: i64) -> Result<(), BrotError> {
    // X0.9 reread_timelock
    if now < stage1_ends_at {
        return Err(BrotError::RereadBeforeTimelock);
    }
    Ok(())
}

/// Every entry's joins are tallied (`NotTallied`): see the module documentation.
pub fn require_tallied(entries_untallied: u32) -> Result<(), BrotError> {
    // X0.9 contest_tallied
    if entries_untallied != 0 {
        return Err(BrotError::NotTallied);
    }
    Ok(())
}

/// The metric slot holds the account the campaign locked at opening (`MetricAccountMismatch`): a re-read reads what
/// the resolution read, never an account its caller chose.
pub fn require_metric(metric: &Address, stored: &Address) -> Result<(), BrotError> {
    // X0.9 reread_metric
    if metric != stored {
        return Err(BrotError::MetricAccountMismatch);
    }
    Ok(())
}

/// The campaign is `Contested` (`NotContested`) at `expected` (`WrongContestStage`): the re-read acts on stage 1,
/// the admin's decision on stage 2. A stored byte no variant has is `BadAccountData`.
pub fn require_stage(status: u8, stage: u8, expected: ContestStage) -> Result<(), BrotError> {
    // X0.9 contest_status
    if Status::try_from(status)? != Status::Contested {
        return Err(BrotError::NotContested);
    }
    // X0.9 contest_stage
    if ContestStage::try_from(stage)? != expected {
        return Err(BrotError::WrongContestStage);
    }
    Ok(())
}

/// Stage 2's decision comes before its deadline (`ContestDeadlinePassed`). The deadline's own second is already
/// past it: from `contest_ends_at` on, the stored result stands and only the lapse remains.
pub fn require_before_deadline(now: i64, contest_ends_at: i64) -> Result<(), BrotError> {
    // X0.9 decide_deadline
    if now >= contest_ends_at {
        return Err(BrotError::ContestDeadlinePassed);
    }
    Ok(())
}

/// When a contest lapses with the stored result (the 78-hour bound, review fix F3): stage 2 at its own deadline, and
/// stage 1, whose re-read nobody ran, `CONTEST_STAGE2_SECONDS` after its deadline: the latest any stage 2 can end,
/// since an escalating re-read starts stage 2 from `min(now, stage 1's deadline)` and the team's escalation comes
/// before that deadline. No stage: `None`.
pub fn contest_lapses_at(
    stage: ContestStage,
    contest_ends_at: i64,
) -> Result<Option<i64>, BrotError> {
    Ok(match stage {
        ContestStage::None => None,
        ContestStage::Stage1 => Some(
            contest_ends_at
                .checked_add(CONTEST_STAGE2_SECONDS)
                .ok_or(BrotError::MathOverflow)?,
        ),
        ContestStage::Stage2 => Some(contest_ends_at),
    })
}

/// The lapse, for `finalize_campaign`: a `Contested` campaign with a stage (`CampaignNotInReview` otherwise, as before
/// Sprint 14) is finalized from `contest_lapses_at` on (`ContestNotLapsed` before), with the stored result. The
/// caller has read the status as `Contested`.
pub fn require_lapsed(stage: u8, now: i64, contest_ends_at: i64) -> Result<(), BrotError> {
    let lapses_at = contest_lapses_at(ContestStage::try_from(stage)?, contest_ends_at)?;
    // X0.9 lapse_stage
    let Some(lapses_at) = lapses_at else {
        return Err(BrotError::CampaignNotInReview);
    };
    // X0.9 lapse_deadline
    if now < lapses_at {
        return Err(BrotError::ContestNotLapsed);
    }
    Ok(())
}

/// An error the reader found in the proof the caller offered (`proof_read`: the reader read it, `readers::reads_proof`)
/// refuses the re-read with that error (review fix F4): a junk, foreign, unverified, stale or wrong-feed proof decides
/// nothing and must not open stage 2. An error about the campaign's own metric account is a different reading.
pub fn require_proof_accepted(proof_read: bool, error: ProgramError) -> ProgramResult {
    // X0.9 reread_proof
    if proof_read {
        return Err(error);
    }
    Ok(())
}

/// The signer is the config's admin (`NotAdmin`): stage 2 is the admin's (the 2-of-3 multisig on mainnet); a team
/// key does not decide.
pub fn require_contest_admin(config: &GlobalConfig, signer: &Address) -> ProgramResult {
    // X0.9 decide_admin
    require_admin(config, signer)
}
