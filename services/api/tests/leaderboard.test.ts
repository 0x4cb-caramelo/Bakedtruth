/**
 * Purpose: the leaderboard route's contract with fake data and no cluster (Sprint 13): 503 until the program's history
 *          has been read (or with no history at all), what health says about that history, a live account's result
 *          counted only once it is final (the review window ended uncontested, or settling), and the paging of the
 *          ranked rows; the route takes no wallet (the privacy review). The rule itself is tests/sdk/points.test.ts; the whole chain is tests/api/leaderboard.test.ts.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { describe, expect, test } from "bun:test";
import { Outcome, Side, Status, type DecodedEvent } from "@brot/sdk/read";

import type { History } from "../src/history";
import { nowOf } from "../src/leaderboard";
import { createHandler } from "../src/routes";
import type { Row, Snapshot } from "../src/snapshot";
import type { Store } from "../src/store";

const CHAIN = { slot: 900n, epoch: 9n, unixTimestamp: 1_800_000_000n };
const ADDR = (n: number) => `${"1".repeat(31)}${n}`;
const view = (state: string, more: Record<string, unknown> = {}) =>
  ({
    state,
    closedBecause: null,
    contested: false,
    reviewEndsAt: null,
    windowEnded: false,
    settled: false,
    ...more,
  }) as unknown as Row["view"];
const row = (n: number, outcome: Outcome, v: Row["view"]): Row =>
  ({ address: ADDR(n), campaign: { outcome, status: Status.InReview }, view: v }) as unknown as Row;

const entry = (campaign: string, baker: string, side: Side, n: number) =>
  ({
    name: "EntryAdded",
    discriminator: 5,
    data: { campaign, baker, side, amount: 10_000_000n, seq: 0n, isFirst: false },
    key: { signature: `s${n}`, ixIndex: 0, innerIndex: 0 },
    slot: BigInt(n),
    blockTime: null,
  }) as unknown as DecodedEvent;

const history = (events: DecodedEvent[], ready = true, complete = true): History => ({
  events: () => events,
  ready: () => ready,
  complete: () => complete,
  refresh: async () => {},
});

const SNAP: Snapshot = {
  takenAt: "2026-10-10T06:00:00.000Z",
  asOfSlot: 900n,
  chain: CHAIN,
  rows: [
    row(1, Outcome.Yes, view("InReview", { windowEnded: true })),
    row(2, Outcome.No, view("InReview", { windowEnded: false })),
    row(3, Outcome.No, view("Paid")),
  ],
};
const store: Store = { current: () => SNAP, lastError: () => null, refresh: async () => {} };
const call = async (h: History | undefined, path: string) => {
  const res = await createHandler(store, { corsOrigin: "*", cluster: "devnet", history: h })(
    new Request(`http://api.test${path}`),
  );
  return { status: res.status, body: (await res.json()) as any };
};

const EVENTS = [
  entry(ADDR(1), "ana", Side.Yes, 1),
  entry(ADDR(2), "ana", Side.No, 2),
  entry(ADDR(3), "bia", Side.No, 3),
  entry(ADDR(3), "caio", Side.No, 4),
  entry(ADDR(1), "caio", Side.Yes, 5),
];

describe("leaderboard route", () => {
  test("503 with no history, or before its first read; health says so", async () => {
    expect((await call(undefined, "/api/v1/leaderboard")).status).toBe(503);
    expect((await call(history([], false), "/api/v1/leaderboard")).status).toBe(503);
    expect((await call(undefined, "/api/v1/health")).body.leaderboard_complete).toBeNull();
    expect((await call(history([], true, false), "/api/v1/health")).body.leaderboard_complete).toBe(false);
  });

  test("a live result counts once final: window ended uncontested, or settling; never while contested", () => {
    expect(nowOf(SNAP.rows[0]).final).toBe(true);
    expect(nowOf(SNAP.rows[1]).final).toBe(false);
    expect(nowOf(SNAP.rows[2]).final).toBe(true);
    expect(nowOf(row(4, Outcome.Yes, view("InReview", { windowEnded: true, contested: true }))).final).toBe(false);
  });

  test("ranks only wallets with points, pages them, and answers a wallet's own line", async () => {
    const { status, body } = await call(history(EVENTS), "/api/v1/leaderboard?limit=1&offset=1");
    expect(status).toBe(200);
    expect(body.total).toBe(3);
    expect(body.rows).toEqual([{ rank: 2, wallet: "ana", points: 1, entered: 2, decided: 1 }]);
    expect(body.you).toBeUndefined(); // the route takes no wallet: a page finds its own line
    expect((await call(history(EVENTS), "/api/v1/leaderboard?wallet=ana")).status).toBe(400);
    expect(body.complete).toBe(true);
    expect(body.as_of_slot).toBe("900");
    const all = (await call(history(EVENTS), "/api/v1/leaderboard")).body.rows;
    expect(all.map((r: any) => [r.wallet, r.points, r.rank])).toEqual([
      ["caio", 2, 1],
      ["ana", 1, 2],
      ["bia", 1, 2],
    ]);
  });
});
