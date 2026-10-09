/**
 * Purpose: the acceptance test of the two ported epoch readers: pred-provable and brot-markets run
 *          on the same captured JitoSOL and bSOL pools and mainnet vote account at the same clocks,
 *          and each opening and resolution lands in the same class, except the differences TP
 *          section 3.4.6 and Sprint 03 chose, each asserted below with its reason. Prints the table.
 * Version: 0.0.3
 * Sprint:  03 (readers and resolution), lane B. Needs both SBF builds; runs before pred-provable
 *          leaves the workspace.
 */
import { afterAll, describe, expect, test } from "bun:test";

import * as P from "../brot/program";
import type { FixtureName } from "../helpers";
import { type Bytes, type Case, E, UPDATED, facts, fixtureAddress, original, ported, update } from "./epoch-support";

const [JITO, BSOL, VOTE] = ["stakepool-jitosol", "stakepool-bsol", "vote-mainnet-top"] as const;
const TOKEN = P.SPL_TOKEN_PROGRAM_ID;
const SOL = P.SOL;

type Scenario = { reader: "pool" | "stake"; fixture: FixtureName; name: string; c: Case; same?: string; diff?: Diff };
/** An expected difference: what each program answers, and why the port answers otherwise. */
type Diff = { original: string; ported: string; why: string };
const scenarios: Scenario[] = [];
const rows: string[][] = [];

/** The stake pool cases on `fixture`. The goal sits 2% above the higher total: past brot's 1%
 * minimum distance, so both programs accept it at opening. */
function poolScenarios(fixture: typeof JITO | typeof BSOL, all: boolean) {
  const { high, low } = facts(fixture);
  const goal = high + high / 50n;
  const bytes = (edit?: Bytes["edit"], owner?: Bytes["owner"]): Bytes => ({ name: fixture, edit, owner });
  /** A campaign measuring E, opened at UPDATED on the captured bytes, resolved at `clock` on `b`. */
  const at = (clock: bigint, b?: Bytes): Case => ({
    epoch: E,
    target: goal,
    bytes: bytes(),
    later: { epoch: clock, bytes: b },
  });
  const add = (name: string, c: Case, same?: string, diff?: Diff) =>
    scenarios.push({ reader: "pool", fixture, name, c, same, diff });
  add("opening 2% above the higher total", { epoch: E, target: goal, bytes: bytes() }, "accepted");
  add("opening at the higher total", { epoch: E, target: high, bytes: bytes() }, "refused: target");
  add("opening between the two totals", { epoch: E, target: low + 1n, bytes: bytes() }, "refused: target");
  add("in E, the snapshot at the goal", at(E, bytes(update(E, goal))), "YES");
  add("in E, the snapshot one lamport short", at(E, bytes(update(E, goal - 1n))), "NO");
  if (!all) return;
  add("opening at zero", { epoch: E, target: 0n, bytes: bytes() }, "refused: target");
  add("opening for the epoch the clock is in", { epoch: UPDATED, target: goal, bytes: bytes() }, "refused: epoch");
  add("opening for a past epoch", { epoch: UPDATED - 1n, target: goal, bytes: bytes() }, "refused: epoch");
  add(
    "opening on another owner's bytes",
    { epoch: E, target: goal, bytes: bytes(undefined, TOKEN) },
    "refused: account",
  );
  add("opening on a validator list", { epoch: E, target: goal, bytes: bytes((d) => (d[0] = 2)) }, "refused: account");
  const stopped = { clock: UPDATED + 2n, epoch: UPDATED + 3n, target: goal, bytes: bytes() };
  add("opening on a pool two epochs behind", stopped, "refused: account");
  add("opening on a pool one epoch behind", { ...stopped, clock: UPDATED + 1n, epoch: UPDATED + 2n }, "accepted");
  add("before E", at(UPDATED), "not yet");
  add("in E, before the pool's first update", at(E), "not yet");
  add("after E, the snapshot of E still there", at(E + 1n, bytes(update(E, goal))), "YES");
  const flash = (d: Uint8Array) => {
    update(E, goal - 1n)(d);
    new DataView(d.buffer).setBigUint64(258, (1n << 64n) - 1n, true); // total_lamports
  };
  add("in E, a short snapshot and a flash deposit", at(E, bytes(flash)), "NO");
  add("in E, another owner's bytes", at(E, bytes(undefined, TOKEN)), "refused: account");
  // TP section 3.4.6: a missed or unreadable snapshot voids, where the frozen program recorded NO
  // and, in a pot, would have paid out without a reading.
  const missed = "TP 3.4.6: a missed snapshot voids (MissedWindow); pred-provable recorded NO";
  const after = (b?: Bytes) => at(E + 1n, b);
  add("after E, overwritten by E + 1", after(bytes(update(E + 1n, 2n * goal))), undefined, {
    original: "NO",
    ported: "VOID(MissedWindow)",
    why: missed,
  });
  add("after E, never updated", after(), undefined, { original: "NO", ported: "VOID(MissedWindow)", why: missed });
  const unreadable =
    "TP 3.4.6: an unreadable account after the window voids (UnreadableAccount); pred-provable recorded NO";
  add("after E, another owner's bytes", after(bytes(undefined, TOKEN)), undefined, {
    original: "NO",
    ported: "VOID(UnreadableAccount)",
    why: unreadable,
  });
  // Row 3 [AC]: the target must clear the current value by 1%; the frozen program asked only above.
  const near = { epoch: E, target: high + 1n, bytes: bytes() };
  add("opening one lamport above the higher total", near, undefined, {
    original: "accepted",
    ported: "refused: target",
    why: "the 1% minimum distance (row 3 [AC])",
  });
}

