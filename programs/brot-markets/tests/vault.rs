//! Purpose: pins what `vault::deposit` does with zero (nothing moves, no System Program call,
//!          success) and that any other amount reaches the transfer, which refuses a borrowed
//!          account before the call. The transfer itself runs in tests/brot/join-campaign-*.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio), lane E

use brot_markets::vault::deposit;
use pinocchio::{account::RuntimeAccount, error::ProgramError, AccountView};

/// A writable, data-less account as the runtime lays it out; `borrowed` marks its data mutably
/// borrowed, which `pinocchio-system`'s `Transfer` refuses before it calls the System Program.
fn runtime_account(borrowed: bool) -> RuntimeAccount {
    RuntimeAccount {
        borrow_state: if borrowed { 0 } else { u8::MAX },
        is_writable: 1,
        lamports: 1_000_000_000,
        ..RuntimeAccount::default()
    }
}

#[test]
fn a_zero_deposit_makes_no_call_and_any_other_amount_does() {
    let mut wallet = runtime_account(false);
    let mut vault = runtime_account(true);
    // SAFETY: both accounts outlive the views, hold no data (nothing follows them), and are
    // only read through the views.
    let (from, to) = unsafe {
        (
            AccountView::new_unchecked(&mut wallet),
            AccountView::new_unchecked(&mut vault),
        )
    };
    assert_eq!(deposit(&from, &to, 0), Ok(()));
    assert_eq!(
        deposit(&from, &to, 1),
        Err(ProgramError::AccountBorrowFailed)
    );
    assert_eq!(
        deposit(&to, &from, 10_000_000),
        Err(ProgramError::AccountBorrowFailed)
    );
}
