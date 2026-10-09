//! Purpose: the `entry`, `estimate` and `schedule` rows of the snapshot vectors: what one entry is paid
//!          under each mode (late parts included), the join's return estimate, and the entry close with
//!          the duration check, each with its result or its refusal.
//! Version: 0.0.1
//! Sprint: 05 (SDK and the devnet cycle)
//!
//! Rows (inputs, then outputs):
//! - `entry,mode;winning_side;winning_total;distributable;one_sided_bps;yes;no;late_yes;late_no;first`,
//!   then `amount;one_sided_fee`, or one refusal;
//! - `estimate,amount;side_after;other;prize;fee_bps;one_sided_bps;creator_bps;first`, then the bps;
//! - `schedule,opens_at;deadline_at`, then `check;entries_close_at`, each field `Ok`, a value or a refusal.

use std::fmt::Write as _;

use brot_markets::{
    instructions::settlement::rules::{entry_payout, EntryAmounts, PotRule},
    math::{
        payout::{estimate_return_bps, JoinedPot},
        schedule::{check_duration, entries_close_at},
    },
    state::enums::{SettleMode, Side},
};

use super::{err, mode_name, Lcg};

const SETTLED: [SettleMode; 3] = [SettleMode::Split, SettleMode::OneSided, SettleMode::Refund];

pub fn entry_rows(rng: &mut Lcg, out: &mut String) {
    for _ in 0..2_000 {
        // Unset, a refusal, one time in twenty.
        let mode = if rng.coin(20) {
            SettleMode::Unset
        } else {
            SETTLED[usize::try_from(rng.below(3)).unwrap_or(0)]
        };
        let winning = if rng.coin(2) { Side::Yes } else { Side::No };
        let rule = PotRule {
            mode,
            winning,
            winning_total: rng.amount(),
            distributable: rng.amount(),
            one_sided_fee_bps: rng.bps(100),
        };
        let entry = EntryAmounts {
            yes: rng.amount(),
            no: rng.amount(),
            late_yes: if rng.coin(3) { rng.amount() } else { 0 },
            late_no: if rng.coin(3) { rng.amount() } else { 0 },
        };
        let first = rng.coin(5);
        let shown = match entry_payout(&rule, &entry, first) {
            Ok(paid) => format!("{};{}", paid.amount, paid.one_sided_fee),
            Err(error) => err(error),
        };
        let side = if winning == Side::Yes { "Yes" } else { "No" };
        let _ = writeln!(
            out,
            "entry,{};{side};{};{};{};{};{};{};{};{first},{shown}",
            mode_name(mode),
            rule.winning_total,
            rule.distributable,
            rule.one_sided_fee_bps,
            entry.yes,
            entry.no,
            entry.late_yes,
            entry.late_no,
        );
    }
}

pub fn estimate_rows(rng: &mut Lcg, out: &mut String) {
    for _ in 0..2_000 {
        let amount = rng.amount();
        // The side after the entry: usually at least the amount, below it one time in ten (a refusal).
        let side_after = if rng.coin(10) {
            rng.below(amount.saturating_add(1))
        } else {
            amount.saturating_add(rng.below(1_000_000_000_000))
        };
        let pot = JoinedPot {
            amount,
            side_after,
            other: rng.amount(),
            prize: if rng.coin(3) { 0 } else { rng.amount() },
            fee_bps: rng.bps(1_000),
            one_sided_fee_bps: rng.bps(100),
            creator_share_bps: rng.bps(100),
            is_first: rng.coin(5),
        };
        let shown = match estimate_return_bps(&pot) {
            Ok(bps) => bps.to_string(),
            Err(error) => err(error),
        };
        let _ = writeln!(
            out,
            "estimate,{};{};{};{};{};{};{};{},{shown}",
            pot.amount,
            pot.side_after,
            pot.other,
            pot.prize,
            pot.fee_bps,
            pot.one_sided_fee_bps,
            pot.creator_share_bps,
            pot.is_first,
        );
    }
}

pub fn schedule_rows(rng: &mut Lcg, out: &mut String) {
    const DAY: u64 = 86_400;
    const HUNDRED_DAYS: u64 = 8_640_000;
    for _ in 0..2_000 {
        let opens_at = i64::try_from(rng.below(4_000_000_000)).unwrap_or(0);
        // Mostly 0 to 100 days, crossing both duration bounds and the clamp; the far past and the far
        // future (near the ends of i64) one time in twenty each.
        let deadline_at = if rng.coin(20) {
            i64::MIN.saturating_add(i64::try_from(rng.below(DAY)).unwrap_or(0))
        } else if rng.coin(20) {
            i64::MAX.saturating_sub(i64::try_from(rng.below(DAY)).unwrap_or(0))
        } else {
            opens_at.saturating_add(i64::try_from(rng.below(HUNDRED_DAYS)).unwrap_or(0))
        };
        let check = match check_duration(opens_at, deadline_at) {
            Ok(()) => String::from("Ok"),
            Err(error) => err(error),
        };
        let close = match entries_close_at(opens_at, deadline_at) {
            Ok(close) => close.to_string(),
            Err(error) => err(error),
        };
        let _ = writeln!(out, "schedule,{opens_at};{deadline_at},{check};{close}");
    }
}
