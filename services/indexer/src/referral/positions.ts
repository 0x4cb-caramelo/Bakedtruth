/**
 * Purpose: the block positions the referral's chain order needs (Sprint 14, lane L14R; order.ts): for each slot where
 *          a referee's link and one of its first entries landed in different transactions, the block's own list of
 *          transaction signatures, read once at `finalized` (`getBlock`, signatures only, no rewards), and the index
 *          of each needed signature kept in `tx_positions`. Nothing else the indexer reads carries a transaction's
 *          index in its block: not `getSignaturesForAddress`, not `getTransaction`, and not the listing's place,
 *          which is wrong for a signature listed late. A position, once read, is never read again; a block the node
 *          does not return leaves the link undecided (earning nothing), and the next refresh tries again.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import type { SolanaRpc } from "@brot/sdk/read";

import type { Store } from "../db/store";
import { joinsOf, linksOf } from "./facts";
import { positionsNeeded } from "./order";

/** Reads the blocks whose order decides a link and is not stored yet; returns how many it read. */
export async function readPositions(rpc: SolanaRpc, store: Store, timeoutMs: number): Promise<number> {
  const known = store.db.prepare("SELECT 1 FROM tx_positions WHERE signature = ?");
  const insert = store.db.prepare("INSERT OR IGNORE INTO tx_positions (signature, slot, position) VALUES (?, ?, ?)");
  const wanted = new Map<number, Set<string>>();
  for (const link of linksOf(store)) {
    const need = positionsNeeded(link, joinsOf(store, link.referee));
    if (!need || need.signatures.every((s) => known.get(s))) continue;
    const slot = wanted.get(need.slot) ?? wanted.set(need.slot, new Set()).get(need.slot)!;
    for (const s of need.signatures) slot.add(s);
  }
  let read = 0;
  for (const [slot, signatures] of wanted) {
    const block = await rpc
      .getBlock(BigInt(slot), {
        ...{ commitment: "finalized", transactionDetails: "signatures", rewards: false },
        maxSupportedTransactionVersion: 0,
      })
      .send({ abortSignal: AbortSignal.timeout(timeoutMs) });
    if (!block) continue;
    const order = new Map((block.signatures as readonly string[]).map((s, i) => [s, i] as const));
    store.tx(() => {
      for (const s of signatures) if (order.has(s)) insert.run(s, slot, order.get(s)!);
    });
    read += 1;
  }
  return read;
}
