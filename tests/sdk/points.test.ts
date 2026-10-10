/**
 * Purpose: the leaderboard's points rule (Sprint 13; BR-29; Q7 answered a): 1 point per campaign entered on the side
 *          that won, once the result is final; never for volume, never for a void, never for a late join; ties share
 *          a rank. Built from the program's events as the SDK decodes them, and from what a live account says.
 *          Filter: `bun test tests/ -t "leaderboard points rule"`.
 * Version: 0.2.0 (a reopened id is a new campaign)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { describe, expect, test } from "bun:test";

import {
  BOTH_SIDES_SCORE,
  finalResults,
  Outcome,
  pointsTable,
  ranksOf,
  SettleMode,
  Side,
  type CampaignNow,
  type DecodedEvent,
} from "@brot/sdk/read";

let n = 0;
const event = (name: string, data: Record<string, unknown>): DecodedEvent =>
  ({
    name,
    discriminator: 0,
    data: { seq: 0n, ...data },
    key: { signature: `sig${++n}`, ixIndex: 0, innerIndex: 0 },
    slot: BigInt(n),
    blockTime: null,
  }) as unknown as DecodedEvent;

const SOL = 1_000_000_000n;
const entry = (campaign: string, baker: string, side: Side, amount = SOL) =>
  event("EntryAdded", { campaign, baker, side, isFirst: false, amount });
const resolved = (campaign: string, outcome: Outcome) => event("CampaignResolved", { campaign, outcome });
const finalized = (campaign: string, settleMode: SettleMode) => event("CampaignFinalized", { campaign, settleMode });
const live = (pairs: [string, CampaignNow][]) => new Map(pairs);
const row = (rows: ReturnType<typeof pointsTable>, wallet: string) => rows.find((r) => r.wallet === wallet);

describe("leaderboard points rule", () => {
  test("one point per campaign on the side that won, whatever the amount or the number of entries", () => {
    const events = [
      entry("c1", "ana", Side.Yes, 5n * SOL),
      entry("c1", "ana", Side.Yes, SOL / 100n),
      entry("c1", "bia", Side.Yes, SOL / 100n),
      entry("c1", "caio", Side.No, 100n * SOL),
    ];
    const rows = pointsTable(events, live([["c1", { outcome: Outcome.Yes, final: true }]]));
    expect(row(rows, "ana")).toEqual({ wallet: "ana", points: 1, entered: 1, decided: 1 });
    expect(row(rows, "bia")?.points).toBe(1); // a hundredth of a SOL scores the same as 5 SOL
    expect(row(rows, "caio")).toEqual({ wallet: "caio", points: 0, entered: 1, decided: 1 });
  });

  test("a result still in its review window scores nothing yet; it counts as entered", () => {
    const events = [entry("c1", "ana", Side.Yes)];
    const rows = pointsTable(events, live([["c1", { outcome: Outcome.Yes, final: false }]]));
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
    const rows = pointsTable(events, live([["c1", { outcome: Outcome.Void, final: true }]]));
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
    expect(results.get("gone#0")).toBe("No");
    expect(results.has("unfinal#0")).toBe(false); // resolved but never finalized, and no account to say more
    expect(row(pointsTable(events, new Map()), "ana")).toEqual({ wallet: "ana", points: 1, entered: 2, decided: 1 });
  });

  test("the live account outranks its events while it exists", () => {
    const events = [entry("c1", "ana", Side.Yes), resolved("c1", Outcome.Yes), finalized("c1", SettleMode.Split)];
    expect(finalResults(events, live([["c1", { outcome: Outcome.Yes, final: false }]])).has("c1#0")).toBe(false);
  });

  test("a join tallied as late comes back whole and never scores", () => {
    const events = [
      entry("c1", "ana", Side.Yes),
      entry("c1", "bia", Side.Yes, 2n * SOL),
      event("LateTallied", { campaign: "c1", baker: "ana", lateYesAdded: SOL, lateNoAdded: 0n }),
      event("LateTallied", { campaign: "c1", baker: "bia", lateYesAdded: SOL, lateNoAdded: 0n }),
    ];
    const rows = pointsTable(events, live([["c1", { outcome: Outcome.Yes, final: true }]]));
    expect(row(rows, "ana")).toBeUndefined(); // only a late join: nothing called
    expect(row(rows, "bia")?.points).toBe(1); // 1 SOL in time still scores
  });

  test("both sides: Q7 read literally scores; the founder's switch can turn it off", () => {
    expect(BOTH_SIDES_SCORE).toBe(true);
    const events = [entry("c1", "ana", Side.Yes), entry("c1", "ana", Side.No)];
    const now = live([["c1", { outcome: Outcome.No, final: true }]]);
    expect(row(pointsTable(events, now), "ana")?.points).toBe(1);
    expect(row(pointsTable(events, now, { bothSidesScore: false }), "ana")).toEqual({
      wallet: "ana",
      points: 0,
      entered: 1,
      decided: 1,
    });
  });

  test("a one-sided pot with a final YES scores the wallets on YES (the rule has no exception for it)", () => {
    const events = [entry("c1", "ana", Side.Yes), entry("c1", "bia", Side.Yes)];
    const rows = pointsTable(events, live([["c1", { outcome: Outcome.Yes, final: true }]]));
    expect(rows.map((r) => r.points)).toEqual([1, 1]);
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
    const open = pointsTable(events, live([["c1", { outcome: Outcome.Unresolved, final: false }]]));
    expect(row(open, "ana")).toEqual({ wallet: "ana", points: 1, entered: 1, decided: 1 });
    expect(row(open, "bia")).toEqual({ wallet: "bia", points: 0, entered: 1, decided: 0 });
    // The new one ends YES: Bia scores, and Ana's old NO is not rescored by it.
    const yes = pointsTable(events, live([["c1", { outcome: Outcome.Yes, final: true }]]));
    expect(row(yes, "ana")?.points).toBe(1);
    expect(row(yes, "bia")?.points).toBe(1);
    expect([...finalResults(events, new Map()).keys()]).toEqual(["c1#1"]);
  });

  test("highest points first, then by address; ties share a rank and zero points has none", () => {
    const now = live([
      ["a", { outcome: Outcome.Yes, final: true }],
      ["b", { outcome: Outcome.Yes, final: true }],
    ]);
    const events = [
      entry("a", "w3", Side.Yes),
      entry("b", "w3", Side.Yes),
      entry("a", "w2", Side.Yes),
      entry("a", "w1", Side.Yes),
      entry("a", "w0", Side.No),
    ];
    const rows = pointsTable(events, now);
    expect(rows.map((r) => [r.wallet, r.points])).toEqual([
      ["w3", 2],
      ["w1", 1],
      ["w2", 1],
      ["w0", 0],
    ]);
    expect(ranksOf(rows)).toEqual([1, 2, 2, null]);
  });
});
