/**
 * Purpose: the feed watcher's rules: only price campaigns are resolved, nothing is sent while the standby gate is
 *          closed, an error is reported and the next tick still runs, overlapping ticks are skipped, and stop()
 *          ends the loop. No network: the campaigns and the resolve task are fakes; ticks are driven by hand.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import { describe, expect, test } from "bun:test";

import { ReaderKind } from "@brot/sdk/read";
import type { Address } from "@solana/kit";

import type { OpenCampaign } from "../src/campaigns";
import type { AttemptResult } from "../src/resolve";
import { priceCampaigns, shouldSkipTick, startWatcher } from "../src/watcher";

const open = (name: string, kind: number): OpenCampaign =>
  ({ address: name as Address, campaign: { kind } }) as unknown as OpenCampaign;
const PRICE = open("price", ReaderKind.PriceTouch);
const OTHER = open("other", ReaderKind.SupplyAtMost);
const resolved = (item: OpenCampaign): AttemptResult => ({
  attempt: "resolved",
  campaign: item.address,
  detail: null,
});
const settle = () => new Promise((done) => setTimeout(done, 0));

describe("priceCampaigns", () => {
  test("keeps only the price-touch campaigns", () => {
    expect(priceCampaigns([PRICE, OTHER])).toEqual([PRICE]);
  });
});

describe("shouldSkipTick", () => {
  test("skips a tick while the previous one still runs", () => {
    expect(shouldSkipTick(true)).toBe(true);
    expect(shouldSkipTick(false)).toBe(false);
  });
});

describe("startWatcher", () => {
  test("resolves only price campaigns", async () => {
    const seen: string[] = [];
    const watcher = startWatcher({
      intervalMs: 1_000_000,
      listOpen: async () => [PRICE, OTHER],
      resolveOne: async (item) => (seen.push(item.address), resolved(item)),
      mayResolve: () => true,
    });
    await watcher.tick();
    watcher.stop();
    expect(seen).toEqual(["price"]);
  });

  test("with the standby gate closed, resolveOne is never called", async () => {
    let calls = 0;
    const attempts: AttemptResult[] = [];
    const watcher = startWatcher({
      intervalMs: 1_000_000,
      listOpen: async () => [PRICE],
      resolveOne: async (item) => (calls++, resolved(item)),
      mayResolve: () => false,
      onAttempt: (result) => attempts.push(result),
    });
    await watcher.tick();
    watcher.stop();
    expect(calls).toBe(0);
    expect(attempts).toEqual([]);
  });

  test("an error in listOpen is reported and the next tick still runs", async () => {
    const errors: string[] = [];
    let listed = 0;
    const watcher = startWatcher({
      intervalMs: 1_000_000,
      listOpen: async () => {
        listed++;
        if (listed === 1) throw new Error("rpc down");
        return [PRICE];
      },
      resolveOne: async (item) => resolved(item),
      mayResolve: () => true,
      onError: (detail) => errors.push(detail),
    });
    await watcher.tick();
    await watcher.tick();
    watcher.stop();
    expect(errors).toEqual(["rpc down"]);
    expect(listed).toBe(2);
    expect(watcher.ticks()).toBe(2);
  });

  test("a resolve error on one campaign does not stop the others", async () => {
    const second = open("second", ReaderKind.PriceTouch);
    const resolvedNames: string[] = [];
    const errors: string[] = [];
    const watcher = startWatcher({
      intervalMs: 1_000_000,
      listOpen: async () => [PRICE, second],
      resolveOne: async (item) => {
        if (item.address === "price") throw new Error("boom");
        resolvedNames.push(item.address);
        return resolved(item);
      },
      mayResolve: () => true,
      onError: (detail) => errors.push(detail),
    });
    await watcher.tick();
    watcher.stop();
    expect(errors).toEqual(["boom"]);
    expect(resolvedNames).toEqual(["second"]);
  });

  test("overlapping ticks are skipped while one still runs", async () => {
    let release: () => void = () => {};
    let listed = 0;
    const watcher = startWatcher({
      intervalMs: 1_000_000,
      listOpen: () =>
        new Promise<OpenCampaign[]>((done) => {
          listed++;
          release = () => done([]);
        }),
      resolveOne: async (item) => resolved(item),
      mayResolve: () => true,
    });
    const first = watcher.tick();
    await watcher.tick(); // skipped: the first is still waiting on listOpen
    release();
    await first;
    watcher.stop();
    expect(listed).toBe(1);
    expect(watcher.ticks()).toBe(1);
  });

  test("stop() ends further ticks", async () => {
    let listed = 0;
    const watcher = startWatcher({
      intervalMs: 1_000_000,
      listOpen: async () => (listed++, []),
      resolveOne: async (item) => resolved(item),
      mayResolve: () => true,
    });
    watcher.stop();
    await watcher.tick();
    await settle();
    expect(listed).toBe(0);
  });
});
