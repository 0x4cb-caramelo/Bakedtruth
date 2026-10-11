/**
 * Purpose: the indexer's entry point (Sprint 08, slice 1): opens its SQLite file and runs the ingest every
 *          INDEXER_POLL_MS, logging one JSON line per refresh with counts and named errors only, never the RPC URL.
 *          The API routes, the WebSocket wake-up hint, the evidence writer and the unit come in later slices.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * Run: INDEXER_RPC_URL=... INDEXER_DB_PATH=/path/outside/repo/indexer.sqlite bun services/indexer/src/main.ts
 */
import { rpcFor } from "@brot/sdk/read";

import { loadIndexerConfig } from "./config";
import { openStore } from "./db/store";
import { createIngest } from "./ingest";

const config = loadIndexerConfig();
const store = openStore(config.dbPath);
const ingest = createIngest(rpcFor(config.rpcUrl), store, { timeoutMs: config.timeoutMs });
const log = (fields: Record<string, unknown>) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));

log({ event: "start", pollMs: config.pollMs });
for (;;) {
  try {
    const r = await ingest.refresh();
    log({ event: "refresh", ...r, gaps: r.gaps.length });
  } catch (caught) {
    log({ event: "refresh-error", error: caught instanceof Error ? caught.name : "Error" });
  }
  await new Promise((done) => setTimeout(done, config.pollMs));
}
