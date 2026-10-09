//! Purpose: `team_open_contest`: a team key contests the outcome inside the review window; the
//!          campaign enters `Contested`, payout is paused and the stage 1 clock starts (TP section
//!          3.4.7). Nothing leaves `Contested` before Sprint 14.
//! Version: 0.0.2
//! Sprint: 04 (lane A). Accounts: 0 team key (signer), 1 config (read), 2 campaign (writable),
//!         3 event authority, 4 program.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks,
    constants::CONTEST_STAGE1_SECONDS,
    error::BrotError,
    events::{self, ContestOpened},
    instructions::{
        no_args,
        resolution::{
            team_shared::{require_team_key, take_seq},
            window::require_review,
        },
    },
    layout::{LeI64, LeU64},
    readers::ChainTime,
    state::{
        campaign::Campaign,
        config::GlobalConfig,
        enums::{ContestStage, Status},
        transitions::transition,
    },
};

pub fn team_open_contest(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [team_member, config, campaign, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(team_member)?;
    checks::writable(campaign)?;
    checks::distinct(config, campaign)?;
    checks::event_accounts(event_authority, program, program_id)?;

    let campaign_key = *campaign.address();
    let signer = *team_member.address();
    let config_state = GlobalConfig::load(config, program_id)?;
    require_team_key(&config_state, &signer)?;
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    let time = ChainTime::now()?;
    require_review(
        stored.status,
        time.unix_timestamp,
        stored.review_ends_at.get(),
        BrotError::ContestOutsideReview,
    )?;

    transition(Status::InReview, Status::Contested)?;
    let contest_ends_at = time
        .unix_timestamp
        .checked_add(CONTEST_STAGE1_SECONDS)
        .ok_or(BrotError::MathOverflow)?;
    let seq = take_seq(&mut stored)?;
    stored.status = Status::Contested as u8;
    stored.contest_stage = ContestStage::Stage1 as u8;
    stored.contest_ends_at = LeI64::new(contest_ends_at);
    let event = ContestOpened {
        campaign: campaign_key,
        seq: LeU64::new(seq),
        signer,
        contest_stage: ContestStage::Stage1 as u8,
        contest_ends_at: LeI64::new(contest_ends_at),
    };
    drop(stored);
    drop(config_state);
    events::emit(&event, event_authority, program, program_id)
}
