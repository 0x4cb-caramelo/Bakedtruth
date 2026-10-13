//! Purpose: the contest's rules (TP section 3.4.7; BP v0.0.4 part 1 section 4.5) as pure functions, each refusal with
//!          its own error: who opens a contest and when, the stage each act needs, stage 2's deadline and its lapse,
//!          and the admin's role. The three contest instructions and `finalize_campaign` call these; host tests check
//!          them without an account.
//! Version: 0.0.1
//! Sprint: 14 (lane L14B, the two-stage dispute)
//!
//! Each refusal follows an `// X0.9 <id>` line, as in `checks.rs`: `scripts/checks-mutation.mjs` returns early right
//! after it and shows the check's negative tests fail. A contest opens only once every entry is tallied: the tally
//! (`tally_late_joins`) runs only while a campaign is `InReview`, so a contest opened before it could never reach the
//! snapshot by any of its three exits (`NotTallied` there). The keeper therefore tallies before a contest can open.

use pinocchio::{Address, ProgramResult};

use crate::{
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

/// The stage-2 lapse, for `finalize_campaign`: a `Contested` campaign is finalized only at stage 2
/// (`CampaignNotInReview` otherwise, as before Sprint 14), and only from `contest_ends_at` on (`ContestNotLapsed`).
/// The stored result stands. The caller has read the status as `Contested`.
pub fn require_lapsed(stage: u8, now: i64, contest_ends_at: i64) -> Result<(), BrotError> {
    // X0.9 lapse_stage
    if ContestStage::try_from(stage)? != ContestStage::Stage2 {
        return Err(BrotError::CampaignNotInReview);
    }
    // X0.9 lapse_deadline
    if now < contest_ends_at {
        return Err(BrotError::ContestNotLapsed);
    }
    Ok(())
}

/// The signer is the config's admin (`NotAdmin`): stage 2 is the admin's (the 2-of-3 multisig on mainnet); a team
/// key does not decide.
pub fn require_contest_admin(config: &GlobalConfig, signer: &Address) -> ProgramResult {
    // X0.9 decide_admin
    require_admin(config, signer)
}
