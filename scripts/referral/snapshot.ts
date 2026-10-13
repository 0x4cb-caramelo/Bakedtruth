/**
 * Purpose: the hook of the referral ledger's nightly snapshot (TP §3.4.11, "its ledger is an evidence table snapshotted
 *          nightly (A-4)"; Sprint 14, lane L14R), like the indexer's (services/indexer/src/snapshot.ts): the ledger
 *          copied whole into a new file, consistent at one moment, by SQLite's `VACUUM INTO`, through a read-only
 *          handle beside any running command (WAL). The copy keeps the ledger's marks, so it opens as a ledger. It
 *          refuses a target that exists. Not here, and not built: the nightly timer and the copy to VM 2; the operator
 *          wires both to this command, as for the indexer's file.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 *
 * Run (as the indexer's user): bun scripts/referral/snapshot.ts <referral-ledger.sqlite> <new snapshot file>
 */
import { existsSync, statSync } from "node:fs";

import { openLedger } from "../../services/indexer/src/referral/ledger";
import { runCommand, UsageError } from "./common";

/** Copies the ledger at `source` into the new file `target`; returns the copy's size in bytes. */
export function snapshotLedger(source: string, target: string): number {
  if (!existsSync(source)) throw new UsageError(`no such ledger: ${source}`);
  if (existsSync(target)) throw new UsageError("a snapshot writes a new file; this one exists");
  const ledger = openLedger(source, { readonly: true });
  try {
    ledger.db.query("VACUUM INTO ?").run(target);
  } finally {
    ledger.close();
  }
  return statSync(target).size;
}

if (import.meta.main)
  await runCommand(async () => {
    const [source, target] = process.argv.slice(2);
    if (!source || !target) throw new UsageError("usage: bun scripts/referral/snapshot.ts <ledger> <new file>");
    return `${JSON.stringify({ event: "referral-ledger-snapshot", bytes: snapshotLedger(source, target) })}\n`;
  });
