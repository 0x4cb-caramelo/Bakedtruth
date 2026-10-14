//! Purpose: `settle_entry`: pays one entry from the vault to its stored baker and closes the Entry, its rent back to
//!          the baker (TP 3.4.5). A losing entry goes through the same instruction with zero from the pot; its late
//!          part comes back whole. The Entry's joins were tallied before finalize (`tally_late_joins`), so this
//!          instruction takes no Join accounts.
//! Version: 0.0.3 (G-2: the vault's change against the books; R1: a Split payout within the entry's exact share)
//! Sprint: 04 (lane C); the amendment of 2026-10-09 (the tally, the late sums on the Entry); 16 (lane L16P)
//!
//! Accounts: 0 entry (writable), 1 campaign (writable), 2 vault (writable), 3 baker (writable; the stored baker),
//! 4 event authority, 5 program. Any wallet; the caller chooses nothing.
//! Refusals, in order: the arguments; the slots; a closed entry (`AlreadySettled`); the stored campaign and baker
//! (`EntryNotOnCampaign`, `WrongBaker`); the campaign's status (`NotFinalized`, or `AlreadySettled` once Settled);
//! `NotTallied` while a join is untallied; then the payout math, a `Split` payout within the entry's exact share
//! (`require_within_share`, `EntryPayoutAboveShare`), `paying_vault`, and the transfer. Last, the vault's change
//! equals the payout the books record in `paid_out_total` (`VaultWatch`, `InvariantViolated`).

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use super::{
    bookkeeping::{bump, credit, pay_from_vault, take_seq, VaultWatch},
    rules::{entry_payout, require_within_share, EntryAmounts, PotRule},
};
use crate::{
    checks,
    error::BrotError,
    events::{self, EntrySettled},
    instructions::no_args,
    layout::LeU64,
    state::{
        campaign::Campaign,
        entry::Entry,
        enums::{Outcome, SettleMode, Side, Status},
        transitions::transition,
        AccountTag,
    },
};

/// The campaign's stored pot rule, read after `finalize_campaign` (`NotFinalized` before it).
fn pot_rule(campaign: &Campaign) -> Result<PotRule, BrotError> {
    let mode = SettleMode::try_from(campaign.settle_mode)?;
    let winning = match Outcome::try_from(campaign.outcome)? {
        Outcome::No => Side::No,
        _ => Side::Yes,
    };
    Ok(PotRule {
        mode,
        winning,
        winning_total: campaign.winning_total.get(),
        distributable: campaign.distributable.get(),
        one_sided_fee_bps: campaign.one_sided_fee_bps.get(),
    })
}

/// The campaign and baker an Entry stores, read after the owner, length and tag checks and before its PDA is
/// re-derived, so a wrong key reports `EntryNotOnCampaign` or `WrongBaker` instead of `PdaMismatch`.
fn stored_keys(
    entry: &AccountView,
    program_id: &Address,
) -> Result<([u8; 32], [u8; 32]), ProgramError> {
    checks::owned_by(entry, program_id)?;
    let data = entry.try_borrow()?;
    checks::len(&data, <Entry as crate::layout::ZeroCopy>::LEN)?;
    checks::tag(&data, AccountTag::Entry)?;
    let campaign = data.get(4..36).and_then(|s| <[u8; 32]>::try_from(s).ok());
    let baker = data.get(36..68).and_then(|s| <[u8; 32]>::try_from(s).ok());
    match (campaign, baker) {
        (Some(campaign), Some(baker)) => Ok((campaign, baker)),
        _ => Err(BrotError::WrongLength.into()),
    }
}

/// The Entry account is closed: the System Program owns it and its data is gone.
fn is_closed(entry: &AccountView) -> bool {
    entry.owned_by(&pinocchio_system::ID) && entry.is_data_empty()
}

pub fn settle_entry(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [entry, campaign, vault, baker, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::writable(entry)?;
    checks::writable(campaign)?;
    checks::writable(vault)?;
    checks::writable(baker)?;
    checks::event_accounts(event_authority, program, program_id)?;
    checks::distinct(baker, vault)?;
    checks::distinct(entry, campaign)?;
    checks::distinct(entry, vault)?;
    checks::distinct(campaign, vault)?;

    if is_closed(entry) {
        return Err(BrotError::AlreadySettled.into());
    }
    let (entry_campaign, entry_baker) = stored_keys(entry, program_id)?;
    // The campaign is this program's before its key is compared with the entry's (house order: owner first).
    checks::owned_by(campaign, program_id)?;
    let campaign_key = *campaign.address();
    if entry_campaign.as_slice() != campaign_key.as_ref() {
        return Err(BrotError::EntryNotOnCampaign.into());
    }
    if entry_baker.as_slice() != baker.address().as_ref() {
        return Err(BrotError::WrongBaker.into());
    }
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    checks::vault_of(vault, &campaign_key, stored.vault_bump, program_id)?;
    match Status::try_from(stored.status)? {
        Status::Settling => {}
        Status::Settled => return Err(BrotError::AlreadySettled.into()),
        _ => return Err(BrotError::NotFinalized.into()),
    }
    if stored.entries_untallied.get() != 0 {
        return Err(BrotError::NotTallied.into());
    }
    let rule = pot_rule(&stored)?;
    let entry_state = Entry::load_mut(entry, &campaign_key, baker.address(), program_id)?;
    if entry_state.joins_tallied.get() != entry_state.join_count.get() {
        return Err(BrotError::NotTallied.into());
    }
    let amounts = EntryAmounts {
        yes: entry_state.amount_yes.get(),
        no: entry_state.amount_no.get(),
        late_yes: entry_state.late_yes.get(),
        late_no: entry_state.late_no.get(),
    };
    let is_first = entry_state.is_first != 0;
    let payout = entry_payout(&rule, &amounts, is_first)?;
    require_within_share(&rule, &amounts, &payout)?;
    drop(entry_state);

    checks::paying_vault(vault, program_id, &[&*baker])?;
    let watch = VaultWatch::start(vault, &stored)?;
    let rent = entry.lamports();
    let seq = take_seq(&mut stored)?;
    let open = stored
        .entries_open
        .get()
        .checked_sub(1)
        .ok_or(BrotError::InvariantViolated)?;
    stored.entries_open.set(open);
    bump(&mut stored.paid_out_total, payout.amount)?;
    bump(&mut stored.one_sided_fees, payout.one_sided_fee)?;
    if stored.entries_open.get() == 0 {
        transition(Status::Settling, Status::Settled)?;
        stored.status = Status::Settled as u8;
    }
    pay_from_vault(vault, baker, payout.amount)?;
    credit(baker, rent)?;
    entry.set_lamports(0);
    checks::close_account(entry, program_id)?;
    watch.check(vault, &stored)?;

    let event = EntrySettled {
        campaign: campaign_key,
        seq: LeU64::new(seq),
        baker: *baker.address(),
        amount: LeU64::new(payout.amount),
        settle_mode: stored.settle_mode,
    };
    drop(stored);
    events::emit(&event, event_authority, program, program_id)
}
