//! Purpose: the epoch kinds' shared rules on the host: the first slot of an epoch against
//!          `solana-epoch-schedule` itself (the copy Mollusk carries) under warmup and normal
//!          schedules, the sysvar's bytes, row 5's epoch rule at its edges, and the join lock of
//!          both kinds, which reads nothing.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution), lane B

mod epoch_support;

use brot_markets::{
    error::BrotError::*,
    readers::{
        epoch::{check_epoch_for_opening, set_host_schedule, EpochSchedule, EPOCH_SCHEDULE_LEN},
        ChainTime, CreationContext,
    },
    state::enums::{Direction, ReaderKind},
};
use epoch_support::*;
use mollusk_svm::sysvar::Sysvars;
use pinocchio::error::ProgramError;

/// The reference (`solana_epoch_schedule::EpochSchedule` in Mollusk's sysvars) and ours, for
/// `slots` an epoch, with the warmup fields `EpochSchedule::custom` derives.
fn schedules(slots: u64, warmup: bool) -> (Sysvars, EpochSchedule) {
    let (first_normal_epoch, first_normal_slot) = if warmup {
        let next = slots.next_power_of_two();
        let log2 = next.trailing_zeros().checked_sub(5).unwrap();
        (u64::from(log2), next.checked_sub(32).unwrap())
    } else {
        (0, 0)
    };
    let ours = EpochSchedule {
        slots_per_epoch: slots,
        leader_schedule_slot_offset: slots,
        warmup,
        first_normal_epoch,
        first_normal_slot,
    };
    let mut sysvars = Sysvars::default();
    let reference = &mut sysvars.epoch_schedule;
    reference.slots_per_epoch = slots;
    reference.leader_schedule_slot_offset = slots;
    reference.warmup = warmup;
    reference.first_normal_epoch = first_normal_epoch;
    reference.first_normal_slot = first_normal_slot;
    (sysvars, ours)
}

/// Row 5's epoch rule for a campaign measuring `epoch` with `deadline`, opened at `time`.
fn rule(epoch: u64, deadline: i64, time: ChainTime) -> Result<(), ProgramError> {
    let mut metric = jito(|_| {});
    let view = metric.view();
    check_epoch_for_opening(&CreationContext {
        metric: &view,
        feed_id: &[0; 32],
        direction: Direction::Above,
        target: 1,
        max_age: 0,
        epoch,
        deadline_at: deadline,
        time,
        curve_config: None,
    })
}

#[test]
fn first_slot_matches_solana_epoch_schedule_and_the_sysvar_bytes_decode() {
    let shapes = [
        (32, true),
        (33, true),
        (100, true),
        (8_192, true),
        (432_000, true),
    ];
    for (slots, warmup) in shapes.into_iter().chain([(432_000, false), (8_192, false)]) {
        let (sysvars, ours) = schedules(slots, warmup);
        let reference = &sysvars.epoch_schedule;
        for epoch in (0..=3_000).chain([1_047, 1_048, 100_000, 1_000_000]) {
            let first = ours.first_slot(epoch).unwrap();
            let case = format!("{slots} slots, warmup {warmup}, epoch {epoch}");
            assert_eq!(first, reference.get_first_slot_in_epoch(epoch), "{case}");
            assert_eq!(reference.get_epoch(first), epoch, "{case}");
        }
        let (_, account) = sysvars.keyed_account_for_epoch_schedule_sysvar();
        let bytes: [u8; EPOCH_SCHEDULE_LEN] = account.data.as_slice().try_into().unwrap();
        assert_eq!(EpochSchedule::from_bytes(&bytes), Ok(ours));
    }
    assert_eq!(schedules(432_000, false).1, EpochSchedule::MAINNET);
}

