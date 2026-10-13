//! Purpose: the core of a join, shared by `user_join_campaign` and `sponsor_join_campaign`: every join
//!          rule in `user_join_campaign`'s order with its own error, the baker's `Entry` and `Join`
//!          records, the deposit into the vault, the bookkeeping and `EntryAdded`.
//! Version: 0.0.2
//! Sprint: 15 (lane L15): moved out of `join_campaign.rs` 0.0.5 unchanged in order, errors and
//!         effects, so the sealed entry joins the pot through the very same path; `amount_of` also
//!         gets the parameters' version (red team L2)
//!
//! Order, after the slots (`join_slots.rs`): the config, read for the pause and the creation
//! parameters; the campaign and its vault; the metric account's address, `Open`, the entry close,
//! the join lock (the reader's error, or `OutcomeKnowable`; `join_lock.rs`) and the pause. Only then
//! does `amount_of` name the lamports the join enters (the signed amount; a sealed entry prices its
//! US$ there). Then the campaign's minimum; the baker's `Entry`
//! (`entry_account.rs`), created on the first join with its rent, the only lamports that move before
//! the estimate; the first baker; the return estimate; and only then the `Join`, the deposit, the
//! bookkeeping and the event. A refusal after the creation reverts it with the rest of the
//! transaction. There is no cap of any kind (D-h), and no instruction moves an entry out (A-1).

use pinocchio::{error::ProgramError, Address};

use super::{
    entry_account::{create_entry, load_entry},
    join_lock::require_outcome_open,
    join_record::{open_join, JoinFields},
    join_rules,
    join_slots::{ConfigTerms, JoinAccounts, JoinTerms},
};
use crate::{
    checks,
    constants::VAULT_SEED,
    error::BrotError,
    events::{self, EntryAdded},
    layout::LeU64,
    math::payout::{estimate_return_bps, JoinedPot},
    readers::ChainTime,
    state::{
        campaign::Campaign,
        config::GlobalConfig,
        enums::{OperatingLevel, Side, Status},
    },
    vault,
};

/// Every rule of a join after its slots, in order, then its effects and `EntryAdded`. `amount_of`
/// is called once the campaign takes joins and entries are not paused, with the config's terms (its
/// creation parameters and their version) and the clock this join read: it names the lamports the join
/// enters, and a value the caller gets back (a sealed entry's charge). Its refusals come before the
/// campaign's minimum.
pub fn join<T>(
    a: JoinAccounts,
    terms: JoinTerms,
    program_id: &Address,
    amount_of: impl FnOnce(&ConfigTerms, &ChainTime) -> Result<(u64, T), ProgramError>,
) -> Result<T, ProgramError> {
    let JoinAccounts {
        baker,
        config,
        campaign,
        vault,
        entry,
        metric_account,
        join,
        event_authority,
        program,
        ..
    } = a;
    // The config is read for the pause and its terms (the parameters and their version); the minimum
    // is the campaign's own (question 5).
    let (paused, config_terms) = {
        let config = GlobalConfig::load(config, program_id)?;
        let read = ConfigTerms {
            params: config.params,
            version: config.params_version.get(),
        };
        (config.operating_level != OperatingLevel::Normal as u8, read)
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
    let (amount, kept) = amount_of(&config_terms, &time)?;
    join_rules::require_min_entry(amount, campaign.min_entry_lamports.get())?;

    let expected_total = terms.expected_entry_total;
    let mut entry = if entry.owned_by(program_id) {
        load_entry(entry, &campaign_key, &baker_key, expected_total, program_id)?
    } else {
        let created = create_entry(baker, entry, &campaign_key, expected_total, program_id)?;
        let entries_open = add_u32(campaign.entries_open.get(), 1)?;
        campaign.entries_open.set(entries_open);
        // A new entry is untallied until its joins are tallied after the proof (`tally_late_joins`).
        let untallied = add_u32(campaign.entries_untallied.get(), 1)?;
        campaign.entries_untallied.set(untallied);
        created
    };

    // The first baker: the entry that lands in an empty pot, by the books, never by the vault's
    // balance (I15). The exemption covers that wallet's whole entry, both sides (Q3).
    let (pool_yes, pool_no) = (campaign.pool_yes.get(), campaign.pool_no.get());
    if add(pool_yes, pool_no)? == 0 {
        campaign.first_baker = baker_key;
        entry.is_first = 1;
    }

    let (side_pool, other_pool) = match terms.side {
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
    if estimate < u64::from(terms.min_return_bps) {
        return Err(BrotError::ReturnBelowMinimum.into());
    }

    // Effects. Every new value is computed with checked math before the entry moves.
    let (entry_yes, entry_no) = (entry.amount_yes.get(), entry.amount_no.get());
    let (pool_yes, pool_no, entry_yes, entry_no) = match terms.side {
        Side::Yes => (side_after, pool_no, add(entry_yes, amount)?, entry_no),
        Side::No => (pool_yes, side_after, entry_yes, add(entry_no, amount)?),
    };
    let seq = campaign.event_seq.get();
    let next_seq = add(seq, 1)?;
    let side = terms.side as u8;
    let fields = JoinFields {
        side,
        joined_at: time.unix_timestamp,
        amount,
    };
    open_join(baker, join, &campaign_key, &mut entry, fields, program_id)?;
    let vault_before = vault.lamports();
    vault::deposit(baker, vault, amount)?;
    // The vault moves by exactly the entry this join books (TP 3.4.13; a lamport sent by hand is in vault_before).
    crate::math::invariant::vault_change_matches(vault_before, vault.lamports(), amount, 0)?;
    entry.amount_yes.set(entry_yes);
    entry.amount_no.set(entry_no);
    campaign.pool_yes.set(pool_yes);
    campaign.pool_no.set(pool_no);
    campaign.event_seq.set(next_seq);
    let event = EntryAdded {
        campaign: campaign_key,
        seq: LeU64::new(seq),
        baker: baker_key,
        side,
        is_first: entry.is_first,
        amount: LeU64::new(amount),
        pool_yes: LeU64::new(pool_yes),
        pool_no: LeU64::new(pool_no),
        entry_yes: LeU64::new(entry_yes),
        entry_no: LeU64::new(entry_no),
    };
    drop(entry);
    drop(campaign);
    events::emit(&event, event_authority, program, program_id)?;
    Ok(kept)
}

fn add(a: u64, b: u64) -> Result<u64, BrotError> {
    a.checked_add(b).ok_or(BrotError::MathOverflow)
}

fn add_u32(a: u32, b: u32) -> Result<u32, BrotError> {
    a.checked_add(b).ok_or(BrotError::MathOverflow)
}
