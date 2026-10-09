//! Purpose: `settle_creator_share`: pays the creator's share once, to the stored creator only (TP 3.4.5, I13).
//!          A credit that would leave the creator's wallet below its rent-exempt minimum is reserved in the vault
//!          (bookkept in `creator_share_reserved`) instead of paid; the creator claims it by calling this again from
//!          a wallet that can take it (`ReserveNotClaimable` otherwise).
//! Version: 0.0.1
//! Sprint: 04 (lane C)
//!
//! Accounts: 0 campaign (writable), 1 vault (writable), 2 creator (writable; the stored creator), 3 event
//! authority, 4 program. Any wallet; it chooses nothing.
//! Refusals: `NotFinalized` (status before Settling), `WrongCreator`, `CreatorShareNotDue` (a team opening, a
//! one-sided pot, a void, a refund, or a zero share), `AlreadySettled` (paid, or nothing reserved to claim).
//! The event `CreatorShareSettled` is emitted when lamports reach the creator; a reserve emits nothing and is read
//! from the campaign.

use pinocchio::{
    error::ProgramError,
    sysvars::{rent::Rent, Sysvar},
    AccountView, Address, ProgramResult,
};

use super::{
    bookkeeping::{bump, pay_from_vault, take_seq},
    rules::{claimable, plan_credit, Credit},
};
use crate::{
    checks,
    error::BrotError,
    events::{self, CreatorShareSettled},
    instructions::no_args,
    layout::LeU64,
    state::{
        campaign::Campaign,
        enums::{SettleMode, Status},
    },
};

pub fn settle_creator_share(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [campaign, vault, creator, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::writable(campaign)?;
    checks::writable(vault)?;
    checks::writable(creator)?;
    checks::event_accounts(event_authority, program, program_id)?;
    checks::distinct(creator, vault)?;

    let campaign_key = *campaign.address();
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    checks::vault_of(vault, &campaign_key, stored.vault_bump, program_id)?;
    match Status::try_from(stored.status)? {
        Status::Settling | Status::Settled => {}
        _ => return Err(BrotError::NotFinalized.into()),
    }
    if creator.address().as_ref() != stored.creator.as_ref() {
        return Err(BrotError::WrongCreator.into());
    }
    let share = stored.creator_share.get();
    let from_fee = stored.creator_share_from_fee.get();
    let from_pot = share
        .checked_sub(from_fee)
        .ok_or(BrotError::InvariantViolated)?;
    // No share is due (a team opening, a mode other than Split, a zero share): checked before the flag, which
    // finalize sets for such a campaign. A reserved claim always has a share due.
    if stored.creator_is_team != 0
        || SettleMode::try_from(stored.settle_mode)? != SettleMode::Split
        || share == 0
    {
        return Err(BrotError::CreatorShareNotDue.into());
    }
    let rent_min = Rent::get()?.try_minimum_balance(0)?;
    let reserved = stored.creator_share_reserved.get();

    // A reserved credit: the creator's claim. Paid only when the wallet, with it, reaches the minimum.
    if stored.creator_share_settled != 0 {
        if reserved == 0 {
            return Err(BrotError::AlreadySettled.into());
        }
        claimable(creator.lamports(), reserved, rent_min)?;
        checks::paying_vault(vault, program_id, &[&*creator])?;
        pay_from_vault(vault, creator, reserved)?;
        stored.creator_share_reserved.set(0);
        bump(&mut stored.paid_out_total, reserved)?;
        let seq = take_seq(&mut stored)?;
        let event = CreatorShareSettled {
            campaign: campaign_key,
            seq: LeU64::new(seq),
            creator: *creator.address(),
            amount: LeU64::new(reserved),
            from_pot: LeU64::new(from_pot),
            from_fee: LeU64::new(from_fee),
        };
        drop(stored);
        return events::emit(&event, event_authority, program, program_id);
    }

    stored.creator_share_settled = 1;
    checks::paying_vault(vault, program_id, &[&*creator])?;
    match plan_credit(creator.lamports(), share, rent_min)? {
        Credit::Reserve => {
            stored.creator_share_reserved.set(share);
            drop(stored);
            Ok(())
        }
        Credit::Pay => {
            pay_from_vault(vault, creator, share)?;
            bump(&mut stored.paid_out_total, share)?;
            let seq = take_seq(&mut stored)?;
            let event = CreatorShareSettled {
                campaign: campaign_key,
                seq: LeU64::new(seq),
                creator: *creator.address(),
                amount: LeU64::new(share),
                from_pot: LeU64::new(from_pot),
                from_fee: LeU64::new(from_fee),
            };
            drop(stored);
            events::emit(&event, event_authority, program, program_id)
        }
    }
}
