/**
 * Purpose: the leaderboard's history reader against a scripted RPC (Sprint 13, the adversarial review's cases): a node
 *          that ignores `until` costs a re-listing but never a second read; pages shorter than asked do not end the
 *          listing; a transaction that never reads back neither blocks the others nor keeps the history incomplete
 *          forever (it is skipped after five tries); a 429 spends no try, keeps the transaction's place and ends the
 *          refresh's reads, while any other refusal still costs a try; a failed listing makes the history incomplete
 *          until one succeeds; and a call that hangs is cut by its timeout. Since Sprint 16 (the review's F1), every
 *          read asks for the SDK's MAX_TRANSACTION_VERSION, and a transaction of a newer version (-32015) is skipped at
 *          once and counted, never a stop. What the events say is tests/api/leaderboard.test.ts.
 * Version: 0.3.0 (Sprint 16: -32015; 0.2.0, the 429 cases, after the 2026-10-13 release)
 * Sprint:  13 (site: ranking, notices and copy); 16
 */
import { describe, expect, test } from "bun:test";
import { getBase58Decoder, SolanaError } from "@solana/kit";
import { SOLANA_ERROR__JSON_RPC__SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION as NEWER } from "@solana/kit";
import { SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR } from "@solana/kit";
import { MAX_TRANSACTION_VERSION, type SolanaRpc } from "@brot/sdk/read";

import { createHistory } from "../src/history";

type Script = {
  /** Newest first. */
  sigs: string[];
  ignoreUntil?: boolean;
  pageCap?: number;
  unreadable?: Set<string>;
  /** Transactions of a version newer than the reader asks for: -32015 (Sprint 16, F1). */
  newer?: Set<string>;
  failList?: boolean;
  hang?: boolean;
  /** Transactions the node answers before it refuses with `status` (429 when unset); unset, it never refuses. */
  budget?: number;
  status?: number;
};

/** A real-looking signature (64 bytes, base58) for a short name, and the name back. */
const SIG = (name: string) => getBase58Decoder().decode(new Uint8Array(64).fill(name.charCodeAt(0)));
const NAME = new Map("abcdefgu".split("").map((n) => [SIG(n), n]));

/** The error Kit's HTTP transport throws for a status that is not OK. */
const refusal = (statusCode: number) =>
  new SolanaError(SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR, { headers: new Headers(), message: "", statusCode });

/**
 * A Kit-shaped RPC: `method(...).send({ abortSignal })`, scripted by short names. Each transaction reads back with no
 * event of the program; `reads` records the names read.
 */
function scripted(script: Script) {
  const reads: string[] = [];
  const versions: unknown[] = [];
  const pending = <T>(work: () => T) => ({
    send: (opts?: { abortSignal?: AbortSignal }) =>
      new Promise<T>((resolve, reject) => {
        if (script.hang) return opts?.abortSignal?.addEventListener("abort", () => reject(new Error("aborted")));
        try {
          resolve(work());
        } catch (error) {
          reject(error);
        }
      }),
  });
  const rpc = {
    getSignaturesForAddress: (_: string, config: { limit: number; before?: string; until?: string }) =>
      pending(() => {
        if (script.failList) throw new Error("429");
        let list = script.sigs.map(SIG);
        if (config.until && !script.ignoreUntil) list = list.slice(0, Math.max(0, list.indexOf(config.until)));
        const from = config.before ? list.indexOf(config.before) + 1 : 0;
        const size = Math.min(config.limit, script.pageCap ?? config.limit);
        return list.slice(from, from + size).map((signature) => ({ signature, err: null, slot: 1n }));
      }),
    getTransaction: (sig: string, config?: { maxSupportedTransactionVersion?: number }) =>
      pending(() => {
        const name = NAME.get(sig) ?? "?";
        reads.push(name);
        versions.push(config?.maxSupportedTransactionVersion);
        if (script.newer?.has(name))
          throw new SolanaError(NEWER, {
            __serverMessage: "Transaction version (2) is not supported by the requesting client.",
          });
        if (script.budget !== undefined && script.budget-- <= 0) throw refusal(script.status ?? 429);
        if (script.unreadable?.has(name)) return null;
        return {
          slot: 1n,
          blockTime: null,
          transaction: { signatures: [sig], message: { accountKeys: [], instructions: [] } },
          meta: { err: null, innerInstructions: [] },
        };
      }),
  };
  return { rpc: rpc as unknown as SolanaRpc, reads, versions };
}

