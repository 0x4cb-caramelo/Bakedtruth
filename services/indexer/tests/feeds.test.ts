/**
 * Purpose: the evidence table and its snapshot (Sprint 08 DoD "Evidence and snapshots"), no cluster: `feed_history`
 *          watches the feeds of price campaigns whose result is not final, records each new publish time of the
 *          sponsored account once, from captured devnet bytes, and names what it refuses (a missing account, another
 *          owner, another feed's bytes) without storing it; the snapshot is a new, consistent copy the indexer opens
 *          as it is, with the evidence in it, and a target that exists is refused.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getBase64Decoder } from "@solana/kit";
import {
  PYTH_RECEIVER_ID,
  SOL_USD_ACCOUNT,
  SOL_USD_FEED_HEX,
  sponsoredPriceAddress,
  type SolanaRpc,
} from "@brot/sdk/read";

import { dump, openStore } from "../src/db/store";
import { createFeedRecorder, watchedFeeds } from "../src/feeds";
import { snapshotInto } from "../src/snapshot";
import { addCampaign, AT } from "./rows";

const dir = mkdtempSync(join(tmpdir(), "brot-indexer-feeds-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));
const FIXTURE = readFileSync(join(import.meta.dir, "../../../tests/fixtures/pyth-sol-usd-devnet.bin"));
const PUBLISH_TIME = 93; // PriceUpdateV2's publish_time offset (tests/brot/setup.ts, PRICE_OFFSETS)
const OTHER_FEED = "e6".repeat(32);

/** The SOL/USD bytes with a given publish time. */
const solBytes = (publishTime: bigint) => {
  const data = new Uint8Array(FIXTURE);
  new DataView(data.buffer).setBigInt64(PUBLISH_TIME, publishTime, true);
  return data;
};

function fakeRpc(accounts: Map<string, { owner: string; data: Uint8Array } | null>) {
  const calls: string[][] = [];
  const rpc = {
    getMultipleAccounts: (addresses: string[]) => ({
      send: async () => {
        calls.push([...addresses]);
        return {
          value: addresses.map((a) => {
            const found = accounts.get(a);
            return found ? { owner: found.owner, data: [getBase64Decoder().decode(found.data), "base64"] } : null;
          }),
        };
      },
    }),
  };
  return { rpc: rpc as unknown as SolanaRpc, calls };
}

describe("feed_history, the evidence of each sponsored feed", () => {
  test("watches price campaigns whose result is not final; records each publish time once; names refusals", async () => {
    const store = openStore(":memory:");
    addCampaign(store, { address: AT(2), feed_id: SOL_USD_FEED_HEX });
    addCampaign(store, { address: AT(3), feed_id: SOL_USD_FEED_HEX, status: "InReview" });
    addCampaign(store, { address: AT(4), feed_id: OTHER_FEED, status: "Contested" });
    addCampaign(store, { address: AT(5), feed_id: "aa".repeat(32), status: "Settling" });
    addCampaign(store, { address: AT(6), feed_id: "bb".repeat(32), closed: 1 });
    addCampaign(store, { address: AT(7), feed_id: "cc".repeat(32), kind: "SupplyAtMost" });
    expect(watchedFeeds(store)).toEqual([OTHER_FEED, SOL_USD_FEED_HEX].sort());
    expect((await sponsoredPriceAddress(SOL_USD_FEED_HEX)).toString()).toBe(SOL_USD_ACCOUNT.toString());

    const other = (await sponsoredPriceAddress(OTHER_FEED)).toString();
    const accounts = new Map<string, { owner: string; data: Uint8Array } | null>([
      [SOL_USD_ACCOUNT.toString(), { owner: PYTH_RECEIVER_ID, data: solBytes(1_800_000_000n) }],
    ]);
    const { rpc, calls } = fakeRpc(accounts);
    const recorder = createFeedRecorder(rpc, store, 1_000);
    expect(await recorder.record()).toEqual({ feeds: 2, written: 1, refused: ["Missing"] });
    expect(await recorder.record()).toMatchObject({ written: 0 });
    accounts.set(SOL_USD_ACCOUNT.toString(), { owner: PYTH_RECEIVER_ID, data: solBytes(1_800_000_063n) });
    // The other feed's account holds SOL/USD's bytes: refused, never stored under the other feed.
    accounts.set(other, { owner: PYTH_RECEIVER_ID, data: solBytes(1_800_000_063n) });
    expect(await recorder.record()).toEqual({ feeds: 2, written: 1, refused: ["PriceWrongFeed"] });
    accounts.set(other, { owner: AT(9), data: solBytes(1_800_000_063n) });
    expect((await recorder.record()).refused).toEqual(["ReaderWrongOwner"]);
    expect(calls.at(-1)?.sort()).toEqual([SOL_USD_ACCOUNT.toString(), other].sort());

    const rows = store.db
      .query("SELECT feed_account, publish_time, exponent FROM feed_history ORDER BY publish_time")
      .all();
    expect(rows).toEqual([
      { feed_account: SOL_USD_ACCOUNT.toString(), publish_time: 1_800_000_000, exponent: -8 },
      { feed_account: SOL_USD_ACCOUNT.toString(), publish_time: 1_800_000_063, exponent: -8 },
    ]);
    // Every campaign of a feed final: no read at all.
    store.db.run("UPDATE campaigns SET status = 'Settled'");
    const before = calls.length;
    expect(await recorder.record()).toEqual({ feeds: 0, written: 0, refused: [] });
    expect(calls.length).toBe(before);
    store.close();
  });
});

describe("the snapshot hook (VACUUM INTO)", () => {
  test("a new, consistent file the indexer opens as it is, evidence included; an existing target is refused", () => {
    const live = join(dir, "live.sqlite");
    const store = openStore(live);
    addCampaign(store, { address: AT(2) });
    store.db.run("INSERT INTO feed_history VALUES (?, 1800000000, '14250000000', '1000000', -8, 7)", [AT(9)]);
    const copy = join(dir, "nightly.sqlite");
    expect(snapshotInto(live, copy)).toBeGreaterThan(0);
    const snap = openStore(copy, { readonly: true });
    expect(dump(snap)).toEqual(dump(store));
    expect(snap.db.query("SELECT * FROM feed_history").all()).toEqual(
      store.db.query("SELECT * FROM feed_history").all(),
    );
    expect(snap.db.query("PRAGMA journal_mode").get()).toEqual({ journal_mode: "delete" });
    snap.close();
    expect(() => snapshotInto(live, copy)).toThrow("new file");
    expect(store.db.query("PRAGMA journal_mode").get()).toEqual({ journal_mode: "wal" });
    store.close();
  });
});
