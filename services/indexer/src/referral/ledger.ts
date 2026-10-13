/**
 * Purpose: the referral payouts' ledger (TP §3.4.11, "its ledger is an evidence table snapshotted nightly (A-4)";
 *          Sprint 14, lane L14R): the `referral_payouts` evidence table and the batches it was prepared in, in a SQLite
 *          file of its own, apart from the indexer's, so a rebuild of the indexer (a new file swapped in) can never
 *          erase what was paid and make the routine pay it again. One row per transfer prepared or carried, and one
 *          per transfer the chain shows landed (by its signature and instruction, unique). What a wallet was paid is the sum of its
 *          landed rows; what is in flight, the sum of its prepared rows. A file that is not a ledger is refused.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 *
 * Statuses: `prepared` (in a signing file, not seen on-chain yet), `carried` (not sent: it would leave the wallet
 * below the rent-exempt minimum; owed again next week), `landed` (seen on-chain at finalized, with its signature),
 * `cancelled` (the operator gave it up before it landed; owed again; a later landing still counts as paid).
 */
import { Database } from "bun:sqlite";

import type { Store } from "../db/store";

export const LEDGER_VERSION = 1;
/** `PRAGMA application_id` of a ledger file ("BRLG"): the indexer's own file never carries it. */
export const LEDGER_APPLICATION_ID = 0x42524c47;

const SCHEMA = [
  `CREATE TABLE batches (
    batch INTEGER PRIMARY KEY, ops_wallet TEXT NOT NULL, as_of_slot INTEGER NOT NULL, rent_min TEXT NOT NULL,
    prepared_at INTEGER NOT NULL)`,
  `CREATE TABLE referral_payouts (
    id INTEGER PRIMARY KEY, batch INTEGER NOT NULL, idx INTEGER NOT NULL, wallet TEXT NOT NULL, amount TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('prepared', 'carried', 'landed', 'cancelled')),
    earned_referrer TEXT, earned_rebate TEXT, paid_before TEXT, balance TEXT, rent_min TEXT,
    signature TEXT, ix INTEGER, slot INTEGER, note TEXT, UNIQUE (signature, ix))`,
  `CREATE INDEX referral_payouts_batch ON referral_payouts (batch, idx)`,
  `CREATE INDEX referral_payouts_wallet ON referral_payouts (wallet, status)`,
  `CREATE TABLE scans (ops_wallet TEXT PRIMARY KEY, last_signature TEXT NOT NULL, last_slot INTEGER NOT NULL)`,
];

/** A file the routine will not use as its ledger. */
export class LedgerRefused extends Error {
  override name = "LedgerRefused";
}

const one = <T>(db: Database, sql: string) => db.query(sql).get() as T;

/** Checks a ledger's marks, or gives a new empty file its schema; throws for anything else. */
function prepare(db: Database, readonly: boolean): void {
  const app = one<{ application_id: number }>(db, "PRAGMA application_id").application_id;
  const version = one<{ user_version: number }>(db, "PRAGMA user_version").user_version;
  const tables = one<{ n: number }>(db, "SELECT count(*) AS n FROM sqlite_master").n;
  if (app === 0 && version === 0 && tables === 0 && !readonly) {
    db.transaction(() => {
      for (const sql of SCHEMA) db.exec(sql);
      db.exec(`PRAGMA application_id = ${LEDGER_APPLICATION_ID}`);
      db.exec(`PRAGMA user_version = ${LEDGER_VERSION}`);
    })();
    return;
  }
  if (app !== LEDGER_APPLICATION_ID) throw new LedgerRefused("not a referral ledger: refused, left as it was");
  if (version !== LEDGER_VERSION) throw new LedgerRefused(`ledger version ${version}, not ${LEDGER_VERSION}`);
}

const storeOf = (db: Database): Store => ({ db, tx: (work) => db.transaction(work)(), close: () => db.close() });

/** Opens (or creates) the ledger at `path`; `:memory:` gives an empty one. */
export function openLedger(path: string, options: { readonly?: boolean } = {}): Store {
  const readonly = options.readonly === true;
  const db = readonly ? new Database(path, { readonly: true, strict: true }) : new Database(path, { strict: true });
  try {
    db.exec("PRAGMA busy_timeout = 5000");
    if (!readonly && path !== ":memory:") db.exec("PRAGMA journal_mode = WAL");
    prepare(db, readonly);
  } catch (error) {
    db.close();
    throw error;
  }
  return storeOf(db);
}

/** A throwaway in-memory copy of the ledger at `path` (or an empty ledger without one), for a dry run. */
export function ledgerCopy(path: string | null): Store {
  if (path === null) return openLedger(":memory:");
  const source = openLedger(path, { readonly: true });
  const bytes = source.db.serialize();
  source.close();
  // A WAL file's header says so (bytes 18 and 19 are 2); an in-memory image must say rollback journal (1).
  bytes[18] = 1;
  bytes[19] = 1;
  const db = Database.deserialize(bytes, { strict: true });
  prepare(db, false);
  return storeOf(db);
}

type Sum = { wallet: string; total: string };
const sums = (ledger: Store, status: string): Map<string, bigint> => {
  const rows = ledger.db
    .query("SELECT wallet, amount AS total FROM referral_payouts WHERE status = ?")
    .all(status) as Sum[];
  const out = new Map<string, bigint>();
  for (const r of rows) out.set(r.wallet, (out.get(r.wallet) ?? 0n) + BigInt(r.total));
  return out;
};

/** What reached each wallet: its landed rows. */
export const paidByWallet = (ledger: Store) => sums(ledger, "landed");
/** What is in a signing file and not seen on-chain yet: its prepared rows. */
export const inFlightByWallet = (ledger: Store) => sums(ledger, "prepared");

/** The batch that still has prepared rows, or `null`. */
export const openBatch = (ledger: Store): number | null =>
  (
    ledger.db.query("SELECT min(batch) AS b FROM referral_payouts WHERE status = 'prepared'").get() as {
      b: number | null;
    }
  ).b;

/** The next batch's number. */
export const nextBatch = (ledger: Store): number =>
  (ledger.db.query("SELECT coalesce(max(batch), 0) + 1 AS b FROM batches").get() as { b: number }).b;

/** Anything written since: the count and the last id, compared before a batch is written. */
export const ledgerMark = (ledger: Store): string =>
  JSON.stringify(ledger.db.query("SELECT count(*) AS n, max(id) AS id FROM referral_payouts").get());

/** Gives up a batch's transfers that have not landed: owed again; one that lands later still counts as paid. */
export const cancelBatch = (ledger: Store, batch: number): number =>
  ledger.db.run("UPDATE referral_payouts SET status = 'cancelled' WHERE batch = ? AND status = 'prepared'", [batch])
    .changes;

/** Each batch's rows by status, for what `record` prints. */
export const batchStatus = (ledger: Store) =>
  ledger.db
    .query("SELECT batch, status, count(*) AS n FROM referral_payouts GROUP BY batch, status ORDER BY batch, status")
    .all() as { batch: number; status: string; n: number }[];
