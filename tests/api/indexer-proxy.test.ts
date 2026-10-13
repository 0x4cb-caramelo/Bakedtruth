/**
 * Purpose: the indexer's read routes through the read API (the founder's routing answer (a), 2026-10-13; Sprint 08),
 *          against a fake indexer on a free loopback port: each of the five routes is forwarded with its query, and
 *          nothing else is (an unlisted path is the API's 404, the campaign route stays the API's); HEAD passes, POST
 *          is the API's 405; the indexer's status, body, content-type and cache-control come back, with the API's own
 *          CORS and none of the indexer's other headers; no cookie, authorization or client address reaches it; a slow
 *          indexer is a 504, a down one a 503, an answer over the cap a 502, `off` a 503, each in the API's error
 *          shape without the indexer's address.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { afterAll, describe, expect, test } from "bun:test";

import { createIndexerProxy } from "../../services/api/src/indexer-proxy";
import { createHandler } from "../../services/api/src/routes";
import type { Store } from "../../services/api/src/store";

const C = "Vote111111111111111111111111111111111111111";
const W = "Stake11111111111111111111111111111111111111";
const seen: { path: string; method: string; headers: Record<string, string> }[] = [];

const indexer = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request) {
    const url = new URL(request.url);
    seen.push({ path: `${url.pathname}${url.search}`, method: request.method, headers: request.headers.toJSON() });
    const q = url.searchParams;
    if (q.has("slow")) await Bun.sleep(400);
    if (q.has("big")) return new Response("x".repeat(2_000), { headers: { "content-type": "text/plain" } });
    if (q.has("stream")) {
      let chunks = 0; // five chunks of 600 bytes and no content-length: counted as they come
      const pull = (c: ReadableStreamDefaultController<Uint8Array>) =>
        ++chunks > 5 ? c.close() : c.enqueue(new TextEncoder().encode("y".repeat(600)));
      return new Response(new ReadableStream({ pull }));
    }
    const status = Number(q.get("status") ?? 200);
    const body =
      status === 200 ? { path: url.pathname } : { error: { code: `c${status}`, message: "from the indexer" } };
    return Response.json(body, {
      status,
      headers: {
        "cache-control": status === 200 ? "public, max-age=0, s-maxage=5" : "no-store",
        "access-control-allow-origin": "*",
        "set-cookie": "indexer=1",
        "x-indexer-internal": "1",
      },
    });
  },
});
const down = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response("") });
const downPort = down.port;
down.stop(true);
afterAll(() => indexer.stop(true));

const store: Store = { current: () => null, lastError: () => null, refresh: async () => {} };
const CORS = "https://brot.markets";
const base = `http://127.0.0.1:${indexer.port}`;
const api = (proxyBase: string | null = base, withProxy = true) =>
  createHandler(store, {
    corsOrigin: CORS,
    cluster: "devnet",
    ...(withProxy ? { indexer: createIndexerProxy(proxyBase, { timeoutMs: 150, maxBytes: 1_000 }) } : {}),
  });
const call = (path: string, init?: RequestInit, handler = api()) =>
  handler(new Request(`http://api.test${path}`, init));
const ROUTES = [
  "/api/v1/activity?limit=5",
  "/api/v1/ranking?listed=true&limit=2&offset=1",
  `/api/v1/wallets/${W}/entries`,
  `/api/v1/campaigns/${C}/activity?opening=1`,
  `/api/v1/campaigns/${C}/chance`,
];

describe("the indexer's routes through the read API", () => {
  test("each route goes through with its query; status, body, type and cache come back, with the API's CORS", async () => {
    for (const path of ROUTES) {
      const before = seen.length;
      const res = await call(path);
      expect([path, res.status, await res.json()]).toEqual([path, 200, { path: path.split("?")[0] }]);
      expect(seen.slice(before).map((s) => s.path)).toEqual([path]);
      expect(res.headers.get("content-type")).toContain("application/json");
      expect(res.headers.get("cache-control")).toBe("public, max-age=0, s-maxage=5");
      expect(res.headers.get("access-control-allow-origin")).toBe(CORS);
      expect([res.headers.get("set-cookie"), res.headers.get("x-indexer-internal")]).toEqual([null, null]);
    }
  });

  test("only those routes: an unlisted path is the API's 404, the campaign route the API's own", async () => {
    const before = seen.length;
    for (const path of [
      "/api/v1/activity/",
      "/api/v1/activities",
      "/api/v1/rankings",
      `/api/v1/wallets/${W}`,
      `/api/v1/wallets/${W}/entries/more`,
      `/api/v1/campaigns/${C}/other`,
      "/api/v1/campaigns/0OIl0OIl0OIl0OIl0OIl0OIl0OIl0OIl0OIl/chance",
    ]) {
      const res = await call(path);
      expect([path, res.status, ((await res.json()) as { error: { code: string } }).error.code]).toEqual([
        path,
        404,
        "not_found",
      ]);
    }
    expect((await call(`/api/v1/campaigns/${C}`)).status).toBe(503); // the API's detail route, before its first read
    expect(seen.length).toBe(before);
  });

  test("HEAD passes; POST is the API's 405; the indexer's 400, 404 and 500 come back as they are", async () => {
    const head = await call("/api/v1/activity", { method: "HEAD" });
    expect([head.status, await head.text(), seen.at(-1)?.method]).toEqual([200, "", "HEAD"]);
    const before = seen.length;
    expect((await call("/api/v1/activity", { method: "POST" })).status).toBe(405);
    expect(seen.length).toBe(before);
    for (const status of [400, 404, 500]) {
      const res = await call(`/api/v1/ranking?status=${status}`);
      expect([res.status, await res.json()]).toEqual([
        status,
        { error: { code: `c${status}`, message: "from the indexer" } },
      ]);
    }
  });

  test("no cookie, authorization or client address reaches the indexer; `accept` does", async () => {
    await call("/api/v1/activity", {
      headers: {
        accept: "application/json",
        cookie: "session=1",
        authorization: "Bearer secret",
        "cf-connecting-ip": "203.0.113.9",
        "x-forwarded-for": "203.0.113.9",
        "x-real-ip": "203.0.113.9",
      },
    });
    const sent = seen.at(-1)!.headers;
    expect(sent.accept).toBe("application/json");
    const forbidden = ["cookie", "authorization", "cf-connecting-ip", "x-forwarded-for", "x-real-ip"];
    expect(Object.keys(sent).filter((name) => forbidden.includes(name))).toEqual([]);
    expect(JSON.stringify(sent)).not.toContain("203.0.113.9");
  });

  test("slow, down, too large or off: 504, 503, 502, 503, in the API's shape, never the indexer's address", async () => {
    const cases: [string, ReturnType<typeof api>, number, string][] = [
      ["/api/v1/activity?slow=1", api(), 504, "indexer_timeout"],
      ["/api/v1/activity", api(`http://127.0.0.1:${downPort}`), 503, "indexer_unavailable"],
      ["/api/v1/activity?big=1", api(), 502, "indexer_too_large"],
      ["/api/v1/activity?stream=1", api(), 502, "indexer_too_large"],
      ["/api/v1/activity", api(null), 503, "indexer_unavailable"],
      [`/api/v1/campaigns/${C}/chance`, api(base, false), 503, "indexer_unavailable"],
    ];
    for (const [path, handler, status, code] of cases) {
      const res = await call(path, undefined, handler);
      const text = await res.text();
      expect([path, res.status, (JSON.parse(text) as { error: { code: string } }).error.code]).toEqual([
        path,
        status,
        code,
      ]);
      expect([res.headers.get("cache-control"), res.headers.get("access-control-allow-origin")]).toEqual([
        "no-store",
        CORS,
      ]);
      expect(text).not.toContain("127.0.0.1");
    }
  });
});
