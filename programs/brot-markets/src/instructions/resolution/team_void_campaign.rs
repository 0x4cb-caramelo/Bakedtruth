//! Purpose: `team_void_campaign(reason, note_hash)`: a team key voids a campaign inside the review
//!          window with a reason it may choose and the hash of its note; the snapshot runs at once
//!          (TP sections 3.4.3, 3.4.7). The reason decides the 10% opening fee. It emits `CampaignVoided`,
//!          then `CampaignFinalized` with the next seq, as `finalize_campaign` would (3.4.14).
//! Version: 0.0.3 (emits `CampaignFinalized` after `CampaignVoided`; found missing by the Sprint 05 review)
//! Sprint: 04 (lane A). Accounts: 0 team key (signer), 1 config (writable, the open count),
//!         2 campaign (writable), 3 event authority, 4 program. Arguments: `reason` (a `VoidReason`)
//!         and `note_hash`, 33 bytes.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{
    checks,
    error::BrotError,
    events::{self, CampaignVoided},
    instructions::{
        args,
        resolution::{
            team_shared::{require_team_key, take_seq},
            void_reason::{team_may_choose, team_void_outcome},
            window::require_review,
        },
        settlement::snapshot::{finalize_snapshot, finalized_event},
    },
    layout::LeU64,
    readers::ChainTime,
    state::{
        campaign::Campaign,
        config::GlobalConfig,
        enums::{Outcome, Status, VoidReason},
        transitions::transition,
    },
    zero_copy,
};

#[derive(ShankType)]
#[repr(C)]
pub struct TeamVoidCampaignArgs {
    /// The reason; lane A refuses the reasons a team key may not choose (`VoidReasonNotForTeam`).
    #[idl_type("VoidReason")]
    pub reason: u8,
    /// The hash of the team's note, kept in the campaign and the event.
    pub note_hash: [u8; 32],
}

zero_copy!(TeamVoidCampaignArgs = 33);

pub fn team_void_campaign(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<TeamVoidCampaignArgs>(data)?;
    let [team_member, config, campaign, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(team_member)?;
    checks::writable(config)?;
    checks::writable(campaign)?;
    checks::distinct(config, campaign)?;
    checks::event_accounts(event_authority, program, program_id)?;
    let reason = VoidReason::try_from(args.reason).map_err(|_| BrotError::BadInstructionData)?;
    team_may_choose(reason)?;
    let note_hash = args.note_hash;

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
    let voided = team_void_outcome(Outcome::try_from(stored.outcome)?)?;

    transition(Status::InReview, Status::Settling)?;
    let seq = take_seq(&mut stored)?;
    stored.outcome = voided as u8;
    stored.void_reason = reason as u8;
    stored.void_note_hash = note_hash;
    finalize_snapshot(&mut stored, &mut config_state)?;
    // `finalize_snapshot` has set the status (Settling, or Settled for a campaign with no entry).
    let event = CampaignVoided {
        campaign: campaign_key,
        seq: LeU64::new(seq),
        signer,
        void_reason: reason as u8,
        note_hash,
    };
    let finalized_seq = take_seq(&mut stored)?;
    let finalized = finalized_event(campaign_key, &stored, finalized_seq)?;
    drop(stored);
    drop(config_state);
    events::emit(&event, event_authority, program, program_id)?;
    events::emit(&finalized, event_authority, program, program_id)
}
