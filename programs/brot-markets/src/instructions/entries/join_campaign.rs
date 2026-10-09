//! Purpose: `user_join_campaign`: a baker joins YES or NO with at least `min_entry_lamports` while
//!          the outcome is not knowable; the entry moves from the baker's wallet into the vault
//!          by System Program transfer, and the pot is bookkept, never read from the vault.
//! Version: 0.0.4
//! Sprint: 02 (pot core on Pinocchio), accounts and arguments frozen at its opening, body by
//!         lane E; 03 (readers and resolution) adds the join lock (BR-06), lane E; 04 (lane G)
//!         reads the campaign's own minimum (question 5) and the proximity buffer (question 7).
//!         The `Join` record (`join_record.rs`) is not written here yet: the account list has no slot for it.
//!
//! Order: the arguments, the slots and the loads, as `checks.rs` orders them; then the
//! campaign's rules: the metric account's address, `Open`, the entry close, the join lock (the
//! reader's error, or `OutcomeKnowable`; `join_lock.rs`), the pause and the minimum. Then the
//! baker's `Entry` (`entry_account.rs`), created on the first join with its rent, the only
//! lamports that move before the estimate; the first baker; the return estimate; and only then
//! the deposit, the bookkeeping and the event. A refusal after the creation reverts it with the
//! rest of the transaction. Every refusal has its own error. There is no cap of any kind (D-h),
//! and no instruction moves an entry out (A-1).

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use super::{
    entry_account::{create_entry, load_entry},
    join_lock::require_outcome_open,
    join_rules,
};
use crate::{
    checks,
    constants::VAULT_SEED,
    error::BrotError,
    events::{self, EntryAdded},
    instructions::args,
    layout::{LeU32, LeU64},
    math::payout::{estimate_return_bps, JoinedPot},
    readers::ChainTime,
    state::{
        campaign::Campaign,
        config::GlobalConfig,
        enums::{OperatingLevel, Side, Status},
    },
    vault, zero_copy,
};

#[derive(ShankType)]
#[repr(C)]
pub struct JoinCampaignArgs {
    #[idl_type("Side")]
    pub side: u8,
    /// Lamports; at least `min_entry_lamports`. No cap (D-h).
    #[idl_type("u64")]
    pub amount: LeU64,
    /// The least the entry must return if its side wins, in bps of `amount`, on the pot as it
    /// stands after the entry; 0 accepts any.
    #[idl_type("u32")]
    pub min_return_bps: LeU32,
    /// The baker's whole entry, both sides, before this join, as the client read it (T10): a
    /// retried transaction finds another total and fails instead of entering twice.
    #[idl_type("u64")]
    pub expected_entry_total: LeU64,
}

zero_copy!(JoinCampaignArgs = 21);

