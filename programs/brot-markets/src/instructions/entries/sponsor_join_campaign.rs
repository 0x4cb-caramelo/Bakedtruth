//! Purpose: `sponsor_join_campaign(side, entry_usd, max_lamports, min_return_bps, expected_entry_total,
//!          expected_params_version)`: a sealed entry (TP section 3.4.12). A sponsor joins YES or NO
//!          with at least the config's `opening_fee_usd`, charged at the SOL/USD price as a paid opening
//!          is; the entry part joins the pot through the join's own path (`join_core.rs`), and the fee
//!          part, Brot's share (at most 10%), is held in the sponsor's `SealedFee` until the campaign is
//!          finalized (`settle_sealed_fee`).
//! Version: 0.1.1 (the creation rules' version bound, red team L2)
//! Sprint: 15 (lane L15; the scaffold's stub of 2026-10-13 filled). Accounts: 0 sponsor (writable,
//!         signer; pays the entry, the fee and the rents), 1 config, 2 campaign (writable), 3 vault
//!         (writable), 4 entry (writable; PDA ["entry", campaign, sponsor], created on the first join),
//!         5 metric account (the join lock), 6 join (writable; PDA ["join", campaign, sponsor, index],
//!         created), 7 SOL/USD price (the sponsored account of `SOL_USD_FEED_ID`), 8 sealed fee
//!         (writable; PDA ["sealed", campaign, sponsor], created on the first sealed entry, then topped
//!         up), 9 System Program, 10 event authority, 11 program. Arguments: 33 bytes.
//!
//! Order: the arguments, the slots and the side byte; the join's slot checks (`join_slots.rs`), then
//! the SealedFee slot's; then the join's rules in their order (`join_core.rs`), with the pause
//! refusing it (`JoinWhilePaused`, I10′). Where a join takes its signed amount, the creation rules'
//! version is checked (`CreationParamsChanged`), the sealed entry is charged (`sealed_charge.rs`: the
//! floor, the SOL/USD account, `max_lamports`) and its SealedFee is checked
//! (`sealed_fee_account.rs`), before the campaign's minimum and before anything moves. The
//! entry part then joins the pot (the Entry, shared with any plain join of the same wallet, the Join,
//! the first baker, the estimate, the deposit, `EntryAdded`); after it, the SealedFee is created or
//! topped up and the fee moves into it; `sealed_fees_open` counts the new account; `SealedFeeHeld`.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use super::{
    join_core,
    join_slots::{check_slots, JoinAccounts, JoinTerms},
    sealed_charge::{require_terms, sealed_charge},
    sealed_fee_account,
};
use crate::{
    error::BrotError,
    events::{self, SealedFeeHeld},
    instructions::{args, settlement::bookkeeping::take_seq},
    layout::{LeI32, LeI64, LeU32, LeU64},
    state::{campaign::Campaign, enums::Side},
    zero_copy,
};

#[derive(ShankType)]
#[repr(C)]
pub struct SponsorJoinArgs {
    #[idl_type("Side")]
    pub side: u8,
    /// Whole US$; at least the config's `opening_fee_usd`.
    #[idl_type("u64")]
    pub entry_usd: LeU64,
    /// The most lamports the sealed entry may cost at the SOL/USD price.
    #[idl_type("u64")]
    pub max_lamports: LeU64,
    /// As in `user_join_campaign`; 0 accepts any.
    #[idl_type("u32")]
    pub min_return_bps: LeU32,
    /// As in `user_join_campaign`: the sponsor's whole entry before this one, as the client read it (T10).
    #[idl_type("u64")]
    pub expected_entry_total: LeU64,
    /// `GlobalConfig.params_version` as the client read it for the preview: the split, the floor and
    /// the price rules the sponsor saw (`CreationParamsChanged` otherwise), as an opening binds them.
    #[idl_type("u32")]
    pub expected_params_version: LeU32,
}

zero_copy!(SponsorJoinArgs = 33);

pub fn sponsor_join_campaign(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<SponsorJoinArgs>(data)?;
    let [sponsor, config, campaign, vault, entry, metric_account, join, sol_usd_price, sealed_fee, system_program, event_authority, program, ..] =
        accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let side = Side::try_from(args.side)?;
    let (entry_usd, max_lamports) = (args.entry_usd.get(), args.max_lamports.get());
    let expected_version = args.expected_params_version.get();
    let (campaign_key, sponsor_key) = (*campaign.address(), *sponsor.address());
    let slots = JoinAccounts {
        baker: sponsor,
        config,
        campaign: &mut *campaign,
        vault,
        entry,
        metric_account,
        join,
        system_program,
        event_authority,
        program,
    };
    check_slots(&slots, program_id)?;
    let others = [
        slots.baker,
        &*slots.campaign,
        slots.vault,
        &*slots.entry,
        &*slots.join,
    ];
    sealed_fee_account::check_slot(sealed_fee, &others)?;
    let terms = JoinTerms {
        side,
        min_return_bps: args.min_return_bps.get(),
        expected_entry_total: args.expected_entry_total.get(),
    };
    // Where a join takes its signed amount: the rules' version, the charge, and the SealedFee checked,
    // before anything moves.
    let (payment, plan) = join_core::join(slots, terms, program_id, |config, time| {
        require_terms(expected_version, config.version)?;
        let params = &config.params;
        let payment = sealed_charge(params, entry_usd, max_lamports, sol_usd_price, time)?;
        let plan = sealed_fee_account::prepare(
            sealed_fee,
            &campaign_key,
            &sponsor_key,
            &payment,
            entry_usd,
            program_id,
        )?;
        Ok((payment.prize, (payment, plan)))
    })?;

    // The entry is in the pot; the fee is held apart, never in the vault (I1 and I15 unchanged).
    sealed_fee_account::hold(sponsor, sealed_fee, &campaign_key, &plan, program_id)?;
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    if plan.create.is_some() {
        let open = stored
            .sealed_fees_open
            .get()
            .checked_add(1)
            .ok_or(BrotError::MathOverflow)?;
        stored.sealed_fees_open.set(open);
    }
    let seq = take_seq(&mut stored)?;
    drop(stored);
    let event = SealedFeeHeld {
        campaign: campaign_key,
        seq: LeU64::new(seq),
        sponsor: sponsor_key,
        entry_usd: LeU64::new(entry_usd),
        paid: LeU64::new(payment.paid),
        entry_lamports: LeU64::new(payment.prize),
        fee_lamports: LeU64::new(payment.fee),
        fee_total: LeU64::new(plan.totals.fee_lamports),
        price: LeI64::new(payment.price),
        exponent: LeI32::new(payment.exponent),
        publish_time: LeI64::new(payment.publish_time),
    };
    events::emit(&event, event_authority, program, program_id)
}
