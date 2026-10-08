//! Purpose: `user_open_campaign`: any wallet opens a price campaign paying US$500 in SOL at the
//!          Pyth SOL/USD price, 90% bookkept as the prize and 10% held as the opening fee; a team
//!          key opens free with no creator share (TP section 3.4.10).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane D

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{
    instructions::args,
    layout::{LeI128, LeI64, LeU64},
    zero_copy,
};

/// The arguments of an opening. No field is a string (D-j); the fees and the share are not
/// arguments: they are copied from the config (row 6).
#[derive(ShankType)]
#[repr(C)]
pub struct OpenCampaignArgs {
    /// Drawn at random by the client and saved before signing (T17): a retry reuses it and fails
    /// on the existing account instead of charging twice.
    #[idl_type("u64")]
    pub id: LeU64,
    #[idl_type("ReaderKind")]
    pub kind: u8,
    /// Price kind: `Above` or `Below`.
    #[idl_type("Direction")]
    pub direction: u8,
    /// Price kind: the Pyth feed id.
    pub feed_id: [u8; 32],
    /// The number the reading is compared with, in the metric account's own units.
    #[idl_type("i128")]
    pub target: LeI128,
    /// Unix seconds; 3 to 90 days after now.
    #[idl_type("i64")]
    pub deadline_at: LeI64,
    /// Whole US$ to pay: at least `opening_fee_usd` for any wallet; 0 for a team key that adds
    /// no prize. Above the fee, the excess is a larger prize at the same 90/10 (D-b).
    #[idl_type("u64")]
    pub opening_usd: LeU64,
    /// The most lamports the signer accepts to pay (T25). Ignored when `opening_usd` is 0.
    #[idl_type("u64")]
    pub max_lamports: LeU64,
}

zero_copy!(OpenCampaignArgs = 82);

pub fn user_open_campaign(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<OpenCampaignArgs>(data)?;
    let [creator, config, campaign, vault, metric_account, sol_usd_price, system_program, event_authority, program, ..] =
        accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let _ = (
        program_id,
        args,
        creator,
        config,
        campaign,
        vault,
        metric_account,
        sol_usd_price,
        system_program,
        event_authority,
        program,
    );
    todo!("Sprint 02 lane D")
}
