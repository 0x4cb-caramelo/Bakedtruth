//! Purpose: `reread_campaign`: stage 1 of a contest (TP section 3.4.7; BP v0.0.4 part 1 section 4.5). Any wallet, at
//!          the top level only, runs the campaign's reading again NOW through the reader the resolution used, and
//!          compares it EXACTLY with the stored result (outcome, void reason, `met_late`, observed value). The same
//!          reading pays, from stage 1's deadline on (24 hours after the contest opened; `RereadBeforeTimelock` before
//!          it): the snapshot runs with the stored outcome. Any difference, or a reader that cannot decide now or
//!          refuses the campaign's own metric account, opens stage 2 at once. A proof the caller offers and the reader
//!          refuses refuses the re-read instead. It never writes a result into the campaign.
//! Version: 0.1.2 (the founder's answer to D2: the 24-hour wait of a matching re-read; review fixes F3, F4 and F5)
//! Sprint: 14 (scaffold of Sprints 14–15, 2026-10-13; the body by lane L14B). Accounts: 0 campaign (writable;
//!         Contested, stage 1), 1 config (writable: the open count, for the snapshot), 2 metric account, 3 proof
//!         account (price kind: a proof, as for `resolve_campaign`; the program's own address offers none; the other
//!         kinds never read it), 4 event authority, 5 program. No arguments. Events: `CampaignReread`, then
//!         `CampaignFinalized` when it pays.
//!
//! Order, each refusal with its own error: no arguments (`BadInstructionData`), six slots (`NotEnoughAccountKeys`),
//! `checks::top_level` before any account is read (`RereadNotTopLevel`), the two writable slots, distinct, the event
//! slots; the campaign and the config loaded (owner, length, tag, PDA); `Contested` (`NotContested`) at stage 1
//! (`WrongContestStage`); the metric slot is the campaign's locked account (`MetricAccountMismatch`); then the reader,
//! and an offered proof it read and refused refuses the re-read with the reader's own error (`ReaderWrongOwner`,
//! `PriceWrongFeed`, `ProofStale`, `ProofDoesNotTouch`...; `readers::reads_proof`: the price kind inside its proof
//! window); last, `reread_act`: the same reading before stage 1's deadline (`RereadBeforeTimelock`). Allowed at any
//! time in stage 1, which lasts 24 hours: during them a team key may send the contest to stage 2 (`team_open_contest`),
//! a different reading escalates at once, and a matching one waits for the deadline. A re-read after it starts stage
//! 2 from that deadline, not from now, and a stage 1 nobody re-reads lapses 48 hours after it (`finalize_campaign`),
//! so the payout is due at most 78 hours after the resolution, with or without a keeper (F3). The pause never blocks it.
//!
//! What "the same reading" means, per family of TP section 3.4.6. The re-read runs the resolution's own code, so it
//! cannot catch a reader's bug: a same reading shows only that the chain still says what it said. Many correct results
//! read differently a few hours later; each such false escalation goes to a person (stage 2), the safe direction, and
//! without a decision the stored result stands when stage 2 lapses.
//! - Irreversible facts (`SupplyAtMost`, `DammV2LockedAtLeast`): the account's value now. Before the deadline a YES
//!   re-reads the same while the value has not moved; burns lower a supply and permanent locks add liquidity, and
//!   anyone holding the token or the position can make them, so a YES whose value kept moving re-reads differently.
//!   After the deadline the reader decides only NO: a YES re-read then reads NO with `met_late` set (the fact met, read
//!   late), and a NO recorded after the deadline re-reads with `met_late` once the fact happens later. Both escalate.
//!   For a correct YES this is what sends it to a person: the admin reads `met_late` as "the fact was met" and checks
//!   the resolution's own evidence (`CampaignResolved`, before the deadline) before confirming (F5).
//! - Stamped fact (`DbcGraduated`): the pool's own stamp decides, and it never moves; the observed value is the
//!   curve's quote reserve, which moves with every swap and leaves when the pool migrates: false escalations. A NO
//!   whose curve completes after the deadline re-reads with `met_late`: the same.
//! - Epoch snapshots (`StakePoolTvlAtLeast`, `StakeAtLeast`): the measured epoch's snapshot, fixed through that epoch:
//!   the same while the epoch lasts. Once it is over the reader voids (`MissedWindow`), so a correct YES or NO
//!   re-read in the next epoch escalates; a stored `MissedWindow` re-reads the same.
//! - Price touch (`PriceTouch`): up to 60 s after the deadline only a YES proof decides, offered in slot 3 exactly as
//!   for the resolution. A proof must be at most 60 s old, so a stored YES re-reads the same only with a proof whose
//!   price equals the stored one: in practice every YES contested before the deadline escalates, with a fresh proof
//!   at another price or with none offered (`NotYet`); a proof the reader refuses refuses the re-read. After that window
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
            contest_rules::{require_metric, require_proof_accepted, require_stage},
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
    let offered = proof_account.address() != program_id;
    // Whether the reader reads the offered proof now: its errors are then the proof's own (review fix F4).
    let proof_read = offered && readers::reads_proof(kind, &stored, &time)?;
    let context = ReadContext {
        metric: metric_account,
        campaign: &stored,
        time,
        proof: offered.then_some(&*proof_account),
    };
    let reading = match readers::try_resolve(kind, &context) {
        Ok(Resolution::Decided(decision)) => Some(decision),
        // The reader cannot decide now: a different reading.
        Ok(Resolution::NotYet) => None,
        // An offered proof's error refuses the re-read; the campaign's own metric account's is a different reading.
        Err(error) => {
            require_proof_accepted(proof_read, error)?;
            None
        }
    };
    let same = same_reading(&StoredResult::of(&stored), reading.as_ref());

    let (event, finalized) =
        match reread_act(same, time.unix_timestamp, stored.contest_ends_at.get())? {
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
