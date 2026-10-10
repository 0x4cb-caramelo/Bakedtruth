//! Purpose: lane D's pure money rules on the host: what `collect_fee` moves to the fee vault and what
//!          `settle_prize` returns, worked out from a stored campaign (TP 3.4.16, P-4). Each case is
//!          one settlement mode or void class; the one-sided case refuses until lane C's total exists.
//! Version: 0.0.1
//! Sprint: 04 (lane D)

use brot_markets::{
    error::BrotError::{self, *},
    instructions::settlement::collect_fee::amount::{kept, prize_return, Kept, PrizeReturn},
    layout::{LeU64, ZeroCopy},
    state::{campaign::Campaign, enums::*},
};
use pinocchio::Address;

const PRIZE: u64 = 900_000;
const OPENING: u64 = 100_000;
const BAKER: Address = Address::new_from_array([3; 32]);

/// A finalized campaign with a prize and an opening fee, its first baker set, and every other byte zero.
fn campaign(mode: SettleMode) -> Vec<u8> {
    let mut bytes = vec![0u8; Campaign::LEN];
    let c = Campaign::from_bytes_mut(&mut bytes).unwrap();
    c.status = Status::Settling as u8;
    c.settle_mode = mode as u8;
    c.prize_lamports = LeU64::new(PRIZE);
    c.opening_fee_lamports = LeU64::new(OPENING);
    c.first_baker = BAKER;
    bytes
}

/// Runs `f` on the campaign in `bytes`, after `edit` sets its fields.
fn with<T>(
    bytes: &mut [u8],
    edit: impl FnOnce(&mut Campaign),
    f: impl FnOnce(&Campaign) -> T,
) -> T {
    let c = Campaign::from_bytes_mut(bytes).unwrap();
    edit(c);
    f(c)
}

fn kept_of(mode: SettleMode, edit: impl FnOnce(&mut Campaign)) -> Result<Kept, BrotError> {
    let mut bytes = campaign(mode);
    with(&mut bytes, edit, kept)
}

fn prize_of(mode: SettleMode, edit: impl FnOnce(&mut Campaign)) -> Result<PrizeReturn, BrotError> {
    let mut bytes = campaign(mode);
    with(&mut bytes, edit, prize_return)
}

#[test]
fn settle_d_split_keeps_the_fee_net_of_the_creator_share_and_the_opening_fee() {
    let split = |c: &mut Campaign| {
        c.fee_total = LeU64::new(5_000);
        c.creator_share_from_fee = LeU64::new(1_200);
    };
    let got = kept_of(SettleMode::Split, split).unwrap();
    assert_eq!(
        got,
        Kept {
            amount: 3_800 + OPENING,
            opening: OPENING
        }
    );
    let prize = prize_of(SettleMode::Split, split).unwrap();
    assert_eq!(
        prize,
        PrizeReturn {
            prize: 0,
            opening: 0
        }
    );
}

#[test]
fn settle_d_split_refuses_a_creator_share_larger_than_the_fee() {
    let bad = |c: &mut Campaign| {
        c.fee_total = LeU64::new(10);
        c.creator_share_from_fee = LeU64::new(11);
    };
    assert_eq!(kept_of(SettleMode::Split, bad), Err(MathOverflow));
}

#[test]
fn settle_d_one_sided_keeps_the_recorded_fees_and_the_opening_fee() {
    let kept = kept_of(SettleMode::OneSided, |c| {
        c.one_sided_fees = LeU64::new(7);
        c.opening_fee_lamports = LeU64::new(5);
    });
    assert_eq!(kept.map(|k| k.amount), Ok(12));
    // The prize still goes back to the opener in a one-sided pot: the opening fee is kept, the prize returns.
    let prize = prize_of(SettleMode::OneSided, |_| {}).unwrap();
    assert_eq!(
        prize,
        PrizeReturn {
            prize: PRIZE,
            opening: 0
        }
    );
}

#[test]
fn settle_d_an_outside_cause_void_keeps_the_opening_fee() {
    let outside = |c: &mut Campaign| c.void_reason = VoidReason::StaleFeed as u8;
    assert_eq!(
        kept_of(SettleMode::Refund, outside),
        Ok(Kept {
            amount: OPENING,
            opening: OPENING
        })
    );
    let prize = prize_of(SettleMode::Refund, outside).unwrap();
    assert_eq!(
        prize,
        PrizeReturn {
            prize: PRIZE,
            opening: 0
        }
    );
}

#[test]
fn settle_d_a_house_failure_void_returns_the_opening_fee_to_the_opener() {
    let house = |c: &mut Campaign| c.void_reason = VoidReason::MissedWindow as u8;
    assert_eq!(
        kept_of(SettleMode::Refund, house),
        Ok(Kept {
            amount: 0,
            opening: 0
        })
    );
    let prize = prize_of(SettleMode::Refund, house).unwrap();
    assert_eq!(
        prize,
        PrizeReturn {
            prize: PRIZE,
            opening: OPENING
        }
    );
}

#[test]
fn settle_d_a_pot_with_no_entry_keeps_the_opening_fee_whatever_the_void() {
    // No first baker: the snapshot's no-entry rule, even for a house failure.
    let empty = |c: &mut Campaign| {
        c.first_baker = Address::new_from_array([0; 32]);
        c.void_reason = VoidReason::MissedWindow as u8;
    };
    assert_eq!(
        kept_of(SettleMode::Refund, empty),
        Ok(Kept {
            amount: OPENING,
            opening: OPENING
        })
    );
    let prize = prize_of(SettleMode::Refund, empty).unwrap();
    assert_eq!(
        prize,
        PrizeReturn {
            prize: PRIZE,
            opening: 0
        }
    );
}

#[test]
fn settle_d_an_unfinalized_mode_is_refused() {
    assert_eq!(kept_of(SettleMode::Unset, |_| {}), Err(NotFinalized));
    assert_eq!(prize_of(SettleMode::Unset, |_| {}), Err(NotFinalized));
}

#[test]
fn settle_d_the_rule_names_are_the_stored_ones() {
    // A stored byte that names no mode or reason is refused, never read as one.
    assert_eq!(
        kept_of(SettleMode::Refund, |c| c.settle_mode = 9),
        Err(BadAccountData)
    );
    assert_eq!(
        kept_of(SettleMode::Refund, |c| c.void_reason = 42),
        Err(BadAccountData)
    );
}
