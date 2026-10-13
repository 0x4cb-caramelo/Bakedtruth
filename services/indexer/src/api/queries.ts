/**
 * Purpose: the indexer's read routes as queries over its SQLite file (TP §6; Sprint 08, slice 2), each row shaped as
 *          @brot/sdk/schemas says: one campaign's activity in chain order (its entries, its settlements, and every
 *          other event of it by name), the history of its split, the recent entries across campaigns, one wallet's
 *          entries with what reached it, and how fresh the file is. Chain order is (slot, ord, instruction, inner):
 *          a signature listed late for a gap still sorts by its slot. Reads only; the ingest is the one writer.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points), slice 2
 */
import type { ActivityItem, ChancePoint, EntryItem, WalletEntry } from "@brot/sdk/schemas";

import type { Store } from "../db/store";

type Key = { signature: string; ix_index: number; inner_index: number; slot: number; ord: number };
type EntryRow = Key & {
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
type SettlementRow = Key & {
  campaign: string;
  opening: number;
  seq: number;
  recipient: string;
  role: "baker" | "creator" | "opener";
  paid: string;
  mode: string | null;
  block_time: number | null;
};
type EventRow = Key & {
  campaign: string;
  opening: number;
  seq: number | null;
  name: string;
  block_time: number | null;
};

const time = (t: number | null) => (t === null ? null : String(t));
const placed = (r: Key & { campaign: string; opening: number; block_time: number | null }) => ({
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

const ENTRY = "SELECT e.*, s.ord FROM entries e JOIN signatures s USING (signature)";
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

/** Every item of one opening, oldest first. */
export function campaignActivity(store: Store, address: string, opening: number): ActivityItem[] {
  const args = [address, opening] as const;
  const entries = store.db.query(`${ENTRY} WHERE e.campaign = ? AND e.opening = ?`).all(...args) as EntryRow[];
  const settlements = store.db
    .query(
      "SELECT t.*, s.ord FROM settlements t JOIN signatures s USING (signature) WHERE t.campaign = ? AND t.opening = ?",
    )
    .all(...args) as SettlementRow[];
  // The other events: those that are neither an entry nor a settlement row.
  const others = store.db
    .query(
      `SELECT v.signature, v.ix_index, v.inner_index, v.slot, v.ord, v.block_time, v.campaign, v.opening, v.seq, v.name
       FROM events v WHERE v.campaign = ? AND v.opening = ?
       AND NOT EXISTS (SELECT 1 FROM entries e WHERE e.signature = v.signature AND e.ix_index = v.ix_index
                       AND e.inner_index = v.inner_index)
       AND NOT EXISTS (SELECT 1 FROM settlements t WHERE t.signature = v.signature AND t.ix_index = v.ix_index
                       AND t.inner_index = v.inner_index)`,
    )
    .all(...args) as EventRow[];
  const items: (Key & { item: ActivityItem })[] = [
    ...entries.map((r) => ({ ...r, item: entryItem(r) })),
    ...settlements.map((r) => ({
      ...r,
      item: {
        type: "settlement" as const,
        ...placed(r),
        seq: String(r.seq),
        recipient: r.recipient,
        role: r.role,
        paid: r.paid,
        mode: r.mode,
      },
    })),
    ...others.map((r) => ({
      ...r,
      item: { type: "event" as const, ...placed(r), seq: r.seq === null ? null : String(r.seq), name: r.name },
    })),
  ];
  const order = (a: Key, b: Key) =>
    a.slot - b.slot || a.ord - b.ord || a.ix_index - b.ix_index || a.inner_index - b.inner_index;
  return items.sort(order).map((x) => x.item);
}

/** The split after each entry of one opening, in `seq` order. */
export function campaignChance(store: Store, address: string, opening: number): ChancePoint[] {
  const rows = store.db
    .query(`${ENTRY} WHERE e.campaign = ? AND e.opening = ? ORDER BY e.seq`)
    .all(address, opening) as EntryRow[];
  return rows.map((r) => {
    const yes = BigInt(r.pool_yes_after);
    const pot = yes + BigInt(r.pool_no_after);
    return {
      seq: String(r.seq),
      slot: String(r.slot),
      block_time: time(r.block_time),
      pool_yes: r.pool_yes_after,
      pool_no: r.pool_no_after,
      yes_bps: pot === 0n ? 0 : Number((yes * 10_000n) / pot),
    };
  });
}

/** The newest entries across every campaign, newest first. */
export const recentEntries = (store: Store, limit: number): EntryItem[] =>
  (store.db.query(`${ENTRY} ORDER BY ${NEWEST("e")} LIMIT ?`).all(limit) as EntryRow[]).map(entryItem);

/** One wallet's entries, one row per opening it entered, newest first, with what reached it as a baker. */
export function walletEntries(store: Store, wallet: string): WalletEntry[] {
  type Row = Pick<EntryRow, "campaign" | "opening" | "side" | "amount" | "slot"> &
    Pick<WalletEntry, "id" | "kind" | "status" | "outcome">;
  const rows = store.db
    .query(
      `SELECT e.campaign, e.opening, e.side, e.amount, e.slot, c.id, c.kind, c.status, c.outcome
       FROM entries e JOIN campaigns c ON c.address = e.campaign AND c.opening = e.opening
       WHERE e.baker = ? ORDER BY e.slot`,
    )
    .all(wallet) as Row[];
  const paid = store.db
    .query("SELECT campaign, opening, paid FROM settlements WHERE recipient = ? AND role = 'baker'")
    .all(wallet) as { campaign: string; opening: number; paid: string }[];
  type Sums = { yes: bigint; no: bigint; received: bigint; entries: number; first: number; last: number };
  const by = new Map<string, { row: Row; sums: Sums }>();
  for (const row of rows) {
    const key = `${row.campaign}:${row.opening}`;
    const at = by.get(key) ?? { row, sums: { yes: 0n, no: 0n, received: 0n, entries: 0, first: row.slot, last: 0 } };
    by.set(key, at);
    if (row.side === "Yes") at.sums.yes += BigInt(row.amount);
    else at.sums.no += BigInt(row.amount);
    at.sums.entries += 1;
    at.sums.last = row.slot;
  }
  for (const p of paid) {
    const at = by.get(`${p.campaign}:${p.opening}`);
    if (at) at.sums.received += BigInt(p.paid);
  }
  return [...by.values()].reverse().map(({ row, sums }) => ({
    campaign: row.campaign,
    opening: row.opening,
    id: row.id,
    kind: row.kind,
    status: row.status,
    outcome: row.outcome,
    yes: sums.yes.toString(),
    no: sums.no.toString(),
    entries: sums.entries,
    received: sums.received.toString(),
    first_slot: String(sums.first),
    last_slot: String(sums.last),
  }));
}
