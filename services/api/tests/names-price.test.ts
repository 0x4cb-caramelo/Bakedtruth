/**
 * Purpose: /api/v1/names and /api/v1/price with fake data and no cluster (Sprint 08): the names file read with the SDK's
 *          rules and the listed feeds with their sponsored accounts, a broken or missing file keeping the last good
 *          list; the display price from CoinGecko, from Pyth when CoinGecko fails, is off or is older than ten
 *          minutes, the last good price kept when both fail, and the gap between them; CoinGecko's request for each
 *          plan (the key in a header, never in the URL) and its answers; Pyth's SOL/USD on the captured devnet
 *          account; each route's 400, 503 and body, and what health says of them. Filter: `bun test services/api`.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getBase64Decoder } from "@solana/kit";
import type { SolanaRpc } from "@brot/sdk/read";

import { createNames } from "../src/names";
import { createPrice, type SourcePrice } from "../src/price";
import { coingeckoRequest, coingeckoSource, PriceSourceError, pythSource } from "../src/price-sources";
import { createHandler } from "../src/routes";

const MINT = "So11111111111111111111111111111111111111112";
const store = { current: () => null, lastError: () => null, refresh: async () => {} };
const body = async (res: Response) => (await res.json()) as any;
const at = (usd: string, publishedAt: bigint): SourcePrice => ({ usd, publishedAt });
const failing = (name: string) => async (): Promise<SourcePrice> => {
  throw new PriceSourceError(name);
};

describe("/api/v1/names", () => {
  test("serves the reviewed names and the listed feeds; a broken or missing file keeps the last good list", async () => {
    const dir = mkdtempSync(join(tmpdir(), "brot-names-"));
    const file = join(dir, "account-names.json");
    try {
      writeFileSync(file, JSON.stringify([{ address: MINT, kind: "burn", name: "Wrapped SOL" }]));
      const names = await createNames(file);
      expect(names.lastError()).toBeNull();
      const handle = createHandler(store, { corsOrigin: "*", cluster: "devnet", names });
      const ok = await body(await handle(new Request("http://api.test/api/v1/names")));
      expect(ok.names).toEqual([{ address: MINT, kind: "burn", name: "Wrapped SOL" }]);
      expect(ok.feeds.length).toBe(17);
      expect(ok.feeds.find((f: any) => f.symbol === "SOL/USD").account).toBe(
        "7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE",
      );
      writeFileSync(file, JSON.stringify([{ address: MINT, kind: "burn", name: "see https://x.example" }]));
      names.refresh();
      expect(names.lastError()).toBe("Error");
      expect(names.names()).toEqual([{ address: MINT, kind: "burn", name: "Wrapped SOL" }]);
      rmSync(file);
      names.refresh();
      expect(names.lastError()).toBe("NotFound");
      const health = await body(await handle(new Request("http://api.test/api/v1/health")));
      expect(health.names_error).toBe("NotFound");
      expect((await handle(new Request("http://api.test/api/v1/names?all=1"))).status).toBe(400);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("the committed names file reads with the SDK's rules", async () => {
    const names = await createNames(join(import.meta.dir, "../../../content/account-names.json"));
    expect(names.lastError()).toBeNull();
  });
});

describe("the display price", () => {
  const NOW = 1_800_000_000n;
  test("CoinGecko first; Pyth when CoinGecko fails, is off or is stale; the last price when both fail", async () => {
    const pyth = async () => at("147.00", NOW - 30n);
    const fresh = createPrice({ coingecko: async () => at("150.00", NOW - 60n), pyth, now: () => NOW });
    await fresh.refresh();
    expect(fresh.current()).toEqual({ usd: "150.00", publishedAt: NOW - 60n, source: "coingecko", fetchedAt: NOW });
    expect(fresh.gapBps()).toBe(204);
    const down = createPrice({ coingecko: failing("Status429"), pyth, now: () => NOW });
    await down.refresh();
    expect([down.current()?.source, down.lastError()]).toEqual(["pyth", "coingecko:Status429"]);
    const stale = createPrice({ coingecko: async () => at("150.00", NOW - 601n), pyth, now: () => NOW });
    await stale.refresh();
    expect([stale.current()?.source, stale.lastError()]).toEqual(["pyth", "coingecko:Stale"]);
    const off = createPrice({ coingecko: null, pyth, now: () => NOW });
    await off.refresh();
    expect([off.current()?.source, off.lastError(), off.gapBps()]).toEqual(["pyth", null, null]);
    let up = true;
    const both = createPrice({
      coingecko: async () => (up ? at("150.00", NOW) : Promise.reject(new PriceSourceError("Status500"))),
      pyth: async () => (up ? at("149.00", NOW) : Promise.reject(new PriceSourceError("NoAccount"))),
      now: () => NOW,
    });
    await both.refresh();
    up = false;
    await both.refresh();
    expect([both.current()?.usd, both.lastError()]).toEqual(["150.00", "coingecko:Status500 pyth:NoAccount"]);
  });

  test("the route: 503 before a first price, then its source, time, staleness and attribution; no parameters", async () => {
    const price = createPrice({
      coingecko: async () => at("150.00", NOW - 700n),
      pyth: failing("NoAccount"),
      now: () => NOW,
    });
    const handle = createHandler(store, { corsOrigin: "*", cluster: "devnet", price, now: () => NOW });
    expect((await handle(new Request("http://api.test/api/v1/price"))).status).toBe(503);
    const fresh = createPrice({
      coingecko: async () => at("150.00", NOW - 60n),
      pyth: failing("NoAccount"),
      now: () => NOW,
    });
    await fresh.refresh();
    const ok = createHandler(store, { corsOrigin: "*", cluster: "devnet", price: fresh, now: () => NOW + 600n });
    const answer = await body(await ok(new Request("http://api.test/api/v1/price")));
    expect(answer.price).toMatchObject({
      usd: "150.00",
      source: "coingecko",
      published_at: String(NOW - 60n),
      stale: true,
      attribution: "Powered by CoinGecko",
    });
    expect((await ok(new Request("http://api.test/api/v1/price?vs=eur"))).status).toBe(400);
    const health = await body(await ok(new Request("http://api.test/api/v1/health")));
    expect([health.price_source, health.price_error]).toEqual(["coingecko", "pyth:NoAccount"]);
  });

  test("CoinGecko's request per plan: the key in its header, never in the URL; its answers checked", async () => {
    const demo = coingeckoRequest("demo-key", "demo");
    expect(demo.url.startsWith("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd")).toBe(
      true,
    );
    expect(demo.headers["x-cg-demo-api-key"]).toBe("demo-key");
    const pro = coingeckoRequest("pro-key", "pro");
    expect(pro.url.startsWith("https://pro-api.coingecko.com/api/v3/")).toBe(true);
    expect(pro.headers["x-cg-pro-api-key"]).toBe("pro-key");
    const keyless = coingeckoRequest(null, "pro");
    expect(keyless.url.startsWith("https://api.coingecko.com/")).toBe(true);
    expect(Object.keys(keyless.headers)).toEqual(["accept"]);
    for (const r of [demo, pro]) expect(r.url.includes("key")).toBe(false);
    const answer = (status: number, json: unknown) => async () => new Response(JSON.stringify(json), { status });
    const read = (f: () => Promise<Response>) => coingeckoSource({ key: null, plan: "demo", fetch: f as never })();
    expect(await read(answer(200, { solana: { usd: 152.34, last_updated_at: 1_800_000_000 } }))).toEqual({
      usd: "152.34",
      publishedAt: 1_800_000_000n,
    });
    expect(await read(answer(200, { solana: { usd: 1e-7, last_updated_at: 1 } }))).toEqual({
      usd: "0.00000010",
      publishedAt: 1n,
    });
    for (const [res, name] of [
      [answer(429, {}), "Status429"],
      [answer(200, { solana: { usd: "152" } }), "BadPrice"],
      [answer(200, { solana: { usd: 152 } }), "BadTime"],
    ] as const)
      await expect(read(res)).rejects.toThrow(name);
  });

  test("Pyth's SOL/USD, from the captured devnet account, decoded by the SDK", async () => {
    const data = new Uint8Array(readFileSync("tests/fixtures/pyth-sol-usd-devnet.bin"));
    const owner = "rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp";
    const rpc = {
      getAccountInfo: () => ({
        send: async () => ({ value: { owner, data: [getBase64Decoder().decode(data), "base64"] } }),
      }),
    } as unknown as SolanaRpc;
    const price = await pythSource(rpc)();
    expect(price.usd).toBe("119.21844516");
    const missing = { getAccountInfo: () => ({ send: async () => ({ value: null }) }) } as unknown as SolanaRpc;
    await expect(pythSource(missing)()).rejects.toThrow("NoAccount");
  });
});
