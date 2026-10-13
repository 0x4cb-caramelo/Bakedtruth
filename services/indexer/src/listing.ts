/**
 * Purpose: the ingest's listing (proposal §2.7; Sprint 08): an address's signatures at `finalized`, newest first, paged
 *          back to a known signature or to the first page that comes back empty, then kept oldest first, each with its
 *          place in the chain (`ord`), in one SQLite transaction that also moves the checkpoint when one is named. A
 *          signature already kept keeps its place; a failed transaction is kept as done at once (it carries no event,
 *          rule 1). What the read API's history learned (Sprint 13): a node that ignores `until` is cut where the
 *          known signature appears; a page shorter than asked does not end the listing; every call has a timeout.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { address, signature as toSignature, type Signature } from "@solana/kit";
import type { SolanaRpc } from "@brot/sdk/read";

import type { Store } from "./db/store";

export type Listed = { signature: string; slot: number; failed: boolean };
export type ListOptions = { pageSize: number; timeoutMs: number };

/** Every signature of `at` newer than `until` (all of them when it is null), newest first. */
export async function listNewer(rpc: SolanaRpc, at: string, until: string | null, o: ListOptions): Promise<Listed[]> {
  const found: Listed[] = [];
  let before: Signature | undefined;
  for (;;) {
    const config = {
      limit: o.pageSize,
      commitment: "finalized" as const,
      ...(before ? { before } : {}),
      ...(until ? { until: toSignature(until) } : {}),
    };
    const page = await rpc
      .getSignaturesForAddress(address(at), config)
      .send({ abortSignal: AbortSignal.timeout(o.timeoutMs) });
    if (page.length === 0) return found;
    const cut = until === null ? -1 : page.findIndex((s) => s.signature === until);
    const kept = cut >= 0 ? page.slice(0, cut) : page;
    found.push(
      ...kept.map((s) => ({ signature: s.signature as string, slot: Number(s.slot), failed: s.err !== null })),
    );
    if (cut >= 0) return found; // a node that ignored `until`: stop where the known signature appears
    before = page[page.length - 1].signature;
  }
}

/**
 * Keeps `newestFirst` oldest first: each new signature gets the next place in the chain, pending (or done when it
 * failed); one already kept is left as it is. With `checkpoint`, the source's checkpoint moves to the newest signature
 * in the same transaction. Returns how many were new.
 */
export function keepListed(store: Store, newestFirst: readonly Listed[], checkpoint: string | null): number {
  const insert = store.db.prepare(
    "INSERT OR IGNORE INTO signatures (signature, slot, ord, failed, state) VALUES (?, ?, ?, ?, ?)",
  );
  return store.tx(() => {
    let ord = (store.db.query("SELECT coalesce(max(ord), 0) AS ord FROM signatures").get() as { ord: number }).ord;
    let added = 0;
    for (const s of [...newestFirst].reverse()) {
      if (insert.run(s.signature, s.slot, ord + 1, s.failed ? 1 : 0, s.failed ? "done" : "pending").changes === 0)
        continue;
      ord += 1;
      added += 1;
    }
    const newest = newestFirst[0];
    if (checkpoint !== null && newest)
      store.db.run("INSERT OR REPLACE INTO checkpoints (source, last_signature, last_slot) VALUES (?, ?, ?)", [
        checkpoint,
        newest.signature,
        newest.slot,
      ]);
    return added;
  });
}

/** The checkpoint of `source`: the newest signature listed for it, or `null` before the first listing. */
export const checkpointOf = (store: Store, source: string): string | null =>
  (
    store.db.query("SELECT last_signature FROM checkpoints WHERE source = ?").get(source) as {
      last_signature: string;
    } | null
  )?.last_signature ?? null;
