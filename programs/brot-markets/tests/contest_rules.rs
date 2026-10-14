//! Purpose: the contest's pure rules on the host (Sprint 14, lane L14B): who opens a contest and when, the stage each
//!          act needs, stage 2's deadline, the lapse of either stage, the admin's role, the account a re-read reads
//!          and the offered proof's own errors. The binary runs the same rules in `contest_mollusk_*.rs` and
//!          tests/brot/contest-*.test.ts.
//! Version: 0.0.3 (review fixes F3, the unread stage 1 lapses; F4, an offered proof's error refuses; D2's two rules
//!          are in contest_timelock.rs)
//! Sprint: 14 (lane L14B)

use brot_markets::{
    constants::CONTEST_STAGE2_SECONDS,
    error::BrotError::*,
    instructions::resolution::contest_rules::{
        contest_lapses_at, require_before_deadline, require_contest_admin,
        require_contest_team_key, require_contest_window, require_lapsed, require_metric,
        require_proof_accepted, require_stage, require_tallied,
    },
    layout::ZeroCopy,
    state::{
        config::GlobalConfig,
        enums::{ContestStage, Status},
    },
};
use pinocchio::{error::ProgramError, Address};

const ENDS: i64 = 1_791_230_000;
const STAGE2: i64 = CONTEST_STAGE2_SECONDS;
const STATUSES: [Status; 5] = [
    Status::Open,
    Status::InReview,
    Status::Contested,
    Status::Settling,
    Status::Settled,
];

fn key(n: u8) -> Address {
    Address::new_from_array([n; 32])
}

/// A config whose admin is `key(1)` and whose one team key is `key(2)`.
fn config() -> Vec<u8> {
    let mut bytes = vec![0u8; GlobalConfig::LEN];
    let c = GlobalConfig::from_bytes_mut(&mut bytes).unwrap();
    (c.admin, c.team_len, c.team[0]) = (key(1), 1, key(2));
    bytes
}

#[test]
fn contest_opens_only_by_a_team_key() {
    let bytes = config();
    let c = GlobalConfig::from_bytes(&bytes).unwrap();
    assert_eq!(require_contest_team_key(c, &key(2)), Ok(()));
    // The admin is not a team key unless named, and a stranger never is.
    assert_eq!(require_contest_team_key(c, &key(1)), Err(NotTeamMember));
    assert_eq!(require_contest_team_key(c, &key(3)), Err(NotTeamMember));
}

#[test]
fn contest_opens_only_in_review_inside_the_window() {
    let in_review = Status::InReview as u8;
    assert_eq!(require_contest_window(in_review, ENDS - 1, ENDS), Ok(()));
    assert_eq!(
        require_contest_window(in_review, ENDS, ENDS),
        Err(ContestOutsideReview)
    );
    for status in STATUSES.into_iter().filter(|s| *s != Status::InReview) {
        let refused = require_contest_window(status as u8, ENDS - 1, ENDS);
        assert_eq!(refused, Err(TeamKeyOutsideReview), "{status:?}");
    }
}

#[test]
fn contest_opens_only_once_every_entry_is_tallied() {
    assert_eq!(require_tallied(0), Ok(()));
    assert_eq!(require_tallied(1), Err(NotTallied));
    assert_eq!(require_tallied(u32::MAX), Err(NotTallied));
}

#[test]
fn contest_each_act_needs_its_stage() {
    let contested = Status::Contested as u8;
    let (one, two) = (ContestStage::Stage1, ContestStage::Stage2);
    assert_eq!(require_stage(contested, one as u8, one), Ok(()));
    assert_eq!(require_stage(contested, two as u8, two), Ok(()));
    assert_eq!(
        require_stage(contested, two as u8, one),
        Err(WrongContestStage)
    );
    assert_eq!(
        require_stage(contested, one as u8, two),
        Err(WrongContestStage)
    );
    assert_eq!(
        require_stage(contested, ContestStage::None as u8, one),
        Err(WrongContestStage)
    );
    for status in STATUSES.into_iter().filter(|s| *s != Status::Contested) {
        assert_eq!(
            require_stage(status as u8, one as u8, one),
            Err(NotContested),
            "{status:?}"
        );
    }
    // Bytes no variant has are the stored data's fault.
    assert_eq!(require_stage(9, one as u8, one), Err(BadAccountData));
    assert_eq!(require_stage(contested, 3, one), Err(BadAccountData));
}

