//! Purpose: what the referral tests run in Mollusk: `user_link_referrer` built from the crate's own
//!          arguments in the slot order of interface.rs, the accounts of a fresh referee, and the link
//!          read back from a result.
//! Version: 0.0.1
//! Sprint: 14 (referral), lane L14A
//!
//! Each test crate that includes this module also includes `checks_support/mollusk.rs` as `world`.

// Shared by two test crates, each of which uses part of it.
#![allow(dead_code)]

use brot_markets::{
    constants::{EVENT_AUTHORITY, REFERRAL_SEED},
    instructions::{ix, referral::link_referrer::LinkReferrerArgs},
    layout::ZeroCopy,
    state::referral::ReferralLink,
    ID,
};
use mollusk_svm::{
    program::{create_program_account_loader_v3, keyed_account_for_system_program},
    result::InstructionResult,
};
use solana_account::Account;
use solana_instruction::{AccountMeta, Instruction};
use solana_pubkey::Pubkey;

use crate::world::{after, key, Accounts, World, SOL, SYSTEM};

/// What a referee holds before it pays the link's rent.
pub const REFEREE_FUNDS: u64 = 10 * SOL;
/// The cluster's clock in these tests: a Unix time and a slot the link must record.
pub const NOW: i64 = 1_791_216_180;
pub const SLOT: u64 = 412_345_678;

pub const REFEREE: Pubkey = key(0x51);
pub const REFERRER: Pubkey = key(0x52);

/// The referee's link: `["referral", referee]` at its canonical bump.
pub fn link_of(referee: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[REFERRAL_SEED, referee.as_ref()], &ID)
}

/// A world whose clock reads `NOW` and `SLOT`.
pub fn world_at_now() -> World {
    let mut world = World::new();
    let clock = &mut world.mollusk.sysvars.clock;
    clock.unix_timestamp = NOW;
    clock.slot = SLOT;
    world
}

/// `user_link_referrer(referrer)` signed by `referee`, its link at the canonical PDA.
pub fn link_ix(referee: &Pubkey, referrer: &Pubkey) -> Instruction {
    let args = LinkReferrerArgs {
        referrer: *referrer,
    };
    link_ix_with_data(referee, args.as_bytes())
}

/// The same slots with `args` as the arguments, whatever their length.
pub fn link_ix_with_data(referee: &Pubkey, args: &[u8]) -> Instruction {
    let mut data = vec![ix::USER_LINK_REFERRER];
    data.extend_from_slice(args);
    Instruction {
        program_id: ID,
        accounts: vec![
            AccountMeta::new(*referee, true),
            AccountMeta::new(link_of(referee).0, false),
            AccountMeta::new_readonly(SYSTEM, false),
            AccountMeta::new_readonly(EVENT_AUTHORITY, false),
            AccountMeta::new_readonly(ID, false),
        ],
        data,
    }
}

/// The accounts of `link_ix` for a referee holding `REFEREE_FUNDS`, with nothing at its link yet.
pub fn link_accounts(referee: &Pubkey) -> Accounts {
    vec![
        (*referee, Account::new(REFEREE_FUNDS, 0, &SYSTEM)),
        (link_of(referee).0, Account::default()),
        keyed_account_for_system_program(),
        (EVENT_AUTHORITY, Account::default()),
        (ID, create_program_account_loader_v3(&ID)),
    ]
}

/// The link's bytes after `result`, which must hold a 96-byte account the program owns.
pub fn link_after(result: &InstructionResult, referee: &Pubkey) -> Vec<u8> {
    let account = after(result, &link_of(referee).0);
    assert_eq!(account.owner, ID, "the link belongs to the program");
    assert_eq!(account.data.len(), ReferralLink::LEN);
    account.data.clone()
}

/// The referee's lamports after `result`.
pub fn referee_lamports(result: &InstructionResult, referee: &Pubkey) -> u64 {
    after(result, referee).lamports
}

/// The link's address still holds a plain System account with no data: nothing was created.
pub fn assert_no_link(result: &InstructionResult, referee: &Pubkey) {
    let account = after(result, &link_of(referee).0);
    assert_eq!((account.owner, account.data.len()), (SYSTEM, 0));
}
