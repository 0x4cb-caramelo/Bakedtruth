//! Purpose: `close_campaign`: once the fee, the prize and the creator share are settled, moves the vault's
//!          dust and hand-sent surplus to the fee vault, returns the rent of the campaign and the vault to
//!          `rent_payer`, zeroes both accounts and gives them back to the System Program (TP sections 3.4.4,
//!          3.4.17, I6, I14). Any wallet may call; every destination is stored or the fee vault.
//! Version: 0.0.1
//! Sprint: 04 (lane D). Accounts frozen at the sprint's opening.
//!
//! Order: no arguments (`BadInstructionData`); the six slots (`NotEnoughAccountKeys`); the four writable
//! slots; the event slots; a campaign that is the System Program's and empty is `AlreadyClosed` (a second
//! call; close zeroes both); the campaign loaded; `Settled` with no entry open and the three flags set
//! (`CampaignNotSettled`); the rent payer is the stored one (`RentPayerNotStored`); the vault's PDA and the
//! fee vault's address; `paying_vault` and `distinct` before the first move. The rent of an empty account
//! comes from the Rent sysvar, read only after every refusal above. Then the moves, `checks::close_account`
//! on both accounts (their lamports must be gone), and `CampaignClosed`.

use pinocchio::{AccountView, Address, ProgramResult};

use super::collect_fee::moves;
use crate::{
    checks,
    constants::VAULT_SEED,
    error::BrotError,
    events::{self, CampaignClosed},
    instructions::no_args,
    layout::LeU64,
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
    checks::require(
        rent_payer.address() == &stored.rent_payer,
        BrotError::RentPayerNotStored,
    )?;
    let key_bytes: &[u8] = key.as_ref();
    checks::pda(
        vault,
        &[VAULT_SEED, key_bytes],
        stored.vault_bump,
        program_id,
    )?;
    moves::fee_vault_is_canonical(fee_vault, program_id)?;
    let seq = stored.event_seq.get();
    drop(stored);

    checks::paying_vault(vault, program_id, &[&*fee_vault, &*rent_payer])?;
    checks::distinct(campaign, rent_payer)?;
    let rent = moves::empty_rent()?;
    let vault_rent = vault.lamports().min(rent);
    let surplus = vault
        .lamports()
        .checked_sub(vault_rent)
        .ok_or(BrotError::MathOverflow)?;
    let campaign_rent = campaign.lamports();
    let rent_returned = campaign_rent
        .checked_add(vault_rent)
        .ok_or(BrotError::MathOverflow)?;

    moves::move_lamports(vault, fee_vault, surplus)?;
    moves::move_lamports(vault, rent_payer, vault_rent)?;
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
    let settled = Status::try_from(stored.status)? == Status::Settled;
    let flags =
        stored.fee_collected != 0 && stored.prize_settled != 0 && stored.creator_share_settled != 0;
    checks::require(
        settled && flags && stored.entries_open.get() == 0,
        BrotError::CampaignNotSettled,
    )
}
