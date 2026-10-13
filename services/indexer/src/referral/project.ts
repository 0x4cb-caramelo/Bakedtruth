/**
 * Purpose: the referral tables (TP §3.4.11, §4; Sprint 14, lane L14R): every referee's rows computed from the
 *          indexer's finalized events (facts.ts, referee.ts) and written whole, in one SQLite transaction, after
 *          each refresh (ingest.ts). They depend on the events only, so a second refresh changes nothing and a
 *          rebuild from the chain writes the same rows (`REBUILDABLE`). A failure here never stops the ingest: the
 *          refresh names it. `computeReferrals` is also what the weekly routine reads, on a read-only handle.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import type { Store } from "../db/store";
import { joinsOf, linksOf, openingFacts, type OpeningFacts } from "./facts";
import { refereeRows, type ReferralEntryRow, type ReferralRow } from "./referee";

export type Referrals = { referrals: ReferralRow[]; entries: ReferralEntryRow[] };

/** Every referee's rows, from the file as it is (call inside a read transaction for one consistent view). */
export function computeReferrals(store: Store): Referrals {
  const cache = new Map<string, OpeningFacts>();
  const factsOf = (campaign: string, opening: number) => {
    const key = `${campaign}:${opening}`;
    return cache.get(key) ?? cache.set(key, openingFacts(store, campaign, opening)).get(key)!;
  };
  const out: Referrals = { referrals: [], entries: [] };
  for (const link of linksOf(store)) {
    const { referral, entries } = refereeRows(link, joinsOf(store, link.referee), factsOf);
    out.referrals.push(referral);
    out.entries.push(...entries);
  }
  return out;
}

/** An INSERT naming the row's columns, bound by name. */
function insertAll(store: Store, table: string, rows: readonly Record<string, string | number | null>[]): void {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]);
  const statement = store.db.prepare(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map((c) => `$${c}`).join(", ")})`,
  );
  for (const row of rows) statement.run(row as never);
}

/** Rewrites both tables from the events, in one transaction. */
export function writeReferrals(store: Store): void {
  store.tx(() => {
    const { referrals, entries } = computeReferrals(store);
    store.db.run("DELETE FROM referral_entries");
    store.db.run("DELETE FROM referrals");
    insertAll(store, "referrals", referrals);
    insertAll(store, "referral_entries", entries);
  });
}
