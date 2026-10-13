/**
 * Purpose: the indexer's entry point (Sprint 08): opens its SQLite file, serves its read routes on its loopback port
 *          (api/), and runs the ingest every INDEXER_POLL_MS, or sooner when `logsSubscribe` hints that the program has
 *          a new finalized transaction (wake.ts: a hint only; the ingest still reads at finalized). After each
 *          refresh, the creator's own entry alert (alerts.ts); before each, content/partners.json again. On a loop of
 *          its own, the evidence of the sponsored feeds (feeds.ts). Logs one JSON line per refresh with counts and
 *          named errors only, never the RPC or WebSocket URL; `/healthz` carries the same state.
 * Version: 0.3.0 (slice 3: the wake-up, the feeds, the alert, the partners, the process's health)
 * Sprint:  08 (indexer, API, relay and points)
 *
 * Run: INDEXER_RPC_URL=... INDEXER_DB_PATH=/path/outside/repo/indexer.sqlite bun services/indexer/src/main.ts
 */
import { rpcFor } from "@brot/sdk/read";

import { createAlerter, creatorEntryWatch } from "./alerts";
import { serveApi } from "./api/server";
import { loadIndexerConfig } from "./config";
import { openStore } from "./db/store";
import { createFeedRecorder } from "./feeds";
import { createIngest } from "./ingest";
import { createPartners } from "./partners";
import { createWaker, followLogs, logsSubscriber } from "./wake";

/** No refresh follows the last one by less than this, however many hints arrive. */
const MIN_GAP_MS = 2_000;

const config = loadIndexerConfig();
const store = openStore(config.dbPath);
const rpc = rpcFor(config.rpcUrl);
const partners = createPartners(config.partnersFile);
const ingest = createIngest(rpc, store, { timeoutMs: config.timeoutMs, partners: () => partners.current() });
const feeds = createFeedRecorder(rpc, store, config.timeoutMs);
const watch = creatorEntryWatch(store, createAlerter());
const waker = createWaker(MIN_GAP_MS);
const nameOf = (caught: unknown) => (caught instanceof Error ? caught.name : "Error");
const log = (fields: Record<string, unknown>) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));
const health = {
  last_refresh_at: null as string | null,
  last_refresh_error: null as string | null,
  logs: config.wsUrl ? "connecting" : "off",
  feeds_error: null as string | null,
};

serveApi(
  store,
  { hostname: config.apiHost, port: config.apiPort },
  { corsOrigin: config.corsOrigin, health: () => ({ ...health, partners_error: partners.lastError() }) },
);
log({
  event: "start",
  pollMs: config.pollMs,
  feedPollMs: config.feedPollMs,
  api: `${config.apiHost}:${config.apiPort}`,
});

if (config.wsUrl)
  void followLogs(logsSubscriber(config.wsUrl), waker, {
    signal: new AbortController().signal,
    log: (fields) => {
      health.logs = fields.event === "logs-subscribed" ? "subscribed" : "retrying";
      log(fields);
    },
  });

void (async function feedLoop() {
  for (;;) {
    try {
      const r = await feeds.record();
      health.feeds_error = null;
      if (r.written > 0 || r.refused.length > 0) log({ event: "feeds", ...r });
    } catch (caught) {
      health.feeds_error = nameOf(caught);
      log({ event: "feeds-error", error: health.feeds_error });
    }
    await Bun.sleep(config.feedPollMs);
  }
})();

let woken = "start";
for (;;) {
  partners.refresh();
  try {
    const r = await ingest.refresh();
    const alerts = watch.check();
    health.last_refresh_at = new Date().toISOString();
    health.last_refresh_error = r.readError ?? r.pointsError ?? r.referralError;
    log({ event: "refresh", woken, ...r, gaps: r.gaps.length, alerts, partnersError: partners.lastError() });
  } catch (caught) {
    health.last_refresh_error = nameOf(caught);
    log({ event: "refresh-error", error: health.last_refresh_error });
  }
  woken = await waker.wait(config.pollMs);
}
