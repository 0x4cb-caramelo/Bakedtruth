//! Purpose: S-8 of the audit scope (the third review) on the host: `require_entry_books`. Every `OneSided` and
//!          `Refund` payout `entry_payout` computes passes, over a grid of rates, early and late parts and the first
//!          baker; one lamport more or less, a lamport moved between the payout and the fee, a fee on the whole entry
//!          or with the exemption the campaign does not record is `OneSidedPayoutNotExact`; a refund above the entry
//!          or with a fee is `RefundPayoutAboveEntry`; `Split` is not these rules'.
//! Version: 0.0.1
//! Sprint: 16 (lane S8)

use brot_markets::{
    error::BrotError,
    instructions::settlement::{
        entry_books::require_entry_books,
        rules::{entry_payout, EntryAmounts, EntryPayout, PotRule},
    },
    state::enums::{SettleMode, Side},
};

const NOT_EXACT: Result<(), BrotError> = Err(BrotError::OneSidedPayoutNotExact);
const ABOVE: Result<(), BrotError> = Err(BrotError::RefundPayoutAboveEntry);

fn add(a: u64, b: u64) -> u64 {
    a.checked_add(b).expect("test values fit a u64")
}

fn sub(a: u64, b: u64) -> u64 {
    a.checked_sub(b).expect("test values stay above zero")
}

fn rule(mode: SettleMode, one_sided_fee_bps: u16) -> PotRule {
    PotRule {
        mode,
        winning: Side::Yes,
        winning_total: 10,
        distributable: 15,
        one_sided_fee_bps,
    }
}

fn entry(early_yes: u64, early_no: u64, late_yes: u64, late_no: u64) -> EntryAmounts {
    EntryAmounts {
        yes: add(early_yes, late_yes),
        no: add(early_no, late_no),
        late_yes,
        late_no,
    }
}

fn paid(amount: u64, one_sided_fee: u64) -> EntryPayout {
    EntryPayout {
        amount,
        one_sided_fee,
    }
}

const EARLY: [(u64, u64); 6] = [
    (0, 0),
    (1, 0),
    (0, 1_000_000),
    (999_999, 1),
    (123_456_789, 987_654_321),
    (4_294_967_295, 7),
];
const LATE: [(u64, u64); 4] = [(0, 0), (17, 0), (0, 5), (1_000_000_000, 3)];

#[test]
fn prefreeze_entry_books_every_one_sided_payout_passes_and_any_other_split_of_it_does_not() {
    let mut checked = 0u32;
    for bps in [0u16, 1, 100, 333, 9_999, 10_000] {
        let rule = rule(SettleMode::OneSided, bps);
        for &(early_yes, early_no) in &EARLY {
            for &(late_yes, late_no) in &LATE {
                for first in [false, true] {
                    let amounts = entry(early_yes, early_no, late_yes, late_no);
                    let p = entry_payout(&rule, &amounts, first).unwrap();
                    let books = |q: EntryPayout| require_entry_books(&rule, &amounts, &q, first);
                    assert_eq!(books(p), Ok(()), "{amounts:?} at {bps} bps");
                    let (amount, fee) = (p.amount, p.one_sided_fee);
                    assert_eq!(books(paid(add(amount, 1), fee)), NOT_EXACT);
                    // A lamport moved from the payout to the fee keeps the sum; the fee is then above the rate's.
                    assert_eq!(books(paid(amount, add(fee, 1))), NOT_EXACT);
                    if amount > 0 {
                        assert_eq!(books(paid(sub(amount, 1), fee)), NOT_EXACT);
                        assert_eq!(books(paid(sub(amount, 1), add(fee, 1))), NOT_EXACT);
                    }
                    if fee > 0 {
                        assert_eq!(books(paid(add(amount, 1), sub(fee, 1))), NOT_EXACT);
                    }
                    checked = checked.checked_add(1).unwrap();
                }
            }
        }
    }
    assert_eq!(checked, 288);
}

#[test]
fn prefreeze_entry_books_one_sided_fee_on_the_whole_entry_or_with_another_exemption_is_refused() {
    let rule = rule(SettleMode::OneSided, 100);
    // Early 15,000 (10,000 YES and 5,000 NO) and 2,000 late: the fee is 1% of the early part, 150.
    let amounts = entry(10_000, 5_000, 1_500, 500);
    let right = entry_payout(&rule, &amounts, false).unwrap();
    assert_eq!(right, paid(16_850, 150));
    assert_eq!(require_entry_books(&rule, &amounts, &right, false), Ok(()));
    // The fee on the whole 17,000, late parts included: 170.
    let whole = paid(16_830, 170);
    assert_eq!(
        require_entry_books(&rule, &amounts, &whole, false),
        NOT_EXACT
    );
    // A payout that read the entry as the first baker's, on an entry the campaign does not record as first.
    let exempt = entry_payout(&rule, &amounts, true).unwrap();
    assert_eq!(exempt, paid(17_000, 0));
    assert_eq!(
        require_entry_books(&rule, &amounts, &exempt, false),
        NOT_EXACT
    );
    // The campaign's first baker charged the fee.
    assert_eq!(
        require_entry_books(&rule, &amounts, &right, true),
        NOT_EXACT
    );
    assert_eq!(require_entry_books(&rule, &amounts, &exempt, true), Ok(()));
    // The ceiling, not the floor: 1% of 15,050 is 150.5, so the fee is 151 and 150 is refused.
    let odd = entry(10_050, 5_000, 0, 0);
    assert_eq!(entry_payout(&rule, &odd, false).unwrap(), paid(14_899, 151));
    assert_eq!(
        require_entry_books(&rule, &odd, &paid(14_900, 150), false),
        NOT_EXACT
    );
}

#[test]
fn prefreeze_entry_books_refund_pays_at_most_the_entry_and_takes_no_fee() {
    let rule = rule(SettleMode::Refund, 100);
    let mut checked = 0u32;
    for &(early_yes, early_no) in &EARLY {
        for &(late_yes, late_no) in &LATE {
            for first in [false, true] {
                let amounts = entry(early_yes, early_no, late_yes, late_no);
                let p = entry_payout(&rule, &amounts, first).unwrap();
                assert_eq!(p, paid(add(amounts.yes, amounts.no), 0));
                let books = |q: EntryPayout| require_entry_books(&rule, &amounts, &q, first);
                assert_eq!(books(p), Ok(()), "{amounts:?}");
                assert_eq!(books(paid(add(p.amount, 1), 0)), ABOVE);
                assert_eq!(books(paid(p.amount, 1)), ABOVE);
                if p.amount > 0 {
                    assert_eq!(books(paid(sub(p.amount, 1), 1)), ABOVE);
                }
                checked = checked.checked_add(1).unwrap();
            }
        }
    }
    assert_eq!(checked, 48);
}

#[test]
fn prefreeze_entry_books_is_the_refund_and_one_sided_rule_only() {
    // `Split` is `require_within_share`'s; `Unset` never reaches a payout (`entry_payout` refuses it).
    for mode in [SettleMode::Split, SettleMode::Unset] {
        let any = paid(1_000, 7);
        let amounts = entry(5, 0, 0, 0);
        assert_eq!(
            require_entry_books(&rule(mode, 100), &amounts, &any, false),
            Ok(())
        );
    }
}
