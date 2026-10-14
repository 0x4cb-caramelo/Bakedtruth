//! Purpose: `close_campaign`: once the fee, the prize and the creator share are settled, moves the vault's
//!          dust and hand-sent surplus to the fee vault, returns the rent of the campaign and the vault to
//!          `rent_payer`, zeroes both accounts and gives them back to the System Program (TP sections 3.4.4,
//!          3.4.17, I6, I14). Any wallet may call; every destination is stored or the fee vault.
//! Version: 0.0.3 (G-2: the vault covers what the books still hold before anything moves)
//! Sprint: 04 (lane D). Accounts frozen at the sprint's opening. 15 (lane L15): close waits for every
//!         sponsor's held fee to be settled (`SealedFeesOpen`). 16 (lane L16P): the audit package's G-2.
//!
//! Order: no arguments (`BadInstructionData`); the six slots (`NotEnoughAccountKeys`); the four writable
//! slots; the event slots; a campaign that is the System Program's and empty is `AlreadyClosed` (a second
//! call; close zeroes both); the campaign loaded; `Settled` with no entry open and the three flags set
//! (`CampaignNotSettled`); no `SealedFee` of the campaign still open (`SealedFeesOpen`); the rent payer is the stored one (`RentPayerNotStored`); the vault's PDA and the
//! fee vault's address; `paying_vault` and `distinct` before the first move. The rent of an empty account
//! comes from the Rent sysvar, read only after every refusal above. The vault's lamports above that rent must
//! cover what the books still hold, the reserve included (`require_books_covered`, `InvariantViolated`). Then the
//! moves, `checks::close_account` on both accounts (their lamports must be gone), and `CampaignClosed`.

use pinocchio::{
    sysvars::{rent::Rent, Sysvar},
    AccountView, Address, ProgramResult,
};

use super::{
    bookkeeping::{books_held, require_books_covered},
    collect_fee::moves,
};
use crate::{
    checks,
    error::BrotError,
    events::{self, CampaignClosed},
    instructions::no_args,
    layout::{LeU64, ZeroCopy},
    state::{campaign::Campaign, enums::Status},
};

pub fn close_campaign(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [campaign, vault, rent_payer, fee_vault, event_authority, program, ..] = accounts else {
        return Err(pinocchio::error::ProgramError::NotEnoughAccountKeys);
    };
    checks::writable(campaign)?;
    checks::writable(vault)?;
    checks::writable(rent_payer)?;
    checks::writable(fee_vault)?;
    checks::event_accounts(event_authority, program, program_id)?;
    // Close zeroes the data and gives the account to the System Program: a second call finds exactly that.
    if campaign.owned_by(&pinocchio_system::ID) && campaign.is_data_empty() {
        return Err(BrotError::AlreadyClosed.into());
    }

    let key = *campaign.address();
    let stored = Campaign::load_mut(campaign, program_id)?;
    require_closable(&stored)?;
    require_no_sealed_fee(&stored)?;
    checks::require(
        rent_payer.address() == &stored.rent_payer,
        BrotError::RentPayerNotStored,
    )?;
    checks::vault_of(vault, &key, stored.vault_bump, program_id)?;
    moves::fee_vault_is_canonical(fee_vault, program_id)?;
    let seq = stored.event_seq.get();
    let reserved = stored.creator_share_reserved.get();
    let held = books_held(&stored)?;
    drop(stored);

    checks::paying_vault(vault, program_id, &[&*fee_vault, &*rent_payer])?;
    checks::distinct(campaign, rent_payer)?;
    let rent = moves::empty_rent()?;
    let vault_rent = vault.lamports().min(rent);
    let after_rent = vault
        .lamports()
        .checked_sub(vault_rent)
        .ok_or(BrotError::MathOverflow)?;
    require_books_covered(after_rent, held, reserved)?;
    // A reserved creator share (only when the creator is the rent payer; `require_closable`) goes to that
    // payer with the rent. The rest of the vault is surplus.
    let vault_surplus = after_rent
        .checked_sub(reserved)
        .ok_or(BrotError::InvariantViolated)?;
    let to_payer = vault_rent
        .checked_add(reserved)
        .ok_or(BrotError::MathOverflow)?;
    // The campaign returns its own rent; lamports sent to it by hand above that are surplus.
    let campaign_min = Rent::get()?.try_minimum_balance(Campaign::LEN)?;
    let campaign_rent = campaign.lamports().min(campaign_min);
    let campaign_surplus = campaign
        .lamports()
        .checked_sub(campaign_rent)
        .ok_or(BrotError::MathOverflow)?;
    let surplus = vault_surplus
        .checked_add(campaign_surplus)
        .ok_or(BrotError::MathOverflow)?;
    let rent_returned = campaign_rent
        .checked_add(vault_rent)
        .ok_or(BrotError::MathOverflow)?;

    moves::move_lamports(vault, fee_vault, vault_surplus)?;
    moves::move_lamports(campaign, fee_vault, campaign_surplus)?;
    moves::move_lamports(vault, rent_payer, to_payer)?;
    moves::move_lamports(campaign, rent_payer, campaign_rent)?;
    checks::close_account(vault, program_id)?;
    checks::close_account(campaign, program_id)?;

    let event = CampaignClosed {
        campaign: key,
        seq: LeU64::new(seq),
        rent_payer: *rent_payer.address(),
        rent_returned: LeU64::new(rent_returned),
        surplus_swept: LeU64::new(surplus),
    };
    events::emit(&event, event_authority, program, program_id)
}

/// `Settled`, no `Entry` open, and the fee, the prize and the creator share each settled. A campaign that
/// is still open for any of them is `CampaignNotSettled`; a reserved creator share unpaid is the same
/// refusal, since its flag stays unset until it is paid (lane C's rule).
fn require_closable(stored: &Campaign) -> ProgramResult {
    // A reserved creator share is paid by close only to a creator who is the rent payer (decision of 2026-10-09);
    // any other reserve blocks close until the creator claims it.
    checks::require(
        stored.creator_share_reserved.get() == 0 || stored.creator == stored.rent_payer,
        BrotError::ReserveNotClaimable,
    )?;
    let settled = Status::try_from(stored.status)? == Status::Settled;
    let flags =
        stored.fee_collected != 0 && stored.prize_settled != 0 && stored.creator_share_settled != 0;
    checks::require(
        settled && flags && stored.entries_open.get() == 0,
        BrotError::CampaignNotSettled,
    )
}

/// Every sponsor's held fee is settled (`SealedFeesOpen`, Sprint 15). A SealedFee holds no lamport of the
/// vault, but `settle_sealed_fee` reads the campaign's outcome to know where the fee goes, so the campaign
/// stays until the last one is settled.
fn require_no_sealed_fee(stored: &Campaign) -> ProgramResult {
    // X0.9 sealed_fees_open
    checks::require(
        stored.sealed_fees_open.get() == 0,
        BrotError::SealedFeesOpen,
    )
}
