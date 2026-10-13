/**
 * Purpose: the rebuild (proposal §2.7; Sprint 08 DoD, X1.3): the program's whole history replayed into a new file, from
 *          its first signature, through the same ingest; the result must equal the live file (`dump`, the evidence
 *          tables aside). It never touches the live file: it refuses a path that already exists and leaves the swap to
 *          the operator. It refreshes until nothing is pending, or gives up after `maxRefreshes` and says so.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * Run: INDEXER_RPC_URL=... bun services/indexer/src/rebuild.ts <new file>
 */
import { existsSync } from "node:fs";
import { rpcFor, type SolanaRpc } from "@brot/sdk/read";

import { openStore, type Store } from "./db/store";
import { createIngest, type IngestOptions, type IngestReport } from "./ingest";

export type Rebuilt = { store: Store; refreshes: number; complete: boolean; last: IngestReport };

const pendingIn = (store: Store) =>
  (store.db.query("SELECT count(*) AS n FROM signatures WHERE state = 'pending'").get() as { n: number }).n;

export async function rebuild(
  rpc: SolanaRpc,
  path: string,
  options: IngestOptions & { maxRefreshes?: number } = {},
): Promise<Rebuilt> {
  if (path !== ":memory:" && existsSync(path)) throw new Error("a rebuild writes a new file; this one exists");
  const store = openStore(path);
  const ingest = createIngest(rpc, store, options);
  const maxRefreshes = options.maxRefreshes ?? 10;
  let refreshes = 0;
  let last: IngestReport;
  do {
    last = await ingest.refresh();
    refreshes += 1;
  } while ((last.listed > 0 || pendingIn(store) > 0) && refreshes < maxRefreshes);
  return { store, refreshes, complete: pendingIn(store) === 0 && last.gaps.length === 0, last };
}

if (import.meta.main) {
  const rpcUrl = process.env.INDEXER_RPC_URL?.trim();
  const path = process.argv[2];
  if (!rpcUrl || !path) throw new Error("usage: INDEXER_RPC_URL=... bun services/indexer/src/rebuild.ts <new file>");
  const { store, refreshes, complete, last } = await rebuild(rpcFor(rpcUrl), path);
  console.log(JSON.stringify({ event: "rebuilt", refreshes, complete, skipped: last.skipped, gaps: last.gaps.length }));
  store.close();
}
