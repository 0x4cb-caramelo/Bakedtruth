//! Purpose: `collect_fee`: moves what Brot keeps to the fee vault, once, after the entries are settled:
//!          the house fee net of the creator's share from it, the opening fee unless refunded, and (from
//!          lane C's running total) the one-sided fees (TP sections 3.4.3, 3.4.16).
//! Version: 0.0.2
//! Sprint: 04 (lane D). Accounts frozen at the sprint's opening.
//!
//! Order: no arguments (`BadInstructionData`); the five slots (`NotEnoughAccountKeys`); the campaign and
//! the vault writable, the fee vault writable; the event slots; the campaign loaded (owner, length,
//! tag, PDA); `Settling` or `Settled` with `entries_open` zero (`CampaignNotSettled`, `NotFinalized`
//! before finalize); `fee_collected` not yet set (`FeeAlreadyCollected`); the vault's PDA and the fee
//! vault's address; `paying_vault` before the transfer. Then the amount, the move, the flag, the event.
//! The caller chooses nothing: the amount and the destination are the campaign's.

pub mod amount;
pub mod moves;

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks,
    error::BrotError,
    events::{self, FeeCollected},
    instructions::no_args,
    layout::LeU64,
    state::{campaign::Campaign, enums::Status},
};

pub fn collect_fee(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [campaign, vault, fee_vault, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::writable(campaign)?;
    checks::writable(vault)?;
    checks::writable(fee_vault)?;
    checks::event_accounts(event_authority, program, program_id)?;

    let key = *campaign.address();
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    require_settled_entries(&stored)?;
    if stored.fee_collected != 0 {
        return Err(BrotError::FeeAlreadyCollected.into());
    }
    checks::vault_of(vault, &key, stored.vault_bump, program_id)?;
    moves::fee_vault_is_canonical(fee_vault, program_id)?;
    checks::paying_vault(vault, program_id, &[&*fee_vault])?;

    let kept = amount::kept(&stored)?;
    let seq = stored.event_seq.get();
    let next = seq.checked_add(1).ok_or(BrotError::MathOverflow)?;
    moves::move_lamports(vault, fee_vault, kept.amount)?;
    stored.fee_collected = 1;
    stored.event_seq = LeU64::new(next);
    drop(stored);

    let event = FeeCollected {
        campaign: key,
        seq: LeU64::new(seq),
        amount: LeU64::new(kept.amount),
        opening_fee_kept: LeU64::new(kept.opening),
    };
    events::emit(&event, event_authority, program, program_id)
}

/// The entries are all settled and the campaign has been finalized: `Settling` or `Settled` with no
/// `Entry` open. Before finalize the status is `Open` or `InReview`: `NotFinalized`, as the other payouts
/// refuse; after finalize, with an entry still open, `CampaignNotSettled`.
pub(crate) fn require_settled_entries(stored: &Campaign) -> ProgramResult {
    let status = Status::try_from(stored.status)?;
    let finalized = matches!(status, Status::Settling | Status::Settled);
    checks::require(finalized, BrotError::NotFinalized)?;
    checks::require(
        stored.entries_open.get() == 0,
        BrotError::CampaignNotSettled,
    )
}
