/**
 * Purpose: the indexer's SQLite file behind a small adapter (TP §3.5, §4; Sprint 08): bun:sqlite in WAL mode with
 *          `synchronous = NORMAL` and a busy timeout; the schema created on a new file; a file of another schema
 *          version, or one that is not the indexer's, refused, never migrated in place (rebuild it instead). One
 *          writer, the ingest; readers open it read-only. `tx` runs one SQLite transaction (a nested call is a
 *          savepoint); `dump` lists the rebuildable rows in a fixed order, for the rebuild check.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { Database } from "bun:sqlite";

import { REBUILDABLE, SCHEMA, SCHEMA_VERSION } from "./schema";

export type Store = {
  readonly db: Database;
  tx<T>(work: () => T): T;
  close(): void;
};

/** A file the indexer will not open as it is. */
export class StoreRefused extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreRefused";
  }
}

const one = <T>(db: Database, sql: string) => db.query(sql).get() as T;

export function openStore(path: string, options: { readonly?: boolean } = {}): Store {
  const readonly = options.readonly === true;
  const db = readonly ? new Database(path, { readonly: true, strict: true }) : new Database(path, { strict: true });
  try {
    db.exec("PRAGMA busy_timeout = 5000");
    if (!readonly) {
      db.exec("PRAGMA journal_mode = WAL");
      db.exec("PRAGMA synchronous = NORMAL");
    }
    const version = one<{ user_version: number }>(db, "PRAGMA user_version").user_version;
    if (version === 0) {
      if (one<{ n: number }>(db, "SELECT count(*) AS n FROM sqlite_master").n > 0)
        throw new StoreRefused("not the indexer's file: it has tables and no schema version");
      if (readonly) throw new StoreRefused("an empty file: the ingest creates the schema");
      db.transaction(() => {
        for (const sql of SCHEMA) db.exec(sql);
        db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
      })();
    } else if (version !== SCHEMA_VERSION) {
      throw new StoreRefused(`schema version ${version}, not ${SCHEMA_VERSION}: rebuild the file`);
    }
  } catch (error) {
    db.close();
    throw error;
  }
  return { db, tx: (work) => db.transaction(work)(), close: () => db.close() };
}

/** Every rebuildable row, table by table, in a fixed order: two files with equal dumps hold the same content. */
export function dump(store: Store): Record<string, unknown[]> {
  const out: Record<string, unknown[]> = {};
  for (const { table, columns, order } of REBUILDABLE)
    out[table] = store.db.query(`SELECT ${columns} FROM ${table} ORDER BY ${order}`).all();
  return out;
}
