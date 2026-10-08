//! Purpose: the lamport vault of a campaign: SOL arriving from a signer's wallet by System
//!          Program transfer, signed by that wallet (TP section 3.4.4).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); signature frozen at the sprint's opening, body by lane E
//!
//! The vault is a data-less PDA owned by the program, so only the program can debit it, and it
//! does so with plain balance edits between accounts it owns (Sprint 04). Anyone can credit it,
//! which is why no balance in the program is ever read from a vault: the pot is bookkept.

use pinocchio::{AccountView, ProgramResult};
use pinocchio_system::instructions::Transfer;

/// Moves `lamports` from `from` (a wallet that signed, writable) into `vault` (writable) by
/// System Program transfer. Used for the opening payment and for every entry. The caller has
/// already checked both slots and the System Program slot, and bookkeeps the amount itself.
///
/// Zero moves nothing and makes no call, and returns success: a team opening that adds no prize
/// pays nothing (I14), and the System Program would accept a zero transfer anyway, at the cost of
/// a CPI. A caller with a minimum refuses it before calling (the join refuses anything below
/// `min_entry_lamports`), and a caller that bookkeeps zero keeps the vault equal to its books (I1).
/// Neither account may be borrowed during the call (`AccountBorrowFailed`).
pub fn deposit(from: &AccountView, vault: &AccountView, lamports: u64) -> ProgramResult {
    if lamports == 0 {
        return Ok(());
    }
    Transfer {
        from,
        to: vault,
        lamports,
    }
    .invoke()
}
