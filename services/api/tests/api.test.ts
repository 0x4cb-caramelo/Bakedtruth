/**
 * Purpose: the read API's contract with fake data and no cluster: the list's filters and paging, the 400 and 404
 *          answers, the detail route, CORS, the method refusal, the health states, the store's refresh failure (the
 *          last good snapshot is kept, and only an error name is shown), and the config's refusals.
 * Version: 0.1.0
 * Sprint:  08 (indexer and API, hackathon MVP)
 */
import { describe, expect, test } from "bun:test";
import { Outcome, ReaderKind, Status, type Campaign, type PublicState } from "@brot/sdk/read";

import { loadApiConfig } from "../src/config";
import { createHandler } from "../src/routes";
import { createStore, type Store } from "../src/store";
import type { Snapshot, Row } from "../src/snapshot";

const ADDR = (n: number) => `${"1".repeat(31)}${n}`;
const CHAIN = { slot: 500n, epoch: 7n, unixTimestamp: 1_800_000_000n };

function row(n: number, state: PublicState, status: Status, outcome: Outcome): Row {
  const campaign = {
    id: BigInt(n),
    kind: ReaderKind.PriceTouch,
    status,
    outcome,
    direction: 0,
    creator: "creator1111111111111111111111111111",
    creatorIsTeam: true,
    poolYes: 1_000_000n,
    poolNo: 2_000_000n,
    prizeLamports: 3_000n,
    entriesCloseAt: 1_800_000_100n,
    deadlineAt: 1_800_500_000n,
    resolvedAt: 0n,
    target: 70_000n,
    metricAccount: "metric1111111111111111111111111111",
    feedId: new Uint8Array(32).fill(0xab),
    priceExponent: -8,
    opensAt: 1_799_000_000n,
    entriesOpen: 3,
    feeBps: 1000,
    oneSidedFeeBps: 100,
    creatorShareBps: 100,
  } as unknown as Campaign;
  const view = {
    state,
    closedBecause: null,
    contested: false,
    reviewEndsAt: null,
    windowEnded: false,
    settled: false,
    asOf: CHAIN,
  };
  return { address: ADDR(n) as Row["address"], campaign, view: view as Row["view"] };
}

const SNAP: Snapshot = {
  takenAt: "2026-10-10T06:00:00.000Z",
  asOfSlot: 500n,
  chain: CHAIN,
  rows: [
    row(1, "Open", Status.Open, Outcome.Unresolved),
    row(2, "InReview", Status.InReview, Outcome.Unresolved),
    row(3, "Paid", Status.Settled, Outcome.Yes),
  ],
};

function fakeStore(snapshot: Snapshot | null, error: string | null = null): Store {
  return { current: () => snapshot, lastError: () => error, refresh: async () => {} };
}

const handler = (store: Store) => createHandler(store, { corsOrigin: "https://site.example.test", cluster: "devnet" });
const get = (store: Store, path: string, init?: RequestInit) =>
  handler(store)(new Request(`http://api.test${path}`, init));
const body = async (res: Response) => (await res.json()) as any;

describe("health", () => {
  test("starting until the first snapshot, with 503", async () => {
    const res = await get(fakeStore(null), "/api/v1/health");
    expect(res.status).toBe(503);
    expect((await body(res)).status).toBe("starting");
  });

  test("ok with a snapshot, stale after a failed refresh", async () => {
    expect((await body(await get(fakeStore(SNAP), "/api/v1/health"))).status).toBe("ok");
    const stale = await body(await get(fakeStore(SNAP, "TypeError"), "/api/v1/health"));
    expect(stale.status).toBe("stale");
    expect(stale.last_refresh_error).toBe("TypeError");
  });
});