#[test]
fn the_schedule_refuses_a_bad_flag_and_overflows_without_saturating() {
    let (sysvars, _) = schedules(432_000, false);
    let (_, account) = sysvars.keyed_account_for_epoch_schedule_sysvar();
    let mut bytes: [u8; EPOCH_SCHEDULE_LEN] = account.data.as_slice().try_into().unwrap();
    bytes[16] = 2;
    assert_eq!(EpochSchedule::from_bytes(&bytes), Err(ReaderBadLayout));
    assert_eq!(
        EpochSchedule::MAINNET.first_slot(u64::MAX),
        Err(MathOverflow)
    );
    let endless_warmup = EpochSchedule {
        first_normal_epoch: u64::MAX,
        ..EpochSchedule::MAINNET
    };
    assert_eq!(endless_warmup.first_slot(64), Err(MathOverflow));
    assert_eq!(endless_warmup.first_slot(u64::MAX), Err(MathOverflow));
    assert_eq!(
        rule(u64::MAX, at(90 * DAY), clock(1_047, NOW)),
        refused(MathOverflow)
    );
}

#[test]
fn the_measured_epoch_must_be_ahead_of_the_clock() {
    let now = clock(1_047, NOW);
    for epoch in [0, 1_046, 1_047] {
        assert_eq!(
            rule(epoch, at(90 * DAY), now),
            refused(EpochAlreadyStarted),
            "{epoch}"
        );
    }
    // A clock whose slot the schedule already puts in the measured epoch (no cluster writes one).
    for into in [432_000, 432_001] {
        let ahead = clock_at(1_047, into, NOW);
        assert_eq!(
            rule(1_048, at(90 * DAY), ahead),
            refused(EpochAlreadyStarted),
            "{into}"
        );
    }
}

#[test]
fn the_slow_estimate_may_land_on_the_deadline_but_not_one_second_after_it() {
    // 100,000 slots into epoch 1,047: 332,000 slots to the next epoch, 166,000 s at 500 ms.
    let now = clock(1_047, NOW);
    assert_eq!(rule(1_048, at(166_000), now), Ok(()));
    assert_eq!(rule(1_048, at(165_999), now), refused(EpochAfterDeadline));
    assert_eq!(rule(1_049, at(382_000), now), Ok(()));
    assert_eq!(rule(1_049, at(381_999), now), refused(EpochAfterDeadline));
    // Three slots are 1.5 s, rounded down as the rule is written.
    let close = clock_at(1_047, 431_997, NOW);
    assert_eq!(rule(1_048, at(1), close), Ok(()));
    assert_eq!(rule(1_048, NOW, close), refused(EpochAfterDeadline));
}

#[test]
fn a_warmup_schedule_set_on_the_host_moves_the_start() {
    let (_, warmup) = schedules(8_192, true);
    assert_eq!(
        (warmup.first_normal_epoch, warmup.first_normal_slot),
        (8, 8_160)
    );
    set_host_schedule(Some(warmup));
    // Slot 100 is in epoch 2 (96 to 223): epoch 3 starts at 224, epoch 9 at 8,160 + 8,192.
    let now = ChainTime {
        unix_timestamp: NOW,
        slot: 100,
        epoch: 2,
    };
    assert_eq!(rule(3, at(62), now), Ok(()));
    assert_eq!(rule(3, at(61), now), refused(EpochAfterDeadline));
    assert_eq!(rule(9, at(8_126), now), Ok(()));
    assert_eq!(rule(9, at(8_125), now), refused(EpochAfterDeadline));
    // Back to mainnet's: epoch 3 starts at slot 1,296,000.
    set_host_schedule(None);
    assert_eq!(rule(3, at(647_950), now), Ok(()));
    assert_eq!(rule(3, at(647_949), now), refused(EpochAfterDeadline));
}

#[test]
fn the_join_lock_is_the_epoch_start_and_reads_nothing() {
    for kind in [ReaderKind::StakePoolTvlAtLeast, ReaderKind::StakeAtLeast] {
        let c = campaign(kind, &JITOSOL_POOL, 1, 1_048, at(7 * DAY));
        // An account no reader accepts: the lock never looks at it.
        let mut nothing = HostAccount::new(JITOSOL_POOL, SYSTEM_PROGRAM, &[]);
        let mut lock = |epoch, unix| knowable(&mut nothing, &c, clock(epoch, unix));
        assert_eq!(lock(1_047, NOW), Ok(false), "{kind:?} before the epoch");
        assert_eq!(
            lock(1_047, at(8 * DAY)),
            Ok(false),
            "{kind:?} past the deadline"
        );
        assert_eq!(lock(1_048, NOW), Ok(true), "{kind:?} in the epoch");
        assert_eq!(lock(1_049, NOW), Ok(true), "{kind:?} after it");
    }
}
