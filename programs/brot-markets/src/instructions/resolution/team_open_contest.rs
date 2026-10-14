//! Purpose: `team_open_contest(stage)`: a team key contests a result inside its review window, or sends a contest to
//!          the admin (TP sections 3.4.2, 3.4.7; BP v0.0.4 part 1 section 4.5). The act is the signed byte, never the
//!          stored status (the second review's S1: a retried or duplicate opening must not escalate). Byte 1: the
//!          campaign becomes `Contested` at stage 1, its payout paused, and stage 1's 24 hours start
//!          (`contest_ends_at = now + CONTEST_STAGE1_SECONDS`); a matching re-read pays only after them, a different
//!          one escalates at once (`reread_campaign`). Byte 2, on a contest still at stage 1 before its deadline: stage
//!          2 for the admin (the founder's answer to D2, 2026-10-13), `contest_ends_at = now + CONTEST_STAGE2_SECONDS`.
//!          It emits `ContestOpened`, with the stage it opened.
//! Version: 0.3.0 (the act in the signed byte, S1; the escalation, D2; enabled in Sprint 14 with its exits)
//! Sprint: 04 (lane A; disabled at the closure review); 14 (lane L14B). Accounts (the frozen list): 0 team key
//!         (signer), 1 config (read), 2 campaign (writable), 3 event authority, 4 program. One argument: `stage`, 1 or 2.
//!
//! Order, each refusal with its own error: one byte of arguments (`BadInstructionData`), five slots
//! (`NotEnoughAccountKeys`); the team key signs, the campaign is writable, the config and the campaign differ, the
//! event slots; the byte is 1 or 2 (`BadInstructionData`); the config loaded, the signer a team key (`NotTeamMember`);
//! the campaign loaded; the act fits it, before any other rule on it (`ContestAlreadyOpen`: byte 1 on a campaign
//! already `Contested`; `NotContested`: byte 2 on one that is not). Byte 1: `InReview` (`TeamKeyOutsideReview`) inside
//! its window (`ContestOutsideReview`), every entry tallied (`NotTallied`: the tally runs only while the campaign is
//! `InReview`, so the keeper tallies before a contest can open; `contest_rules.rs`). Byte 2: at stage 1
//! (`WrongContestStage`), before stage 1's deadline (`ContestDeadlinePassed`). The pause never blocks it. No lamport
//! moves, and the result is not touched: only the status, the stage, its deadline and the event number.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{
    checks,
    constants::{CONTEST_STAGE1_SECONDS, CONTEST_STAGE2_SECONDS},
    error::BrotError,
    events::{self, ContestOpened},
    instructions::{
        args,
        resolution::{
            contest_rules::{
                require_act_fits, require_contest_act, require_contest_team_key,
                require_contest_window, require_escalation, require_tallied,
            },
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
    zero_copy,
};

#[derive(ShankType)]
#[repr(C)]
pub struct TeamOpenContestArgs {
    /// The stage this call opens: 1 contests a result in review (stage 1, 24 hours); 2 sends a contest still at
    /// stage 1, before its deadline, to the admin (stage 2, 48 hours). Any other byte is refused.
    pub stage: u8,
}

zero_copy!(TeamOpenContestArgs = 1);

pub fn team_open_contest(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<TeamOpenContestArgs>(data)?;
    let [team_member, config, campaign, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(team_member)?;
    checks::writable(campaign)?;
    checks::distinct(config, campaign)?;
    checks::event_accounts(event_authority, program, program_id)?;
    require_contest_act(args.stage)?;
    let stage = if args.stage == ContestStage::Stage2 as u8 {
        ContestStage::Stage2
    } else {
        ContestStage::Stage1
    };

    let campaign_key = *campaign.address();
    let signer = *team_member.address();
    let config_state = GlobalConfig::load(config, program_id)?;
    require_contest_team_key(&config_state, &signer)?;
    drop(config_state);
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    require_act_fits(stage, stored.status)?;
    let now = ChainTime::now()?.unix_timestamp;
    let lasts = if stage == ContestStage::Stage2 {
        // The team's escalation (D2): a contest still at stage 1, before its deadline, goes to the admin.
        require_escalation(stored.contest_stage, now, stored.contest_ends_at.get())?;
        CONTEST_STAGE2_SECONDS
    } else {
        require_contest_window(stored.status, now, stored.review_ends_at.get())?;
        require_tallied(stored.entries_untallied.get())?;
        CONTEST_STAGE1_SECONDS
    };

    // Given the stored status, the table refuses an Open, Settling or Settled campaign on its own; `Contested` to
    // `Contested` is an edge, used by the escalation above and by a re-read's, so the guards are the act's own:
    // `require_escalation` (stage 1, before its deadline) and, for an opening, `require_contest_window`.
    transition(Status::try_from(stored.status)?, Status::Contested)?;
    let ends_at = now.checked_add(lasts).ok_or(BrotError::MathOverflow)?;
    let seq = take_seq(&mut stored)?;
    stored.status = Status::Contested as u8;
    stored.contest_stage = stage as u8;
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
