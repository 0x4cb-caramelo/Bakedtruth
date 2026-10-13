//! Purpose: the sponsor's `SealedFee` (`["sealed", campaign, sponsor]`) at a sealed entry: its slot
//!          checked; before anything moves, an existing one loaded and matched with the campaign and
//!          the sponsor, or the canonical PDA found, and the totals after this entry worked out with
//!          checked math; then, once the entry has joined the pot, the account created with the
//!          sponsor's rent or topped up, and the fee moved into it from the sponsor.
//! Version: 0.0.1
//! Sprint: 15 (lane L15)
//!
//! The fee is bookkept in `fee_lamports`, never read from the account's lamports (I15). An address
//! funded in advance does not block the creation: `checks::create_pda_account` tops it up, as for an
//! `Entry` or a `Join`, and `settle_sealed_fee` sweeps what was sent by hand to the fee vault.

use pinocchio::{cpi::Seed, error::ProgramError, AccountView, Address, ProgramResult};

use crate::{
    checks,
    constants::SEALED_FEE_SEED,
    error::BrotError,
    instructions::campaigns::open_campaign::payment::Payment,
    layout::ZeroCopy,
    math::invariant::vault_change_matches,
    state::{self, sealed_fee::SealedFee},
    vault,
};

/// The totals a `SealedFee` keeps, as they stand after a sealed entry.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Totals {
    pub fee_lamports: u64,
    pub entry_lamports: u64,
    pub usd_total: u64,
    pub sealed_count: u32,
}

/// What `hold` does, decided before anything moves: create the account at the canonical `bump`
/// (`Some`) or top up the one that exists (`None`); move `fee` in; write `totals`.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Hold {
    pub create: Option<u8>,
    pub fee: u64,
    pub totals: Totals,
}

/// The SealedFee slot: writable, and none of the join's writable slots (`DuplicateAccount`).
pub fn check_slot(sealed_fee: &AccountView, others: &[&AccountView]) -> ProgramResult {
    checks::writable(sealed_fee)?;
    for other in others {
        // X0.9 sealed_fee_distinct
        checks::distinct(sealed_fee, other)?;
    }
    Ok(())
}

/// Before anything moves. An account the program owns is loaded (owner, length, tag, the PDA of this
/// campaign and sponsor at its stored bump) and its stored keys compared; any other address must be
/// the canonical PDA (`PdaMismatch`). The totals after this entry refuse an overflow here.
pub fn prepare(
    sealed_fee: &AccountView,
    campaign: &Address,
    sponsor: &Address,
    payment: &Payment,
    entry_usd: u64,
    program_id: &Address,
) -> Result<Hold, ProgramError> {
    let seeds: [&[u8]; 3] = [SEALED_FEE_SEED, campaign.as_ref(), sponsor.as_ref()];
    let (create, before) = if sealed_fee.owned_by(program_id) {
        let stored = state::load::<SealedFee, 3>(sealed_fee, &seeds, program_id)?;
        require_keys(&stored, campaign, sponsor)?;
        (None, totals_of(&stored))
    } else {
        let bump = checks::canonical_pda(sealed_fee, &seeds, program_id)?;
        (Some(bump), Totals::default())
    };
    let totals = Totals {
        fee_lamports: add(before.fee_lamports, payment.fee)?,
        entry_lamports: add(before.entry_lamports, payment.prize)?,
        usd_total: add(before.usd_total, entry_usd)?,
        sealed_count: before
            .sealed_count
            .checked_add(1)
            .ok_or(BrotError::MathOverflow)?,
    };
    Ok(Hold {
        create,
        fee: payment.fee,
        totals,
    })
}

/// The stored campaign and sponsor are the ones the address was derived from (`SealedFeeMismatch`).
fn require_keys(stored: &SealedFee, campaign: &Address, sponsor: &Address) -> ProgramResult {
    let matches = stored.campaign == *campaign && stored.sponsor == *sponsor;
    // X0.9 sealed_fee_keys
    checks::require(matches, BrotError::SealedFeeMismatch)
}

/// After the entry joined the pot: the account created with the sponsor's rent (or loaded again), its
/// totals written, then the fee moved in by System Program transfer, signed by the sponsor. The
/// account moves by exactly the fee (TP section 3.4.13's assertion, as for the vault).
pub fn hold(
    sponsor: &AccountView,
    sealed_fee: &mut AccountView,
    campaign: &Address,
    plan: &Hold,
    program_id: &Address,
) -> ProgramResult {
    let sponsor_key = *sponsor.address();
    let mut stored = match plan.create {
        Some(bump) => {
            let bump_seed = [bump];
            let signer_seeds = [
                Seed::from(SEALED_FEE_SEED),
                Seed::from(campaign.as_array()),
                Seed::from(sponsor_key.as_array()),
                Seed::from(&bump_seed),
            ];
            checks::create_pda_account(
                sponsor,
                sealed_fee,
                SealedFee::LEN,
                program_id,
                &signer_seeds,
            )?;
            let mut created = state::init::<SealedFee>(sealed_fee)?;
            created.bump = bump;
            created.campaign = *campaign;
            created.sponsor = sponsor_key;
            created
        }
        None => {
            let seeds: [&[u8]; 3] = [SEALED_FEE_SEED, campaign.as_ref(), sponsor_key.as_ref()];
            state::load_mut::<SealedFee, 3>(sealed_fee, &seeds, program_id)?
        }
    };
    stored.fee_lamports.set(plan.totals.fee_lamports);
    stored.entry_lamports.set(plan.totals.entry_lamports);
    stored.usd_total.set(plan.totals.usd_total);
    stored.sealed_count.set(plan.totals.sealed_count);
    drop(stored);
    let before = sealed_fee.lamports();
    vault::deposit(sponsor, sealed_fee, plan.fee)?;
    vault_change_matches(before, sealed_fee.lamports(), plan.fee, 0)?;
    Ok(())
}

fn totals_of(stored: &SealedFee) -> Totals {
    Totals {
        fee_lamports: stored.fee_lamports.get(),
        entry_lamports: stored.entry_lamports.get(),
        usd_total: stored.usd_total.get(),
        sealed_count: stored.sealed_count.get(),
    }
}

fn add(a: u64, b: u64) -> Result<u64, BrotError> {
    a.checked_add(b).ok_or(BrotError::MathOverflow)
}
