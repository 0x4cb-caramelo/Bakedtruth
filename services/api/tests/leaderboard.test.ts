/**
 * Purpose: the leaderboard route's contract with fake data and no cluster (Sprint 13): 503 until the program's history
 *          has been read (or with no history at all), what health says about that history, a live account's result
 *          counted only once it is final (the window ended uncontested; a YES price campaign only once settling, since
 *          its late joins are known then), the paging of the ranked rows with no success rate, the hide list applied
 *          before ranking, and the table kept until something changes. The route takes no wallet (the privacy
 *          review). The rule itself is tests/sdk/points.test.ts; the whole chain is tests/api/leaderboard.test.ts.
 * Version: 0.2.0 (the Sprint 13 reviews)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { describe, expect, test } from "bun:test";
import { Outcome, ReaderKind, Side, Status, type DecodedEvent } from "@brot/sdk/read";

import { createHidden, parseHidden, type Hidden } from "../src/hidden";
import type { History } from "../src/history";
import { createBoard, nowOf } from "../src/leaderboard";
import { createHandler } from "../src/routes";
import type { Row, Snapshot } from "../src/snapshot";
import type { Store } from "../src/store";

const CHAIN = { slot: 900n, epoch: 9n, unixTimestamp: 1_800_000_000n };
const ADDR = (n: number) => `${"1".repeat(31)}${n}`;
const WALLET = (n: number) => `${"9".repeat(31)}${n}`;
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
const row = (n: number, outcome: Outcome, v: Row["view"], kind = ReaderKind.SupplyAtMost): Row =>
  ({ address: ADDR(n), campaign: { outcome, kind, status: Status.InReview }, view: v }) as unknown as Row;

const entry = (campaign: string, baker: string, side: Side, n: number) =>
  ({
    name: "EntryAdded",
    discriminator: 5,
    data: { campaign, baker, side, amount: 10_000_000n, seq: 0n, isFirst: false },
    key: { signature: `s${n}`, ixIndex: 0, innerIndex: 0 },
    slot: BigInt(n),
    blockTime: null,
  }) as unknown as DecodedEvent;

const history = (events: DecodedEvent[], ready = true, complete = true, version = 1): History => ({
  events: () => events,
  version: () => version,
  ready: () => ready,
  complete: () => complete,
  skipped: () => 0,
  refresh: async () => {},
});
const hideOnly = (wallets: string[]): Hidden => ({
  current: () => new Set(wallets),
  version: () => wallets.length,
  lastError: () => null,
  refresh: () => {},
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
const call = async (h: History | undefined, path: string, hidden?: Hidden) => {
  const res = await createHandler(store, { corsOrigin: "*", cluster: "devnet", history: h, hidden })(
    new Request(`http://api.test${path}`),
  );
  return { status: res.status, body: (await res.json()) as any };
};

const EVENTS = [
  entry(ADDR(1), WALLET(1), Side.Yes, 1),
  entry(ADDR(2), WALLET(1), Side.No, 2),
  entry(ADDR(3), WALLET(2), Side.No, 3),
  entry(ADDR(3), WALLET(3), Side.No, 4),
  entry(ADDR(1), WALLET(3), Side.Yes, 5),
];

describe("leaderboard route", () => {
  test("503 with no history, or before its first read; health says so", async () => {
    expect((await call(undefined, "/api/v1/leaderboard")).status).toBe(503);
    expect((await call(history([], false), "/api/v1/leaderboard")).status).toBe(503);
    expect((await call(undefined, "/api/v1/health")).body.leaderboard_complete).toBeNull();
    const health = (await call(history([], true, false), "/api/v1/health")).body;
    expect([health.leaderboard_complete, health.leaderboard_skipped]).toEqual([false, 0]);
  });

  test("a live result counts once final; a YES price result only once settling; never while contested", () => {
    expect(nowOf(SNAP.rows[0]).final).toBe(true);
    expect(nowOf(SNAP.rows[1]).final).toBe(false);
    expect(nowOf(SNAP.rows[2]).final).toBe(true);
    expect(nowOf(row(4, Outcome.Yes, view("InReview", { windowEnded: true, contested: true }))).final).toBe(false);
    const priceYes = (state: string) => row(5, Outcome.Yes, view(state, { windowEnded: true }), ReaderKind.PriceTouch);
    expect(nowOf(priceYes("InReview")).final).toBe(false); // its late joins are known only once tallied
    expect(nowOf(priceYes("Paid")).final).toBe(true);
    expect(nowOf(row(6, Outcome.No, view("InReview", { windowEnded: true }), ReaderKind.PriceTouch)).final).toBe(true);
  });

  test("ranks only wallets with points, in pages, with no success rate, and takes no wallet", async () => {
    const { status, body } = await call(history(EVENTS), "/api/v1/leaderboard?limit=1&offset=1");
    expect(status).toBe(200);
    expect(body.total).toBe(3);
    expect(body.rows).toEqual([{ rank: 2, wallet: WALLET(1), points: 1, entered: 2 }]);
    expect(body.complete).toBe(true);
    expect(body.as_of_slot).toBe("900");
    const all = (await call(history(EVENTS), "/api/v1/leaderboard")).body.rows;
    expect(all.map((r: any) => [r.wallet, r.points, r.rank])).toEqual([
      [WALLET(3), 2, 1],
      [WALLET(1), 1, 2],
      [WALLET(2), 1, 2],
    ]);
    expect((await call(history(EVENTS), `/api/v1/leaderboard?wallet=${WALLET(1)}`)).status).toBe(400);
  });

  test("a wallet on the hide list is left out before ranking, and the others close ranks over it", async () => {
    const rows = (await call(history(EVENTS), "/api/v1/leaderboard", hideOnly([WALLET(3)]))).body.rows;
    expect(rows).toEqual([
      { rank: 1, wallet: WALLET(1), points: 1, entered: 2 },
      { rank: 1, wallet: WALLET(2), points: 1, entered: 1 },
    ]);
  });

  test("the hide list file: base58 addresses only, a missing file hides nobody, a bad file keeps the last list", () => {
    expect(parseHidden(JSON.stringify([WALLET(1)]))).toEqual([WALLET(1)]);
    for (const bad of ["{}", '["not an address"]', "[1]", "nope"]) expect(() => parseHidden(bad)).toThrow();
    const none = createHidden(null);
    none.refresh();
    expect(none.current().size).toBe(0);
    const missing = createHidden(`${import.meta.dir}/no-such-file.json`);
    missing.refresh();
    expect([missing.current().size, missing.lastError()]).toEqual([0, null]);
    const bad = createHidden(import.meta.path); // a TypeScript file is not a JSON array
    bad.refresh();
    expect([bad.current().size, bad.lastError()]).toEqual([0, "SyntaxError"]);
  });

  test("the table is computed once until the history, the snapshot or the hide list changes", () => {
    let reads = 0;
    const h = history(EVENTS);
    const counted: History = { ...h, events: () => (reads++, h.events()) };
    const board = createBoard(counted);
    board(SNAP);
    board(SNAP);
    expect(reads).toBe(1);
    board({ ...SNAP, takenAt: "later" });
    expect(reads).toBe(2);
  });
});
