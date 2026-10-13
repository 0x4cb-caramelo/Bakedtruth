/**
 * Purpose: the hook of the nightly snapshot (TP §3.5 "Snapshots", T16; Sprint 08 DoD "Evidence and snapshots"): the
 *          live file copied whole into a new file, consistent at one moment, by SQLite's `VACUUM INTO`, through a
 *          read-only handle beside the running ingest (WAL), so the indexer's own writes are never touched. The copy
 *          carries the evidence table `feed_history`, which RPC cannot rebuild, with everything rebuildable; it is a
 *          single file in rollback-journal mode, with the same schema version, so `openStore` opens it as it is.
 *          Refuses a target that exists. Not here, and not built: the nightly timer and the copy to VM 2, where
 *          Sprint 07's standby receives it; the operator wires both to this command.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * Run (as the indexer's user): bun services/indexer/src/snapshot.ts <live file> <new snapshot file>
 */
import { existsSync, statSync } from "node:fs";

import { openStore } from "./db/store";

/** Copies the indexer's file at `source` into the new file `target`; returns the copy's size in bytes. */
export function snapshotInto(source: string, target: string): number {
  if (existsSync(target)) throw new Error("a snapshot writes a new file; this one exists");
  const store = openStore(source, { readonly: true });
  try {
    store.db.query("VACUUM INTO ?").run(target);
  } finally {
    store.close();
  }
  return statSync(target).size;
}

if (import.meta.main) {
  const [source, target] = process.argv.slice(2);
  if (!source || !target)
    throw new Error("usage: bun services/indexer/src/snapshot.ts <live file> <new snapshot file>");
  console.log(JSON.stringify({ event: "snapshot", bytes: snapshotInto(source, target) }));
}
