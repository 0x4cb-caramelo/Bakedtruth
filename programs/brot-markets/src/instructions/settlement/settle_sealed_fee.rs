//! Purpose: `settle_sealed_fee`: once the campaign is finalized, any wallet sends a sponsor's held fee to
//!          the sponsor on a void the house caused, or else to the fee vault (P-4: the 10% follows the
//!          cause; TP sections 3.4.7, 3.4.12), returns the `SealedFee`'s rent to the sponsor, sweeps what
//!          was sent to it by hand to the fee vault, and closes it. Never paused (I10′).
//! Version: 0.1.0
//! Sprint: 15 (lane L15; the scaffold's stub of 2026-10-13 filled). Accounts: 0 sealed fee (writable;
//!         closed), 1 campaign (writable; Settling or Settled, its `sealed_fees_open` decremented),
//!         2 sponsor (writable; SealedFee.sponsor: the refund and the rent), 3 fee vault (writable;
//!         PDA ["fee_vault"]), 4 event authority, 5 program. No arguments.
//!
//! Order: no arguments (`BadInstructionData`); the six slots (`NotEnoughAccountKeys`); the four writable
//! slots; the SealedFee apart from the campaign and from both recipients (`DuplicateAccount`); the event
//! slots; a SealedFee that is the System Program's and empty was closed by an earlier call
//! (`AlreadySettled`); the SealedFee's owner, length and tag; the campaign's owner; the stored campaign
//! (`SealedFeeMismatch`) and sponsor (`WrongSponsor`); the campaign loaded; `Settling` or `Settled`
//! (`NotFinalized`); the SealedFee's PDA; the fee vault's address. The rent of the account comes from
//! the Rent sysvar, read after every refusal. The caller chooses nothing: the amount is the stored
//! `fee_lamports` (bookkept, never read from the lamports: I15) and each destination is stored or the
//! fee vault. Then the moves, `checks::close_account`, the count and `SealedFeeSettled`.

use pinocchio::{
    error::ProgramError,
    sysvars::{rent::Rent, Sysvar},
    AccountView, Address, ProgramResult,
};

use super::{bookkeeping::take_seq, collect_fee::moves};
use crate::{
    checks,
    constants::SEALED_FEE_SEED,
    error::BrotError,
    events::{self, SealedFeeSettled},
    instructions::{no_args, resolution::void_reason::is_house_failure},
    layout::{LeU64, ZeroCopy},
    state::{
        self,
        campaign::Campaign,
        enums::{SettleMode, Status, VoidReason},
        sealed_fee::SealedFee,
        AccountTag,
    },
};

