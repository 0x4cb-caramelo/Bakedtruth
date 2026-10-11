/**
 * Purpose: /api/v1/names and /api/v1/price with fake data and no cluster (Sprint 08): the names file read with the SDK's
 *          rules and the listed feeds with their sponsored accounts, a broken or missing file keeping the last good
 *          list; the display price from Pyth, the last good price kept when a read fails; Pyth's SOL/USD on the
 *          captured devnet account; each route's 400, 503 and body, and what health says of them. Filter:
 *          `bun test services/api`.
 * Version: 0.2.0 (2b: Pyth only)
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
import { PriceSourceError, pythSource } from "../src/price-source";
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
  test("Pyth's price; a failed read keeps the last good price and names the error", async () => {
    let up = true;
    const price = createPrice({
      pyth: async () => (up ? at("147.00", NOW - 30n) : Promise.reject(new PriceSourceError("NoAccount"))),
      now: () => NOW,
    });
    await price.refresh();
    expect([price.current(), price.lastError()]).toEqual([
      { usd: "147.00", publishedAt: NOW - 30n, source: "pyth", fetchedAt: NOW },
      null,
    ]);
    up = false;
    await price.refresh();
    expect([price.current()?.usd, price.lastError()]).toEqual(["147.00", "pyth:NoAccount"]);
  });

  test("the route: 503 before a first price, then its source, time, staleness and attribution; no parameters", async () => {
    const none = createPrice({ pyth: failing("NoAccount"), now: () => NOW });
    const handle = createHandler(store, { corsOrigin: "*", cluster: "devnet", price: none, now: () => NOW });
    expect((await handle(new Request("http://api.test/api/v1/price"))).status).toBe(503);
    const price = createPrice({ pyth: async () => at("147.00", NOW - 60n), now: () => NOW });
    await price.refresh();
    const ok = createHandler(store, { corsOrigin: "*", cluster: "devnet", price, now: () => NOW + 600n });
    const answer = await body(await ok(new Request("http://api.test/api/v1/price")));
    expect(answer.price).toEqual({
      asset: "SOL",
      currency: "USD",
      usd: "147.00",
      source: "pyth",
      published_at: String(NOW - 60n),
      fetched_at: String(NOW),
      stale: true,
      attribution: "Pyth Network SOL/USD",
      use: "display only; the program charges at the Pyth price it reads on-chain",
    });
    expect((await ok(new Request("http://api.test/api/v1/price?vs=eur"))).status).toBe(400);
    // No price older than a day is served.
    const late = createHandler(store, { corsOrigin: "*", cluster: "devnet", price, now: () => NOW + 86_400n });
    expect(await body(await late(new Request("http://api.test/api/v1/price")))).toEqual({
      error: { code: "no_recent_price", message: "no price of the last day" },
    });
    await none.refresh();
    const health = await body(await handle(new Request("http://api.test/api/v1/health")));
    expect([health.price_source, health.price_error, "price_gap_bps" in health]).toEqual([
      null,
      "pyth:NoAccount",
      false,
    ]);
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
