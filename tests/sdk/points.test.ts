/**
 * Purpose: the leaderboard's points rule (Sprint 13; BR-29; Q7 answered a): 1 point per campaign entered on the side
 *          that won, once the result is final; never for volume, never for a void, never for a late join; ties share
 *          a rank. Built from the program's events as the SDK decodes them, and from what a live account says. What
 *          the founder's answer 3a takes out (a refunded pot, a wallet on both sides, the creator's own wallet) is
 *          points-3a.test.ts. Filter: `bun test tests/ -t "leaderboard points rule"`.
 * Version: 0.3.0 (the events and accounts moved to points-kit.ts with the founder's answer 3a; 0.2.0, a reopened id is
 *          a new campaign)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { describe, expect, test } from "bun:test";

import { finalResults, Outcome, pointsTable, ranksOf, SettleMode, Side } from "@brot/sdk/read";

import { entry, event, finalized, live, now, resolved, row, SOL } from "./points-kit";

describe("leaderboard points rule", () => {
  test("one point per campaign on the side that won, whatever the amount or the number of entries", () => {
    const events = [
      entry("c1", "ana", Side.Yes, 5n * SOL),
      entry("c1", "ana", Side.Yes, SOL / 100n),
      entry("c1", "bia", Side.Yes, SOL / 100n),
      entry("c1", "caio", Side.No, 100n * SOL),
    ];
    const rows = pointsTable(events, live([["c1", now(Outcome.Yes, true)]]));
    expect(row(rows, "ana")).toEqual({ wallet: "ana", points: 1, entered: 1, decided: 1 });
    expect(row(rows, "bia")?.points).toBe(1); // a hundredth of a SOL scores the same as 5 SOL
    expect(row(rows, "caio")).toEqual({ wallet: "caio", points: 0, entered: 1, decided: 1 });
  });

  test("a result still in its review window scores nothing yet; it counts as entered", () => {
    const events = [entry("c1", "ana", Side.Yes)];
    const rows = pointsTable(events, live([["c1", now(Outcome.Yes, false)]]));
    expect(row(rows, "ana")).toEqual({ wallet: "ana", points: 0, entered: 1, decided: 0 });
  });

  test("a void scores nothing and is not decided, whether automatic, by the team, or seen only in events", () => {
    const events = [
      entry("c1", "ana", Side.Yes),
      entry("c2", "ana", Side.Yes),
      resolved("c2", Outcome.Yes),
      event("CampaignVoided", { campaign: "c2" }),
      finalized("c2", SettleMode.Refund),
    ];
    const rows = pointsTable(events, live([["c1", now(Outcome.Void, true)]]));
    expect(row(rows, "ana")).toEqual({ wallet: "ana", points: 0, entered: 2, decided: 0 });
  });

  test("a campaign closed after its payouts is read from its events: finalized, then its outcome", () => {
    const events = [
      entry("gone", "ana", Side.No),
      resolved("gone", Outcome.No),
      finalized("gone", SettleMode.Split),
      entry("unfinal", "ana", Side.No),
      resolved("unfinal", Outcome.No),
    ];
    const results = finalResults(events, new Map());
    expect(results.get("gone#0")).toEqual({ result: "No", oneSided: false, creator: undefined, kind: undefined });
    expect(results.has("unfinal#0")).toBe(false); // resolved but never finalized, and no account to say more
    expect(row(pointsTable(events, new Map()), "ana")).toEqual({ wallet: "ana", points: 1, entered: 2, decided: 1 });
  });

  test("the live account outranks its events while it exists", () => {
    const events = [entry("c1", "ana", Side.Yes), resolved("c1", Outcome.Yes), finalized("c1", SettleMode.Split)];
    expect(finalResults(events, live([["c1", now(Outcome.Yes, false)]])).has("c1#0")).toBe(false);
  });

  test("a join tallied as late comes back whole and never scores", () => {
    const events = [
      entry("c1", "ana", Side.Yes),
      entry("c1", "bia", Side.Yes, 2n * SOL),
      event("LateTallied", { campaign: "c1", baker: "ana", lateYesAdded: SOL, lateNoAdded: 0n }),
      event("LateTallied", { campaign: "c1", baker: "bia", lateYesAdded: SOL, lateNoAdded: 0n }),
    ];
    const rows = pointsTable(events, live([["c1", now(Outcome.Yes, true)]]));
    expect(row(rows, "ana")).toBeUndefined(); // only a late join: nothing called
    expect(row(rows, "bia")?.points).toBe(1); // 1 SOL in time still scores
  });

  test("a closed campaign's id opened again is a new campaign: the old bakers keep the old result", () => {
    const events = [
      event("CampaignOpened", { campaign: "c1" }),
      entry("c1", "ana", Side.No),
      resolved("c1", Outcome.No),
      finalized("c1", SettleMode.Split),
      event("CampaignClosed", { campaign: "c1" }),
      event("CampaignOpened", { campaign: "c1" }),
      entry("c1", "bia", Side.Yes),
    ];
    // The new campaign at the same address is open: the old one's NO still scores; Bia has nothing decided yet.
    const open = pointsTable(events, live([["c1", now(Outcome.Unresolved, false)]]));
    expect(row(open, "ana")).toEqual({ wallet: "ana", points: 1, entered: 1, decided: 1 });
    expect(row(open, "bia")).toEqual({ wallet: "bia", points: 0, entered: 1, decided: 0 });
    // The new one ends YES: Bia scores, and Ana's old NO is not rescored by it.
    const yes = pointsTable(events, live([["c1", now(Outcome.Yes, true)]]));
    expect(row(yes, "ana")?.points).toBe(1);
    expect(row(yes, "bia")?.points).toBe(1);
    expect([...finalResults(events, new Map()).keys()]).toEqual(["c1#1"]);
  });

  test("highest points first, then by address; ties share a rank and zero points has none", () => {
    const accounts = live([
      ["a", now(Outcome.Yes, true)],
      ["b", now(Outcome.Yes, true)],
    ]);
    const events = [
      entry("a", "w3", Side.Yes),
      entry("b", "w3", Side.Yes),
      entry("a", "w2", Side.Yes),
      entry("a", "w1", Side.Yes),
      entry("a", "w0", Side.No),
    ];
    const rows = pointsTable(events, accounts);
    expect(rows.map((r) => [r.wallet, r.points])).toEqual([
      ["w3", 2],
      ["w1", 1],
      ["w2", 1],
      ["w0", 0],
    ]);
    expect(ranksOf(rows)).toEqual([1, 2, 2, null]);
  });
});
