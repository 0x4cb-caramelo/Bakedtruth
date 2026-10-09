//! Purpose: `Entry` (`["entry", campaign, baker]`): one baker's entry in one campaign, both
//!          sides, created on the baker's first join and closed by `settle_entry` (Sprint 04).
//! Version: 0.0.3
//! Sprint: 02 (pot core on Pinocchio); `join_count` in 04 (the reserved bytes)

use pinocchio::{account::RefMut, error::ProgramError, AccountView, Address};
use shank::ShankAccount;

use crate::{
    constants::ENTRY_SEED,
    layout::{LeU32, LeU64, Pubkey},
    state::{AccountState, AccountTag},
    zero_copy,
};

#[derive(ShankAccount)]
#[repr(C)]
pub struct Entry {
    pub tag: u8,
    pub version: u8,
    pub bump: u8,
    /// This wallet's entry landed in an empty pot: its whole entry is exempt from the one-sided
    /// fee (Q3).
    #[idl_type("bool")]
    pub is_first: u8,
    pub campaign: Pubkey,
    pub baker: Pubkey,
    #[idl_type("u64")]
    pub amount_yes: LeU64,
    #[idl_type("u64")]
    pub amount_no: LeU64,
    /// How many `Join` accounts this baker has in this campaign: the next join's `index` (founder
    /// decision, 2026-10-09: one account per join, no cap).
    #[idl_type("u32")]
    pub join_count: LeU32,
    #[padding]
    pub _reserved: [u8; 12],
}

zero_copy!(Entry = 100);

impl AccountState for Entry {
    const TAG: AccountTag = AccountTag::Entry;

    fn bump(&self) -> u8 {
        self.bump
    }
}

impl Entry {
    /// Loads an existing entry for writing. Callers still compare `campaign` and `baker` with the
    /// accounts of the instruction (the explicit `has_one` of TP section 3.4.17).
    pub fn load_mut<'a>(
        account: &'a mut AccountView,
        campaign: &Address,
        baker: &Address,
        program_id: &Address,
    ) -> Result<RefMut<'a, Self>, ProgramError> {
        crate::state::load_mut(
            account,
            &[ENTRY_SEED, campaign.as_ref(), baker.as_ref()],
            program_id,
        )
    }

    /// The baker's whole entry, both sides: what `expected_entry_total` is compared with (T10).
    pub fn total(&self) -> Option<u64> {
        self.amount_yes.get().checked_add(self.amount_no.get())
    }
}
