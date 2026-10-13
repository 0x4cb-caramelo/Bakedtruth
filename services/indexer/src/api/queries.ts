/**
 * Purpose: the indexer's read routes as queries over its SQLite file (TP §6; Sprint 08, slice 2), each row shaped as
 *          @brot/sdk/schemas says: the rows the routes share (an entry, a settlement, another event, where each sits),
 *          the recent entries across campaigns, and how fresh the file is. Chain order is (slot, ord, instruction,
 *          inner): a signature listed late for a gap still sorts by its slot. One campaign's lists are paged in
 *          campaign-pages.ts, one wallet's in wallet-pages.ts. Reads only; the ingest is the one writer.
 * Version: 0.2.0 (the paged lists moved to campaign-pages.ts and wallet-pages.ts)
 * Sprint:  08 (indexer, API, relay and points), slice 2
 */
import type { EntryItem } from "@brot/sdk/schemas";

import type { Store } from "../db/store";

export type Key = { signature: string; ix_index: number; inner_index: number; slot: number; ord: number };
export type EntryRow = Key & {
  campaign: string;
  opening: number;
  seq: number;
  baker: string;
  side: string;
  amount: string;
  is_first: number;
  is_creator: number;
  pool_yes_after: string;
  pool_no_after: string;
  block_time: number | null;
};
export type SettlementRow = Key & {
  campaign: string;
  opening: number;
  seq: number;
  recipient: string;
  role: "baker" | "creator" | "opener";
  paid: string;
  mode: string | null;
  block_time: number | null;
};
export type EventRow = Key & {
  campaign: string;
  opening: number;
  seq: number | null;
  name: string;
  block_time: number | null;
};

export const time = (t: number | null) => (t === null ? null : String(t));
export const placed = (r: Key & { campaign: string; opening: number; block_time: number | null }) => ({
  signature: r.signature,
  slot: String(r.slot),
  block_time: time(r.block_time),
  campaign: r.campaign,
  opening: r.opening,
});

export const entryItem = (r: EntryRow): EntryItem => ({
  type: "entry",
  ...placed(r),
  seq: String(r.seq),
  baker: r.baker,
  side: r.side === "Yes" ? "yes" : "no",
  amount: r.amount,
  is_first: r.is_first === 1,
  is_creator: r.is_creator === 1,
  pool_yes_after: r.pool_yes_after,
  pool_no_after: r.pool_no_after,
});

export const ENTRY = "SELECT e.*, s.ord FROM entries e JOIN signatures s USING (signature)";
/** Newest first: every column of the chain order descending (a single DESC would only turn the last one). */
const NEWEST = (t: string) => `${t}.slot DESC, ord DESC, ${t}.ix_index DESC, ${t}.inner_index DESC`;

/** The last slot read in full (every signature at or below it is read), and that slot's block time. */
export function freshness(store: Store): { as_of_slot: string; chain_time: string | null } {
  const q = <T>(sql: string, ...args: (string | number)[]) => store.db.query(sql).get(...args) as T;
  const pending = q<{ slot: number | null }>("SELECT min(slot) AS slot FROM signatures WHERE state = 'pending'").slot;
  const listed = q<{ slot: number | null }>("SELECT max(last_slot) AS slot FROM checkpoints").slot ?? 0;
  const asOf = pending === null ? listed : Math.max(0, pending - 1);
  const t = q<{ t: number | null }>("SELECT max(block_time) AS t FROM events WHERE slot <= ?", asOf).t;
  return { as_of_slot: String(asOf), chain_time: time(t) };
}

/** The latest opening at `address`, or `null` when no campaign was ever opened there. */
export const latestOpening = (store: Store, address: string): number | null =>
  (store.db.query("SELECT max(opening) AS o FROM campaigns WHERE address = ?").get(address) as { o: number | null }).o;

/** The newest entries across every campaign, newest first. */
export const recentEntries = (store: Store, limit: number): EntryItem[] =>
  (store.db.query(`${ENTRY} ORDER BY ${NEWEST("e")} LIMIT ?`).all(limit) as EntryRow[]).map(entryItem);
