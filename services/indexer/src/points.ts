/**
 * Purpose: the `points` table (Q7, the founder's answer 3a; Sprint 08): the SDK's own rule (`pointsTable`) over every
 *          stored event in chain order and what the live accounts say now (live.ts), the same inputs the read API's
 *          leaderboard uses, so both give each wallet the same points. Replaced whole in one transaction, with the
 *          slot it was computed at; a failed live read leaves the last table as it was. Volume never scores.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { pointsTable, type DecodedEvent } from "@brot/sdk/read";

import { revive, STORED_EVENT, type StoredEvent } from "./codec";
import type { Store } from "./db/store";
import { openAddresses, type ReadLive } from "./live";

/** Every stored event in chain order: slot, then the listing's place, then the keys. */
export const chainEvents = (store: Store): DecodedEvent[] =>
  (
    store.db
      .query(`SELECT ${STORED_EVENT} FROM events ORDER BY slot, ord, ix_index, inner_index`)
      .all() as StoredEvent[]
  ).map(revive);

/** Recomputes the table from the events and the live accounts. */
export async function refreshPoints(store: Store, readLive: ReadLive): Promise<void> {
  const live = await readLive(openAddresses(store));
  const rows = pointsTable(chainEvents(store), live.now);
  const insert = store.db.prepare(
    "INSERT INTO points (wallet, points, entered, decided, updated_slot) VALUES (?, ?, ?, ?, ?)",
  );
  store.tx(() => {
    store.db.run("DELETE FROM points");
    for (const row of rows) insert.run(row.wallet, row.points, row.entered, row.decided, Number(live.chain.slot));
  });
}
