//! Purpose: `checks::top_level`, the guard that keeps `resolve_campaign` and `reread_campaign` out of
//!          other programs' CPIs (TP section 3.4.17): the instruction must run at the transaction's top
//!          level. Each caller names its own error.
//! Version: 0.0.4 (the error is the caller's: `ResolveNotTopLevel`, `RereadNotTopLevel`)
//! Sprint: 03 (readers and resolution); the frozen program's guard, kept; Sprint 14 (lane L14B) passes the
//!         error, so the contest's re-read refuses with its own
//!
//! Called from inside another program, a resolution could be wrapped by logic the transaction's
//! instruction list does not show (pred-provable's reason, `resolve.rs`). On a host build there is
//! no stack, so the check passes; the refusal is tested through a CPI in LiteSVM.

use pinocchio::ProgramResult;

use super::require;
use crate::{constants::TRANSACTION_LEVEL_STACK_HEIGHT, error::BrotError};

/// The current instruction runs at the transaction's top level (`error` otherwise: the caller's own).
pub fn top_level(error: BrotError) -> ProgramResult {
    // X0.9 top_level
    require(stack_height() == TRANSACTION_LEVEL_STACK_HEIGHT, error)
}

#[cfg(target_os = "solana")]
fn stack_height() -> u64 {
    // SAFETY: the syscall takes no argument and only returns the runtime's invoke depth.
    unsafe { pinocchio::syscalls::sol_get_stack_height() }
}

#[cfg(not(target_os = "solana"))]
fn stack_height() -> u64 {
    TRANSACTION_LEVEL_STACK_HEIGHT
}
