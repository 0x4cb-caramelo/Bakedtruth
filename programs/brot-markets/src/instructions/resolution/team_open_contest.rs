//! Purpose: `team_open_contest`: DISABLED until Sprint 14 (decision of 2026-10-09). A contest would freeze a pot
//!          with no exit (its payout is paused until an instruction that does not exist yet), so every call is
//!          refused with `ContestExitDisabled`. The Contested state and its transitions stay in the table
//!          (`state/transitions.rs`) for Sprint 14.
//! Version: 0.0.3
//! Sprint: 04 (lane A; disabled at the closure review). Accounts (the frozen list): 0 team key (signer),
//!         1 config (read), 2 campaign (writable), 3 event authority, 4 program.

use pinocchio::{AccountView, Address, ProgramResult};

use crate::{error::BrotError, instructions::no_args};

/// Refused with `ContestExitDisabled` for every call, whatever the accounts.
pub fn team_open_contest(
    _program_id: &Address,
    _accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    no_args(data)?;
    Err(BrotError::ContestExitDisabled.into())
}
