/**
 * Purpose: what the indexer derives after each refresh from its finalized rows and one read of the live chain (Sprint
 *          08): the live campaign accounts and the chain's clock (live.ts), then the points (points.ts) and the
 *          home page's order (ranking.ts) at that clock. A failed live read leaves both as they were, and the ingest
 *          names the error; nothing derived here ever decides money (K-05).
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import type { Partner } from "@brot/sdk/schemas";

import type { Store } from "./db/store";
import { openAddresses, type ReadLive } from "./live";
import { writePoints } from "./points";
import { writeRanking } from "./ranking";

/** Reads the live chain once, then rewrites the points and the ranking; returns the clock it ranked at. */
export async function refreshDerived(store: Store, readLive: ReadLive, partners: readonly Partner[]): Promise<number> {
  const live = await readLive(openAddresses(store));
  writePoints(store, live);
  const now = Number(live.chain.unixTimestamp);
  writeRanking(store, partners, now);
  return now;
}
