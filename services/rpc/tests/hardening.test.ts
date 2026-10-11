/**
 * Purpose: the fixes of the Sprint 08 security review, each tested: a hostile option value is refused, never converted
 *          (M1, L1), and any throw is a JSON-RPC error with no detail; the tunnel's secret header (M4); one IPv6 /48
 *          bounded as eight clients, whatever its /64s (M3); the upstream URL read from a credential file, which wins
 *          over the variable (M6); no "*" CORS origin (L3); and, in the read API, a state named after an Object member
 *          refused as a bad query, any throw answered as a JSON 500 (M2). Filter: `bun test services/rpc`.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { describe, expect, test } from "bun:test";

import { createHandler } from "../../api/src/routes";
import { loadRelayConfig } from "../src/config";
import { CODE, createRelay } from "../src/relay";
import { ADDR, setup } from "./kit";

const SECRET = "s".repeat(40);

describe("the security review's fixes", () => {
  test("a hostile option value is refused, never converted; a throw anywhere is a bare JSON-RPC error", async () => {
    const r = setup();
    const refused = [
      ["getBalance", [ADDR, { commitment: { toString: 1 } }]],
      ["getBalance", [ADDR, { minContextSlot: { evil: 1 } }]],
      ["getSignatureStatuses", [["1".repeat(88)], { searchTransactionHistory: "yes" }]],
      ["sendTransaction", ["AAAA", { encoding: "base64", maxRetries: 99 }]],
      ["getTransaction", ["1".repeat(88), { maxSupportedTransactionVersion: 1 }]],
    ] as const;
    for (const [method, params] of refused)
      expect(`${method}: ${(await r.call(method, [...params])).json.error.code}`).toBe(`${method}: ${CODE.params}`);
    expect(r.calls).toEqual([]);
    // The upstream throwing is its own guard's (502, no detail); any other throw is the catch-all's (500, no detail).
    const down = setup({
      answer: () => {
        throw new TypeError("boom at /srv/brot-markets/rpc");
      },
    });
    const late = await down.call("getBlockHeight", []);
    expect([late.status, late.json.error.code, JSON.stringify(late.json).includes("/srv")]).toEqual([
      502,
      -32000,
      false,
    ]);
    const relay = createRelay({
      config: loadRelayConfig({ RELAY_UPSTREAM_URL: "https://u.test" }),
      programData: ADDR,
      upstream: async () => ({ status: 200, text: "{}" }),
      limiter: {
        take: () => {
          throw new Error("at /srv/brot-markets/rpc");
        },
        size: () => 0,
        sweep: () => {},
      },
      budget: { spend: () => true, left: () => 1 },
      cache: { get: () => undefined, set: () => {}, size: () => 0, sweep: () => {} },
    });
    const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBlockHeight", params: [] });
    const crashed = await relay(new Request("http://relay.test/rpc", { method: "POST", body }));
    const text = await crashed.text();
    expect([crashed.status, JSON.parse(text).error.code, text.includes("/srv")]).toEqual([500, -32603, false]);
  });

  test("with the tunnel's secret set, a call without it, or with another, is refused before anything else", async () => {
    const r = setup({ env: { RELAY_TUNNEL_SECRET: SECRET } });
    expect((await r.call("getBlockHeight", [])).status).toBe(403);
    expect((await r.call("getBlockHeight", [], { "x-brot-tunnel": "s".repeat(39) + "t" })).status).toBe(403);
    expect((await r.call("getBlockHeight", [], { "x-brot-tunnel": SECRET })).status).toBe(200);
    expect(r.calls.length).toBe(1);
    expect(() => loadRelayConfig({ RELAY_UPSTREAM_URL: "https://u.test", RELAY_TUNNEL_SECRET: "short" })).toThrow("32");
  });

  test("one IPv6 /48 is bounded as eight clients, however many /64s it rotates through", async () => {
    const r = setup({ env: { RELAY_BURST: "2", RELAY_RATE_PER_SECOND: "1" } });
    let ok = 0;
    for (let i = 0; i < 40; i++)
      if (
        (await r.call("getBlockHeight", [], { "cf-connecting-ip": `2001:db8:0:${i.toString(16)}::1` })).status === 200
      )
        ok++;
    expect(ok).toBe(16);
  });

  test("the upstream URL from a credential file wins over the variable; no CORS origin of *", () => {
    const read = (path: string) =>
      path === "/run/credentials/brot-rpc/upstream-url" ? "https://file.example.test/?k=1\n" : "";
    const c = loadRelayConfig(
      {
        RELAY_UPSTREAM_URL: "https://env.example.test",
        RELAY_UPSTREAM_URL_FILE: "/run/credentials/brot-rpc/upstream-url",
      },
      read,
    );
    expect(c.upstreamUrl).toBe("https://file.example.test/?k=1");
    expect(() => loadRelayConfig({ RELAY_UPSTREAM_URL: "https://u.test", RELAY_CORS_ORIGIN: "*" })).toThrow("never *");
  });

  test("the read API: a state named after an Object member is a 400; any throw is a JSON 500, never a stack", async () => {
    const snap = { asOfSlot: 1n, chain: { unixTimestamp: 1n }, rows: [] } as never;
    const store = { current: () => snap, lastError: () => null, refresh: async () => {} };
    const handle = createHandler(store, { corsOrigin: "*", cluster: "devnet" });
    for (const state of ["constructor", "__proto__", "toString"]) {
      const res = await handle(new Request(`http://api.test/api/v1/campaigns?state=${state}`));
      expect(`${state}: ${res.status}`).toBe(`${state}: 400`);
    }
    const throwing = {
      current: () => {
        throw new Error("at /srv/brot-markets/api");
      },
      lastError: () => null,
      refresh: async () => {},
    };
    const res = await createHandler(throwing as never, { corsOrigin: "*", cluster: "devnet" })(
      new Request("http://api.test/api/v1/campaigns"),
    );
    expect([res.status, await res.json()]).toEqual([
      500,
      { error: { code: "internal", message: "the request could not be answered" } },
    ]);
  });
});