pub fn settle_sealed_fee(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [sealed_fee, campaign, sponsor, fee_vault, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::writable(sealed_fee)?;
    checks::writable(campaign)?;
    checks::writable(sponsor)?;
    checks::writable(fee_vault)?;
    checks::distinct(campaign, sealed_fee)?;
    checks::distinct(sponsor, sealed_fee)?;
    checks::distinct(fee_vault, sealed_fee)?;
    checks::event_accounts(event_authority, program, program_id)?;

    require_unsettled(sealed_fee)?;
    let (stored_campaign, stored_sponsor) = stored_keys(sealed_fee, program_id)?;
    // The campaign is this program's before its key is compared with the stored one (owner first).
    checks::owned_by(campaign, program_id)?;
    require_campaign(&stored_campaign, campaign.address())?;
    require_sponsor(&stored_sponsor, sponsor.address())?;
    let key = *campaign.address();
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    require_finalized(&stored)?;
    let refunded = refunds(&stored)?;
    let fee = {
        let seeds: [&[u8]; 3] = [SEALED_FEE_SEED, key.as_ref(), stored_sponsor.as_ref()];
        state::load::<SealedFee, 3>(sealed_fee, &seeds, program_id)?
            .fee_lamports
            .get()
    };
    moves::fee_vault_is_canonical(fee_vault, program_id)?;

    // The account holds its rent, the bookkept fee, and whatever was sent to it by hand.
    let rent = Rent::get()?.try_minimum_balance(SealedFee::LEN)?;
    let after_fee = sealed_fee
        .lamports()
        .checked_sub(fee)
        .ok_or(BrotError::InvariantViolated)?;
    let rent_back = after_fee.min(rent);
    let surplus = after_fee
        .checked_sub(rent_back)
        .ok_or(BrotError::MathOverflow)?;
    let (to_sponsor, to_fee_vault) = if refunded {
        (rent_back.checked_add(fee), Some(surplus))
    } else {
        (Some(rent_back), surplus.checked_add(fee))
    };
    let to_sponsor = to_sponsor.ok_or(BrotError::MathOverflow)?;
    let to_fee_vault = to_fee_vault.ok_or(BrotError::MathOverflow)?;
    let open = stored
        .sealed_fees_open
        .get()
        .checked_sub(1)
        .ok_or(BrotError::InvariantViolated)?;
    stored.sealed_fees_open.set(open);
    let seq = take_seq(&mut stored)?;
    drop(stored);

    moves::move_lamports(sealed_fee, fee_vault, to_fee_vault)?;
    moves::move_lamports(sealed_fee, sponsor, to_sponsor)?;
    checks::close_account(sealed_fee, program_id)?;

    let event = SealedFeeSettled {
        campaign: key,
        seq: LeU64::new(seq),
        sponsor: stored_sponsor,
        fee_lamports: LeU64::new(fee),
        refunded: u8::from(refunded),
    };
    events::emit(&event, event_authority, program, program_id)
}

/// A SealedFee closed by an earlier call is the System Program's and empty (`AlreadySettled`).
fn require_unsettled(sealed_fee: &AccountView) -> ProgramResult {
    let closed = sealed_fee.owned_by(&pinocchio_system::ID) && sealed_fee.is_data_empty();
    // X0.9 sealed_fee_settled
    checks::require(!closed, BrotError::AlreadySettled)
}

/// The campaign and sponsor a SealedFee stores, read after its owner, length and tag and before its
/// PDA, so a wrong key reports `SealedFeeMismatch` or `WrongSponsor` instead of `PdaMismatch`.
fn stored_keys(
    sealed_fee: &AccountView,
    program_id: &Address,
) -> Result<(Address, Address), ProgramError> {
    checks::owned_by(sealed_fee, program_id)?;
    let data = sealed_fee.try_borrow()?;
    checks::len(&data, SealedFee::LEN)?;
    checks::tag(&data, AccountTag::SealedFee)?;
    let stored = SealedFee::from_bytes(&data).ok_or(BrotError::WrongLength)?;
    Ok((stored.campaign, stored.sponsor))
}

/// The SealedFee belongs to the campaign passed (`SealedFeeMismatch`).
fn require_campaign(stored: &Address, campaign: &Address) -> ProgramResult {
    // X0.9 sealed_fee_campaign
    checks::require(stored == campaign, BrotError::SealedFeeMismatch)
}

/// The sponsor slot is the SealedFee's stored sponsor (`WrongSponsor`): the refund and the rent go
/// nowhere else.
fn require_sponsor(stored: &Address, sponsor: &Address) -> ProgramResult {
    // X0.9 sealed_fee_sponsor
    checks::require(stored == sponsor, BrotError::WrongSponsor)
}

/// The campaign is finalized: `Settling` or `Settled` (`NotFinalized` before), so its outcome and
/// void reason, which decide where the fee goes, can no longer change.
fn require_finalized(stored: &Campaign) -> ProgramResult {
    let finalized = matches!(
        Status::try_from(stored.status)?,
        Status::Settling | Status::Settled
    );
    // X0.9 sealed_fee_finalized
    checks::require(finalized, BrotError::NotFinalized)
}

/// True when the fee goes back to the sponsor: a void the house caused (`is_house_failure`). A split,
/// a one-sided pot and a void by an outside cause send it to the fee vault (P-4). A finalized
/// campaign with no settle mode is corrupt (`BadAccountData`, as `settlement/rules.rs` reads it).
fn refunds(stored: &Campaign) -> Result<bool, ProgramError> {
    match SettleMode::try_from(stored.settle_mode)? {
        SettleMode::Refund => Ok(is_house_failure(VoidReason::try_from(stored.void_reason)?)),
        SettleMode::Split | SettleMode::OneSided => Ok(false),
        SettleMode::Unset => Err(BrotError::BadAccountData.into()),
    }
}
