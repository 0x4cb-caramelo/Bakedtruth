//! Purpose: the founder's answer to D2 (2026-10-13) on the host: stage 1 lasts 24 hours; a matching re-read pays only
//!          from its deadline on (`require_timelock_over`, through `reread_act`, the one place a re-read's comparison
//!          becomes an act) and a different one escalates at once; until that deadline a team key may send the
//!          contest to stage 2 (`require_escalation`). The binary runs the same rules in `contest_mollusk_reread.rs`,
//!          `contest_mollusk_escalate.rs`, tests/brot/contest-reread.test.ts and tests/brot/contest-escalate.test.ts.
//! Version: 0.0.1
//! Sprint: 14 (lane L14B, D2; out of contest_rules.rs and contest_reread.rs, which stay under 200 lines)

use brot_markets::{
    constants::CONTEST_STAGE1_SECONDS,
    error::BrotError::{
        BadAccountData, ContestDeadlinePassed, RereadBeforeTimelock, WrongContestStage,
    },
    instructions::resolution::{
        contest_reread::{reread_act, RereadAct},
        contest_rules::{require_escalation, require_timelock_over},
    },
    state::enums::ContestStage,
};

/// Stage 1's deadline.
const ENDS: i64 = 1_791_230_000;

#[test]
fn contest_stage_one_lasts_24_hours() {
    assert_eq!(CONTEST_STAGE1_SECONDS, 86_400);
}

#[test]
fn contest_matching_reread_waits_for_stage_one_deadline() {
    assert_eq!(require_timelock_over(ENDS, ENDS), Ok(()));
    assert_eq!(require_timelock_over(ENDS + 1, ENDS), Ok(()));
    assert_eq!(
        require_timelock_over(ENDS - 1, ENDS),
        Err(RereadBeforeTimelock)
    );
}

#[test]
fn contest_reread_act_pays_the_same_reading_and_escalates_a_different_one() {
    // The same reading pays from stage 1's deadline on, a different one escalates at once.
    assert_eq!(reread_act(true, ENDS, ENDS), Ok(RereadAct::Pay));
    assert_eq!(reread_act(true, ENDS + 3_600, ENDS), Ok(RereadAct::Pay));
    assert_eq!(reread_act(true, ENDS - 1, ENDS), Err(RereadBeforeTimelock));
    for now in [ENDS - 86_400, ENDS - 1, ENDS, ENDS + 1] {
        assert_eq!(
            reread_act(false, now, ENDS),
            Ok(RereadAct::Escalate),
            "{now}"
        );
    }
}

#[test]
fn contest_escalation_needs_stage_one_before_its_deadline() {
    // A team key sends a contest still at stage 1 to the admin, before stage 1's deadline.
    let (one, two) = (ContestStage::Stage1 as u8, ContestStage::Stage2 as u8);
    assert_eq!(require_escalation(one, ENDS - 1, ENDS), Ok(()));
    assert_eq!(
        require_escalation(one, ENDS, ENDS),
        Err(ContestDeadlinePassed)
    );
    assert_eq!(
        require_escalation(two, ENDS - 1, ENDS),
        Err(WrongContestStage)
    );
    assert_eq!(
        require_escalation(ContestStage::None as u8, ENDS - 1, ENDS),
        Err(WrongContestStage)
    );
    assert_eq!(require_escalation(3, ENDS - 1, ENDS), Err(BadAccountData));
}
