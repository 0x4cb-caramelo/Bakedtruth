/**
 * Purpose: the retry guard's rules (A-9), without a chain: what a record means given the chain now (a signature's
 *          confirmed status decides; without one, the entry total; past the deadline, which only grows); a store that
 *          refuses everything; a record kept in the page's memory when storage is blocked, and owned by one attempt; a
 *          status that counts only once confirmed; and a watch whose network stops, which keeps its record unresolved.
 *          Filter: `bun test tests/ -t "the retry guard's rules"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry; split from retry-guard.test.ts after the security review)
 */
import { describe, expect, test } from "bun:test";
import { createSolanaRpc } from "@solana/kit";

import {
  clearAttempt,
  decidePending,
  KEEP_SETTLED_MS,
  layeredStore,
  loadPending,
  pendingKey,
  pruneSettled,
  retrying,
  savePending,
  updateAttempt,
  type PendingEntry,
} from "../../app/features/entry/retry-guard";
import { settle } from "../../app/features/entry/submit";
import { statusFrom } from "../../app/features/entry/watch";
import * as P from "../brot/program";
import { memoryStore, refusingStore } from "./support";

describe("the retry guard's rules", () => {
  test("the guard's rule, and a store that refuses everything", () => {
    const record: PendingEntry = {
      v: 2,
      attempt: "a1",
      campaign: "c",
      baker: "b",
      side: "yes",
      amount: "5",
      expectedEntryTotal: "10",
      lastValidBlockHeight: "100",
      deadline: "100",
      signature: null,
      state: "handed",
      handedBefore: false,
      savedAt: 0,
    };
    const now = (entryTotal: bigint, blockHeight: bigint, status: "landed" | "failed" | null = null) => ({
      entryTotal,
      blockHeight,
      status,
    });
    expect(decidePending(record, now(10n, 100n))).toBe("wait");
    expect(decidePending(record, now(15n, 100n))).toBe("landed");
    expect(decidePending(record, now(10n, 101n))).toBe("not-landed");
    expect(decidePending(record, now(10n, 50n, "failed"))).toBe("failed");
    expect(decidePending(record, now(10n, 50n, "landed"))).toBe("landed");
    // With a signature, its status decides: another entry moving the total does not make this one landed.
    const signed = { ...record, signature: "sig" };
    expect(decidePending(signed, now(15n, 50n, "failed"))).toBe("failed");
    expect(decidePending(signed, now(15n, 50n))).toBe("wait");
    expect(decidePending(signed, now(15n, 101n))).toBe("landed");
    expect(decidePending(signed, now(10n, 101n))).toBe("not-landed");
    // A wallet that answered late may have signed a newer blockhash: the deadline only grows.
    expect(decidePending({ ...record, deadline: "250" }, now(10n, 101n))).toBe("wait");
    expect(savePending(refusingStore(), { ...record })).toBe(false);
    expect(loadPending(refusingStore(), "c", "b")).toBeNull();
    const store = memoryStore();
    store.setItem(pendingKey("c", "b"), JSON.stringify({ ...record, expectedEntryTotal: "-1" }));
    expect(loadPending(store, "c", "b")).toBeNull();
    store.setItem(pendingKey("c", "b"), "{not json");
    expect(loadPending(store, "c", "b")).toBeNull();
  });

  test("with storage blocked the record lives in this page's memory, and only its own attempt touches it", () => {
    const record = (attempt: string): PendingEntry => ({
      v: 2,
      attempt,
      campaign: `c-${attempt.length}`,
      baker: "b",
      side: "no",
      amount: "7",
      expectedEntryTotal: "0",
      lastValidBlockHeight: "100",
      deadline: "100",
      signature: null,
      state: "handed",
      handedBefore: false,
      savedAt: 0,
    });
    const blocked = layeredStore(refusingStore());
    const first = record("first");
    expect(savePending(blocked, first)).toBe(true);
    expect(blocked.persists).toBe(false);
    expect(loadPending(blocked, first.campaign, "b")?.attempt).toBe("first"); // kept in memory
    // A newer attempt replaces it; the older attempt's watcher can neither update nor clear the newer record.
    const newer = { ...record("firsT"), campaign: first.campaign };
    savePending(blocked, newer);
    updateAttempt(blocked, { ...first, state: "expired" });
    clearAttempt(blocked, first);
    expect(loadPending(blocked, first.campaign, "b")).toMatchObject({ attempt: "firsT", state: "handed" });
    clearAttempt(blocked, newer);
    expect(loadPending(blocked, first.campaign, "b")).toBeNull();
    // A refusal keeps the saved total, and a changed entry after an earlier hand-off still means it landed.
    expect(retrying(null)).toBe(false);
    expect(retrying({ ...first, state: "refused" })).toBe(false);
    expect(retrying({ ...first, state: "refused", handedBefore: true })).toBe(true);
    expect(retrying({ ...first, state: "expired" })).toBe(true);
  });

  test("a settled record is deleted after a day; an unresolved one stays until a watch settles it", () => {
    const map = new Map<string, string>();
    const local = {
      get length() {
        return map.size;
      },
      key: (i: number) => [...map.keys()][i] ?? null,
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    };
    const at = (state: PendingEntry["state"], savedAt: number, campaign: string) =>
      local.setItem(pendingKey(campaign, "b"), JSON.stringify({ state, savedAt, campaign, baker: "b" }));
    const day = KEEP_SETTLED_MS;
    at("expired", 0, "old-expired");
    at("refused", 0, "old-refused");
    at("handed", 0, "old-handed");
    at("expired", 2 * day - 1_000, "fresh-expired");
    local.setItem("another-site-key", "kept");
    pruneSettled(local, 2 * day);
    expect([...map.keys()].sort()).toEqual(
      ["another-site-key", pendingKey("fresh-expired", "b"), pendingKey("old-handed", "b")].sort(),
    );
  });

  test("a status counts once confirmed; a failure seen at processed may sit on a dropped fork", () => {
    expect(statusFrom(null)).toEqual({ status: null, err: null });
    expect(statusFrom({ err: { InstructionError: [0, { Custom: 6067 }] }, confirmationStatus: "processed" })).toEqual({
      status: null,
      err: null,
    });
    expect(statusFrom({ err: "boom", confirmationStatus: "confirmed" })).toEqual({ status: "failed", err: "boom" });
    expect(statusFrom({ err: null, confirmationStatus: "finalized" })).toEqual({ status: "landed", err: null });
  });

  test("a watch whose network stops keeps its record, still unresolved, for the next check", async () => {
    const store = memoryStore();
    const record: PendingEntry = {
      v: 2,
      attempt: "net",
      campaign: P.PROGRAM_ID,
      baker: P.PROGRAM_ID,
      side: "yes",
      amount: "1",
      expectedEntryTotal: "0",
      lastValidBlockHeight: "100",
      deadline: "100",
      signature: null,
      state: "handed",
      handedBefore: false,
      savedAt: 0,
    };
    savePending(store, record);
    const dead = createSolanaRpc("http://127.0.0.1:9"); // nothing listens on the discard port
    const outcome = await settle(dead, record, store, false, { sleep: async () => undefined });
    expect(outcome).toEqual({ kind: "stopped", record });
    expect(loadPending(store, record.campaign, record.baker)?.state).toBe("handed");
  });
});
