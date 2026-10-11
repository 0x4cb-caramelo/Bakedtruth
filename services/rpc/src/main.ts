/**
 * Purpose: brot-rpc's entry point (TP §3.5, T14; Sprint 08). Reads its settings, derives the program's ProgramData
 *          address once (A-8), and serves the relay on the loopback address for the tunnel's `/rpc` route. Calls the
 *          upstream of its own RPC account with a timeout. Sweeps idle buckets and expired answers every ten seconds.
 *          Logs one JSON line a minute with counts by outcome and the budget left, never the upstream URL, an IP, a
 *          header or a parameter.
 * Version: 0.2.0 (the Sprint 08 legal review, R1: the sweep; the security review: the /48, no error pages, 8 KB)
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
const limiter = createLimiter({ ratePerSecond: config.ratePerSecond, burst: config.burst, now });
// One IPv6 /48 may hold eight clients' worth at once, never 65,536 fresh /64 buckets (the security review, M3).
const area = createLimiter({ ratePerSecond: config.ratePerSecond * 8, burst: config.burst * 8, now });
const cache = createCache(now);
const relay = createRelay({
  config,
  programData: (await programDataAddress()).toString(),
  upstream,
  limiter,
  area,
  budget,
  cache,
  count: (outcome) => counts.set(outcome, (counts.get(outcome) ?? 0) + 1),
});

// No development error page whatever NODE_ENV says (M1); the socket's limit is the handler's own 8 KB (L2).
Bun.serve({
  hostname: config.host,
  port: config.port,
  fetch: relay,
  maxRequestBodySize: config.bodyMax,
  development: false,
});
const log = (fields: Record<string, unknown>) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));
log({
  event: "start",
  host: config.host,
  port: config.port,
  geoBlock: config.geoBlock.size,
  // Without it, any local process can pose as a visitor: set it before the tunnel's /rpc route opens (M4).
  tunnelSecret: config.tunnelSecret !== null,
});

// R1 of the legal review: a visitor's IP leaves memory about a minute after its last call, busy or quiet.
setInterval(() => {
  limiter.sweep();
  area.sweep();
  cache.sweep();
}, 10_000);

setInterval(() => {
  if (counts.size === 0) return;
  log({ event: "minute", counts: Object.fromEntries(counts), budgetLeft: budget.left() });
  counts.clear();
}, 60_000);
