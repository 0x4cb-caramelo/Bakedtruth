/**
 * Purpose: one campaign's lists, in pages (TP §6; Sprint 08: since the routing answer (a), no answer may reach the read
 *          API's 1 MB cap): its activity (its entries, its settlements, and every other event of one opening, by name)
 *          and the history of its split after each entry. Both run in the campaign's own order, its `seq`: the order
 *          the program wrote its events, one number per event of an opening, so items of one slot or one transaction
 *          never tie. A page is the newest `limit` items whose `seq` is below `before` (all of them without it),
 *          returned oldest first, as these routes always listed; `next_before` is the oldest item's `seq` when an
 *          older one remains, else null: passed as `?before=`, it gives the page before.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import type { ActivityItem, ChancePoint } from "@brot/sdk/schemas";

import type { Store } from "../db/store";
import { ENTRY, entryItem, placed, time, type EntryRow, type EventRow, type SettlementRow } from "./queries";

export type SeqPage = { limit: number; before: number | null };
type Window = { lo: number; hi: number; next_before: string | null };

const BEFORE_ALL = Number.MAX_SAFE_INTEGER;
/** The rows of table alias `t` in one opening's page, bound as (campaign, opening, lo, hi). */
const inPage = (t: string) => `${t}.campaign = ? AND ${t}.opening = ? AND ${t}.seq BETWEEN ? AND ?`;

/** The `seq` range of the page among `table`'s rows of the opening, or null for an empty page. */
function windowOf(store: Store, table: string, at: string, opening: number, page: SeqPage): Window | null {
  const seqs = (
    store.db
      .query(`SELECT seq FROM ${table} WHERE campaign = ? AND opening = ? AND seq < ? ORDER BY seq DESC LIMIT ?`)
      .all(at, opening, page.before ?? BEFORE_ALL, page.limit + 1) as { seq: number }[]
  ).map((r) => r.seq);
  if (seqs.length === 0) return null;
  const kept = seqs.slice(0, page.limit);
  const lo = kept[kept.length - 1];
  return { lo, hi: kept[0], next_before: seqs.length > page.limit ? String(lo) : null };
}

/** One page of an opening's items, oldest first, and the cursor of the page before it. */
export function campaignActivityPage(store: Store, at: string, opening: number, page: SeqPage) {
  const w = windowOf(store, "events", at, opening, page);
  if (w === null) return { items: [] as ActivityItem[], next_before: null };
  const args = [at, opening, w.lo, w.hi] as const;
  const entries = store.db.query(`${ENTRY} WHERE ${inPage("e")}`).all(...args) as EntryRow[];
  const settlements = store.db
    .query(`SELECT t.*, s.ord FROM settlements t JOIN signatures s USING (signature) WHERE ${inPage("t")}`)
    .all(...args) as SettlementRow[];
  // The other events: those that are neither an entry nor a settlement row.
  const others = store.db
    .query(
      `SELECT v.signature, v.ix_index, v.inner_index, v.slot, v.ord, v.block_time, v.campaign, v.opening, v.seq, v.name
       FROM events v WHERE ${inPage("v")}
       AND NOT EXISTS (SELECT 1 FROM entries e WHERE e.signature = v.signature AND e.ix_index = v.ix_index
                       AND e.inner_index = v.inner_index)
       AND NOT EXISTS (SELECT 1 FROM settlements t WHERE t.signature = v.signature AND t.ix_index = v.ix_index
                       AND t.inner_index = v.inner_index)`,
    )
    .all(...args) as EventRow[];
  const items: { seq: number; item: ActivityItem }[] = [
    ...entries.map((r) => ({ seq: r.seq, item: entryItem(r) })),
    ...settlements.map((r) => ({
      seq: r.seq,
      item: {
        type: "settlement" as const,
        ...placed(r),
        ...{ seq: String(r.seq), recipient: r.recipient, role: r.role, paid: r.paid, mode: r.mode },
      },
    })),
    ...others.map((r) => ({
      seq: r.seq ?? -1,
      item: { type: "event" as const, ...placed(r), seq: r.seq === null ? null : String(r.seq), name: r.name },
    })),
  ];
  return { items: items.sort((a, b) => a.seq - b.seq).map((x) => x.item), next_before: w.next_before };
}

/** One page of the split after each entry of an opening, in `seq` order, and the cursor of the page before it. */
export function campaignChancePage(store: Store, at: string, opening: number, page: SeqPage) {
  const w = windowOf(store, "entries", at, opening, page);
  if (w === null) return { points: [] as ChancePoint[], next_before: null };
  const rows = store.db
    .query(`${ENTRY} WHERE ${inPage("e")} ORDER BY e.seq`)
    .all(at, opening, w.lo, w.hi) as EntryRow[];
  const points = rows.map((r): ChancePoint => {
    const yes = BigInt(r.pool_yes_after);
    const pot = yes + BigInt(r.pool_no_after);
    return {
      ...{ seq: String(r.seq), slot: String(r.slot), block_time: time(r.block_time) },
      ...{ pool_yes: r.pool_yes_after, pool_no: r.pool_no_after },
      yes_bps: pot === 0n ? 0 : Number((yes * 10_000n) / pot),
    };
  });
  return { points, next_before: w.next_before };
}
