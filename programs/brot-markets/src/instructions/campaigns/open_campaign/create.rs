//! Purpose: row 10 of TP section 3.4.10 for `user_open_campaign`: the `Campaign` and its vault,
//!          created at their canonical PDAs with the creator paying both rents. An existing
//!          campaign is refused, the retry guard (T17); an address funded in advance still opens.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio), lane D

use pinocchio::{cpi::Seed, error::ProgramError, AccountView, Address};

use crate::{
    checks,
    constants::{CAMPAIGN_SEED, VAULT_SEED},
    layout::ZeroCopy,
    state::campaign::Campaign,
};

/// The canonical bumps of the two new accounts, for the campaign to store.
pub struct Bumps {
    pub campaign: u8,
    pub vault: u8,
}

/// Derives both canonical bumps before anything is created, so a wrong slot fails with
/// `PdaMismatch` first; then creates the campaign (`Campaign::LEN` bytes) and the data-less
/// vault (`["vault", campaign]`), both owned by the program. `checks::create_pda_account` refuses
/// an address the program already owns (`AlreadyInitialized`) and tops up one funded in advance.
pub fn campaign_and_vault(
    creator: &AccountView,
    campaign: &AccountView,
    vault: &AccountView,
    id: u64,
    program_id: &Address,
) -> Result<Bumps, ProgramError> {
    let id = id.to_le_bytes();
    let campaign_bump =
        checks::canonical_pda(campaign, &[CAMPAIGN_SEED, id.as_slice()], program_id)?;
    let campaign_key = *campaign.address();
    let campaign_seed: &[u8] = campaign_key.as_ref();
    let vault_bump = checks::canonical_pda(vault, &[VAULT_SEED, campaign_seed], program_id)?;

    let bump = [campaign_bump];
    let seeds = [
        Seed::from(CAMPAIGN_SEED),
        Seed::from(&id),
        Seed::from(&bump),
    ];
    checks::create_pda_account(creator, campaign, Campaign::LEN, program_id, &seeds)?;
    let bump = [vault_bump];
    let seeds = [
        Seed::from(VAULT_SEED),
        Seed::from(campaign_seed),
        Seed::from(&bump),
    ];
    checks::create_pda_account(creator, vault, 0, program_id, &seeds)?;
    Ok(Bumps {
        campaign: campaign_bump,
        vault: vault_bump,
    })
}
