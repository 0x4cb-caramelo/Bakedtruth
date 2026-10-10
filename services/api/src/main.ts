/**
 * Purpose: the read API's entry point. Reads its settings, takes a chain snapshot at start and then every
 *          API_REFRESH_MS, reads the program's new history for the leaderboard in the same loop (Sprint 13), and serves
 *          /api/v1 on the loopback address. Logs one JSON line per refresh, never the RPC URL or a wallet.
 * Version: 0.2.0 (Sprint 13: the program's history for the leaderboard)
 * Sprint:  08 (indexer and API, hackathon MVP); 13
 *
 * Run: API_RPC_URL=... bun services/api/src/main.ts
 */
import { rpcFor } from "@brot/sdk/read";

import { loadApiConfig } from "./config";
import { createHistory } from "./history";
import { createHandler } from "./routes";
import { createStore } from "./store";

const config = loadApiConfig();
const rpc = rpcFor(config.rpcUrl);
const store = createStore(rpc);
const history = createHistory(rpc, { perRefresh: config.historyPerRefresh });
const handle = createHandler(store, { corsOrigin: config.corsOrigin, cluster: config.cluster, history });

Bun.serve({ hostname: config.host, port: config.port, fetch: handle });
console.log(JSON.stringify({ ts: new Date().toISOString(), event: "start", host: config.host, port: config.port }));

async function refreshLoop() {
  for (;;) {
    await store.refresh();
    // A failed history read keeps what was read; only the error's name is logged (a message can carry the RPC URL).
    const historyError = await history.refresh().then(
      () => null,
      (caught: unknown) => (caught instanceof Error ? caught.name : "Error"),
    );
    const snap = store.current();
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        event: store.lastError() ? "refresh-error" : "refresh",
        error: store.lastError(),
        campaigns: snap?.rows.length ?? null,
        asOfSlot: snap ? snap.asOfSlot.toString() : null,
        historyEvents: history.events().length,
        historyComplete: history.complete(),
        historyError,
      }),
    );
    await new Promise((done) => setTimeout(done, config.refreshMs));
  }
}
void refreshLoop();
