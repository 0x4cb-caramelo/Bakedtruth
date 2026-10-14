//! Purpose: `settle_prize`: returns the prize to whoever opened in `OneSided` and `Refund`, and the opening
//!          fee too on a house-failure void (TP sections 3.4.7, 3.4.16; P-4). Any wallet may call; the
//!          destination is the stored creator, who opened.
//! Version: 0.0.2 (G-2: the vault's change asserted against the books, `VaultWatch`)
//! Sprint: 04 (lane C's stub, body by lane D); 16 (lane L16P)
//!
//! Order: no arguments (`BadInstructionData`); the five slots (`NotEnoughAccountKeys`); the campaign,
//! the vault and the recipient writable; the event slots; the campaign loaded; `Settling` or `Settled`
//! (`NotFinalized` before); `prize_settled` not yet set (`PrizeAlreadySettled`); the recipient is the
//! stored creator (`WrongCreator`); `paying_vault` before the transfer. A `Split` returns nothing: its
//! prize is inside the distributable amount, and the flag is set so that close can run. Before the event, the
//! vault's change equals what the flag books out (`VaultWatch`, `InvariantViolated`).

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use super::{
    bookkeeping::VaultWatch,
    collect_fee::{amount, moves},
};
use crate::{
    checks,
    error::BrotError,
    events::{self, PrizeSettled},
    instructions::no_args,
    layout::LeU64,
    state::{campaign::Campaign, enums::Status},
};

pub fn settle_prize(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [campaign, vault, recipient, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::writable(campaign)?;
    checks::writable(vault)?;
    checks::writable(recipient)?;
    checks::event_accounts(event_authority, program, program_id)?;

    let key = *campaign.address();
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    checks::vault_of(vault, &key, stored.vault_bump, program_id)?;
    let finalized = matches!(
        Status::try_from(stored.status)?,
        Status::Settling | Status::Settled
    );
    checks::require(finalized, BrotError::NotFinalized)?;
    if stored.prize_settled != 0 {
        return Err(BrotError::PrizeAlreadySettled.into());
    }
    checks::require(
        recipient.address() == &stored.creator,
        BrotError::WrongCreator,
    )?;
    checks::paying_vault(vault, program_id, &[&*recipient])?;

    let returned = amount::prize_return(&stored)?;
    let total = returned
        .prize
        .checked_add(returned.opening)
        .ok_or(BrotError::MathOverflow)?;
    let seq = stored.event_seq.get();
    let next = seq.checked_add(1).ok_or(BrotError::MathOverflow)?;
    let watch = VaultWatch::start(vault, &stored)?;
    moves::move_lamports(vault, recipient, total)?;
    stored.prize_settled = 1;
    stored.event_seq = LeU64::new(next);
    watch.check(vault, &stored)?;
    drop(stored);

    let event = PrizeSettled {
        campaign: key,
        seq: LeU64::new(seq),
        recipient: *recipient.address(),
        prize_returned: LeU64::new(returned.prize),
        opening_fee_returned: LeU64::new(returned.opening),
    };
    events::emit(&event, event_authority, program, program_id)
}
