//! Purpose: `tally_late_joins` (amendment of 2026-10-09, founder decisions 1 and 2): reads a baker's Join accounts
//!          in index order, adds the late amounts (joined at or after the YES proof's publish time) to the entry
//!          and the campaign, closes each Join with its rent back to the baker, and marks the entry tallied when
//!          its last join is closed. Lets the snapshot know the late totals before finalize.
//! Version: 0.0.4 (O-3: a YES price result is tallied only once its cut-off is final)
//! Sprint: 04 (contract amendment; the body is lane G's); 16 (lane L16P, the audit package's O-3)
//!
//! Accounts: 0 campaign (writable), 1 entry (writable), 2 baker (writable), 3 event authority, 4 program,
//! then the Join accounts to close, in index order, at least one. Refused unless the campaign is InReview
//! (`TallyNotReady`), for every outcome; on a YES price result, also while its cut-off can still move
//! (`CutoffNotFinal`, `require_cutoff_final`). A join is late only on a YES price campaign, at or after the proof's
//! publish time (`LateRule`); each join must be the next index (`JoinAccountsMismatch`).

use pinocchio::{AccountView, Address, ProgramResult};

use crate::{
    checks,
    constants::PROOF_DELAY_SECONDS,
    error::BrotError,
    events::{self, LateTallied},
    instructions::entries::{
        entry_account::load_entry_for_tally,
        join_tally::{tally_join, LateRule},
    },
    layout::{LeU32, LeU64},
    readers::ChainTime,
    state::{campaign::Campaign, enums::Status},
};

pub fn tally_late_joins(
    program_id: &Address,
    accounts: &mut [AccountView],
    _data: &[u8],
) -> ProgramResult {
    let [campaign, entry, baker, event_authority, program, joins @ ..] = accounts else {
        return Err(pinocchio::error::ProgramError::NotEnoughAccountKeys);
    };
    if joins.is_empty() {
        return Err(BrotError::JoinAccountsMismatch.into());
    }
    checks::writable(campaign)?;
    checks::writable(entry)?;
    checks::writable(baker)?;
    checks::distinct(campaign, entry)?;
    checks::distinct(campaign, baker)?;
    checks::distinct(entry, baker)?;
    checks::event_accounts(event_authority, program, program_id)?;

    let campaign_key = *campaign.address();
    let baker_key = *baker.address();
    let mut campaign_state = Campaign::load_mut(campaign, program_id)?;
    let rule = LateRule::of(
        campaign_state.outcome,
        campaign_state.kind,
        campaign_state.publish_time.get(),
    );
    if campaign_state.status != Status::InReview as u8 {
        return Err(BrotError::TallyNotReady.into());
    }
    require_cutoff_final(rule, ChainTime::now()?.unix_timestamp)?;
    let mut entry_state = load_entry_for_tally(entry, &campaign_key, &baker_key, program_id)?;
    let total = entry_state.join_count.get();
    let mut next = entry_state.joins_tallied.get();
    if next >= total {
        return Err(BrotError::EntryAlreadyTallied.into());
    }

    let (mut late_yes, mut late_no, mut closed) = (0u64, 0u64, 0u32);
    let mut rent_total = 0u64;
    for join in joins.iter_mut() {
        if next >= total {
            return Err(BrotError::JoinAccountsMismatch.into());
        }
        let tallied = tally_join(join, &campaign_key, &baker_key, next, rule, program_id)?;
        rent_total = add(rent_total, tallied.rent)?;
        if tallied.late {
            if tallied.yes {
                late_yes = add(late_yes, tallied.amount)?;
            } else {
                late_no = add(late_no, tallied.amount)?;
            }
        }
        next = next.checked_add(1).ok_or(BrotError::MathOverflow)?;
        closed = closed.checked_add(1).ok_or(BrotError::MathOverflow)?;
    }

    entry_state.joins_tallied.set(next);
    let entry_yes = add(entry_state.late_yes.get(), late_yes)?;
    let entry_no = add(entry_state.late_no.get(), late_no)?;
    let campaign_yes = add(campaign_state.late_yes.get(), late_yes)?;
    let campaign_no = add(campaign_state.late_no.get(), late_no)?;
    entry_state.late_yes.set(entry_yes);
    entry_state.late_no.set(entry_no);
    // The closed joins' rent is held by the Entry until settlement returns it to the baker.
    drop(entry_state);
    let entry_lamports = add(entry.lamports(), rent_total)?;
    entry.set_lamports(entry_lamports);
    campaign_state.late_yes.set(campaign_yes);
    campaign_state.late_no.set(campaign_no);
    if next == total {
        let untallied = campaign_state
            .entries_untallied
            .get()
            .checked_sub(1)
            .ok_or(BrotError::MathOverflow)?;
        campaign_state.entries_untallied.set(untallied);
    }
    let seq = campaign_state.event_seq.get();
    campaign_state.event_seq.set(add(seq, 1)?);
    let event = LateTallied {
        campaign: campaign_key,
        seq: LeU64::new(seq),
        baker: baker_key,
        joins_closed: LeU32::new(closed),
        late_yes_added: LeU64::new(late_yes),
        late_no_added: LeU64::new(late_no),
    };
    drop(campaign_state);
    events::emit(&event, event_authority, program, program_id)
}

/// The cut-off is final (O-3, Sprint 16). On a YES price result, `resolve_campaign` moves the cut-off back to an
/// earlier proof at most `PROOF_DELAY_SECONDS` old, and its own gate sees only entries tallied whole, never a part of
/// one, so a join tallied under the old cut-off would keep its class. Once `now` is past the recorded proof's
/// publish time plus that bound, the recorded proof is itself too old to be accepted, every earlier one is older
/// still, and the cut-off can no longer move: the tally waits until then. Every other outcome and kind has no cut-off
/// to move. In i128, so no publish time can overflow the bound.
pub fn require_cutoff_final(rule: LateRule, now: i64) -> ProgramResult {
    if !rule.yes_price {
        return Ok(());
    }
    let moves_until = i128::from(rule.publish_time)
        .checked_add(i128::from(PROOF_DELAY_SECONDS))
        .ok_or(BrotError::MathOverflow)?;
    // X0.9 tally_cutoff_final
    if i128::from(now) <= moves_until {
        return Err(BrotError::CutoffNotFinal.into());
    }
    Ok(())
}

fn add(a: u64, b: u64) -> Result<u64, BrotError> {
    a.checked_add(b).ok_or(BrotError::MathOverflow)
}
