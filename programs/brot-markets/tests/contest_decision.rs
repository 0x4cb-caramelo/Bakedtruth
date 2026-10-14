//! Purpose: the admin's decision at stage 2 of a contest on the host (Sprint 14, lane L14B): the reason must fit the
//!          decision, and "decide contest never inverts": no stored outcome and no argument bytes, of all 65,536
//!          pairs, record a YES or NO other than the stored one. The binary runs it in `contest_mollusk_decide.rs`
//!          and tests/brot/contest-decide.test.ts.
//! Version: 0.0.1
//! Sprint: 14 (lane L14B)

use brot_markets::{
    error::BrotError::{self, *},
    instructions::resolution::contest_decision::{decided_outcome, require_reason_fits},
    state::enums::{ContestDecision, Outcome, VoidReason},
};

const REASONS: [VoidReason; 6] = [
    VoidReason::None,
    VoidReason::MissedWindow,
    VoidReason::UnreadableAccount,
    VoidReason::StaleFeed,
    VoidReason::TeamHouseFailure,
    VoidReason::TeamOutsideCause,
];

#[test]
fn contest_decision_reason_fits_the_decision() {
    for reason in REASONS {
        let confirm = require_reason_fits(ContestDecision::Confirm, reason);
        let expected = if reason == VoidReason::None {
            Ok(())
        } else {
            Err(ConfirmWithVoidReason)
        };
        assert_eq!(confirm, expected, "confirm with {reason:?}");
        let team = !matches!(reason, VoidReason::None | VoidReason::UnreadableAccount);
        let void = require_reason_fits(ContestDecision::Void, reason);
        assert_eq!(
            void,
            if team {
                Ok(())
            } else {
                Err(VoidReasonNotForTeam)
            },
            "void with {reason:?}"
        );
    }
}

/// What `admin_decide_contest` records from the raw argument bytes, as the instruction decodes them.
fn decide_bytes(stored: Outcome, decision: u8, reason: u8) -> Result<Outcome, BrotError> {
    let decision = ContestDecision::try_from(decision)?;
    let reason = VoidReason::try_from(reason).map_err(|_| BadInstructionData)?;
    require_reason_fits(decision, reason)?;
    decided_outcome(stored, decision)
}

#[test]
fn decide_contest_never_inverts() {
    let outcomes = [
        Outcome::Unresolved,
        Outcome::Yes,
        Outcome::No,
        Outcome::Void,
    ];
    let mut recorded = 0u32;
    for stored in outcomes {
        for decision in 0..=u8::MAX {
            for reason in 0..=u8::MAX {
                let Ok(outcome) = decide_bytes(stored, decision, reason) else {
                    continue;
                };
                recorded = recorded.checked_add(1).unwrap();
                // The stored outcome stands, or the campaign is voided: never another YES or NO.
                assert!(
                    outcome == stored || outcome == Outcome::Void,
                    "{stored:?} {decision} {reason}"
                );
                if matches!(outcome, Outcome::Yes | Outcome::No) {
                    assert_eq!(outcome, stored);
                }
                assert_ne!(
                    stored,
                    Outcome::Unresolved,
                    "an unresolved campaign has nothing to decide"
                );
            }
        }
    }
    // Each resolved outcome: one confirm (no reason) and four voids (the team's reasons).
    assert_eq!(recorded, 15);
}

#[test]
fn decide_contest_bytes_are_refused_with_their_own_errors() {
    assert_eq!(
        decide_bytes(Outcome::Yes, 2, 0),
        Err(InvalidContestDecision)
    );
    assert_eq!(
        decide_bytes(Outcome::Yes, u8::MAX, 0),
        Err(InvalidContestDecision)
    );
    assert_eq!(decide_bytes(Outcome::Yes, 0, 6), Err(BadInstructionData));
    assert_eq!(decide_bytes(Outcome::Yes, 0, 4), Err(ConfirmWithVoidReason));
    assert_eq!(decide_bytes(Outcome::No, 1, 2), Err(VoidReasonNotForTeam));
    assert_eq!(decide_bytes(Outcome::No, 1, 4), Ok(Outcome::Void));
    assert_eq!(decide_bytes(Outcome::Void, 0, 0), Ok(Outcome::Void));
    assert_eq!(
        decided_outcome(Outcome::Unresolved, ContestDecision::Confirm),
        Err(SnapshotInconsistent)
    );
}
