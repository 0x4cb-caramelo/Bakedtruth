/**
 * Purpose: the indexer's SQLite adapter (Sprint 08) with no cluster: a new file gets the schema, WAL mode and its
 *          version; it opens again as it is; a file of another version, or one that is not the indexer's, is refused
 *          and never changed; a read-only open refuses an empty file and every write; `tx` rolls back on a throw; the
 *          dump lists the rebuildable tables. Filter: `bun test services/indexer`.
 * Version: 0.1.1 (schema 2: the referral tables, rebuildable)
 * Sprint:  08 (indexer, API, relay and points); 14 (referral, lane L14R)
 */
import { afterAll, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { SCHEMA_VERSION } from "../src/db/schema";
import { dump, openStore } from "../src/db/store";

const dir = mkdtempSync(join(tmpdir(), "brot-indexer-store-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));
const file = (name: string) => join(dir, name);

describe("the indexer's SQLite file", () => {
  test("a new file gets the schema, WAL mode and its version, and opens again as it is", () => {
    const store = openStore(file("new.sqlite"));
    expect((store.db.query("PRAGMA journal_mode").get() as { journal_mode: string }).journal_mode).toBe("wal");
    expect((store.db.query("PRAGMA user_version").get() as { user_version: number }).user_version).toBe(SCHEMA_VERSION);
    const tables = store.db.query("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all();
    expect(tables.map((t) => (t as { name: string }).name)).toEqual([
      "campaigns",
      "checkpoints",
      "entries",
      "events",
      "feed_history",
      "points",
      "referral_entries",
      "referrals",
      "settlements",
      "signatures",
      "tx_positions",
    ]);
    store.db.run("INSERT INTO checkpoints VALUES ('program', 'sig', 7)");
    store.close();
    const again = openStore(file("new.sqlite"));
    expect(dump(again).checkpoints).toEqual([{ source: "program", last_signature: "sig", last_slot: 7 }]);
    expect(Object.keys(dump(again))).toEqual([
      "signatures",
      "events",
      "campaigns",
      "entries",
      "settlements",
      "points",
      "checkpoints",
      "referrals",
      "referral_entries",
      "tx_positions",
    ]);
    again.close();
  });

  test("another schema version, or a file that is not the indexer's, is refused and left as it was", () => {
    const old = new Database(file("old.sqlite"));
    old.exec("CREATE TABLE events (x TEXT)");
    old.exec(`PRAGMA user_version = ${SCHEMA_VERSION + 1}`);
    old.close();
    expect(() => openStore(file("old.sqlite"))).toThrow(`schema version ${SCHEMA_VERSION + 1}`);
    const foreign = new Database(file("foreign.sqlite"));
    foreign.exec("CREATE TABLE notes (x TEXT)");
    foreign.close();
    expect(() => openStore(file("foreign.sqlite"))).toThrow("not the indexer's file");
    const kept = new Database(file("foreign.sqlite"));
    expect(kept.query("SELECT name FROM sqlite_master").all()).toEqual([{ name: "notes" }]);
    kept.close();
  });

  test("read-only: an empty file is refused, and nothing can be written", () => {
    new Database(file("empty.sqlite")).close();
    expect(() => openStore(file("empty.sqlite"), { readonly: true })).toThrow("empty file");
    openStore(file("ro.sqlite")).close();
    const reader = openStore(file("ro.sqlite"), { readonly: true });
    expect(() => reader.db.run("INSERT INTO checkpoints VALUES ('program', 'sig', 7)")).toThrow();
    reader.close();
  });

  test("tx is one transaction: a throw inside it leaves nothing behind", () => {
    const store = openStore(":memory:");
    expect(() =>
      store.tx(() => {
        store.db.run("INSERT INTO checkpoints VALUES ('program', 'sig', 7)");
        throw new Error("halfway");
      }),
    ).toThrow("halfway");
    expect(dump(store).checkpoints).toEqual([]);
    store.close();
  });
});
