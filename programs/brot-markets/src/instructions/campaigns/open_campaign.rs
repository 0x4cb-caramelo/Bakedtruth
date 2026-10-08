//! Purpose: `user_open_campaign`: any wallet opens a price campaign paying US$500 in SOL at the
//!          Pyth SOL/USD price, 90% bookkept as the prize and 10% held as the opening fee; a team
//!          key opens free with no creator share (TP section 3.4.10).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane D
//!
//! The handler runs the ten rows of TP section 3.4.10 in the order of `checks.rs`, each refusal
//! with its own error (X0.7): the arguments (rows 1 and 9), the slots, the config (row 8), the
//! duration (row 5), the reader (rows 2 to 4), the payment (row 7, in `payment`), the two new
//! accounts (row 10), the deposit, the fields (row 6, in `record`) and the event.

mod create;
pub mod payment;
mod record;

use pinocchio::{
    error::ProgramError,
    sysvars::{clock::Clock, Sysvar},
    AccountView, Address, ProgramResult,
};
use shank::ShankType;

use crate::{
    checks,
    error::BrotError,
    events,
    instructions::args,
    layout::{LeI128, LeI64, LeU64},
    math::schedule,
    readers::{self, CreationContext},
    state::{
        self,
        campaign::Campaign,
        config::GlobalConfig,
        enums::{Direction, OperatingLevel, ReaderKind},
    },
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
    // Row 1: a byte that names no reader, then a kind that does not open yet (the four other
    // kinds until Sprint 03; `StakeAtLeast` until a devnet YES). Then the direction byte.
    let kind = ReaderKind::try_from(args.kind)?;
    if kind != ReaderKind::PriceTouch {
        return Err(BrotError::ReaderKindNotOpen.into());
    }
    let direction = Direction::try_from(args.direction)?;

    // The slots. The metric and SOL/USD slots are only read, and may hold the same account: a
    // campaign on SOL/USD itself passes it twice.
    checks::signer(creator)?;
    checks::writable(creator)?;
    checks::writable(config)?;
    checks::writable(campaign)?;
    checks::writable(vault)?;
    checks::distinct(campaign, vault)?;
    checks::system_program(system_program)?;
    checks::event_accounts(event_authority, program, program_id)?;

    // Row 8: the pause stops openings too, and the valve on the services' work (T18).
    let mut config = GlobalConfig::load_mut(config, program_id)?;
    if OperatingLevel::try_from(config.operating_level)? == OperatingLevel::EntriesHalted {
        return Err(BrotError::OpenWhilePaused.into());
    }
    let open_campaigns = config.open_campaigns.get();
    if open_campaigns >= config.params.max_open_campaigns.get() {
        return Err(BrotError::TooManyOpenCampaigns.into());
    }
    let params = config.params;

    // Row 5: 3 to 90 days from now, and when entries close.
    let now = Clock::get()?.unix_timestamp;
    let deadline_at = args.deadline_at.get();
    schedule::check_duration(now, deadline_at)?;
    let entries_close_at = schedule::entries_close_at(now, deadline_at)?;

    // Rows 2 to 4: the reader accepts the account, and the target is not touched yet.
    let context = CreationContext {
        metric: metric_account,
        feed_id: &args.feed_id,
        direction,
        target: args.target.get(),
        max_age: params.campaign_max_age.get(),
        now,
    };
    let reading = readers::validate_at_creation(kind, &context)?;

    // Row 7: what the opening pays, priced and bounded before anything is created.
    let is_team = config.is_team(creator.address());
    let opening_usd = args.opening_usd.get();
    let max_lamports = args.max_lamports.get();
    let payment = payment::charge(
        &params,
        is_team,
        opening_usd,
        max_lamports,
        sol_usd_price,
        now,
    )?;

    // Row 10: the campaign and its vault at their canonical PDAs, rent paid by the creator.
    let bumps = create::campaign_and_vault(creator, campaign, vault, args.id.get(), program_id)?;
    let campaign_key = *campaign.address();

    // All of the payment into the vault, bookkept below as prize and opening fee (I14).
    if payment.paid > 0 {
        crate::vault::deposit(creator, vault, payment.paid)?;
    }

    // Row 6 and every other field, then the count of open campaigns (I7).
    let mut opened = state::init::<Campaign>(campaign)?;
    let opening = record::Opening {
        args,
        kind,
        direction,
        bump: bumps.campaign,
        vault_bump: bumps.vault,
        creator: creator.address(),
        is_team,
        params: &params,
        metric_account: metric_account.address(),
        price_exponent: reading.price_exponent,
        now,
        entries_close_at,
        payment,
    };
    record::write(&mut opened, &opening);
    let open_campaigns = open_campaigns
        .checked_add(1)
        .ok_or(BrotError::MathOverflow)?;
    config.open_campaigns.set(open_campaigns);

    // The event with `seq` 0, then the campaign's next sequence number (X0.4).
    events::emit(
        &record::opened_event(&campaign_key, &opened),
        event_authority,
        program,
        program_id,
    )?;
    let next_seq = opened
        .event_seq
        .get()
        .checked_add(1)
        .ok_or(BrotError::MathOverflow)?;
    opened.event_seq.set(next_seq);
    Ok(())
}
