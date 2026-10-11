/**
 * Purpose: the read API's settings: the refusals (no RPC URL, a public bind, an unknown cluster, a bad switch or plan)
 *          and the defaults, since Sprint 13 the leaderboard's and since Sprint 08's second part the names file and
 *          the display price's (CoinGecko keyless on the Demo plan's root, a price every 3 minutes). Moved from
 *          api.test.ts.
 * Version: 0.1.0
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
      // Sprint 08: the repository's names file, a price every 3 minutes, CoinGecko keyless on the Demo plan's root.
      namesFile: expect.stringMatching(/content\/account-names\.json$/),
      priceRefreshMs: 180_000,
      coingecko: false, // off by the legal review of 2026-10-11
      coingeckoKey: null,
      coingeckoPlan: "demo",
    });
    expect(() => loadApiConfig({ API_RPC_URL: "https://rpc.example.test", API_COINGECKO: "yes" })).toThrow("on or off");
    expect(() => loadApiConfig({ API_RPC_URL: "https://rpc.example.test", API_COINGECKO_PLAN: "free" })).toThrow(
      "demo or pro",
    );
  });
});
