/**
 * Purpose: the read API's entry point. Reads its settings, takes a chain snapshot at start and then every
 *          API_REFRESH_MS, and serves /api/v1 on the loopback address. Logs one JSON line per refresh, never the RPC URL.
 * Version: 0.1.0
 * Sprint:  08 (indexer and API, hackathon MVP)
 *
 * Run: API_RPC_URL=... bun services/api/src/main.ts
 */
import { rpcFor } from "@brot/sdk/read";

import { loadApiConfig } from "./config";
import { createHandler } from "./routes";
import { createStore } from "./store";

const config = loadApiConfig();
const rpc = rpcFor(config.rpcUrl);
const store = createStore(rpc);
const handle = createHandler(store, { corsOrigin: config.corsOrigin, cluster: config.cluster });

Bun.serve({ hostname: config.host, port: config.port, fetch: handle });
console.log(JSON.stringify({ ts: new Date().toISOString(), event: "start", host: config.host, port: config.port }));

async function refreshLoop() {
  for (;;) {
    await store.refresh();
    const snap = store.current();
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        event: store.lastError() ? "refresh-error" : "refresh",
        error: store.lastError(),
        campaigns: snap?.rows.length ?? null,
        asOfSlot: snap ? snap.asOfSlot.toString() : null,
      }),
    );
    await new Promise((done) => setTimeout(done, config.refreshMs));
  }
}
void refreshLoop();
