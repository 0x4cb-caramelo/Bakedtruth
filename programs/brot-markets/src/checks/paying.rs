//! Purpose: `checks::paying_vault`: the checks every paying instruction makes on its vault before any
//!          lamport moves (TP 3.4.17, Sprint 04): the vault belongs to this program, and no recipient in
//!          the instruction is the vault itself.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze)

use pinocchio::{AccountView, Address, ProgramResult};

use super::{distinct, owned_by};

/// The vault is owned by `program_id` (`WrongOwner`), and each recipient is a different account from
/// it (`DuplicateAccount`). Called before the first transfer, by every instruction that pays.
pub fn paying_vault(
    vault: &AccountView,
    program_id: &Address,
    recipients: &[&AccountView],
) -> ProgramResult {
    owned_by(vault, program_id)?;
    for recipient in recipients {
        // X0.9 paying_vault_distinct
        distinct(recipient, vault)?;
    }
    Ok(())
}
