/**
 * Purpose: the read API's entry point. Reads its settings, takes a chain snapshot at start and then every
 *          API_REFRESH_MS, reads the program's new history and the hide list for the leaderboard on a loop of their own
 *          (Sprint 13), the names file with it and the display price on a loop of its own (Sprint 08), and serves
 *          /api/v1 on the loopback address, the indexer's read routes forwarded to API_INDEXER_URL (the founder's
 *          routing answer (a)). Logs one JSON line per refresh, never the RPC URL, a key or a wallet.
 * Version: 0.5.0 (the indexer's routes forwarded; 0.4.3, the entries switch reaches health)
 * Sprint:  08 (indexer and API, hackathon MVP); 13
 *
 * Run: API_RPC_URL=... bun services/api/src/main.ts
 */
import { rpcFor } from "@brot/sdk/read";

import { loadApiConfig } from "./config";
import { createHidden } from "./hidden";
import { createHistory } from "./history";
import { createIndexerProxy } from "./indexer-proxy";
import { createNames } from "./names";
import { createPrice } from "./price";
import { pythSource } from "./price-source";
import { createHandler } from "./routes";
import { createStore } from "./store";

const config = loadApiConfig();
const rpc = rpcFor(config.rpcUrl);
const store = createStore(rpc);
// The history can read through its own RPC (API_HISTORY_RPC_URL), so its bursts never spend the snapshot's rate limit.
const history = createHistory(config.historyRpcUrl ? rpcFor(config.historyRpcUrl) : rpc, {
  perRefresh: config.historyPerRefresh,
});
const hidden = createHidden(config.hiddenFile);
const names = await createNames(config.namesFile);
const unixNow = () => BigInt(Math.floor(Date.now() / 1_000));
const price = createPrice({ pyth: pythSource(rpc), now: unixNow });
const handle = createHandler(store, {
  corsOrigin: config.corsOrigin,
  cluster: config.cluster,
  history,
  hidden,
  names,
  price,
  now: unixNow,
  entriesSwitch: config.entriesSwitch,
  indexer: createIndexerProxy(config.indexerUrl),
});

// development: false whatever NODE_ENV says, so no error page can ever show a stack trace (the security review, M1/M2).
Bun.serve({ hostname: config.host, port: config.port, fetch: handle, development: false });
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
    names.refresh();
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

/** The display price, every API_PRICE_REFRESH_MS: its source and a named error. */
async function priceLoop() {
  for (;;) {
    await price.refresh();
    log({
      event: price.lastError() ? "price-error" : "price",
      source: price.current()?.source ?? null,
      error: price.lastError(),
    });
    await new Promise((done) => setTimeout(done, config.priceRefreshMs));
  }
}

void snapshotLoop();
void historyLoop();
void priceLoop();
