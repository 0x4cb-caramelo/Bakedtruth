//! Purpose: every instruction of Sprint 04 that has a stub body refuses with its own error,
//!          `UnknownInstruction`, and reads no account (its body lands in its lane).
//! Version: 0.0.1
//! Sprint: 04 (contract freeze)

use brot_markets::{
    error::BrotError,
    instructions::{resolution, settlement},
};
use pinocchio::{AccountView, Address, ProgramResult};

type Handler = fn(&Address, &mut [AccountView], &[u8]) -> ProgramResult;

#[test]
fn every_stub_refuses_before_reading_an_account() {
    let program = Address::new_from_array([7; 32]);
    let handlers: [Handler; 6] = [
        resolution::team_confirm_result::team_confirm_result,
        resolution::team_void_campaign::team_void_campaign,
        resolution::team_open_contest::team_open_contest,
        settlement::finalize_campaign::finalize_campaign,
        settlement::settle_entry::settle_entry,
        settlement::settle_creator_share::settle_creator_share,
    ];
    for handler in handlers {
        let result = handler(&program, &mut [], &[]);
        assert_eq!(result, Err(BrotError::UnknownInstruction.into()));
    }
}
