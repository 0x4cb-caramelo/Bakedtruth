//! Purpose: the `snapshot` rows of the snapshot vectors: random pots under the four verdicts, with one row
//!          in three placed within a few lamports of the Economic Viability Rule's threshold, where the
//!          pot turns from one-sided to split (decision of 2026-10-09).
//! Version: 0.0.1
//! Sprint: 05 (SDK and the devnet cycle)
//!
//! Row: `snapshot,verdict;yes;no;late_yes;late_no;prize;opening_fee;fee_bps;one_sided_bps;creator_bps;team`
//! then `mode;winning;losing;late;fee;share;share_from_fee;from_pot;distributable;brot_keeps;to_opener`.

use std::fmt::Write as _;

use brot_markets::math::{
    snapshot::{snapshot, SnapshotInput, Verdict},
    void::VoidClass,
};

use super::{err, mode_name, Lcg};

const VERDICTS: [(&str, Verdict); 4] = [
    ("Yes", Verdict::Yes),
    ("No", Verdict::No),
    ("VoidHouse", Verdict::Void(VoidClass::HouseFailure)),
    ("VoidOutside", Verdict::Void(VoidClass::OutsideCause)),
];

/// A losing side within a few lamports of the viability threshold for `winning`: the `P` where
/// `P = ceil(P × fee ÷ 10,000) + floor((V + P) × share ÷ 10,000)`, about `V × share ÷ (10,000 − fee −
/// share)`; for a team campaign (no share) a losing side of 1 to 7 lamports.
fn near_threshold(rng: &mut Lcg, winning: u64, fee_bps: u16, share_bps: u16, team: bool) -> u64 {
    let rest = 10_000u128
        .saturating_sub(u128::from(fee_bps))
        .saturating_sub(u128::from(share_bps));
    let base = if team || rest == 0 {
        4
    } else {
        u128::from(winning)
            .saturating_mul(u128::from(share_bps))
            .checked_div(rest)
            .unwrap_or(0)
    };
    let losing = i128::try_from(base)
        .unwrap_or(i128::MAX)
        .saturating_add(rng.step());
    u64::try_from(losing.max(1)).unwrap_or(u64::MAX)
}

pub fn rows(rng: &mut Lcg, out: &mut String) {
    for _ in 0..6_000 {
        let (name, verdict) = VERDICTS[usize::try_from(rng.below(4)).unwrap_or(0)];
        let fee_bps = rng.bps(1_000);
        let one_sided_fee_bps = rng.bps(100);
        let creator_share_bps = rng.bps(100);
        let creator_is_team = rng.coin(4);
        let decided = matches!(verdict, Verdict::Yes | Verdict::No);
        let (yes_total, no_total) = if decided && rng.coin(3) {
            let winning = rng.positive();
            let losing = near_threshold(rng, winning, fee_bps, creator_share_bps, creator_is_team);
            if matches!(verdict, Verdict::Yes) {
                (winning, losing)
            } else {
                (losing, winning)
            }
        } else {
            (rng.amount(), rng.amount())
        };
        let input = SnapshotInput {
            verdict,
            yes_total,
            no_total,
            late_yes: if rng.coin(4) { rng.amount() } else { 0 },
            late_no: if rng.coin(4) { rng.amount() } else { 0 },
            prize: if rng.coin(3) { 0 } else { rng.amount() },
            opening_fee: if rng.coin(3) { 0 } else { rng.amount() },
            fee_bps,
            one_sided_fee_bps,
            creator_share_bps,
            creator_is_team,
        };
        let shown = match snapshot(input) {
            Ok(s) => format!(
                "{};{};{};{};{};{};{};{};{};{};{}",
                mode_name(s.mode),
                s.winning_total,
                s.losing_total,
                s.refunded_late,
                s.fee_total,
                s.creator_share,
                s.creator_share_from_fee,
                s.from_pot,
                s.distributable,
                s.brot_keeps,
                s.to_opener
            ),
            Err(error) => err(error),
        };
        let _ = writeln!(
            out,
            "snapshot,{name};{yes_total};{no_total};{};{};{};{};{fee_bps};{one_sided_fee_bps};{creator_share_bps};{creator_is_team},{shown}",
            input.late_yes, input.late_no, input.prize, input.opening_fee,
        );
    }
}
