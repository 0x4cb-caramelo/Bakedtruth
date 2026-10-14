//! Purpose: R1 of the second pre-freeze review (Sprint 16, S-5) on the host: `require_within_share`. Every `Split`
//!          payout `entry_payout` computes (the floor of the exact share, plus the late parts) passes, over a grid of
//!          winning totals, distributable amounts, early parts and late parts on both sides; one lamport more is
//!          `EntryPayoutAboveShare`; a payout below its own late parts is `InvariantViolated`; other modes are not
//!          this check's.
//! Version: 0.0.1
//! Sprint: 16 (lane L16P, the second review's follow-ups)

use brot_markets::{
    error::BrotError,
    instructions::settlement::rules::{
        entry_payout, require_within_share, EntryAmounts, EntryPayout, PotRule,
    },
    state::enums::{SettleMode, Side},
};

const ABOVE: Result<(), BrotError> = Err(BrotError::EntryPayoutAboveShare);

fn add(a: u64, b: u64) -> u64 {
    a.checked_add(b).expect("test values fit a u64")
}

fn split(winning: Side, winning_total: u64, distributable: u64) -> PotRule {
    PotRule {
        mode: SettleMode::Split,
        winning,
        winning_total,
        distributable,
        one_sided_fee_bps: 100,
    }
}

/// The entry with `early` on the winning side (YES), `late_yes` and `late_no` late, and 3 on the losing side.
fn entry(early: u64, late_yes: u64, late_no: u64) -> EntryAmounts {
    EntryAmounts {
        yes: add(early, late_yes),
        no: add(3, late_no),
        late_yes,
        late_no,
    }
}

#[test]
fn prefreeze_entry_share_every_payout_the_program_computes_passes_and_one_lamport_more_does_not() {
    let totals = [1u64, 7, 1_000_000_007, 2_000_000_003, 9_007_199_254_740_993];
    let mut checked = 0u32;
    for &v in &totals {
        for extra in [0u64, 1, 13, 999_999_937, v] {
            let d = add(v, extra);
            for early in [1u64, v / 3, v / 2, v.saturating_sub(1), v] {
                if early == 0 || early > v {
                    continue;
                }
                for (late_yes, late_no) in [(0u64, 0u64), (17, 0), (0, 5), (1_000_000_000, 7)] {
                    let rule = split(Side::Yes, v, d);
                    let amounts = entry(early, late_yes, late_no);
                    let paid = entry_payout(&rule, &amounts, false).unwrap();
                    assert_eq!(require_within_share(&rule, &amounts, &paid), Ok(()));
                    let more = EntryPayout {
                        amount: add(paid.amount, 1),
                        one_sided_fee: 0,
                    };
                    assert_eq!(require_within_share(&rule, &amounts, &more), ABOVE);
                    checked = checked.checked_add(1).unwrap();
                }
            }
        }
    }
    assert!(checked > 400, "the grid checked {checked} payouts");
}

#[test]
fn prefreeze_entry_share_counts_the_winning_side_and_refunds_late_parts_whole() {
    // NO won: the early NO part is the share's base; the YES side, early or late, is a loser's or a refund.
    let rule = split(Side::No, 10, 15);
    let amounts = EntryAmounts {
        yes: 8,
        no: 4,
        late_yes: 2,
        late_no: 0,
    };
    // floor(4 × 15 ÷ 10) = 6, plus the 2 late lamports.
    assert_eq!(entry_payout(&rule, &amounts, false).unwrap().amount, 8);
    let pays = |amount| {
        require_within_share(
            &rule,
            &amounts,
            &EntryPayout {
                amount,
                one_sided_fee: 0,
            },
        )
    };
    assert_eq!(pays(8), Ok(()));
    assert_eq!(pays(9), ABOVE);
    // A payout below its own late parts is not a share at all.
    assert_eq!(pays(1), Err(BrotError::InvariantViolated));
}

#[test]
fn prefreeze_entry_share_is_the_split_rule_only() {
    for mode in [SettleMode::OneSided, SettleMode::Refund] {
        let rule = PotRule {
            mode,
            ..split(Side::Yes, 10, 15)
        };
        let any = EntryPayout {
            amount: 1_000,
            one_sided_fee: 0,
        };
        assert_eq!(require_within_share(&rule, &entry(5, 0, 0), &any), Ok(()));
    }
}
