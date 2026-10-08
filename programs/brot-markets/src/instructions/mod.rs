//! Purpose: the program's interface: every instruction with its discriminator, its accounts in
//!          order and its arguments, for the dispatcher and for the Shank IDL (T9).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); frozen at the sprint's opening
//!
//! Instruction data is `[discriminator, arguments]`; the arguments are a fixed little-endian
//! layout of exactly their size (no string, no optional field: D-j). Shank numbers the variants
//! of `BrotInstruction` by position, so the constants in `ix` follow the same order and new
//! instructions are appended. Accounts after the listed ones are ignored. Every instruction
//! ends with the two event slots (T4).

pub mod admin;
pub mod campaigns;
pub mod entries;

use pinocchio::{error::ProgramError, ProgramResult};
use shank::ShankInstruction;

use crate::{error::BrotError, layout::ZeroCopy, state::config::CreationParams};
use admin::{
    initialize_config::InitializeConfigArgs, set_fee_recipient::SetFeeRecipientArgs,
    set_team::SetTeamArgs, transfer_admin::TransferAdminArgs,
};
use campaigns::open_campaign::OpenCampaignArgs;
use entries::join_campaign::JoinCampaignArgs;

/// Instruction discriminators, in the order of `BrotInstruction`.
pub mod ix {
    pub const ADMIN_INITIALIZE_CONFIG: u8 = 0;
    pub const ADMIN_SET_TEAM: u8 = 1;
    pub const ADMIN_SET_CREATION_PARAMS: u8 = 2;
    pub const ADMIN_SET_FEE_RECIPIENT: u8 = 3;
    pub const ADMIN_TRANSFER_ADMIN: u8 = 4;
    pub const ADMIN_ACCEPT_ADMIN: u8 = 5;
    pub const TEAM_PAUSE_ENTRIES: u8 = 6;
    pub const ADMIN_RESUME_ENTRIES: u8 = 7;
    pub const USER_OPEN_CAMPAIGN: u8 = 8;
    pub const USER_JOIN_CAMPAIGN: u8 = 9;
    /// Not an instruction: the self-CPI that carries an event (`events::EVENT_IX_TAG`).
    pub const EMIT_EVENT: u8 = crate::events::EVENT_IX_TAG;
}

#[derive(ShankInstruction)]
#[rustfmt::skip]
pub enum BrotInstruction {
    /// Creates `GlobalConfig` and the fee vault, once. Only the program's upgrade authority.
    #[account(0, writable, signer, name = "authority", desc = "The program's upgrade authority; pays both rents")]
    #[account(1, writable, name = "config", desc = "GlobalConfig, PDA [\"config\"], created")]
    #[account(2, writable, name = "fee_vault", desc = "Fee vault, PDA [\"fee_vault\"], created with no data")]
    #[account(3, name = "program_data", desc = "This program's ProgramData account")]
    #[account(4, name = "system_program", desc = "System Program")]
    #[account(5, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(6, name = "program", desc = "This program")]
    AdminInitializeConfig(InitializeConfigArgs),

    /// Sets up to five team keys.
    #[account(0, signer, name = "admin", desc = "GlobalConfig.admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminSetTeam(SetTeamArgs),

    /// Changes the creation parameters, each under its ceiling, for future campaigns only.
    #[account(0, signer, name = "admin", desc = "GlobalConfig.admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminSetCreationParams(CreationParams),

    /// Sets where `sweep_fees` sends the fee vault.
    #[account(0, signer, name = "admin", desc = "GlobalConfig.admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminSetFeeRecipient(SetFeeRecipientArgs),

    /// First step of an admin change: names the pending admin (zero cancels).
    #[account(0, signer, name = "admin", desc = "GlobalConfig.admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminTransferAdmin(TransferAdminArgs),

    /// Second step: the pending admin accepts.
    #[account(0, signer, name = "new_admin", desc = "GlobalConfig.pending_admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminAcceptAdmin,

    /// Pauses entries and openings: `Normal` to `EntriesHalted` only. Never blocks payouts.
    #[account(0, signer, name = "team_member", desc = "A key in GlobalConfig.team")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    TeamPauseEntries,

    /// Resumes entries: `EntriesHalted` to `Normal`.
    #[account(0, signer, name = "admin", desc = "GlobalConfig.admin")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(3, name = "program", desc = "This program")]
    AdminResumeEntries,

    /// Opens a campaign: the ten checks of TP section 3.4.10, then the campaign, its vault and
    /// the opening payment into the vault.
    #[account(0, writable, signer, name = "creator", desc = "Any wallet, or a team key; pays the opening and both rents")]
    #[account(1, writable, name = "config", desc = "GlobalConfig")]
    #[account(2, writable, name = "campaign", desc = "Campaign, PDA [\"campaign\", id], created")]
    #[account(3, writable, name = "vault", desc = "Vault, PDA [\"vault\", campaign], created with no data")]
    #[account(4, name = "metric_account", desc = "The account the reader reads (price: the sponsored account of feed_id)")]
    #[account(5, name = "sol_usd_price", desc = "The sponsored SOL/USD account; read only when the opening pays")]
    #[account(6, name = "system_program", desc = "System Program")]
    #[account(7, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(8, name = "program", desc = "This program")]
    UserOpenCampaign(OpenCampaignArgs),

    /// Joins a campaign: the entry moves from the baker's wallet into the vault.
    #[account(0, writable, signer, name = "baker", desc = "The joining wallet; pays the entry and the Entry rent")]
    #[account(1, name = "config", desc = "GlobalConfig: the pause and the minimum")]
    #[account(2, writable, name = "campaign", desc = "Campaign")]
    #[account(3, writable, name = "vault", desc = "The campaign's vault")]
    #[account(4, writable, name = "entry", desc = "Entry, PDA [\"entry\", campaign, baker], created on the first join")]
    #[account(5, name = "metric_account", desc = "Campaign.metric_account (the join lock reads it from Sprint 03)")]
    #[account(6, name = "system_program", desc = "System Program")]
    #[account(7, name = "event_authority", desc = "PDA [\"__event_authority\"]")]
    #[account(8, name = "program", desc = "This program")]
    UserJoinCampaign(JoinCampaignArgs),
}

/// The arguments of an instruction, refused unless the data is exactly their size.
pub fn args<T: ZeroCopy>(data: &[u8]) -> Result<&T, ProgramError> {
    T::from_bytes(data).ok_or_else(|| BrotError::BadInstructionData.into())
}

/// An instruction without arguments carries none.
pub fn no_args(data: &[u8]) -> ProgramResult {
    if data.is_empty() {
        Ok(())
    } else {
        Err(BrotError::BadInstructionData.into())
    }
}
