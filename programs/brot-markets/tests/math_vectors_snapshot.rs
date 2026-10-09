//! Purpose: the second set of committed math vectors (X0.3, Sprint 05): the finalize snapshot (every mode,
//!          the viability rule at its threshold, voids of both classes, team campaigns, late entries), what
//!          one entry is paid under each mode, the join's return estimate, and the schedule, each with its
//!          result or its refusal. The SDK's TypeScript mirror replays the same file
//!          (tests/sdk/math-vectors.test.ts).
//! Version: 0.0.1
//! Sprint: 05 (SDK and the devnet cycle)
//!
//! Like `math_vectors.rs`, the test regenerates the rows from a fixed seed and compares them with
//! `tests/vectors/snapshot-vectors.csv`, so the file cannot drift from the code;
//! `REGEN_MATH_VECTORS=1 cargo test ...` rewrites it. The row formats are in `vectors_support/`. The
//! schedule rows depend on the build's time constants, so this test does not run in a `drill` build.
#![cfg(not(feature = "drill"))]

mod vectors_support;

use vectors_support::{other_rows, snapshot_rows, Lcg};

const SEED: u64 = 0x5EED_0505;
const PATH: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/../../tests/vectors/snapshot-vectors.csv"
);

fn generate() -> String {
    let mut rng = Lcg(SEED);
    let mut out = String::from("kind,inputs,outputs\n");
    snapshot_rows::rows(&mut rng, &mut out);
    other_rows::entry_rows(&mut rng, &mut out);
    other_rows::estimate_rows(&mut rng, &mut out);
    other_rows::schedule_rows(&mut rng, &mut out);
    out
}

#[test]
fn the_committed_snapshot_vectors_are_the_code_s_output() {
    let generated = generate();
    assert!(
        generated.lines().count() > 10_000,
        "X0.3 needs at least 10,000 vectors in each file"
    );
    if std::env::var_os("REGEN_MATH_VECTORS").is_some() {
        std::fs::write(PATH, &generated).expect("write the vectors");
    }
    let committed =
        std::fs::read_to_string(PATH).expect("tests/vectors/snapshot-vectors.csv is committed");
    assert!(
        committed == generated,
        "the snapshot vectors drifted from the code; regenerate and review the diff"
    );
}
