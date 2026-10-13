/**
 * Purpose: what the founder's answer 3a (2026-10-10) takes out of the leaderboard's points rule: a wallet with entries
 *          on both sides of a campaign scores nothing for it; a pot refunded as one-sided (one side empty, or a losing
 *          side too small to pay the fees), whether a live account says so or its finalization did, scores nothing;
 *          the wallet that opened a burn, lock or stake campaign never scores on it, while the creator's other wallets
 *          cannot be told apart on-chain and still do. Filter: `bun test tests/ -t "leaderboard points rule"`.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { describe, expect, test } from "bun:test";

import {
  BOTH_SIDES_SCORE,
  creatorCanControl,
  finalResults,
  Outcome,
  pointsTable,
  ReaderKind,
  SettleMode,
  Side,
} from "@brot/sdk/read";

import { entry, finalized, live, now, opened, resolved, row, SOL } from "./points-kit";

describe("leaderboard points rule, the founder's answer 3a", () => {
  test("a wallet with entries on both sides scores nothing for that campaign (3a); Q7 read literally would score it", () => {
    expect(BOTH_SIDES_SCORE).toBe(false);
    const events = [entry("c1", "ana", Side.Yes, SOL / 100n), entry("c1", "ana", Side.No, SOL / 100n)];
    const final = live([["c1", now(Outcome.No, true)]]);
    expect(row(pointsTable(events, final), "ana")).toEqual({ wallet: "ana", points: 0, entered: 1, decided: 1 });
    expect(row(pointsTable(events, final, { bothSidesScore: true }), "ana")?.points).toBe(1);
  });

  test("a refunded pot scores nothing (3a): one-sided by the live account, or finalized one-sided in the events", () => {
    const events = [
      entry("c1", "ana", Side.Yes),
      entry("c1", "bia", Side.Yes),
      entry("gone", "ana", Side.No),
      entry("gone", "caio", Side.Yes, SOL / 1000n), // too small to pay the fees: the pot is refunded
      resolved("gone", Outcome.No),
      finalized("gone", SettleMode.OneSided),
    ];
    const rows = pointsTable(events, live([["c1", now(Outcome.Yes, true, { oneSided: true })]]));
    expect(rows.map((r) => [r.wallet, r.points, r.entered, r.decided])).toEqual([
      ["ana", 0, 2, 2],
      ["bia", 0, 1, 1],
      ["caio", 0, 1, 1],
    ]);
    expect(finalResults(events, new Map()).get("gone#0")?.oneSided).toBe(true);
  });

  test("the creator's own wallet never scores on a burn, lock, stake or graduation campaign; on a price one it does (3a)", () => {
    expect(
      [...Object.values(ReaderKind)]
        .filter((k) => typeof k === "number")
        .map((k) => creatorCanControl(k as ReaderKind)),
    ).toEqual([false, true, true, true, true, true]);
    const events = [
      opened("burn", "maker", ReaderKind.SupplyAtMost),
      entry("burn", "maker", Side.Yes),
      entry("burn", "maker-2", Side.Yes), // the same person's other wallet: nothing on-chain ties it to the creator
      entry("burn", "ana", Side.No),
      resolved("burn", Outcome.Yes),
      finalized("burn", SettleMode.Split),
      opened("price", "maker"),
      entry("price", "maker", Side.No),
      entry("price", "ana", Side.Yes),
    ];
    const rows = pointsTable(events, live([["price", now(Outcome.No, true)]]));
    expect(row(rows, "maker")).toEqual({ wallet: "maker", points: 1, entered: 2, decided: 2 }); // the price one only
    expect(row(rows, "maker-2")?.points).toBe(1);
    // A live account names its creator and kind itself, should its opening event be missing.
    const lock = pointsTable(
      [entry("lock", "maker", Side.Yes)],
      live([["lock", now(Outcome.Yes, true, { kind: ReaderKind.DammV2LockedAtLeast })]]),
    );
    expect(row(lock, "maker")?.points).toBe(0);
  });
});
