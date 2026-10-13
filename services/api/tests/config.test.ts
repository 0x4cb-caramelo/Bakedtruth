/**
 * Purpose: the read API's settings: the refusals (no RPC URL, a public bind, an unknown cluster) and the defaults,
 *          since Sprint 13 the leaderboard's and since Sprint 08's second part the names file and the display price's
 *          interval (a Pyth price every 3 minutes); since the third part, K-11's entries switch (on, off, nothing else).
 *          Moved from api.test.ts.
 * Version: 0.3.0 (the entries switch; 0.2.0, 2b: no CoinGecko settings)
 * Sprint:  08 (indexer and API)
 */
import { describe, expect, test } from "bun:test";

import { loadApiConfig } from "../src/config";

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
      historyRpcUrl: null,
      // Sprint 08: the repository's names file and a Pyth price every 3 minutes.
      namesFile: expect.stringMatching(/content\/account-names\.json$/),
      priceRefreshMs: 180_000,
      // Sprint 08's third part: K-11's switch is on unless the operator turns it off.
      entriesSwitch: true,
    });
  });

  test("the entries switch is on or off; anything else stops the start", () => {
    const base = { API_RPC_URL: "https://rpc.example.test" };
    expect(loadApiConfig({ ...base, API_ENTRIES_ALLOWED: "off" }).entriesSwitch).toBe(false);
    expect(loadApiConfig({ ...base, API_ENTRIES_ALLOWED: "on" }).entriesSwitch).toBe(true);
    expect(() => loadApiConfig({ ...base, API_ENTRIES_ALLOWED: "false" })).toThrow("API_ENTRIES_ALLOWED");
  });
});
