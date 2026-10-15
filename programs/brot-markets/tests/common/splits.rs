//! Purpose: the `Split` pots of the S-8 host tests (`prefreeze_snapshot_books.rs`, `prefreeze_snapshot_derived.rs`):
//!          a snapshot input at the reference rates, the snapshot it splits into, and a grid of 80 pots.
//! Version: 0.0.1
//! Sprint: 16 (lane S8)

use brot_markets::{
    math::snapshot::{snapshot, Snapshot, SnapshotInput, Verdict},
    state::enums::SettleMode,
};

pub fn input(
    verdict: Verdict,
    yes: u64,
    no: u64,
    late_yes: u64,
    late_no: u64,
    team: bool,
) -> SnapshotInput {
    SnapshotInput {
        verdict,
        yes_total: yes,
        no_total: no,
        late_yes,
        late_no,
        prize: 4_118_239_224,
        opening_fee: 457_582_136,
        fee_bps: 1_000,
        one_sided_fee_bps: 100,
        creator_share_bps: 100,
        creator_is_team: team,
    }
}

pub fn split(input: &SnapshotInput) -> Snapshot {
    let snap = snapshot(*input).expect("the pot snapshots");
    assert_eq!(snap.mode, SettleMode::Split, "{input:?}");
    snap
}

pub fn up(x: u64) -> u64 {
    x.checked_add(1).unwrap()
}

pub fn down(x: u64) -> u64 {
    x.checked_sub(1).unwrap()
}

/// 80 pots that split on either verdict (neither side is 89 times the other: the Economic Viability Rule), with late
/// parts on either side, team or not.
pub fn grid() -> Vec<SnapshotInput> {
    let pots = [
        (600u64, 400u64),
        (400, 600),
        (2_000_000_000, 1_000_000_000),
        (1_000_000, 50_000_000),
        (9_007_199_254_740_993, 1_000_000_000_000_007),
    ];
    let lates = [(0u64, 0u64), (77, 0), (0, 13), (1_000_000_000, 7)];
    let mut all = Vec::new();
    for verdict in [Verdict::Yes, Verdict::No] {
        for &(yes, no) in &pots {
            for &(late_yes, late_no) in &lates {
                for team in [false, true] {
                    all.push(input(verdict, yes, no, late_yes, late_no, team));
                }
            }
        }
    }
    all
}
