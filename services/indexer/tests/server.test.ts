/**
 * Purpose: the indexer's settings and its server (Sprint 08, slice 2): the read routes listen on loopback port 4201
 *          unless told otherwise, a bad port is refused at start, and the running server answers `/healthz` with how
 *          fresh the file is, a route with its CORS header, and an unknown path with a JSON 404.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points), slice 2
 */
import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { serveApi } from "../src/api/server";
import { loadIndexerConfig } from "../src/config";
import { openStore } from "../src/db/store";

const BASE = { INDEXER_RPC_URL: "https://api.devnet.solana.com", INDEXER_DB_PATH: "/tmp/x.sqlite" };

describe("the indexer's settings and server", () => {
  test("the read routes listen on loopback port 4201 by default; a bad port stops the start", () => {
    expect(loadIndexerConfig(BASE)).toMatchObject({ apiHost: "127.0.0.1", apiPort: 4201, corsOrigin: "*" });
    expect(loadIndexerConfig({ ...BASE, INDEXER_API_PORT: "4301" }).apiPort).toBe(4301);
    expect(() => loadIndexerConfig({ ...BASE, INDEXER_API_PORT: "http" })).toThrow("INDEXER_API_PORT");
  });

  const dir = mkdtempSync(join(tmpdir(), "brot-indexer-server-"));
  const store = openStore(join(dir, "index.sqlite"));
  const server = serveApi(store, { hostname: "127.0.0.1", port: 0 }, { corsOrigin: "https://brot.markets" });
  afterAll(() => (server.stop(true), store.close(), rmSync(dir, { recursive: true, force: true })));
  const url = (path: string) => `http://127.0.0.1:${server.port}${path}`;

  test("it answers its health, a route with CORS, and an unknown path with a JSON 404", async () => {
    expect(await (await fetch(url("/healthz"))).json()).toEqual({ status: "ok", as_of_slot: "0", chain_time: null });
    const recent = await fetch(url("/api/v1/activity"));
    expect(recent.headers.get("access-control-allow-origin")).toBe("https://brot.markets");
    expect(await recent.json()).toEqual({ as_of_slot: "0", chain_time: null, items: [] });
    const missing = await fetch(url("/nothing"));
    expect([missing.status, (await missing.json()).error.code]).toEqual([404, "not_found"]);
  });
});
