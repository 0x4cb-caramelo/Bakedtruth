//! Purpose: the re-read's two bounds from the Sprint 14 red-team review, on the program's SBF binary in Mollusk:
//!          a late re-read adds no time, since stage 2 counts from stage 1's deadline when the re-read comes after
//!          it (F3); and a proof the caller offers and the reader refuses refuses the re-read with the reader's own
//!          error, while no proof at all, or an error in the campaign's own metric account, still escalates (F4).
//! Version: 0.0.1
//! Sprint: 14 (lane L14B, review fixes). Runs after the SBF build (`BROT_MARKETS_SO`, else
//!         `target/deploy/brot_markets.so`).

#[allow(unused_imports)]
#[path = "checks_support/mollusk.rs"]
mod world;

#[path = "contest_support/mod.rs"]
mod contest;

use brot_markets::{
    constants::CONTEST_STAGE2_SECONDS,
    error::BrotError,
    layout::{LeI64, ZeroCopy},
    state::{
        campaign::Campaign,
        enums::{ContestStage, Direction, Outcome, ReaderKind, Status},
    },
    ID,
};
use contest::*;
use mollusk_svm::program::create_program_account_loader_v3;
use solana_instruction::AccountMeta;
use world::{assert_ok, assert_refused, World};

const DAY: i64 = 24 * HOUR;
const WEEK: i64 = 7 * DAY;

/// A price campaign resolved YES a day before its deadline, contested at stage 1 until `NOW + HOUR`: inside its proof
/// window at `NOW`, so the reader reads the proof slot and nothing else.
fn price_stage_one() -> Vec<u8> {
    contested_data(ContestStage::Stage1, NOW + HOUR, |c| {
        (c.kind, c.direction) = (ReaderKind::PriceTouch as u8, Direction::Above as u8);
        (c.outcome, c.deadline_at) = (Outcome::Yes as u8, LeI64::new(NOW + DAY));
    })
}

#[test]
fn reread_proof_offered_and_refused_by_the_reader_refuses_the_reread() {
    // The default call offers the mint in the proof slot: a foreign account, which the price reader refuses.
    let mut w = World::new();
    let result = reread(&w, price_stage_one(), mint(&w, SUPPLY)).at(&mut w, NOW);
    assert_refused(&result, BrotError::ReaderWrongOwner);
}

#[test]
fn reread_with_no_proof_offered_still_escalates() {
    // The program's own address offers none: the reader cannot decide now, a different reading.
    let mut w = World::new();
    let no_proof = AccountMeta::new_readonly(ID, false);
    let call = reread(&w, price_stage_one(), mint(&w, SUPPLY));
    let call = call.with_slot(3, no_proof, create_program_account_loader_v3(&ID));
    let result = call.at(&mut w, NOW);
    assert_ok(&result);
    let c = Campaign::from_bytes(&stored(&result)).copied_stage();
    assert_eq!(
        c,
        (
            Status::Contested as u8,
            ContestStage::Stage2 as u8,
            NOW + CONTEST_STAGE2_SECONDS
        )
    );
}

#[test]
fn reread_metric_error_still_escalates_and_the_proof_slot_is_not_read() {
    // A supply campaign never reads the proof slot: the mint unreadable before the deadline is the metric's error.
    let mut w = World::new();
    let early = contested_data(ContestStage::Stage1, NOW + HOUR, |c| {
        (c.outcome, c.deadline_at) = (Outcome::Yes as u8, LeI64::new(NOW + DAY));
    });
    let result = reread(&w, early, unreadable()).at(&mut w, NOW);
    assert_ok(&result);
    let c = Campaign::from_bytes(&stored(&result)).copied_stage();
    assert_eq!(c.1, ContestStage::Stage2 as u8);
}

#[test]
fn reread_late_adds_no_time_to_stage_two() {
    // Stage 1 ended a week ago and nobody re-read: a different reading now opens stage 2 that already ended, 48 hours
    // after stage 1's deadline, so only the lapse remains.
    let mut w = World::new();
    let ended = NOW - WEEK;
    let campaign = contested_data(ContestStage::Stage1, ended, |_| {});
    let result = reread(&w, campaign, mint(&w, SUPPLY - 1)).at(&mut w, NOW);
    assert_ok(&result);
    let c = Campaign::from_bytes(&stored(&result)).copied_stage();
    assert_eq!(
        c,
        (
            Status::Contested as u8,
            ContestStage::Stage2 as u8,
            ended + CONTEST_STAGE2_SECONDS
        )
    );
    let lapse = finalize(&w, stored(&result)).at(&mut w, NOW);
    assert_ok(&lapse);
}

/// The status, the stage and its deadline of a campaign read back.
trait Stage {
    fn copied_stage(self) -> (u8, u8, i64);
}

impl Stage for Option<&Campaign> {
    fn copied_stage(self) -> (u8, u8, i64) {
        let c = self.expect("exact length");
        (c.status, c.contest_stage, c.contest_ends_at.get())
    }
}
