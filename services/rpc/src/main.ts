/**
 * Purpose: brot-rpc's entry point (TP §3.5, T14; Sprint 08). Reads its settings, derives the program's ProgramData
 *          address once (A-8), and serves the relay on the loopback address for the tunnel's `/rpc` route. Calls the
 *          upstream of its own RPC account with a timeout. Logs one JSON line a minute with counts by outcome and the
 *          budget left, never the upstream URL, an IP, a header or a parameter.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * Run: RELAY_UPSTREAM_URL=... bun services/rpc/src/main.ts
 */
import { programDataAddress } from "@brot/sdk/read";

import { loadRelayConfig } from "./config";
import { createBudget, createCache, createLimiter } from "./limits";
import { createRelay, type Upstream } from "./relay";

const config = loadRelayConfig();
const now = () => Date.now();
const upstream: Upstream = async (body) => {
  const response = await fetch(config.upstreamUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    signal: AbortSignal.timeout(config.upstreamTimeoutMs),
  });
  return { status: response.status, text: await response.text() };
};

const counts = new Map<string, number>();
const budget = createBudget({ daily: config.dailyBudget, now });
const relay = createRelay({
  config,
  programData: (await programDataAddress()).toString(),
  upstream,
  limiter: createLimiter({ ratePerSecond: config.ratePerSecond, burst: config.burst, now }),
  budget,
  cache: createCache(now),
  count: (outcome) => counts.set(outcome, (counts.get(outcome) ?? 0) + 1),
});

Bun.serve({ hostname: config.host, port: config.port, fetch: relay, maxRequestBodySize: config.bodyMax * 2 });
const log = (fields: Record<string, unknown>) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));
log({ event: "start", host: config.host, port: config.port, geoBlock: config.geoBlock.size });

setInterval(() => {
  if (counts.size === 0) return;
  log({ event: "minute", counts: Object.fromEntries(counts), budgetLeft: budget.left() });
  counts.clear();
}, 60_000);
