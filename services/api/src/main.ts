/**
 * Purpose: the read API's entry point. Reads its settings, takes a chain snapshot at start and then every
 *          API_REFRESH_MS, reads the program's new history and the hide list for the leaderboard on a loop of their own
 *          (Sprint 13), and serves /api/v1 on the loopback address. Logs one JSON line per refresh, never the RPC URL
 *          or a wallet.
 * Version: 0.3.0 (the Sprint 13 adversarial review: the history on its own loop, so it can never hold the snapshot)
 * Sprint:  08 (indexer and API, hackathon MVP); 13
 *
 * Run: API_RPC_URL=... bun services/api/src/main.ts
 */
import { rpcFor } from "@brot/sdk/read";

import { loadApiConfig } from "./config";
import { createHidden } from "./hidden";
import { createHistory } from "./history";
import { createHandler } from "./routes";
import { createStore } from "./store";

const config = loadApiConfig();
const rpc = rpcFor(config.rpcUrl);
const store = createStore(rpc);
const history = createHistory(rpc, { perRefresh: config.historyPerRefresh });
const hidden = createHidden(config.hiddenFile);
const handle = createHandler(store, { corsOrigin: config.corsOrigin, cluster: config.cluster, history, hidden });

Bun.serve({ hostname: config.host, port: config.port, fetch: handle });
console.log(JSON.stringify({ ts: new Date().toISOString(), event: "start", host: config.host, port: config.port }));

const log = (fields: Record<string, unknown>) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));
const pause = () => new Promise((done) => setTimeout(done, config.refreshMs));

/** The campaign snapshot, which the site's lists and entry panel depend on: never waits for the history. */
async function snapshotLoop() {
  for (;;) {
    await store.refresh();
    const snap = store.current();
    log({
      event: store.lastError() ? "refresh-error" : "refresh",
      error: store.lastError(),
      campaigns: snap?.rows.length ?? null,
      asOfSlot: snap ? snap.asOfSlot.toString() : null,
    });
    await pause();
  }
}

/** The program's history and the hide list, for the leaderboard only. A failed read keeps what was read; only the
 * error's name is logged (a message can carry the RPC URL), and never a wallet. */
async function historyLoop() {
  for (;;) {
    hidden.refresh();
    const error = await history.refresh().then(
      () => null,
      (caught: unknown) => (caught instanceof Error ? caught.name : "Error"),
    );
    log({
      event: error ? "history-error" : "history",
      error,
      events: history.events().length,
      complete: history.complete(),
      skipped: history.skipped(),
      hidden: hidden.current().size,
      hiddenError: hidden.lastError(),
    });
    await pause();
  }
}

void snapshotLoop();
void historyLoop();
