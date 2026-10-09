//! Purpose: `team_confirm_result`: a team key ends the review window now and the outcome stands;
//!          the snapshot runs at once, so the campaign is `Settling` (TP sections 3.4.3, 3.4.7).
//! Version: 0.0.2
//! Sprint: 04 (lane A). Accounts: 0 team key (signer), 1 config (writable, the open count),
//!         2 campaign (writable), 3 event authority, 4 program. Confirms an automatic void too.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks,
    error::BrotError,
    events::{self, ResultConfirmed},
    instructions::{
        no_args,
        resolution::{
            team_shared::{require_team_key, take_seq},
            window::require_review,
        },
        settlement::snapshot::finalize_snapshot,
    },
    layout::LeU64,
    readers::ChainTime,
    state::{
        campaign::Campaign,
        config::GlobalConfig,
        enums::{Outcome, Status},
        transitions::transition,
    },
};

pub fn team_confirm_result(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [team_member, config, campaign, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(team_member)?;
    checks::writable(config)?;
    checks::writable(campaign)?;
    checks::distinct(config, campaign)?;
    checks::event_accounts(event_authority, program, program_id)?;

    let campaign_key = *campaign.address();
    let signer = *team_member.address();
    let mut config_state = GlobalConfig::load_mut(config, program_id)?;
    require_team_key(&config_state, &signer)?;
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    let time = ChainTime::now()?;
    require_review(
        stored.status,
        time.unix_timestamp,
        stored.review_ends_at.get(),
        BrotError::OutsideReviewWindow,
    )?;

    transition(Status::InReview, Status::Settling)?;
    let outcome = Outcome::try_from(stored.outcome)?;
    let seq = take_seq(&mut stored)?;
    finalize_snapshot(&mut stored, &mut config_state)?;
    // `finalize_snapshot` has set the status (Settling, or Settled for a campaign with no entry).
    let event = ResultConfirmed {
        campaign: campaign_key,
        seq: LeU64::new(seq),
        signer,
        outcome: outcome as u8,
    };
    drop(stored);
    drop(config_state);
    events::emit(&event, event_authority, program, program_id)
}
