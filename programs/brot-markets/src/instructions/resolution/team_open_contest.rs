//! Purpose: `team_open_contest`: a team key contests a result inside its review window (TP sections 3.4.2, 3.4.7;
//!          BP v0.0.4 part 1 section 4.5). The campaign becomes `Contested` at stage 1, its payout paused, and stage
//!          1's clock starts: `contest_ends_at = now + CONTEST_STAGE1_SECONDS`, the hour the keeper has to run the
//!          re-read (`reread_campaign`). It emits `ContestOpened`.
//! Version: 0.1.0 (enabled in Sprint 14 with its exits; refused with `ContestExitDisabled` from Sprint 04 until then)
//! Sprint: 04 (lane A; disabled at the closure review); 14 (lane L14B). Accounts (the frozen list): 0 team key
//!         (signer), 1 config (read), 2 campaign (writable), 3 event authority, 4 program. No arguments.
//!
//! Order, each refusal with its own error: no arguments (`BadInstructionData`), five slots (`NotEnoughAccountKeys`);
//! the team key signs, the campaign is writable, the config and the campaign differ, the event slots; the config
//! loaded, the signer a team key (`NotTeamMember`); the campaign loaded, `InReview` (`TeamKeyOutsideReview`) inside
//! its window (`ContestOutsideReview`); every entry tallied (`NotTallied`: the tally runs only while the campaign is
//! `InReview`, so the keeper tallies before a contest can open; `contest_rules.rs`). The pause never blocks it. No
//! lamport moves, and the result is not touched: only the status, the stage, its deadline and the event number.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks,
    constants::CONTEST_STAGE1_SECONDS,
    error::BrotError,
    events::{self, ContestOpened},
    instructions::{
        no_args,
        resolution::{
            contest_rules::{require_contest_team_key, require_contest_window, require_tallied},
            team_shared::take_seq,
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
    require_contest_team_key(&config_state, &signer)?;
    drop(config_state);
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    let time = ChainTime::now()?;
    require_contest_window(
        stored.status,
        time.unix_timestamp,
        stored.review_ends_at.get(),
    )?;
    require_tallied(stored.entries_untallied.get())?;

    // From the stored status, so the table refuses on its own whatever the window check let through.
    transition(Status::try_from(stored.status)?, Status::Contested)?;
    let ends_at = time
        .unix_timestamp
        .checked_add(CONTEST_STAGE1_SECONDS)
        .ok_or(BrotError::MathOverflow)?;
    let seq = take_seq(&mut stored)?;
    stored.status = Status::Contested as u8;
    stored.contest_stage = ContestStage::Stage1 as u8;
    stored.contest_ends_at = LeI64::new(ends_at);
    let event = ContestOpened {
        campaign: campaign_key,
        seq: LeU64::new(seq),
        signer,
        contest_stage: stored.contest_stage,
        contest_ends_at: stored.contest_ends_at,
    };
    drop(stored);
    events::emit(&event, event_authority, program, program_id)
}
