/**
 * Purpose: the indexer's settings and its server (Sprint 08, slices 2 and 3): the read routes listen on loopback port
 *          4201 unless told otherwise, and only on loopback; a bad port is refused at start; the RPC and WebSocket URLs
 *          come from credential files when named (the file wins), the WebSocket one is the RPC's over ws(s) unless set
 *          or `off`, and a refused URL is never quoted; the running server answers `/healthz` with how fresh the file
 *          is and the process's own state, a route with its CORS header, and an unknown path with a JSON 404.
 * Version: 0.2.0 (slice 3: credentials, the WebSocket URL, loopback only, the process's health)
 * Sprint:  08 (indexer, API, relay and points), slices 2 and 3
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
    expect(() => loadIndexerConfig({ ...BASE, INDEXER_API_HOST: "0.0.0.0" })).toThrow("loopback");
    expect(loadIndexerConfig(BASE)).toMatchObject({ pollMs: 15_000, feedPollMs: 15_000 });
    expect(loadIndexerConfig(BASE).partnersFile.endsWith("content/partners.json")).toBe(true);
  });

  test("secrets from credential files; the WebSocket URL from the RPC's unless set; a bad URL never quoted", () => {
    const files: Record<string, string> = {
      "/cred/rpc": "https://rpc.example/?api-key=SECRET\n",
      "/cred/ws": "wss://ws.example/x",
    };
    const read = (path: string) => files[path];
    const keyed = {
      INDEXER_DB_PATH: "/tmp/x.sqlite",
      INDEXER_RPC_URL_FILE: "/cred/rpc",
      INDEXER_RPC_URL: "http://ignored",
    };
    expect(loadIndexerConfig(keyed, read)).toMatchObject({
      rpcUrl: "https://rpc.example/?api-key=SECRET",
      wsUrl: "wss://rpc.example/?api-key=SECRET",
    });
    expect(loadIndexerConfig({ ...keyed, INDEXER_WS_URL_FILE: "/cred/ws" }, read).wsUrl).toBe("wss://ws.example/x");
    expect(loadIndexerConfig({ ...BASE, INDEXER_RPC_URL: "http://127.0.0.1:8899" }).wsUrl).toBe("ws://127.0.0.1:8899");
    expect(loadIndexerConfig({ ...BASE, INDEXER_WS_URL: "off" }).wsUrl).toBeNull();
    for (const [env, name] of [
      [{ ...BASE, INDEXER_RPC_URL: "ftp://secret-host/key" }, "INDEXER_RPC_URL"],
      [{ ...BASE, INDEXER_WS_URL: "https://secret-host/key" }, "INDEXER_WS_URL"],
      [{ ...BASE, INDEXER_RPC_URL: "not a url secret-key" }, "INDEXER_RPC_URL"],
    ] as const) {
      expect(() => loadIndexerConfig(env)).toThrow(name);
      expect(() => loadIndexerConfig(env)).not.toThrow("secret");
    }
    expect(() => loadIndexerConfig({ INDEXER_DB_PATH: "/tmp/x.sqlite" })).toThrow("INDEXER_RPC_URL is not set");
  });

  const dir = mkdtempSync(join(tmpdir(), "brot-indexer-server-"));
  const store = openStore(join(dir, "index.sqlite"));
  const health = () => ({ last_refresh_error: null, logs: "subscribed" });
  const server = serveApi(store, { hostname: "127.0.0.1", port: 0 }, { corsOrigin: "https://brot.markets", health });
  afterAll(() => (server.stop(true), store.close(), rmSync(dir, { recursive: true, force: true })));
  const url = (path: string) => `http://127.0.0.1:${server.port}${path}`;

  test("it answers its health, a route with CORS, and an unknown path with a JSON 404", async () => {
    expect(await (await fetch(url("/healthz"))).json()).toEqual({
      ...{ status: "ok", as_of_slot: "0", chain_time: null },
      ...{ last_refresh_error: null, logs: "subscribed" },
    });
    const recent = await fetch(url("/api/v1/activity"));
    expect(recent.headers.get("access-control-allow-origin")).toBe("https://brot.markets");
    expect(await recent.json()).toEqual({ as_of_slot: "0", chain_time: null, items: [] });
    const missing = await fetch(url("/nothing"));
    expect([missing.status, (await missing.json()).error.code]).toEqual([404, "not_found"]);
  });
});
