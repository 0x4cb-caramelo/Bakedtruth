//! Host tests of the settlement rules (lane C): what each entry is paid under each mode, and the reserve
//! path of a credit below rent. Pure functions only; the instructions are tested in LiteSVM at integration.

use brot_markets::{
    error::BrotError,
    instructions::settlement::rules::{
        claimable, entry_payout, plan_credit, Credit, EntryAmounts, PotRule,
    },
    state::enums::{SettleMode, Side},
};

const RENT_MIN: u64 = 890_880;

fn split_rule(winning: Side, winning_total: u64, distributable: u64) -> PotRule {
    PotRule {
        mode: SettleMode::Split,
        winning,
        winning_total,
        distributable,
        one_sided_fee_bps: 100,
    }
}

fn amounts(yes: u64, no: u64, late_yes: u64, late_no: u64) -> EntryAmounts {
    EntryAmounts {
        yes,
        no,
        late_yes,
        late_no,
    }
}

#[test]
fn settle_host_split_winner_is_worked_example_a() {
    // TP 3.4.16 worked example A: V = 6 SOL, distributable 13,618,239,224.
    let rule = split_rule(Side::Yes, 6_000_000_000, 13_618_239_224);
    let ana = entry_payout(&rule, &amounts(4_000_000_000, 0, 0, 0), false).unwrap();
    assert_eq!(ana.amount, 9_078_826_149);
    let bruno = entry_payout(&rule, &amounts(2_000_000_000, 0, 0, 0), false).unwrap();
    assert_eq!(bruno.amount, 4_539_413_074);
    assert_eq!(ana.one_sided_fee, 0);
}

#[test]
fn settle_host_split_loser_gets_only_its_late_part() {
    let rule = split_rule(Side::Yes, 6_000_000_000, 13_618_239_224);
    let loser = entry_payout(&rule, &amounts(0, 400_000_000, 0, 150_000_000), false).unwrap();
    assert_eq!(loser.amount, 150_000_000);
    let nothing = entry_payout(&rule, &amounts(0, 400_000_000, 0, 0), false).unwrap();
    assert_eq!(nothing.amount, 0);
}

#[test]
fn settle_host_split_winner_late_part_comes_back_whole() {
    // 4 SOL on YES, of which 1 SOL joined late: the early 3 SOL share the pot, the late 1 SOL is whole.
    let rule = split_rule(Side::Yes, 6_000_000_000, 13_618_239_224);
    let got = entry_payout(&rule, &amounts(4_000_000_000, 0, 1_000_000_000, 0), false).unwrap();
    let share = 3_000_000_000u128 * 13_618_239_224u128 / 6_000_000_000u128;
    assert_eq!(u128::from(got.amount), share + 1_000_000_000);
}

#[test]
fn settle_host_split_uses_the_winning_side_only() {
    // The baker is on NO and NO loses: the NO early part is not a share, only the late part is paid.
    let rule = split_rule(Side::Yes, 6_000_000_000, 13_618_239_224);
    let got = entry_payout(&rule, &amounts(0, 2_000_000_000, 0, 500_000_000), false).unwrap();
    assert_eq!(got.amount, 500_000_000);
}

#[test]
fn settle_host_refund_returns_every_lamport_late_included() {
    let rule = PotRule {
        mode: SettleMode::Refund,
        winning: Side::Yes,
        winning_total: 0,
        distributable: 0,
        one_sided_fee_bps: 100,
    };
    let got = entry_payout(
        &rule,
        &amounts(1_000_000_000, 2_000_000_000, 500_000_000, 0),
        true,
    )
    .unwrap();
    assert_eq!(got.amount, 3_000_000_000);
    assert_eq!(got.one_sided_fee, 0);
}

#[test]
fn settle_host_one_sided_is_worked_example_c() {
    // Ana (first, exempt), Bruno and Carla on YES at 100 bps: 1, 1.98 and 2.97 SOL back; 0.05 SOL in fees.
    let rule = PotRule {
        mode: SettleMode::OneSided,
        winning: Side::Yes,
        winning_total: 6_000_000_000,
        distributable: 0,
        one_sided_fee_bps: 100,
    };
    let ana = entry_payout(&rule, &amounts(1_000_000_000, 0, 0, 0), true).unwrap();
    assert_eq!((ana.amount, ana.one_sided_fee), (1_000_000_000, 0));
    let bruno = entry_payout(&rule, &amounts(2_000_000_000, 0, 0, 0), false).unwrap();
    assert_eq!(
        (bruno.amount, bruno.one_sided_fee),
        (1_980_000_000, 20_000_000)
    );
    let carla = entry_payout(&rule, &amounts(3_000_000_000, 0, 0, 0), false).unwrap();
    assert_eq!(
        (carla.amount, carla.one_sided_fee),
        (2_970_000_000, 30_000_000)
    );
}

#[test]
fn settle_host_one_sided_late_part_is_whole_and_fee_only_on_early() {
    let rule = PotRule {
        mode: SettleMode::OneSided,
        winning: Side::Yes,
        winning_total: 0,
        distributable: 0,
        one_sided_fee_bps: 100,
    };
    // 2 SOL of which 1 SOL late: the early 1 SOL pays a 1% fee, the late 1 SOL comes back whole.
    let got = entry_payout(&rule, &amounts(2_000_000_000, 0, 1_000_000_000, 0), false).unwrap();
    assert_eq!(got.one_sided_fee, 10_000_000);
    assert_eq!(got.amount, 990_000_000 + 1_000_000_000);
}

#[test]
fn settle_host_unset_mode_and_bad_late_are_refused() {
    let unset = PotRule {
        mode: SettleMode::Unset,
        winning: Side::Yes,
        winning_total: 1,
        distributable: 1,
        one_sided_fee_bps: 0,
    };
    assert_eq!(
        entry_payout(&unset, &amounts(1, 0, 0, 0), false),
        Err(BrotError::BadAccountData)
    );
    // A late part above the side's amount is a corrupt entry.
    let rule = split_rule(Side::Yes, 10, 10);
    assert_eq!(
        entry_payout(&rule, &amounts(5, 0, 6, 0), false),
        Err(BrotError::MathOverflow)
    );
}

#[test]
fn settle_host_credit_below_rent_is_reserved() {
    assert_eq!(plan_credit(0, 100_000, RENT_MIN), Ok(Credit::Reserve));
    assert_eq!(plan_credit(0, RENT_MIN - 1, RENT_MIN), Ok(Credit::Reserve));
    assert_eq!(plan_credit(0, RENT_MIN, RENT_MIN), Ok(Credit::Pay));
    assert_eq!(plan_credit(RENT_MIN, 100_000, RENT_MIN), Ok(Credit::Pay));
    assert_eq!(
        plan_credit(u64::MAX, 1, RENT_MIN),
        Err(BrotError::MathOverflow)
    );
}

#[test]
fn settle_host_reserve_is_claimable_only_once_the_wallet_reaches_rent() {
    assert_eq!(
        claimable(0, 100_000, RENT_MIN),
        Err(BrotError::ReserveNotClaimable)
    );
    assert_eq!(claimable(600_000, 300_000, RENT_MIN), Ok(()));
    assert_eq!(claimable(RENT_MIN, 0, RENT_MIN), Ok(()));
}
