//! Purpose: `user_link_referrer(referrer)`: a referee names the wallet that referred it, once, in a
//!          `ReferralLink` (`["referral", referee]`) it signs and pays the rent of. No instruction
//!          changes or closes the link, so the indexer can trust its times (TP section 3.4.11).
//! Version: 0.1.0
//! Sprint: 14 (scaffold of Sprints 14–15, 2026-10-13; the body by lane L14A). Accounts: 0 referee
//!         (writable, signer; pays the rent), 1 referral link (writable; PDA ["referral", referee],
//!         created), 2 System Program, 3 event authority, 4 program. Arguments: `referrer`, 32 bytes.
//!
//! Order, as `checks.rs` orders it: the arguments, the slots, the System Program and the event
//! slots; the link's address, which is derived from the signer, so no wallet can name another
//! wallet's link; the referrer's rule (`rules.rs`); then the creation, the fields and the event.
//! The link is created by `checks::create_pda_account`, as the `Entry` and the `Join` are: an
//! address funded in advance is topped up, and an address that already holds a link is refused
//! (`AlreadyInitialized`), so a link is written once. The config is not read: linking is never
//! paused (I10′). "Before the first entry" is not checked here: the indexer compares
//! `linked_slot` and `linked_at` with the referee's first entry, both on-chain (TP 3.4.11).

use pinocchio::{cpi::Seed, error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use super::rules::require_referrer;
use crate::{
    checks,
    constants::REFERRAL_SEED,
    events::{self, ReferralLinked},
    instructions::args,
    layout::{LeI64, LeU64, Pubkey, ZeroCopy},
    readers::ChainTime,
    state::{self, referral::ReferralLink},
    zero_copy,
};

#[derive(ShankType)]
#[repr(C)]
pub struct LinkReferrerArgs {
    /// The wallet that referred the signer: never the zero address, never the signer itself.
    pub referrer: Pubkey,
}

zero_copy!(LinkReferrerArgs = 32);

pub fn user_link_referrer(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<LinkReferrerArgs>(data)?;
    let [referee, referral_link, system_program, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };

    checks::signer(referee)?;
    checks::writable(referee)?;
    checks::writable(referral_link)?;
    checks::system_program(system_program)?;
    checks::event_accounts(event_authority, program, program_id)?;

    let referee_key = *referee.address();
    let referrer = args.referrer;
    let seeds: [&[u8]; 2] = [REFERRAL_SEED, referee_key.as_ref()];
    let bump = checks::canonical_pda(referral_link, &seeds, program_id)?;
    require_referrer(&referrer, &referee_key)?;

    // Effects: the link, with the referee's rent, and the time and slot the indexer compares.
    let time = ChainTime::now()?;
    let bump_seed = [bump];
    let signer_seeds = [
        Seed::from(REFERRAL_SEED),
        Seed::from(referee_key.as_array()),
        Seed::from(&bump_seed),
    ];
    checks::create_pda_account(
        referee,
        referral_link,
        ReferralLink::LEN,
        program_id,
        &signer_seeds,
    )?;
    let mut link = state::init::<ReferralLink>(referral_link)?;
    link.bump = bump;
    link.referee = referee_key;
    link.referrer = referrer;
    link.linked_at.set(time.unix_timestamp);
    link.linked_slot.set(time.slot);
    drop(link);

    let event = ReferralLinked {
        referee: referee_key,
        referrer,
        linked_at: LeI64::new(time.unix_timestamp),
        linked_slot: LeU64::new(time.slot),
    };
    events::emit(&event, event_authority, program, program_id)
}
