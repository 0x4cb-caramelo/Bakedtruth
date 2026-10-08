//! Purpose: `GlobalConfig` (`["config"]`): roles, the pause, the creation parameters, the fee
//!          recipient and the open-campaign counter; and the creation parameters' own layout.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio)
//!
//! One per program, created by `admin_initialize_config` together with the data-less fee vault
//! (`["fee_vault"]`), whose bump is kept here. Every creation parameter is copied into a campaign
//! at opening where the campaign needs it, so a change applies to future campaigns only.

use pinocchio::{
    account::{Ref, RefMut},
    error::ProgramError,
    AccountView, Address,
};
use shank::{ShankAccount, ShankType};

use crate::{
    constants::CONFIG_SEED,
    layout::{LeU16, LeU32, LeU64, Pubkey},
    state::{AccountState, AccountTag},
    zero_copy,
};

/// Most team keys the config holds, one per person (Q12). Shank reads array lengths as
/// literals, so the layouts write `5`; this assertion ties them to the constant.
pub const MAX_TEAM: usize = 5;
const _: () = assert!(MAX_TEAM == 5);

/// The parameters `admin_set_creation_params` changes, each under its code ceiling (TP section
/// 3.4.1). Also the argument of that instruction and part of `admin_initialize_config`'s.
#[derive(ShankType, Clone, Copy, Debug, PartialEq, Eq)]
#[repr(C)]
pub struct CreationParams {
    /// Price of a paid opening, whole US$ (D-b: 500).
    #[idl_type("u64")]
    pub opening_fee_usd: LeU64,
    /// Share of a paid opening that becomes the prize (D-b: 9,000).
    #[idl_type("u16")]
    pub opening_prize_bps: LeU16,
    /// Brot's fee on the losing side (P1 section 3.3: 1,000). Neutral name (T11).
    #[idl_type("u16")]
    pub fee_bps: LeU16,
    /// Fee per entry in a one-sided pot (P1 section 3.5: 100).
    #[idl_type("u16")]
    pub one_sided_fee_bps: LeU16,
    /// The creator's share of the entries for a paid opening (D-g: 100).
    #[idl_type("u16")]
    pub creator_share_bps: LeU16,
    /// The valve on the services' work (T18).
    #[idl_type("u32")]
    pub max_open_campaigns: LeU32,
    /// Smallest entry (P-5: 10,000,000, 0.01 SOL). Read at every join, not copied.
    #[idl_type("u64")]
    pub min_entry_lamports: LeU64,
    /// The Pyth SOL/USD feed id the opening is priced with (D-f).
    pub sol_usd_feed_id: [u8; 32],
    /// Oldest SOL/USD price accepted at a paid opening, seconds (at least 90 on devnet).
    #[idl_type("u32")]
    pub max_price_age: LeU32,
    /// Widest SOL/USD confidence accepted at a paid opening, bps of the price.
    #[idl_type("u16")]
    pub max_price_conf_bps: LeU16,
    /// The join-time price age copied into each new price campaign, seconds (never below 30).
    #[idl_type("u32")]
    pub campaign_max_age: LeU32,
}

/// The program's single configuration account.
#[derive(ShankAccount)]
#[repr(C)]
pub struct GlobalConfig {
    pub tag: u8,
    pub version: u8,
    pub bump: u8,
    /// Bump of the data-less fee vault, which cannot store its own.
    pub fee_vault_bump: u8,
    #[idl_type("OperatingLevel")]
    pub operating_level: u8,
    /// How many of `team` are in use; the rest are zero.
    pub team_len: u8,
    pub admin: Pubkey,
    /// The admin named by `admin_transfer_admin`, zero when no change is pending.
    pub pending_admin: Pubkey,
    pub team: [Pubkey; 5],
    /// Where `sweep_fees` sends the fee vault (Sprint 04).
    pub fee_recipient: Pubkey,
    pub params: CreationParams,
    /// Campaigns opened and not yet finalized (I7).
    #[idl_type("u32")]
    pub open_campaigns: LeU32,
    #[padding]
    pub _reserved: [u8; 64],
}

zero_copy!(CreationParams = 70, GlobalConfig = 400);

impl AccountState for GlobalConfig {
    const TAG: AccountTag = AccountTag::GlobalConfig;

    fn bump(&self) -> u8 {
        self.bump
    }
}

impl GlobalConfig {
    /// Loads the config for reading, with every check of [`crate::state::load`].
    pub fn load<'a>(
        account: &'a AccountView,
        program_id: &Address,
    ) -> Result<Ref<'a, Self>, ProgramError> {
        crate::state::load(account, &[CONFIG_SEED], program_id)
    }

    /// Loads the config for writing.
    pub fn load_mut<'a>(
        account: &'a mut AccountView,
        program_id: &Address,
    ) -> Result<RefMut<'a, Self>, ProgramError> {
        crate::state::load_mut(account, &[CONFIG_SEED], program_id)
    }

    /// The team keys in use.
    pub fn team(&self) -> &[Pubkey] {
        self.team.get(..usize::from(self.team_len)).unwrap_or(&[])
    }

    /// True when `key` is one of the team keys in use.
    pub fn is_team(&self, key: &Address) -> bool {
        self.team().contains(key)
    }
}

impl CreationParams {
    /// Checks every parameter against its floor and ceiling (TP section 3.4.1). Used by
    /// `admin_initialize_config` and `admin_set_creation_params`. Lane B implements it.
    pub fn validate(&self) -> Result<(), ProgramError> {
        todo!("Sprint 02 lane B: floors and ceilings of constants.rs, one error per parameter")
    }
}
