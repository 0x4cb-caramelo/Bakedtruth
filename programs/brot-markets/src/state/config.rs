//! Purpose: `GlobalConfig` (`["config"]`): roles, the pause, the creation parameters, the fee
//!          recipient and the open-campaign counter; and the creation parameters' own layout.
//! Version: 0.0.4
//! Sprint: 02 (pot core on Pinocchio); `params_version` taken from the reserve in 03
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
    /// The Pyth SOL/USD feed id (D-f). Since founder answer 3 the opening is priced with the compiled
    /// `SOL_USD_FEED_ID`, so this field is unused by pricing; it stays in the frozen layout, checked
    /// non-zero only, and is not read by any instruction at opening.
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
    /// Counts the changes of `params`; an opening signs the version it previewed (Sprint 03).
    #[idl_type("u32")]
    pub params_version: LeU32,
    #[padding]
    pub _reserved: [u8; 60],
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
    /// Checks every parameter against its floor and ceiling (TP section 3.4.1), in field order,
    /// each with its own error; a bound itself passes. Used by `admin_initialize_config` and
    /// `admin_set_creation_params`.
    pub fn validate(&self) -> Result<(), ProgramError> {
        use crate::{
            constants::{
                BPS_DENOMINATOR, CAMPAIGN_MAX_AGE_CEILING, CAMPAIGN_MAX_AGE_FLOOR,
                MAX_CREATOR_SHARE_BPS, MAX_FEE_BPS, MAX_ONE_SIDED_FEE_BPS, MAX_OPENING_FEE_USD,
                MAX_OPEN_CAMPAIGNS_CEILING, MAX_PRICE_AGE_CEILING, MAX_PRICE_CONF_BPS_CEILING,
                MIN_ENTRY_CEILING_LAMPORTS, MIN_ENTRY_FLOOR_LAMPORTS, MIN_OPENING_FEE_USD,
                MIN_OPENING_PRIZE_BPS,
            },
            error::BrotError,
        };

        // The prize share is at most the whole payment; compared in u64, the constant's type.
        let prize_bps = u64::from(self.opening_prize_bps.get());
        let min_entry = self.min_entry_lamports.get();
        let join_age = self.campaign_max_age.get();

        if !(MIN_OPENING_FEE_USD..=MAX_OPENING_FEE_USD).contains(&self.opening_fee_usd.get()) {
            return Err(BrotError::OpeningFeeUsdOutOfRange.into());
        }
        if !(u64::from(MIN_OPENING_PRIZE_BPS)..=BPS_DENOMINATOR).contains(&prize_bps) {
            return Err(BrotError::OpeningPrizeBpsOutOfRange.into());
        }
        if self.fee_bps.get() > MAX_FEE_BPS {
            return Err(BrotError::FeeBpsAboveCeiling.into());
        }
        if self.one_sided_fee_bps.get() > MAX_ONE_SIDED_FEE_BPS {
            return Err(BrotError::OneSidedFeeBpsAboveCeiling.into());
        }
        if self.creator_share_bps.get() > MAX_CREATOR_SHARE_BPS {
            return Err(BrotError::CreatorShareBpsAboveCeiling.into());
        }
        if !(1..=MAX_OPEN_CAMPAIGNS_CEILING).contains(&self.max_open_campaigns.get()) {
            return Err(BrotError::MaxOpenCampaignsOutOfRange.into());
        }
        if !(MIN_ENTRY_FLOOR_LAMPORTS..=MIN_ENTRY_CEILING_LAMPORTS).contains(&min_entry) {
            return Err(BrotError::MinEntryOutOfRange.into());
        }
        if self.sol_usd_feed_id == [0; 32] {
            return Err(BrotError::SolUsdFeedIdZero.into());
        }
        if !(1..=MAX_PRICE_AGE_CEILING).contains(&self.max_price_age.get()) {
            return Err(BrotError::MaxPriceAgeOutOfRange.into());
        }
        if !(1..=MAX_PRICE_CONF_BPS_CEILING).contains(&self.max_price_conf_bps.get()) {
            return Err(BrotError::MaxPriceConfOutOfRange.into());
        }
        if !(CAMPAIGN_MAX_AGE_FLOOR..=CAMPAIGN_MAX_AGE_CEILING).contains(&join_age) {
            return Err(BrotError::CampaignMaxAgeOutOfRange.into());
        }
        Ok(())
    }
}
