/**
 * Purpose: brot-rpc's gates on transactions and clients (Sprint 08; X1.7): a transaction carries only this program,
 *          ComputeBudget and Lighthouse at its top level, never a System transfer or a program named through a lookup
 *          table; a join or an opening from a country on GEO_BLOCK_COUNTRIES is refused, and with the list empty, the
 *          default for now, nothing is (the founder, 2026-10-11); the token bucket per IP and per IPv6 /64 refills with
 *          time, and the sweep forgets an idle client within a minute (the legal review, R1); the daily budget stops the
 *          relay's spending, and a cached answer spends none; the settings' refusals.
 *          Filter: `bun test services/rpc`.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { describe, expect, test } from "bun:test";
import {
  COMPUTE_BUDGET_PROGRAM_ID,
  INSTRUCTION_DISCRIMINATOR as D,
  LIGHTHOUSE_PROGRAM_ID,
  PROGRAM_ID,
  SPL_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from "@brot/sdk/read";

import { loadRelayConfig } from "../src/config";
import { clientKey, createBudget, createCache, createLimiter, IDLE_MS } from "../src/limits";
import { REFUSED } from "../src/relay";
import { checkTransaction } from "../src/transaction";
import { ix, setup, wire } from "./kit";

const SEND = { encoding: "base64" };
const join = wire([ix(COMPUTE_BUDGET_PROGRAM_ID, 2), ix(PROGRAM_ID, D.userJoinCampaign)]);

describe("brot-rpc's gates", () => {
  test("a transaction carries only this program, ComputeBudget and Lighthouse at its top level", () => {
    expect(checkTransaction(join)).toEqual({ ok: true, joinsOrOpens: true });
    expect(checkTransaction(wire([ix(PROGRAM_ID, D.userOpenCampaign)]))).toEqual({ ok: true, joinsOrOpens: true });
    expect(checkTransaction(wire([ix(PROGRAM_ID, 12), ix(LIGHTHOUSE_PROGRAM_ID, 0)]))).toEqual({
      ok: true,
      joinsOrOpens: false,
    });
    expect(checkTransaction(wire([ix(SYSTEM_PROGRAM_ID, 2)]))).toMatchObject({ ok: false });
    expect(checkTransaction(wire([ix(PROGRAM_ID, D.userJoinCampaign), ix(SPL_TOKEN_PROGRAM_ID, 3)]))).toMatchObject({
      ok: false,
    });
    expect(checkTransaction("AAAA")).toEqual({ ok: false, reason: "not a transaction" });
  });

  test("the country gate: refused from a listed country; with the list empty, the default, nothing is blocked", async () => {
    const listed = setup({ env: { GEO_BLOCK_COUNTRIES: "xx, yy" }, answer: () => ({ result: "sig" }) });
    expect((await listed.call("sendTransaction", [join, SEND], { "cf-ipcountry": "XX" })).json.error.code).toBe(
      REFUSED.country,
    );
    expect((await listed.call("simulateTransaction", [join, SEND], { "cf-ipcountry": "yy" })).json.error.code).toBe(
      REFUSED.country,
    );
    const settle = wire([ix(PROGRAM_ID, 12)]);
    expect((await listed.call("sendTransaction", [settle, SEND], { "cf-ipcountry": "XX" })).json.result).toBe("sig");
    expect((await listed.call("sendTransaction", [join, SEND], { "cf-ipcountry": "BR" })).json.result).toBe("sig");
    const open = setup({ answer: () => ({ result: "sig" }) });
    expect(open.config.geoBlock.size).toBe(0);
    expect((await open.call("sendTransaction", [join, SEND], { "cf-ipcountry": "XX" })).json.result).toBe("sig");
    expect((await open.call("sendTransaction", [wire([ix(SYSTEM_PROGRAM_ID, 2)]), SEND])).json.error.code).toBe(
      REFUSED.program,
    );
  });

  test("clients are keyed by IP, an IPv6 address by its /64; the bucket refills with time", async () => {
    expect(clientKey("203.0.113.7")).toBe("203.0.113.7");
    expect(clientKey("::ffff:203.0.113.7")).toBe("203.0.113.7");
    expect(clientKey("2001:db8:0:1::5")).toBe(clientKey("2001:0db8:0000:0001:ffff:1:2:3"));
    expect(clientKey("2001:db8:0:1::5")).not.toBe(clientKey("2001:db8:0:2::5"));
    expect(clientKey(null)).toBe("direct");
    const r = setup({ env: { RELAY_BURST: "3", RELAY_RATE_PER_SECOND: "1" } });
    const from = (ip: string) => r.call("getBlockHeight", [], { "cf-connecting-ip": ip });
    for (let i = 0; i < 3; i++) expect((await from("2001:db8:0:1::5")).status).toBe(200);
    const limited = await from("2001:db8:0:1::99");
    expect([limited.status, limited.json.error.code]).toEqual([429, REFUSED.rate]);
    expect((await from("203.0.113.7")).status).toBe(200);
    r.clock.now += 1_000;
    expect((await from("2001:db8:0:1::5")).status).toBe(200);
    const bucket = createLimiter({ ratePerSecond: 1, burst: 2, now: () => 0 });
    expect([bucket.take("a", 2), bucket.take("a", 1)]).toEqual([true, false]);
  });

  test("the sweep forgets a client about a minute after its last call, and expired answers with it", () => {
    const clock = { now: 0 };
    const limiter = createLimiter({ ratePerSecond: 0.001, burst: 1_000, now: () => clock.now });
    limiter.take("203.0.113.7", 900); // far from full again: only time drops it
    clock.now = IDLE_MS - 1;
    limiter.sweep();
    expect(limiter.size()).toBe(1);
    clock.now = IDLE_MS;
    limiter.sweep();
    expect(limiter.size()).toBe(0);
    const cache = createCache(() => clock.now);
    cache.set("k", 1, 1_500);
    clock.now += 1_500;
    cache.sweep();
    expect(cache.size()).toBe(0);
  });

  test("the daily budget stops the relay's spending; a cached answer spends nothing; a new UTC day starts over", async () => {
    const r = setup({ env: { RELAY_DAILY_BUDGET: "2" }, answer: () => ({ result: 1 }) });
    expect((await r.call("getMinimumBalanceForRentExemption", [96])).status).toBe(200);
    expect((await r.call("getMinimumBalanceForRentExemption", [96])).status).toBe(200); // cached
    expect((await r.call("getBlockHeight", [])).status).toBe(200);
    const spent = await r.call("getBlockHeight", []);
    expect([spent.status, spent.json.error.code]).toEqual([503, REFUSED.budget]);
    // A tenth of the day is kept for the signing path: reads alone stop at nine of ten (the security review, M3).
    const day = { now: 86_400_000 - 1 };
    const budget = createBudget({ daily: 10, now: () => day.now });
    expect([budget.spend(9), budget.spend(1), budget.spend(1, true), budget.spend(1, true)]).toEqual([
      true,
      false,
      true,
      false,
    ]);
    day.now += 1;
    expect(budget.spend(9)).toBe(true);
  });

  test("the settings: an upstream is needed, the bind is loopback, a country code is two letters", () => {
    expect(() => loadRelayConfig({})).toThrow("RELAY_UPSTREAM_URL");
    expect(() => loadRelayConfig({ RELAY_UPSTREAM_URL: "https://u.test", RELAY_HOST: "0.0.0.0" })).toThrow("loopback");
    expect(() => loadRelayConfig({ RELAY_UPSTREAM_URL: "https://u.test", GEO_BLOCK_COUNTRIES: "BRA" })).toThrow(
      "country",
    );
    const c = loadRelayConfig({ RELAY_UPSTREAM_URL: "https://u.test" });
    expect([c.port, c.bodyMax, c.corsOrigin, c.geoBlock.size]).toEqual([4202, 8_192, null, 0]);
  });
});
