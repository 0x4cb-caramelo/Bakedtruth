/**
 * Purpose: the block positions the referral's chain order needs (Sprint 14, lane L14R; order.ts): for each slot where
 *          a referee's link and one of its first entries landed in different transactions, the block's own list of
 *          transaction signatures, read once at `finalized` (`getBlock`, signatures only, no rewards), and the index
 *          of each needed signature kept in `tx_positions`. Nothing else the indexer reads carries a transaction's
 *          index in its block: not `getSignaturesForAddress`, not `getTransaction`, and not the listing's place,
 *          which is wrong for a signature listed late. A position, once read, is never read again; a block the node
 *          does not return leaves the link undecided (earning nothing), and the next refresh tries again. A block is
 *          read up to the SDK's MAX_TRANSACTION_VERSION; one holding a transaction of a newer version (-32015) is
 *          skipped and counted, its links undecided until it can be read: safe, since an undecided link earns nothing,
 *          so nothing is ever paid on a guessed order (Sprint 16, the review's F1).
 * Version: 0.2.0 (Sprint 16: every transaction version the cluster serves; an unreadable block skipped and counted)
 * Sprint:  14 (referral, lane L14R); 16
 */
import { isUnsupportedVersion, MAX_TRANSACTION_VERSION, type SolanaRpc } from "@brot/sdk/read";

import type { Store } from "../db/store";
import { joinsOf, linksOf } from "./facts";
import { positionsNeeded } from "./order";

/** Reads the blocks whose order decides a link and is not stored yet; returns how many it read and the unreadable. */
export async function readPositions(
  rpc: SolanaRpc,
  store: Store,
  timeoutMs: number,
): Promise<{ read: number; unreadable: number[] }> {
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
  const unreadable: number[] = [];
  for (const [slot, signatures] of wanted) {
    let block;
    try {
      block = await rpc
        .getBlock(BigInt(slot), {
          ...{ commitment: "finalized", transactionDetails: "signatures", rewards: false },
          maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION,
        })
        .send({ abortSignal: AbortSignal.timeout(timeoutMs) });
    } catch (caught) {
      if (!isUnsupportedVersion(caught)) throw caught;
      unreadable.push(slot); // its links stay undecided, earning nothing, until it can be read
      continue;
    }
    if (!block) continue;
    const order = new Map((block.signatures as readonly string[]).map((s, i) => [s, i] as const));
    store.tx(() => {
      for (const s of signatures) if (order.has(s)) insert.run(s, slot, order.get(s)!);
    });
    read += 1;
  }
  return { read, unreadable };
}
