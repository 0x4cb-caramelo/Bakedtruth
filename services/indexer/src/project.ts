/**
 * Purpose: the projections of one campaign address (TP §4; Sprint 08), rebuilt whole from its stored events each time
 *          one of them lands, so a transaction read late or again for a gap changes nothing but the missing rows.
 *          The address's events in chain order (slot, then the listing's place, then the keys) are split into
 *          openings at each `CampaignOpened` (a closed campaign's address can carry a new one); each opening's
 *          events, in `seq` order, give its `campaigns` row (campaign-row.ts), its `entries` (each `EntryAdded`,
 *          the creator's own wallet flagged) and its `settlements` (`EntrySettled` to a baker, `CreatorShareSettled`
 *          to the creator, `PrizeSettled` to whoever opened it). `gapIn` says whether an opening's `seq` is not
 *          contiguous from 0, which makes the ingest refetch the address's signatures.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { SettleMode, Side, type DecodedEvent } from "@brot/sdk/read";

import { campaignRow } from "./campaign-row";
import { revive, STORED_EVENT, type StoredEvent } from "./codec";
import type { Store } from "./db/store";

type Value = string | number | null;
type Row = Record<string, Value>;

const seqOf = (event: DecodedEvent) => (event.data as { seq?: bigint }).seq ?? -1n;

/** An INSERT naming its columns, bound by name, so a row's key order never matters. */
function inserter(store: Store, table: string) {
  const cache = new Map<string, ReturnType<Store["db"]["prepare"]>>();
  return (row: Row) => {
    const columns = Object.keys(row);
    const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map((c) => `$${c}`).join(", ")})`;
    const statement = cache.get(sql) ?? cache.set(sql, store.db.prepare(sql)).get(sql)!;
    statement.run(row as never);
  };
}

/** The address's events grouped by opening (0 for events before any opening: a gap), each group in `seq` order. */
function openingsOf(store: Store, address: string): Map<number, DecodedEvent[]> {
  const rows = store.db
    .query(`SELECT ${STORED_EVENT} FROM events WHERE campaign = ? ORDER BY slot, ord, ix_index, inner_index`)
    .all(address) as StoredEvent[];
  const mark = store.db.prepare(
    "UPDATE events SET opening = ? WHERE signature = ? AND ix_index = ? AND inner_index = ?",
  );
  const openings = new Map<number, DecodedEvent[]>();
  let opening = 0;
  for (const row of rows) {
    const event = revive(row);
    if (event.name === "CampaignOpened") opening += 1;
    mark.run(opening, row.signature, row.ix_index, row.inner_index);
    (openings.get(opening) ?? openings.set(opening, []).get(opening)!).push(event);
  }
  for (const list of openings.values()) list.sort((a, b) => (seqOf(a) < seqOf(b) ? -1 : seqOf(a) > seqOf(b) ? 1 : 0));
  return openings;
}

/** Rewrites every row the address's events project to. Runs inside the caller's transaction. */
export function projectAddress(store: Store, address: string): void {
  const openings = openingsOf(store, address);
  store.db.run("DELETE FROM campaigns WHERE address = ?", [address]);
  store.db.run("DELETE FROM entries WHERE campaign = ?", [address]);
  store.db.run("DELETE FROM settlements WHERE campaign = ?", [address]);
  const [campaign, entry, settlement] = ["campaigns", "entries", "settlements"].map((t) => inserter(store, t));
  for (const [opening, events] of openings) {
    const row = campaignRow(address, opening, events);
    if (row) campaign(row);
    for (const event of events) {
      const base: Row = {
        signature: event.key.signature,
        ix_index: event.key.ixIndex,
        inner_index: event.key.innerIndex,
        campaign: address,
        opening,
        seq: Number(seqOf(event)),
        slot: Number(event.slot),
        block_time: event.blockTime === null ? null : Number(event.blockTime),
      };
      if (event.name === "EntryAdded") {
        const d = event.data;
        entry({
          ...base,
          baker: d.baker,
          side: Side[d.side],
          amount: d.amount.toString(),
          is_first: d.isFirst ? 1 : 0,
          is_creator: row !== null && row.creator === d.baker ? 1 : 0,
          pool_yes_after: d.poolYes.toString(),
          pool_no_after: d.poolNo.toString(),
        });
      } else if (event.name === "EntrySettled") {
        const d = event.data;
        settlement({
          ...base,
          recipient: d.baker,
          role: "baker",
          paid: d.amount.toString(),
          mode: SettleMode[d.settleMode],
        });
      } else if (event.name === "CreatorShareSettled") {
        const d = event.data;
        settlement({ ...base, recipient: d.creator, role: "creator", paid: d.amount.toString(), mode: null });
      } else if (event.name === "PrizeSettled") {
        const d = event.data;
        const paid = (d.prizeReturned + d.openingFeeReturned).toString();
        settlement({ ...base, recipient: d.recipient, role: "opener", paid, mode: null });
      }
    }
  }
}

/** Whether an opening of the address misses an event: its `seq`s are not 0, 1, 2…, or it has no `CampaignOpened`. */
export function gapIn(store: Store, address: string): boolean {
  const rows = store.db
    .query("SELECT opening, seq, name FROM events WHERE campaign = ? ORDER BY opening, seq")
    .all(address) as { opening: number; seq: number; name: string }[];
  let opening = -1;
  let next = 0;
  for (const row of rows) {
    if (row.opening !== opening) {
      if (row.opening === 0 || row.name !== "CampaignOpened") return true;
      opening = row.opening;
      next = 0;
    }
    if (row.seq !== next) return true;
    next += 1;
  }
  return false;
}
