/**
 * Purpose: the second read's rules and the review queue's line: a match, a real difference, a missing account, a
 *          difference that a retry at RPC B clears (publish landing between the two reads), and the queue's entry.
 *          Real bytes: the devnet BTC/USD PriceUpdateV2 fixture; fake RPCs answer `getAccountInfo` only.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ReaderKind, PYTH_RECEIVER_ID, type SolanaRpc } from "@brot/sdk/read";
import { address, type Address } from "@solana/kit";

import { appendReview, type ReviewEntry } from "../src/review-queue";
import { isPriceCampaign, secondRead } from "../src/second-read";

const FIXTURE = join(import.meta.dir, "../../../tests/fixtures/pyth-btc-usd-devnet.bin");
const BASE = new Uint8Array(readFileSync(FIXTURE));
const METRIC: Address = address("APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5");
// Offsets of the reader: discriminator 8, write authority 32, verification 1, feed id 32, then price i64.
const FEED = BASE.slice(41, 73);
const PRICE_AT = 73;
const PUBLISH_AT = 93;

/** The fixture with its price (and optionally its publish time) changed. */
function variant(price?: bigint, publish?: bigint): Uint8Array {
  const bytes = BASE.slice();
  const view = new DataView(bytes.buffer);
  if (price !== undefined) view.setBigInt64(PRICE_AT, price, true);
  if (publish !== undefined) view.setBigInt64(PUBLISH_AT, publish, true);
  return bytes;
}

/** A fake RPC: `getAccountInfo` answers with the next account in `answers` (the last one repeats). */
function fakeRpc(answers: Array<{ owner: string; data: Uint8Array } | null>) {
  const calls: string[] = [];
  let i = 0;
  const rpc = {
    getAccountInfo: () => ({
      send: async () => {
        calls.push("get");
        const answer = answers[Math.min(i, answers.length - 1)];
        i++;
        if (!answer) return { value: null };
        const base64 = Buffer.from(answer.data).toString("base64");
        return { value: { owner: answer.owner, data: [base64, "base64"] } };
      },
    }),
  } as unknown as SolanaRpc;
  return { rpc, calls };
}

const ok = (data: Uint8Array) => ({ owner: PYTH_RECEIVER_ID, data });

describe("secondRead", () => {
  test("the same update at both providers matches", async () => {
    const { rpc: a } = fakeRpc([ok(BASE)]);
    const { rpc: b } = fakeRpc([ok(BASE)]);
    expect(await secondRead(a, b, METRIC, FEED, 0)).toEqual({ match: true });
  });

  test("a different price at RPC B is a mismatch that survives the retry", async () => {
    const { rpc: a } = fakeRpc([ok(BASE)]);
    const { rpc: b } = fakeRpc([ok(variant(7_000_000_000_000n))]);
    const result = await secondRead(a, b, METRIC, FEED, 0);
    expect(result.match).toBe(false);
    if (result.match !== false) throw new Error("expected a mismatch");
    expect(result.detail).toContain("differs after a 0 ms re-read at RPC B");
  });

  test("a missing account at one provider is not checked, never a mismatch", async () => {
    const { rpc: a } = fakeRpc([ok(BASE)]);
    const { rpc: b } = fakeRpc([null]);
    const result = await secondRead(a, b, METRIC, FEED, 0);
    expect(result.match).toBeNull();
    expect(JSON.stringify(result)).toContain("RPC B account missing");
  });

  test("an account under the wrong owner is not checked (the reader refuses before any byte)", async () => {
    const { rpc: a } = fakeRpc([ok(BASE)]);
    const { rpc: b } = fakeRpc([{ owner: "11111111111111111111111111111111", data: BASE }]);
    const result = await secondRead(a, b, METRIC, FEED, 0);
    expect(result.match).toBeNull();
  });

  test("a publish that lands between the two reads is not checked, never a mismatch", async () => {
    const later = variant(7_100_000_000_000n, 1_900_000_000n);
    const { rpc: a } = fakeRpc([ok(BASE)]);
    const { rpc: b } = fakeRpc([ok(later)]);
    const result = await secondRead(a, b, METRIC, FEED, 0);
    expect(result.match).toBeNull();
    expect(JSON.stringify(result)).toContain("published between the two reads");
  });

  test("a forged price at RPC B with the same publish time is a mismatch, kept after the retry", async () => {
    const forged = variant(7_100_000_000_000n);
    const { rpc: a } = fakeRpc([ok(BASE)]);
    const { rpc: b, calls } = fakeRpc([ok(forged), ok(forged)]);
    const result = await secondRead(a, b, METRIC, FEED, 0);
    expect(result.match).toBe(false);
    expect(calls.length).toBe(2);
  });

  test("a campaign is re-read only when its kind is a price touch", () => {
    expect(isPriceCampaign({ kind: ReaderKind.PriceTouch })).toBe(true);
    expect(isPriceCampaign({ kind: ReaderKind.SupplyAtMost })).toBe(false);
  });
});

describe("appendReview", () => {
  test("writes one JSON line and never a URL or a secret", async () => {
    const lines: string[] = [];
    const entry: ReviewEntry = {
      at: "2026-10-10T12:00:00.000Z",
      campaign: "FmDoExampleCampaignAddress",
      reason: "second_read_mismatch",
      primarySlot: "123",
      detail: "primary price 1 conf 1 publish 1; RPC B price 2 conf 1 publish 1",
    };
    await appendReview("/var/lib/brot-markets/review-queue.jsonl", entry, async (_, line) => {
      lines.push(line);
    });
    expect(lines.length).toBe(1);
    expect(lines[0].endsWith("\n")).toBe(true);
    expect(JSON.parse(lines[0])).toEqual(entry);
    expect(lines[0]).not.toMatch(/https?:\/\/|api-key|secret/i);
  });
});
