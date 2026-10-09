//! Purpose: `checks::close_account`: closes one account the program owns. Its data is zeroed, its lamports
//!          must already have left (`AccountNotEmpty`), and then the crate's `close` gives the account to
//!          the System Program. A revived account (funded again in the same transaction) is then owned by
//!          the System Program and fails `owned_by` and every tag check (TP 3.4.17).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze). The helper calls the crate's own `close`, which is safe: it refuses while
//!         the data is borrowed and zeroes the length, the lamports and the owner (the System Program is
//!         the all-zero address), so this module writes no `unsafe` code.

use pinocchio::{AccountView, Address, ProgramResult};

use super::{owned_by, require};
use crate::error::BrotError;

/// Zeroes the data, then closes the account. Refuses, with nothing changed, when the account is not
/// owned by `program_id` or still holds lamports.
pub fn close_account(account: &mut AccountView, program_id: &Address) -> ProgramResult {
    owned_by(account, program_id)?;
    // X0.9 close_account_lamports
    require(account.lamports() == 0, BrotError::AccountNotEmpty)?;
    account.try_borrow_mut()?.fill(0);
    account.close()
}
