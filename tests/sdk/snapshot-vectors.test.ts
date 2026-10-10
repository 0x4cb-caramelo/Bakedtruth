/**
 * Purpose: X0.3, the TypeScript half, second file: every vector of tests/vectors/snapshot-vectors.csv
 *          (programs/brot-markets/tests/math_vectors_snapshot.rs: the finalize snapshot with the viability
 *          rule at its threshold, what one entry is paid, the join's estimate, the schedule) is replayed
 *          through the SDK, refusals included, with no mismatch.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, test } from "bun:test";

import {
  checkDuration,
  entriesCloseAt,
  entryPayout,
  estimateReturnBps,
  SettleMode,
  Side,
  snapshot,
  type Verdict,
} from "@brot/sdk/read";

import { attempt, replayFile, show } from "./vectors";

const VERDICTS: Record<string, Verdict> = {
  Yes: { kind: "Yes" },
  No: { kind: "No" },
  VoidHouse: { kind: "Void", voidClass: "HouseFailure" },
  VoidOutside: { kind: "Void", voidClass: "OutsideCause" },
};

const modeOf = (name: string) => SettleMode[name as keyof typeof SettleMode];

function replay(kind: string, inputs: string[]): string {
  const big = (i: number) => BigInt(inputs[i]);
  const num = (i: number) => Number(inputs[i]);
  const flag = (i: number) => inputs[i] === "true";
  switch (kind) {
    case "snapshot": {
      const input = {
        verdict: VERDICTS[inputs[0]],
        yesTotal: big(1),
        noTotal: big(2),
        lateYes: big(3),
        lateNo: big(4),
        prize: big(5),
        openingFee: big(6),
        feeBps: num(7),
        oneSidedFeeBps: num(8),
        creatorShareBps: num(9),
        creatorIsTeam: flag(10),
      };
      return show(
        attempt(() => snapshot(input)),
        (s) =>
          [
            SettleMode[s.mode],
            s.winningTotal,
            s.losingTotal,
            s.refundedLate,
            s.feeTotal,
            s.creatorShare,
            s.creatorShareFromFee,
            s.fromPot,
            s.distributable,
            s.brotKeeps,
            s.toOpener,
          ].join(";"),
      );
    }
    case "entry": {
      const rule = {
        mode: modeOf(inputs[0]),
        winning: inputs[1] === "Yes" ? Side.Yes : Side.No,
        winningTotal: big(2),
        distributable: big(3),
        oneSidedFeeBps: num(4),
      };
      const entry = { yes: big(5), no: big(6), lateYes: big(7), lateNo: big(8) };
      return show(
        attempt(() => entryPayout(rule, entry, flag(9))),
        (p) => `${p.amount};${p.oneSidedFee}`,
      );
    }
    case "estimate": {
      const pot = {
        amount: big(0),
        sideAfter: big(1),
        other: big(2),
        prize: big(3),
        feeBps: num(4),
        oneSidedFeeBps: num(5),
        creatorShareBps: num(6),
        isFirst: flag(7),
      };
      return show(attempt(() => estimateReturnBps(pot)));
    }
    case "schedule": {
      const check = show(
        attempt(() => checkDuration(big(0), big(1))),
        () => "Ok",
      );
      return `${check};${show(attempt(() => entriesCloseAt(big(0), big(1))))}`;
    }
    default:
      throw new Error(`unknown vector kind ${kind}`);
  }
}

describe("sdk math matches rust vectors", () => {
  test("tests/vectors/snapshot-vectors.csv: snapshot, entry payout, estimate, schedule", () => {
    replayFile("tests/vectors/snapshot-vectors.csv", replay);
  });
});
