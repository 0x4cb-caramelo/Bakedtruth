//! Purpose: `sweep_fees`: sends the fee vault's lamports above its rent-exempt minimum to
//!          `GlobalConfig.fee_recipient`, and nowhere else (TP sections 3.4.3, 3.4.4). Any wallet may
//!          call; it chooses nothing.
//! Version: 0.0.1
//! Sprint: 04 (lane D). Accounts frozen at the sprint's opening.
//!
//! Order: no arguments (`BadInstructionData`); the five slots (`NotEnoughAccountKeys`); the fee vault and
//! the recipient writable; the event slots; the config loaded (owner, tag, PDA); the recipient is the
//! stored `fee_recipient` (`FeeRecipientMismatch`) and not the fee vault (`FeeRecipientIsFeeVault`); the
//! fee vault's PDA at the stored bump (`PdaMismatch`); `paying_vault`. Then the surplus above the rent of
//! an empty account, read from the Rent sysvar; nothing above it is `NothingToSweep`.
//! The event has no signer slot in this instruction, so its `signer` is the zero address.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use super::collect_fee::moves;
use crate::{
    checks,
    constants::FEE_VAULT_SEED,
    error::BrotError,
    events::{self, FeesSwept},
    instructions::no_args,
    layout::LeU64,
    state::config::GlobalConfig,
};

pub fn sweep_fees(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [config, fee_vault, fee_recipient, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::writable(fee_vault)?;
    checks::writable(fee_recipient)?;
    checks::event_accounts(event_authority, program, program_id)?;

    let (stored_recipient, fee_vault_bump) = {
        let stored = GlobalConfig::load(config, program_id)?;
        (stored.fee_recipient, stored.fee_vault_bump)
    };
    checks::require(
        fee_recipient.address() == &stored_recipient,
        BrotError::FeeRecipientMismatch,
    )?;
    checks::require(
        fee_recipient.address() != fee_vault.address(),
        BrotError::FeeRecipientIsFeeVault,
    )?;
    checks::owned_by(fee_vault, program_id)?;
    checks::pda(fee_vault, &[FEE_VAULT_SEED], fee_vault_bump, program_id)?;
    checks::paying_vault(fee_vault, program_id, &[&*fee_recipient])?;

    let rent = moves::empty_rent()?;
    let amount = fee_vault
        .lamports()
        .checked_sub(rent)
        .filter(|surplus| *surplus > 0)
        .ok_or(BrotError::NothingToSweep)?;
    moves::move_lamports(fee_vault, fee_recipient, amount)?;

    let event = FeesSwept {
        signer: Address::new_from_array([0; 32]),
        fee_recipient: stored_recipient,
        amount: LeU64::new(amount),
    };
    events::emit(&event, event_authority, program, program_id)
}
