//! Purpose: `reread_campaign`: stage 1 of a contest (TP section 3.4.7; BP v0.0.4 part 1 section 4.5). Any wallet, at
//!          the top level only, runs the campaign's reading again NOW through the reader the resolution used, and
//!          compares it EXACTLY with the stored result (outcome, void reason, `met_late`, observed value). The same
//!          reading pays: the snapshot runs with the stored outcome. Any difference, or a reader that now refuses or
//!          cannot decide, opens stage 2 for 48 hours. It never writes a result into the campaign.
//! Version: 0.1.0 (the body, lane L14B)
//! Sprint: 14 (scaffold of Sprints 14–15, 2026-10-13; the body by lane L14B). Accounts: 0 campaign (writable;
//!         Contested, stage 1), 1 config (writable: the open count, for the snapshot), 2 metric account, 3 proof
//!         account (price kind: a proof, as for `resolve_campaign`; the program's own address offers none; the other
//!         kinds never read it), 4 event authority, 5 program. No arguments. Events: `CampaignReread`, then
//!         `CampaignFinalized` when it pays.
//!
//! Order, each refusal with its own error: no arguments (`BadInstructionData`), six slots (`NotEnoughAccountKeys`),
//! `checks::top_level` before any account is read (`RereadNotTopLevel`), the two writable slots, distinct, the event
//! slots; the campaign and the config loaded (owner, length, tag, PDA); `Contested` (`NotContested`) at stage 1
//! (`WrongContestStage`); the metric slot is the campaign's locked account (`MetricAccountMismatch`). Allowed at any
//! time in stage 1: its `contest_ends_at` is the one-hour target the keeper meets, not a deadline (the worst case of
//! 55 hours from resolution to payout assumes the keeper meets it). The pause never blocks it.
//!
//! What "the same reading" means, per family of TP section 3.4.6. The re-read runs the resolution's own code, so it
//! cannot catch a reader's bug: a same reading shows only that the chain still says what it said. Many correct results
//! read differently a few hours later; each such false escalation goes to a person (stage 2), the safe direction, and
//! without a decision the stored result stands when stage 2 lapses.
//! - Irreversible facts (`SupplyAtMost`, `DammV2LockedAtLeast`): the account's value now. Same while the value has not
//!   moved. Burns lower a supply and permanent locks add liquidity, and anyone holding the token or the position can
//!   make them, so a YES whose value kept moving re-reads differently, and a NO recorded after the deadline re-reads
//!   with `met_late` once the fact happens later: false escalations.
//! - Stamped fact (`DbcGraduated`): the pool's own stamp decides, and it never moves; the observed value is the
//!   curve's quote reserve, which moves with every swap and leaves when the pool migrates: false escalations. A NO
//!   whose curve completes after the deadline re-reads with `met_late`: the same.
//! - Epoch snapshots (`StakePoolTvlAtLeast`, `StakeAtLeast`): the measured epoch's snapshot, fixed through that epoch:
//!   the same while the epoch lasts. Once it is over the reader voids (`MissedWindow`), so a correct YES or NO
//!   re-read in the next epoch escalates; a stored `MissedWindow` re-reads the same.
//! - Price touch (`PriceTouch`): up to 60 s after the deadline only a YES proof decides, offered in slot 3 exactly as
//!   for the resolution. A proof must be at most 60 s old, so a stored YES re-reads the same only with a proof whose
//!   price equals the stored one: in practice every YES contested before the deadline escalates. After that window
//!   the sponsored account alone is read: a stored YES re-reads as NO or a void and escalates; a stored NO re-reads
//!   the same only while the account still holds the price read at resolution (any newer update escalates); a stored
//!   `StaleFeed` re-reads the same until an update lands after the deadline, then as NO.
//! - Any kind: an account that cannot be read voids (`UnreadableAccount`, nothing read), the same while it stays so.

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks,
    error::BrotError,
    events,
    instructions::{
        no_args,
        resolution::{
            contest_reread::{
                open_stage2, reread_act, reread_event, same_reading, RereadAct, StoredResult,
            },
            contest_rules::{require_metric, require_stage},
            team_shared::take_seq,
        },
        settlement::snapshot::{finalize_snapshot, finalized_event},
    },
    readers::{self, ChainTime, ReadContext, Resolution},
    state::{
        campaign::Campaign,
        config::GlobalConfig,
        enums::{ContestStage, ReaderKind},
    },
};

pub fn reread_campaign(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    let [campaign, config, metric_account, proof_account, event_authority, program, ..] = accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    // As for the resolution: called from inside another program, a re-read could be wrapped by logic the
    // transaction's instruction list does not show, so no account is read before this check.
    checks::top_level(BrotError::RereadNotTopLevel)?;
    checks::writable(campaign)?;
    checks::writable(config)?;
    checks::distinct(campaign, config)?;
    checks::event_accounts(event_authority, program, program_id)?;

    let campaign_key = *campaign.address();
    let mut stored = Campaign::load_mut(campaign, program_id)?;
    let mut settings = GlobalConfig::load_mut(config, program_id)?;
    require_stage(stored.status, stored.contest_stage, ContestStage::Stage1)?;
    require_metric(metric_account.address(), &stored.metric_account)?;
    let kind = ReaderKind::try_from(stored.kind)?;

    // The resolution's reader, on the campaign as stored. Its decision is only compared and reported.
    let time = ChainTime::now()?;
    let no_proof = proof_account.address() == program_id;
    let context = ReadContext {
        metric: metric_account,
        campaign: &stored,
        time,
        proof: (!no_proof).then_some(&*proof_account),
    };
    let reading = match readers::try_resolve(kind, &context) {
        Ok(Resolution::Decided(decision)) => Some(decision),
        // The reader refuses, or cannot decide now: a different reading.
        Ok(Resolution::NotYet) | Err(_) => None,
    };
    let same = same_reading(&StoredResult::of(&stored), reading.as_ref());

    let (event, finalized) = match reread_act(same) {
        RereadAct::Pay => {
            let seq = take_seq(&mut stored)?;
            // The stored outcome, as `team_confirm_result` takes it; the snapshot sets the status.
            finalize_snapshot(&mut stored, &mut settings)?;
            let event = reread_event(campaign_key, &stored, reading.as_ref(), true, seq);
            let finalized_seq = take_seq(&mut stored)?;
            let finalized = finalized_event(campaign_key, &stored, finalized_seq)?;
            (event, Some(finalized))
        }
        RereadAct::Escalate => {
            let seq = open_stage2(&mut stored, time.unix_timestamp)?;
            let event = reread_event(campaign_key, &stored, reading.as_ref(), false, seq);
            (event, None)
        }
    };
    drop(settings);
    drop(stored);
    events::emit(&event, event_authority, program, program_id)?;
    match finalized {
        Some(finalized) => events::emit(&finalized, event_authority, program, program_id),
        None => Ok(()),
    }
}