describe("history reader", () => {
  test("a node that ignores until re-lists everything, but nothing is read twice", async () => {
    const script: Script = { sigs: ["c", "b", "a"], ignoreUntil: true };
    const { rpc, reads } = scripted(script);
    const h = createHistory(rpc);
    await h.refresh();
    expect(reads.sort()).toEqual(["a", "b", "c"]);
    script.sigs = ["d", ...script.sigs];
    await h.refresh();
    expect(reads.sort()).toEqual(["a", "b", "c", "d"]);
    expect(h.complete()).toBe(true);
  });

  test("pages shorter than asked do not end the listing", async () => {
    const { rpc, reads } = scripted({ sigs: ["e", "d", "c", "b", "a"], pageCap: 2 });
    const h = createHistory(rpc);
    await h.refresh();
    expect(reads.length).toBe(5);
  });

  test("a transaction that never reads back waits at the back, then is skipped; the others go on", async () => {
    const { rpc, reads } = scripted({ sigs: ["c", "b", "a"], unreadable: new Set(["a"]) });
    const h = createHistory(rpc, { perRefresh: 2 });
    await h.refresh();
    await h.refresh();
    expect(reads.filter((s) => s !== "a").sort()).toEqual(["b", "c"]); // read by the second refresh at the latest
    expect(h.complete()).toBe(false);
    for (let i = 0; i < 4; i++) await h.refresh();
    expect(h.skipped()).toBe(1);
    expect(h.complete()).toBe(true);
    expect(reads.filter((s) => s === "a").length).toBe(5);
  });

  test("a 429 ends the refresh's reads; what the node refused keeps its place, with no try spent", async () => {
    const script: Script = { sigs: ["f", "e", "d", "c", "b", "a"], budget: 2 };
    const { rpc, reads } = scripted(script);
    const h = createHistory(rpc);
    await h.refresh();
    expect(reads).toEqual(["a", "b", "c", "d"]); // c and d refused in the first four; e and f not asked
    expect(h.complete()).toBe(false);
    script.budget = 2;
    await h.refresh();
    expect(reads.slice(4)).toEqual(["c", "d", "e", "f"]); // the refused ones first, oldest first
    script.budget = 2;
    await h.refresh();
    expect(reads.slice(8)).toEqual(["e", "f"]);
    expect(h.complete()).toBe(true);
    expect(h.skipped()).toBe(0);
  });

  test("a rate limit longer than five refreshes skips nothing and costs one slice of calls per refresh", async () => {
    const script: Script = { sigs: ["f", "e", "d", "c", "b", "a"], budget: 0 };
    const { rpc, reads } = scripted(script);
    const h = createHistory(rpc);
    for (let i = 0; i < 7; i++) await h.refresh();
    expect(reads.length).toBe(7 * 4);
    expect(h.skipped()).toBe(0);
    expect(h.complete()).toBe(false);
    script.budget = undefined;
    await h.refresh();
    expect(h.complete()).toBe(true);
    expect(h.skipped()).toBe(0);
  });

  test("any other refusal still costs a try: five 503s skip the transaction", async () => {
    const { rpc, reads } = scripted({ sigs: ["b", "a"], budget: 0, status: 503 });
    const h = createHistory(rpc);
    for (let i = 0; i < 5; i++) await h.refresh();
    expect(reads.length).toBe(5 * 2);
    expect(h.skipped()).toBe(2);
    expect(h.complete()).toBe(true);
  });

  test("a transaction of a newer version is skipped at once and counted, never a stop; each read asks for v1", async () => {
    const { rpc, reads, versions } = scripted({ sigs: ["c", "b", "a"], newer: new Set(["b"]) });
    const h = createHistory(rpc);
    await h.refresh();
    await h.refresh();
    // Each read once, oldest first ("c" was not held back), "b" never asked again; every read asked for v1.
    expect([reads, h.skipped(), h.complete()]).toEqual([["a", "b", "c"], 1, true]);
    expect(versions.every((v) => v === MAX_TRANSACTION_VERSION)).toBe(true);
  });

  test("a failed listing leaves the history incomplete until a listing succeeds", async () => {
    const script: Script = { sigs: ["a"] };
    const { rpc } = scripted(script);
    const h = createHistory(rpc);
    await h.refresh();
    expect(h.complete()).toBe(true);
    script.failList = true;
    await expect(h.refresh()).rejects.toThrow("429");
    expect(h.complete()).toBe(false);
    script.failList = false;
    await h.refresh();
    expect(h.complete()).toBe(true);
  });

  test("a call that hangs is cut by its timeout", async () => {
    const { rpc } = scripted({ sigs: ["a"], hang: true });
    const h = createHistory(rpc, { timeoutMs: 50 });
    const started = Date.now();
    await expect(h.refresh()).rejects.toThrow("aborted");
    expect(Date.now() - started).toBeLessThan(2_000);
    expect(h.ready()).toBe(false);
  });
});
