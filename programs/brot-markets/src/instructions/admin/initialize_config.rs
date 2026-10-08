//! Purpose: `admin_initialize_config`: creates `GlobalConfig` and the data-less fee vault, once.
//!          Only the program's upgrade authority, read from its ProgramData account, can run it (TP
//!          section 7).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{cpi::Seed, error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{
    checks,
    constants::{CONFIG_SEED, FEE_VAULT_SEED},
    error::BrotError,
    events::{self, ConfigInitialized},
    instructions::{
        admin::shared::{is_zero, ZERO_ADDRESS},
        args,
    },
    layout::{Pubkey, ZeroCopy},
    state::{
        config::{CreationParams, GlobalConfig, MAX_TEAM},
        enums::OperatingLevel,
    },
    zero_copy,
};

#[derive(ShankType)]
#[repr(C)]
pub struct InitializeConfigArgs {
    /// The first admin (not zero). The upgrade authority chooses it.
    pub admin: Pubkey,
    /// Where `sweep_fees` will send the fee vault (not zero).
    pub fee_recipient: Pubkey,
    /// Checked like `admin_set_creation_params` checks them.
    pub params: CreationParams,
}

zero_copy!(InitializeConfigArgs = 134);

pub fn admin_initialize_config(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<InitializeConfigArgs>(data)?;
    let [authority, config, fee_vault, program_data, system_program, event_authority, program, ..] =
        accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    // The authority signs and pays both rents; both new accounts are written.
    checks::signer(authority)?;
    checks::writable(authority)?;
    checks::writable(config)?;
    checks::writable(fee_vault)?;
    checks::distinct(config, fee_vault)?;
    checks::system_program(system_program)?;
    checks::event_accounts(event_authority, program, program_id)?;
    // Whoever initialises chooses the admin, so only the upgrade authority may (TP section 7).
    checks::upgrade_authority(program_data, program_id, authority)?;
    if is_zero(&args.admin) || is_zero(&args.fee_recipient) {
        return Err(BrotError::ZeroAddress.into());
    }
    args.params.validate()?;

    // Both accounts at their canonical PDAs. Creation refuses an address the program already
    // owns, so a second initialisation fails here (`AlreadyInitialized`); an address funded in
    // advance is topped up and taken over instead.
    let bump = checks::canonical_pda(config, &[CONFIG_SEED], program_id)?;
    let fee_vault_bump = checks::canonical_pda(fee_vault, &[FEE_VAULT_SEED], program_id)?;
    let config_bump_seed = [bump];
    let config_seeds = [Seed::from(CONFIG_SEED), Seed::from(&config_bump_seed)];
    checks::create_pda_account(
        authority,
        config,
        GlobalConfig::LEN,
        program_id,
        &config_seeds,
    )?;
    let fee_vault_bump_seed = [fee_vault_bump];
    let fee_vault_seeds = [Seed::from(FEE_VAULT_SEED), Seed::from(&fee_vault_bump_seed)];
    checks::create_pda_account(authority, fee_vault, 0, program_id, &fee_vault_seeds)?;

    let mut state = crate::state::init::<GlobalConfig>(config)?;
    state.bump = bump;
    state.fee_vault_bump = fee_vault_bump;
    state.operating_level = OperatingLevel::Normal as u8;
    state.team_len = 0;
    state.admin = args.admin;
    state.pending_admin = ZERO_ADDRESS;
    state.team = [ZERO_ADDRESS; MAX_TEAM];
    state.fee_recipient = args.fee_recipient;
    state.params = args.params;
    state.open_campaigns.set(0);
    drop(state);

    let event = ConfigInitialized {
        signer: *authority.address(),
        admin: args.admin,
        fee_recipient: args.fee_recipient,
        params: args.params,
    };
    events::emit(&event, event_authority, program, program_id)
}
