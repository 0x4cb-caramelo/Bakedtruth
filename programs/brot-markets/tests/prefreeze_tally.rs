//! Purpose: O-3 of the audit package (Sprint 16) on the host: `require_cutoff_final`, the tally's wait on a YES price
//!          result. Refused while the recorded proof is at most `PROOF_DELAY_SECONDS` old (to the second), accepted
//!          after; every other outcome or kind at once; no publish time can overflow the bound. The program-level
//!          tests are tests/brot/prefreeze-partial-tally.test.ts.
//! Version: 0.0.1
//! Sprint: 16 (lane L16P, the pre-freeze hardening)

use brot_markets::{
    constants::PROOF_DELAY_SECONDS,
    error::BrotError,
    instructions::{
        entries::join_tally::LateRule, settlement::tally_late_joins::require_cutoff_final,
    },
    state::enums::{Outcome, ReaderKind},
};

const PROOF: i64 = 1_791_216_180;

fn refused() -> pinocchio::ProgramResult {
    Err(BrotError::CutoffNotFinal.into())
}

#[test]
fn prefreeze_tally_waits_until_the_proof_is_over_60_seconds_old() {
    let yes = LateRule::of(Outcome::Yes as u8, ReaderKind::PriceTouch as u8, PROOF);
    assert!(yes.yes_price);
    assert_eq!(require_cutoff_final(yes, PROOF), refused());
    assert_eq!(
        require_cutoff_final(yes, PROOF + PROOF_DELAY_SECONDS),
        refused()
    );
    assert_eq!(
        require_cutoff_final(yes, PROOF + PROOF_DELAY_SECONDS + 1),
        Ok(())
    );
    // A clock behind the proof (Pyth's time may lead the cluster's) waits too.
    assert_eq!(require_cutoff_final(yes, PROOF - 30), refused());
    // A publish time at the edge of i64 cannot overflow the bound: it waits.
    let far = LateRule::of(Outcome::Yes as u8, ReaderKind::PriceTouch as u8, i64::MAX);
    assert_eq!(require_cutoff_final(far, i64::MAX), refused());
}

#[test]
fn prefreeze_tally_of_any_other_result_runs_at_once() {
    for outcome in [Outcome::No, Outcome::Void] {
        let rule = LateRule::of(outcome as u8, ReaderKind::PriceTouch as u8, PROOF);
        assert_eq!(require_cutoff_final(rule, PROOF), Ok(()));
    }
    let supply = LateRule::of(Outcome::Yes as u8, ReaderKind::SupplyAtMost as u8, 0);
    assert_eq!(require_cutoff_final(supply, 0), Ok(()));
}