#[test]
fn contest_stage_two_decides_before_its_deadline_only() {
    assert_eq!(require_before_deadline(ENDS - 1, ENDS), Ok(()));
    assert_eq!(
        require_before_deadline(ENDS, ENDS),
        Err(ContestDeadlinePassed)
    );
    assert_eq!(
        require_before_deadline(i64::MAX, ENDS),
        Err(ContestDeadlinePassed)
    );
}

#[test]
fn contest_lapse_needs_stage_two_and_its_deadline() {
    let two = ContestStage::Stage2 as u8;
    assert_eq!(require_lapsed(two, ENDS, ENDS), Ok(()));
    assert_eq!(require_lapsed(two, ENDS + 1, ENDS), Ok(()));
    assert_eq!(require_lapsed(two, ENDS - 1, ENDS), Err(ContestNotLapsed));
    // No stage: not a contest that can lapse.
    let none = ContestStage::None as u8;
    assert_eq!(
        require_lapsed(none, ENDS + STAGE2, ENDS),
        Err(CampaignNotInReview)
    );
}

#[test]
fn contest_lapse_of_an_unread_stage_one_comes_48_hours_after_its_deadline() {
    // Review fix F3: with no re-read at all, the stored result stands where the latest stage 2 would end.
    let one = ContestStage::Stage1 as u8;
    assert_eq!(require_lapsed(one, ENDS + STAGE2, ENDS), Ok(()));
    assert_eq!(
        require_lapsed(one, ENDS + STAGE2 - 1, ENDS),
        Err(ContestNotLapsed)
    );
    assert_eq!(require_lapsed(one, ENDS, ENDS), Err(ContestNotLapsed));
    assert_eq!(
        contest_lapses_at(ContestStage::Stage1, ENDS),
        Ok(Some(ENDS + STAGE2))
    );
    assert_eq!(
        contest_lapses_at(ContestStage::Stage2, ENDS),
        Ok(Some(ENDS))
    );
    assert_eq!(contest_lapses_at(ContestStage::None, ENDS), Ok(None));
    assert_eq!(
        contest_lapses_at(ContestStage::Stage1, i64::MAX),
        Err(MathOverflow)
    );
}

#[test]
fn contest_reread_proof_refuses_only_an_offered_proof_the_reader_read() {
    // Review fix F4: the reader's error refuses when it is about the offered proof; otherwise it escalates.
    let error: ProgramError = ReaderWrongOwner.into();
    assert_eq!(
        require_proof_accepted(true, error.clone()),
        Err(error.clone())
    );
    assert_eq!(require_proof_accepted(false, error), Ok(()));
}

#[test]
fn contest_stage_two_is_the_admins_alone() {
    let bytes = config();
    let c = GlobalConfig::from_bytes(&bytes).unwrap();
    assert_eq!(require_contest_admin(c, &key(1)), Ok(()));
    let refused: Result<(), pinocchio::error::ProgramError> = Err(NotAdmin.into());
    assert_eq!(require_contest_admin(c, &key(2)), refused);
    assert_eq!(require_contest_admin(c, &key(3)), refused);
}

#[test]
fn contest_reread_reads_only_the_locked_account() {
    assert_eq!(require_metric(&key(5), &key(5)), Ok(()));
    assert_eq!(require_metric(&key(6), &key(5)), Err(MetricAccountMismatch));
}
