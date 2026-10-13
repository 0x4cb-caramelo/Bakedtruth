/**
 * Purpose: one wallet's entries, in pages (TP §6; Sprint 08: since the routing answer (a), no answer may reach the read
 *          API's 1 MB cap): one row per opening it entered, with its two sides, its entry count and what reached it
 *          as a baker, newest first by the wallet's first entry in that opening. That entry's place,
 *          `<slot>:<signature>:<instruction>:<inner>`, is the row's cursor: a total order the chain fixes (the slot,
 *          then the signature's text, then the instruction indexes), so rows of one slot or one transaction never tie
 *          and a rebuilt file pages the same way. A page is the newest `limit` rows whose cursor is below `before`
 *          (all of them without it); `next_before` is its last row's cursor when an older row remains, else null.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import type { WalletEntry } from "@brot/sdk/schemas";

import type { Store } from "../db/store";

export type Cursor = { slot: number; signature: string; ix: number; inner: number };
export type WalletPage = { limit: number; before: Cursor | null };

const CURSOR = /^(\d{1,15}):([1-9A-HJ-NP-Za-km-z]{64,88}):(\d{1,3}):(\d{1,3})$/;

/** A cursor from its text, or null when it is not one. */
export function parseCursor(text: string): Cursor | null {
  const m = CURSOR.exec(text);
  return m ? { slot: Number(m[1]), signature: m[2], ix: Number(m[3]), inner: Number(m[4]) } : null;
}

export const cursorText = (c: Cursor): string => `${c.slot}:${c.signature}:${c.ix}:${c.inner}`;

const compare = (a: Cursor, b: Cursor): number =>
  a.slot - b.slot ||
  (a.signature < b.signature ? -1 : a.signature > b.signature ? 1 : 0) ||
  a.ix - b.ix ||
  a.inner - b.inner;

type Row = { campaign: string; opening: number; side: string; amount: string; slot: number; signature: string } & {
  ix_index: number;
  inner_index: number;
} & Pick<WalletEntry, "id" | "kind" | "status" | "outcome">;
type Group = { row: Row; first: Cursor; yes: bigint; no: bigint; received: bigint; entries: number; last: number };

/** One page of the wallet's rows, newest first, and the cursor of the page before it. */
export function walletEntriesPage(store: Store, wallet: string, page: WalletPage) {
  const rows = store.db
    .query(
      `SELECT e.campaign, e.opening, e.side, e.amount, e.slot, e.signature, e.ix_index, e.inner_index,
         c.id, c.kind, c.status, c.outcome
       FROM entries e JOIN campaigns c ON c.address = e.campaign AND c.opening = e.opening WHERE e.baker = ?`,
    )
    .all(wallet) as Row[];
  const groups = new Map<string, Group>();
  for (const row of rows) {
    const key = `${row.campaign}:${row.opening}`;
    const here: Cursor = { slot: row.slot, signature: row.signature, ix: row.ix_index, inner: row.inner_index };
    const g = groups.get(key) ?? { row, first: here, yes: 0n, no: 0n, received: 0n, entries: 0, last: row.slot };
    groups.set(key, g);
    if (compare(here, g.first) < 0) g.first = here;
    if (row.side === "Yes") g.yes += BigInt(row.amount);
    else g.no += BigInt(row.amount);
    g.entries += 1;
    g.last = Math.max(g.last, row.slot);
  }
  const paid = store.db
    .query("SELECT campaign, opening, paid FROM settlements WHERE recipient = ? AND role = 'baker'")
    .all(wallet) as { campaign: string; opening: number; paid: string }[];
  for (const p of paid) {
    const g = groups.get(`${p.campaign}:${p.opening}`);
    if (g) g.received += BigInt(p.paid);
  }
  const older = [...groups.values()]
    .filter((g) => page.before === null || compare(g.first, page.before) < 0)
    .sort((a, b) => compare(b.first, a.first));
  const kept = older.slice(0, page.limit);
  const items = kept.map((g): WalletEntry => ({
    ...{ campaign: g.row.campaign, opening: g.row.opening, id: g.row.id, kind: g.row.kind, status: g.row.status },
    ...{ outcome: g.row.outcome, yes: g.yes.toString(), no: g.no.toString(), entries: g.entries },
    ...{ received: g.received.toString(), first_slot: String(g.first.slot), last_slot: String(g.last) },
  }));
  return { items, next_before: older.length > page.limit ? cursorText(kept[kept.length - 1].first) : null };
}
