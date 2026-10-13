//! Purpose: `admin_decide_contest(decision, void_reason, note_hash)`: stage 2 of a contest (TP section 3.4.7; BP v0.0.4
//!          part 1 section 4.5). Before its deadline the admin (the 2-of-3 multisig on mainnet) confirms the stored
//!          result or voids the campaign with a team reason and the hash of the published note; the snapshot follows
//!          at once. It never inverts: `Confirm` keeps the stored outcome, `Void` records `Void`, and no path writes
//!          YES or NO (`contest_decision.rs`). Emits `ContestClosed`, then `CampaignFinalized`.
//! Version: 0.1.0 (the body, lane L14B)
//! Sprint: 14 (scaffold of Sprints 14–15, 2026-10-13; the body by lane L14B). Accounts: 0 admin
//!         (signer; GlobalConfig.admin), 1 config (writable: the open count), 2 campaign (writable;
//!         Contested, stage 2), 3 event authority, 4 program. Arguments: `decision` (a
//!         `ContestDecision`), `void_reason` (a `VoidReason`) and `note_hash`, 34 bytes.
//!
//! Order, each refusal with its own error: the arguments' size (`BadInstructionData`), five slots
//! (`NotEnoughAccountKeys`); the admin signs, both writable slots, the config and the campaign differ, the event
//! slots; the decision byte (`InvalidContestDecision`), the reason byte (`BadInstructionData`, as
//! `team_void_campaign`), the reason fits the decision (`ConfirmWithVoidReason`, `VoidReasonNotForTeam`); the
//! config loaded, the signer its admin (`NotAdmin`: a team key does not decide); the campaign loaded, `Contested`
//! (`NotContested`) at stage 2 (`WrongContestStage`), before `contest_ends_at` (`ContestDeadlinePassed`: from then
//! on the stored result stands, and `finalize_campaign` takes the lapse). A void stores the reason and the note's
//! hash, and its reason's class decides the 10% opening fee (`void_reason.rs`: a house failure refunds it, an outside
//! cause keeps it). A confirm keeps every stored field of the result; its note hash is in the event only. The pause
//! never blocks it.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{
    checks,
    error::BrotError,
    events::{self, ContestClosed},
    instructions::{
        args,
        resolution::{
            contest_decision::{decided_outcome, require_reason_fits},
            contest_rules::{require_before_deadline, require_contest_admin, require_stage},
            team_shared::take_seq,
        },
        settlement::snapshot::{finalize_snapshot, finalized_event},
    },
    layout::LeU64,
    readers::ChainTime,
    state::{
        campaign::Campaign,
        config::GlobalConfig,
        enums::{ContestDecision, ContestStage, Outcome, VoidReason},
    },
    zero_copy,
};

#[derive(ShankType)]
#[repr(C)]
pub struct DecideContestArgs {
    /// `Confirm` keeps the stored result; `Void` voids the campaign.
    #[idl_type("ContestDecision")]
    pub decision: u8,
    /// The reason of a `Void` decision, one a team key may choose.
    #[idl_type("VoidReason")]
    pub void_reason: u8,
    /// The hash of the admin's note.
    pub note_hash: [u8; 32],
}

zero_copy!(DecideContestArgs = 34);

pub fn admin_decide_contest(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<DecideContestArgs>(data)?;
    let [admin, config, campaign, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(admin)?;
    checks::writable(config)?;
    checks::writable(campaign)?;
    checks::distinct(config, campaign)?;
    checks::event_accounts(event_authority, program, program_id)?;
    let decision = ContestDecision::try_from(args.decision)?;
    let reason =
        VoidReason::try_from(args.void_reason).map_err(|_| BrotError::BadInstructionData)?;
    require_reason_fits(decision, reason)?;
    let note_hash = args.note_hash;

    let campaign_key = *campaign.address();
    let signer = *admin.address();
    let mut config_state = GlobalConfig::load_mut(config, program_id)?;
    require_contest_admin(&config_state, &signer)?;
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    require_stage(stored.status, stored.contest_stage, ContestStage::Stage2)?;
    let time = ChainTime::now()?;
    require_before_deadline(time.unix_timestamp, stored.contest_ends_at.get())?;
    let outcome = decided_outcome(Outcome::try_from(stored.outcome)?, decision)?;

    let seq = take_seq(&mut stored)?;
    if decision == ContestDecision::Void {
        stored.outcome = outcome as u8;
        stored.void_reason = reason as u8;
        stored.void_note_hash = note_hash;
    }
    // `finalize_snapshot` moves the status (Settling, or Settled for a campaign with no entry) through the table.
    finalize_snapshot(&mut stored, &mut config_state)?;
    let event = ContestClosed {
        campaign: campaign_key,
        seq: LeU64::new(seq),
        signer,
        decision: decision as u8,
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
