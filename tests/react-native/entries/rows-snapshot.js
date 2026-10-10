/**
 * Purpose: the four kinds of tests/vectors/snapshot-vectors.csv (programs/brot-markets/tests/
 *          math_vectors_snapshot.rs and vectors_support/): the finalize `snapshot`, one `entry`'s
 *          payout, the join's `estimate` and the `schedule`, passed to `@brot/sdk/read` and printed as
 *          the Rust wrote them. The same calls as the Bun replay (tests/sdk/snapshot-vectors.test.ts).
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 */
import {
  checkDuration,
  entriesCloseAt,
  entryPayout,
  estimateReturnBps,
  SettleMode,
  Side,
  snapshot,
} from "@brot/sdk/read";

import { attempt, shown } from "./outcome";

const VERDICTS = {
  Yes: { kind: "Yes" },
  No: { kind: "No" },
  VoidHouse: { kind: "Void", voidClass: "HouseFailure" },
  VoidOutside: { kind: "Void", voidClass: "OutsideCause" },
};

const read = (inputs) => ({
  big: (i) => BigInt(inputs[i]),
  num: (i) => Number(inputs[i]),
  flag: (i) => inputs[i] === "true",
});

function snapshotRow(inputs) {
  const { big, num, flag } = read(inputs);
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
  const fields = (s) => [SettleMode[s.mode], s.winningTotal, s.losingTotal, s.refundedLate, s.feeTotal];
  const share = (s) => [s.creatorShare, s.creatorShareFromFee, s.fromPot, s.distributable, s.brotKeeps, s.toOpener];
  return shown(
    attempt(() => snapshot(input)),
    (s) => [...fields(s), ...share(s)].join(";"),
  );
}

function entryRow(inputs) {
  const { big, num, flag } = read(inputs);
  const rule = {
    mode: SettleMode[inputs[0]],
    winning: inputs[1] === "Yes" ? Side.Yes : Side.No,
    winningTotal: big(2),
    distributable: big(3),
    oneSidedFeeBps: num(4),
  };
  const entry = { yes: big(5), no: big(6), lateYes: big(7), lateNo: big(8) };
  return shown(
    attempt(() => entryPayout(rule, entry, flag(9))),
    (paid) => `${paid.amount};${paid.oneSidedFee}`,
  );
}

function estimateRow(inputs) {
  const { big, num, flag } = read(inputs);
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
  return shown(attempt(() => estimateReturnBps(pot)));
}

function scheduleRow([opensAt, deadlineAt]) {
  const check = shown(
    attempt(() => checkDuration(BigInt(opensAt), BigInt(deadlineAt))),
    () => "Ok",
  );
  return `${check};${shown(attempt(() => entriesCloseAt(BigInt(opensAt), BigInt(deadlineAt))))}`;
}

export const SNAPSHOT_ROWS = { snapshot: snapshotRow, entry: entryRow, estimate: estimateRow, schedule: scheduleRow };
