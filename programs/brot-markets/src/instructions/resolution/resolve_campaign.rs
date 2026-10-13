//! Purpose: `resolve_campaign`: any wallet records the outcome the campaign's reader reads, at
//!          the top level only, and opens the six-hour review window (TP sections 3.4.2, 3.4.6).
//! Version: 0.0.4
//! Sprint: 03 (readers and resolution); accounts frozen at the sprint's opening, body by lane D
//!
//! Order, each refusal with its own error: no arguments (`BadInstructionData`) and the five slots
//! (`NotEnoughAccountKeys`); `checks::top_level` before any account is read (`ResolveNotTopLevel`);
//! the campaign slot writable and the two event slots; the campaign loaded (owner, length, tag,
//! PDA), `Open` (`CampaignNotOpen`), the metric slot its locked account (`MetricAccountMismatch`),
//! its kind; the clock; the reader's `try_resolve`, whose own refusals pass through and whose
//! `NotYet` is `NotResolvableYet`. Then `record` writes `InReview`, the outcome, `met_late` or the
//! void reason, `observed_value`, `resolved_at` and `review_ends_at = now + REVIEW_WINDOW_SECONDS`,
//! and `CampaignResolved` leaves with the next `seq`. No lamports move. A second call finds the
//! campaign `InReview` (`CampaignNotOpen`). The caller chooses nothing (Q1): it offers a proof
//! account, which only the price reader reads, and checks. A caller with no proof to offer puts
//! the program's own address in that slot, and the reader sees no proof (`NotResolvableYet` while
//! the window is open): without it, every price campaign still open would answer
//! `ProofDoesNotTouch` for whatever account filled the slot (Sprint 03 review).

pub mod record;

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks,
    error::BrotError,
    events,
    instructions::no_args,
    readers::{self, ChainTime, ReadContext, Resolution},
    state::{
        campaign::Campaign,
        enums::{Outcome, ReaderKind, Status},
    },
};

pub fn resolve_campaign(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [campaign, metric_account, proof_account, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    // Called from inside another program, a resolution could be wrapped by logic the
    // transaction's instruction list does not show, so no account is read before this check.
    checks::top_level(BrotError::ResolveNotTopLevel)?;
    checks::writable(campaign)?;
    checks::event_accounts(event_authority, program, program_id)?;

    let campaign_key = *campaign.address();
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    let review = stored.status == Status::InReview as u8;
    if !review && stored.status != Status::Open as u8 {
        return Err(BrotError::CampaignNotOpen.into());
    }
    if metric_account.address() != &stored.metric_account {
        return Err(BrotError::MetricAccountMismatch.into());
    }
    let kind = ReaderKind::try_from(stored.kind)?;
    // A campaign already in review moves its cut-off only for an earlier YES price proof, before any tally starts
    // (decision of 2026-10-09): every other re-proof is refused.
    if review
        && (kind != ReaderKind::PriceTouch
            || stored.outcome != Outcome::Yes as u8
            || stored.entries_untallied.get() != stored.entries_open.get())
    {
        return Err(BrotError::CutoffNotMovable.into());
    }

    // The reader sees the campaign as stored; nothing is written until it has decided.
    let time = ChainTime::now()?;
    let no_proof = proof_account.address() == program_id;
    let context = ReadContext {
        metric: metric_account,
        campaign: &stored,
        time,
        proof: (!no_proof).then_some(&*proof_account),
    };
    let decision = match readers::try_resolve(kind, &context)? {
        Resolution::NotYet => return Err(BrotError::NotResolvableYet.into()),
        Resolution::Decided(decision) => decision,
    };

    let event = if review {
        if decision.outcome != Outcome::Yes
            || decision.reading.publish_time >= stored.publish_time.get()
        {
            return Err(BrotError::CutoffNotMovable.into());
        }
        record::move_cutoff(&campaign_key, &mut stored, &decision, &time)?
    } else {
        record::write(&campaign_key, &mut stored, &decision, &time)?
    };
    drop(stored);
    events::emit(&event, event_authority, program, program_id)
}