describe("campaign list", () => {
  test("lists every campaign with lamport strings and public state names", async () => {
    const data = await body(await get(fakeStore(SNAP), "/api/v1/campaigns"));
    expect(data.total).toBe(3);
    expect(data.as_of_slot).toBe("500");
    expect(data.campaigns.map((c: any) => c.state)).toEqual(["open", "in_review", "paid"]);
    expect(data.campaigns[0].pool_yes).toBe("1000000");
    expect(data.campaigns[0].kind).toBe("PriceTouch");
    expect(data.campaigns[2].outcome).toBe("Yes");
  });

  test("state=active and state=resolved group the public states", async () => {
    const active = await body(await get(fakeStore(SNAP), "/api/v1/campaigns?state=active"));
    expect(active.campaigns.map((c: any) => c.state)).toEqual(["open"]);
    const resolved = await body(await get(fakeStore(SNAP), "/api/v1/campaigns?state=resolved"));
    expect(resolved.campaigns.map((c: any) => c.state)).toEqual(["in_review", "paid"]);
  });

  test("pages with limit and offset, and the total counts the filter", async () => {
    const page = await body(await get(fakeStore(SNAP), "/api/v1/campaigns?limit=1&offset=1"));
    expect(page.total).toBe(3);
    expect(page.campaigns.map((c: any) => c.id)).toEqual(["2"]);
  });

  test("an unknown parameter, a bad state, or a bad limit is a 400 with a named code", async () => {
    for (const path of ["?sort=id", "?state=bet", "?limit=0", "?limit=101", "?offset=-1", "?limit=abc"]) {
      const res = await get(fakeStore(SNAP), `/api/v1/campaigns${path}`);
      expect(res.status).toBe(400);
      const err = (await body(res)).error;
      expect(err.code).toBe("bad_query");
      expect(err.message.length).toBeGreaterThan(0);
    }
  });

  test("503 before the first snapshot", async () => {
    expect((await get(fakeStore(null), "/api/v1/campaigns")).status).toBe(503);
  });
});

describe("campaign detail, routing and methods", () => {
  test("a known address returns its campaign; an unknown one is 404", async () => {
    const found = await body(await get(fakeStore(SNAP), `/api/v1/campaigns/${ADDR(2)}`));
    expect(found.campaign.state).toBe("in_review");
    const missing = await get(fakeStore(SNAP), `/api/v1/campaigns/${ADDR(9)}`);
    expect(missing.status).toBe(404);
    expect((await body(missing)).error.code).toBe("not_found");
  });

  test("other paths are 404; a POST is refused with 405", async () => {
    expect((await get(fakeStore(SNAP), "/api/v1/nope")).status).toBe(404);
    expect((await get(fakeStore(SNAP), "/api/v1/campaigns", { method: "POST" })).status).toBe(405);
  });

  test("the campaign carries the fields a card needs: feed, direction, exponent, fees and entries", async () => {
    const found = await body(await get(fakeStore(SNAP), `/api/v1/campaigns/${ADDR(1)}`));
    expect(found.campaign).toMatchObject({
      feed_id: "ab".repeat(32),
      direction: "Above",
      price_exponent: -8,
      opens_at: "1799000000",
      entries_count: 3,
      fee_bps: 1000,
      one_sided_fee_bps: 100,
      creator_share_bps: 100,
    });
  });

  test("every answer carries the configured CORS origin and no-store", async () => {
    const res = await get(fakeStore(SNAP), "/api/v1/campaigns");
    expect(res.headers.get("access-control-allow-origin")).toBe("https://site.example.test");
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});

describe("store refresh", () => {
  test("a failed refresh keeps the last good snapshot and records the error name only", async () => {
    let calls = 0;
    const store = createStore({} as never, async () => {
      calls++;
      if (calls === 1) return SNAP;
      throw Object.assign(new TypeError("fetch failed https://rpc.secret.example/?api-key=XYZ"), {});
    });
    await store.refresh();
    await store.refresh();
    expect(store.current()?.rows.length).toBe(3);
    expect(store.lastError()).toBe("TypeError");
    expect(JSON.stringify({ e: store.lastError() })).not.toContain("secret");
  });
});

describe("config", () => {
  test("needs the RPC URL; refuses a non-loopback host and an unknown cluster", () => {
    expect(() => loadApiConfig({})).toThrow("API_RPC_URL is not set");
    expect(() => loadApiConfig({ API_RPC_URL: "https://rpc.example.test", API_HOST: "0.0.0.0" })).toThrow("loopback");
    expect(() => loadApiConfig({ API_RPC_URL: "https://rpc.example.test", API_CLUSTER: "mainnet" })).toThrow(
      "devnet or local",
    );
  });

  test("defaults: loopback 4220, 15 s refresh, any origin (read-only), devnet, 200 history reads a refresh", () => {
    const c = loadApiConfig({ API_RPC_URL: "https://rpc.example.test" });
    expect(c).toEqual({
      rpcUrl: "https://rpc.example.test",
      host: "127.0.0.1",
      port: 4220,
      refreshMs: 15_000,
      corsOrigin: "*",
      cluster: "devnet",
      historyPerRefresh: 200,
      hiddenFile: null,
    });
  });
});
