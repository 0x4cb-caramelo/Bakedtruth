//! Purpose: `admin_set_fee_recipient`: the admin sets where `sweep_fees` sends the fee vault
//!          (Sprint 04).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{
    checks,
    error::BrotError,
    events,
    instructions::{
        admin::shared::{config_changed, is_zero, require_admin},
        args,
    },
    layout::Pubkey,
    state::{config::GlobalConfig, enums::ConfigChange},
    zero_copy,
};

#[derive(ShankType)]
#[repr(C)]
pub struct SetFeeRecipientArgs {
    /// Not zero.
    pub fee_recipient: Pubkey,
}

zero_copy!(SetFeeRecipientArgs = 32);

pub fn admin_set_fee_recipient(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<SetFeeRecipientArgs>(data)?;
    let [admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(admin)?;
    checks::writable(config)?;
    checks::event_accounts(event_authority, program, program_id)?;
    let mut state = GlobalConfig::load_mut(config, program_id)?;
    require_admin(&state, admin.address())?;
    if is_zero(&args.fee_recipient) {
        return Err(BrotError::ZeroAddress.into());
    }
    state.fee_recipient = args.fee_recipient;
    let event = config_changed(ConfigChange::FeeRecipient, admin.address(), &state);
    drop(state);
    events::emit(&event, event_authority, program, program_id)
}