poolScenarios(JITO, true);
poolScenarios(BSOL, false);

// StakeAtLeast: LiteSVM's npm package returns zero stake, so in the epoch both read NO; past it the
// syscall can no longer answer for the epoch and brot voids. The opening is closed in brot (row 1)
// until a devnet YES, and only brot reads the vote account's layout.
const voteBytes = (edit?: Bytes["edit"]): Bytes => ({ name: VOTE, edit });
const stake = (epoch: bigint, b?: Bytes): Case => ({
  epoch: E,
  target: SOL,
  bytes: voteBytes(),
  later: { epoch, bytes: b },
});
const addStake = (name: string, c: Case, same?: string, diff?: Diff) =>
  scenarios.push({ reader: "stake", fixture: VOTE, name, c, same, diff });
addStake("before E", stake(UPDATED), "not yet");
addStake("in E, zero stake", stake(E), "NO");
addStake("after E", stake(E + 1n), undefined, {
  original: "NO",
  ported: "VOID(MissedWindow)",
  why: "TP 3.4.6: past the epoch the syscall cannot answer for it",
});
const zeroed = voteBytes((d) => d.fill(0));
addStake("in E, a zeroed vote account", stake(E, zeroed), undefined, {
  original: "NO",
  ported: "refused: account",
  why: "the port checks the vote layout; pred-provable checked the owner only",
});
addStake("opening on the vote account", { epoch: E, target: SOL, bytes: voteBytes() }, undefined, {
  original: "accepted",
  ported: "refused: kind not open",
  why: "row 1: StakeAtLeast opens only after a devnet YES (feature stake-at-least off)",
});

describe("ported reader matches pred-provable: StakePoolTvlAtLeast and StakeAtLeast", () => {
  for (const s of scenarios) {
    test(`${s.reader === "pool" ? "StakePoolTvlAtLeast" : "StakeAtLeast"} on ${s.fixture}: ${s.name}`, async () => {
      const kind = s.reader === "pool" ? P.ReaderKind.StakePoolTvlAtLeast : P.ReaderKind.StakeAtLeast;
      // The frozen program's `target`: the pool's mint, or the vote account itself.
      const target = s.reader === "pool" ? facts(s.fixture).mint : fixtureAddress(s.fixture);
      const found = { original: await original(s.reader, s.c, target), ported: await ported(kind, s.c) };
      rows.push([
        s.reader === "pool" ? "StakePoolTvlAtLeast" : "StakeAtLeast",
        s.fixture,
        s.name,
        found.original,
        found.ported,
      ]);
      if (s.diff) {
        // An expected difference, asserted on both sides; its reason is in `s.diff.why`.
        expect(found).toEqual({ original: s.diff.original, ported: s.diff.ported });
      } else {
        expect(found).toEqual({ original: s.same!, ported: s.same! });
      }
    });
  }
});

afterAll(() => {
  const header = ["reader", "fixture", "case", "original", "ported"];
  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i]!.length)));
  const line = (r: string[]) => r.map((cell, i) => cell.padEnd(widths[i]!)).join(" | ");
  console.log(["", line(header), widths.map((n) => "-".repeat(n)).join("-|-"), ...rows.map(line)].join("\n"));
});
