//! Purpose: the late-entry split (question 7: the joins at or after the YES proof's publish time) and
//!          the in-program vault assertion (TP 3.4.13), with their refusals. Hand-sent lamports are the
//!          case the assertion must not refuse: they are in the vault before the instruction.
//! Version: 0.0.1
//! Sprint: 04 (contract freeze, lanes B and G)

use brot_markets::{
    error::BrotError,
    math::{
        invariant::vault_change_matches,
        refund::{split_late, Join},
    },
};

fn join(joined_at: i64, amount: u64) -> Join {
    Join { joined_at, amount }
}

#[test]
fn a_join_at_the_publish_time_is_late() {
    // The boundary is inclusive: a join at `publish_time` is refunded (question 7).
    let joins = [join(99, 10), join(100, 20), join(101, 40)];
    assert_eq!(split_late(&joins, 100), Ok((10, 60)));
}

#[test]
fn every_lamport_lands_once_early_or_late() {
    let joins = [join(1, 7), join(50, 3), join(200, 11), join(300, 13)];
    let total: u64 = joins.iter().map(|j| j.amount).sum();
    for publish in [0, 1, 50, 51, 300, 301] {
        let (early, late) = split_late(&joins, publish).expect("small sums never overflow");
        assert_eq!(early + late, total, "publish {publish}");
    }
}

#[test]
fn no_join_is_late_before_all_of_them() {
    let joins = [join(10, 5), join(20, 6)];
    assert_eq!(split_late(&joins, 0), Ok((0, 11)));
    assert_eq!(split_late(&joins, 1_000), Ok((11, 0)));
}

#[test]
fn an_overflowing_sum_is_refused_not_wrapped() {
    let joins = [join(1, u64::MAX), join(2, 1)];
    assert_eq!(split_late(&joins, 0), Err(BrotError::MathOverflow));
}

#[test]
fn the_vault_moves_by_exactly_what_is_booked() {
    assert_eq!(vault_change_matches(1_000, 1_500, 500, 0), Ok(()));
    assert_eq!(vault_change_matches(1_000, 700, 0, 300), Ok(()));
}

#[test]
fn an_unexplained_lamport_in_the_vault_is_refused() {
    // One lamport more than the bookkeeping explains.
    assert_eq!(
        vault_change_matches(1_000, 1_501, 500, 0),
        Err(BrotError::InvariantViolated)
    );
    assert_eq!(
        vault_change_matches(1_000, 1_499, 500, 0),
        Err(BrotError::InvariantViolated)
    );
}

#[test]
fn a_hand_sent_lamport_before_the_instruction_changes_nothing() {
    // The 1,000 lamports sent by hand are in `vault_before`; the join moves 500 in and is accepted.
    let before = 1_000 + 1_000;
    assert_eq!(vault_change_matches(before, before + 500, 500, 0), Ok(()));
}
