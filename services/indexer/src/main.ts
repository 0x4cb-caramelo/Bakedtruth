/**
 * Purpose: the indexer's entry point (Sprint 08): opens its SQLite file, serves its read routes on its loopback port
 *          (slice 2, api/), and runs the ingest every INDEXER_POLL_MS, logging one JSON line per refresh with counts
 *          and named errors only, never the RPC URL. The WebSocket wake-up hint, the evidence writer and the unit
 *          come in later slices.
 * Version: 0.2.0 (slice 2: the read routes)
 * Sprint:  08 (indexer, API, relay and points)
 *
 * Run: INDEXER_RPC_URL=... INDEXER_DB_PATH=/path/outside/repo/indexer.sqlite bun services/indexer/src/main.ts
 */
import { rpcFor } from "@brot/sdk/read";

import { serveApi } from "./api/server";
import { loadIndexerConfig } from "./config";
import { openStore } from "./db/store";
import { createIngest } from "./ingest";

const config = loadIndexerConfig();
const store = openStore(config.dbPath);
const ingest = createIngest(rpcFor(config.rpcUrl), store, { timeoutMs: config.timeoutMs });
const log = (fields: Record<string, unknown>) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));

serveApi(store, { hostname: config.apiHost, port: config.apiPort }, { corsOrigin: config.corsOrigin });
log({ event: "start", pollMs: config.pollMs, api: `${config.apiHost}:${config.apiPort}` });
for (;;) {
  try {
    const r = await ingest.refresh();
    log({ event: "refresh", ...r, gaps: r.gaps.length });
  } catch (caught) {
    log({ event: "refresh-error", error: caught instanceof Error ? caught.name : "Error" });
  }
  await new Promise((done) => setTimeout(done, config.pollMs));
}
