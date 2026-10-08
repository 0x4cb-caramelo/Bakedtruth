//! Purpose: `admin_set_fee_recipient`: the admin sets where `sweep_fees` sends the fee vault
//!          (Sprint 04).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{instructions::args, layout::Pubkey, zero_copy};

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
    let _ = args;
    let [admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let _ = (program_id, admin, config, event_authority, program);
    todo!("Sprint 02 lane B")
}