pub fn user_join_campaign(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<JoinCampaignArgs>(data)?;
    // The Join account sits at slot 6 (amendment 2026-10-09); lane G writes it. Until then it is only passed.
    let [baker, config, campaign, vault, entry, metric_account, _join, system_program, event_authority, program, ..] =
        accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let side = Side::try_from(args.side)?;
    let amount = args.amount.get();

    checks::signer(baker)?;
    checks::writable(baker)?;
    checks::writable(campaign)?;
    checks::writable(vault)?;
    checks::writable(entry)?;
    checks::distinct(campaign, vault)?;
    checks::distinct(entry, vault)?;
    checks::distinct(entry, campaign)?;
    checks::system_program(system_program)?;
    checks::event_accounts(event_authority, program, program_id)?;

    // The config is only read for the pause; the minimum is the campaign's own (question 5).
    let paused = {
        let config = GlobalConfig::load(config, program_id)?;
        config.operating_level != OperatingLevel::Normal as u8
    };
    let campaign_key = *campaign.address();
    let baker_key = *baker.address();
    let mut campaign = Campaign::load_mut(campaign, program_id)?;
    let vault_seeds: [&[u8]; 2] = [VAULT_SEED, campaign_key.as_ref()];
    checks::owned_by(vault, program_id)?;
    checks::pda(vault, &vault_seeds, campaign.vault_bump, program_id)?;
    // Only the account locked at opening is read. For a price campaign that is the sponsored
    // account, derived on-chain from the push oracle, shard 0 and the feed (Sprint 02): this
    // comparison is what makes the price join accept only the sponsored account.
    if metric_account.address() != &campaign.metric_account {
        return Err(BrotError::MetricAccountMismatch.into());
    }

    if campaign.status != Status::Open as u8 {
        return Err(BrotError::CampaignNotOpen.into());
    }
    // One clock read serves the entry close and the join lock.
    let time = ChainTime::now()?;
    if time.unix_timestamp >= campaign.entries_close_at.get() {
        return Err(BrotError::EntriesClosed.into());
    }
    // The join lock (BR-06).
    require_outcome_open(metric_account, &campaign, time)?;
    if paused {
        return Err(BrotError::JoinWhilePaused.into());
    }
    join_rules::require_min_entry(amount, campaign.min_entry_lamports.get())?;

    let expected_total = args.expected_entry_total.get();
    let mut entry = if entry.owned_by(program_id) {
        load_entry(entry, &campaign_key, &baker_key, expected_total, program_id)?
    } else {
        let created = create_entry(baker, entry, &campaign_key, expected_total, program_id)?;
        let entries_open = add_u32(campaign.entries_open.get(), 1)?;
        campaign.entries_open.set(entries_open);
        created
    };

    // The first baker: the entry that lands in an empty pot, by the books, never by the vault's
    // balance (I15). The exemption covers that wallet's whole entry, both sides (Q3).
    let (pool_yes, pool_no) = (campaign.pool_yes.get(), campaign.pool_no.get());
    if add(pool_yes, pool_no)? == 0 {
        campaign.first_baker = baker_key;
        entry.is_first = 1;
    }

    let (side_pool, other_pool) = match side {
        Side::Yes => (pool_yes, pool_no),
        Side::No => (pool_no, pool_yes),
    };
    let side_after = add(side_pool, amount)?;
    let estimate = estimate_return_bps(&JoinedPot {
        amount,
        side_after,
        other: other_pool,
        prize: campaign.prize_lamports.get(),
        fee_bps: campaign.fee_bps.get(),
        one_sided_fee_bps: campaign.one_sided_fee_bps.get(),
        creator_share_bps: campaign.creator_share_bps.get(),
        is_first: entry.is_first != 0,
    })?;
    if estimate < u64::from(args.min_return_bps.get()) {
        return Err(BrotError::ReturnBelowMinimum.into());
    }

    // Effects. Every new value is computed with checked math before the entry moves.
    let (entry_yes, entry_no) = (entry.amount_yes.get(), entry.amount_no.get());
    let (pool_yes, pool_no, entry_yes, entry_no) = match side {
        Side::Yes => (side_after, pool_no, add(entry_yes, amount)?, entry_no),
        Side::No => (pool_yes, side_after, entry_yes, add(entry_no, amount)?),
    };
    let seq = campaign.event_seq.get();
    let next_seq = add(seq, 1)?;
    vault::deposit(baker, vault, amount)?;
    entry.amount_yes.set(entry_yes);
    entry.amount_no.set(entry_no);
    campaign.pool_yes.set(pool_yes);
    campaign.pool_no.set(pool_no);
    campaign.event_seq.set(next_seq);
    let event = EntryAdded {
        campaign: campaign_key,
        seq: LeU64::new(seq),
        baker: baker_key,
        side: args.side,
        is_first: entry.is_first,
        amount: LeU64::new(amount),
        pool_yes: LeU64::new(pool_yes),
        pool_no: LeU64::new(pool_no),
        entry_yes: LeU64::new(entry_yes),
        entry_no: LeU64::new(entry_no),
    };
    drop(entry);
    drop(campaign);
    events::emit(&event, event_authority, program, program_id)
}

fn add(a: u64, b: u64) -> Result<u64, BrotError> {
    a.checked_add(b).ok_or(BrotError::MathOverflow)
}

fn add_u32(a: u32, b: u32) -> Result<u32, BrotError> {
    a.checked_add(b).ok_or(BrotError::MathOverflow)
}
