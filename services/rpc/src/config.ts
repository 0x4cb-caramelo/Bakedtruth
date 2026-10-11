/**
 * Purpose: brot-rpc's settings, read from its environment only (TP §3.5, T14; Sprint 08): the upstream RPC of its own
 *          account (a secret: logs never show it), a loopback bind (port 4202, behind the tunnel's `/rpc` route), the
 *          body limit (8 KB), the weighted token bucket per IP and per IPv6 /64, the daily credit budget, the account
 *          cache's lifetime, an optional CORS origin, and the countries whose joins and openings are refused
 *          (`GEO_BLOCK_COUNTRIES`): empty by default, so nothing is blocked until the founder names some (K-11, C-11).
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */

export type RelayConfig = {
  upstreamUrl: string;
  host: string;
  port: number;
  /** null: no CORS header, for a relay served on the site's own origin. */
  corsOrigin: string | null;
  bodyMax: number;
  /** Credits a client earns per second, and the most it can hold. */
  ratePerSecond: number;
  burst: number;
  /** Credits the relay spends upstream per UTC day, every client together. */
  dailyBudget: number;
  cacheMs: number;
  upstreamTimeoutMs: number;
  /** Two-letter country codes, upper case, as Cloudflare's CF-IPCountry sends them. */
  geoBlock: ReadonlySet<string>;
};

type Env = Record<string, string | undefined>;
const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1"]);

export function loadRelayConfig(env: Env = process.env): RelayConfig {
  const upstreamUrl = env.RELAY_UPSTREAM_URL?.trim();
  if (!upstreamUrl) throw new Error("RELAY_UPSTREAM_URL is not set");
  try {
    new URL(upstreamUrl);
  } catch {
    throw new Error("RELAY_UPSTREAM_URL is not a URL");
  }
  const host = env.RELAY_HOST?.trim() || "127.0.0.1";
  if (!LOOPBACK.has(host)) throw new Error("RELAY_HOST must be a loopback address");
  return {
    upstreamUrl,
    host,
    port: whole(env.RELAY_PORT, 4202, "RELAY_PORT"),
    corsOrigin: env.RELAY_CORS_ORIGIN?.trim() || null,
    bodyMax: whole(env.RELAY_BODY_MAX, 8_192, "RELAY_BODY_MAX"),
    ratePerSecond: whole(env.RELAY_RATE_PER_SECOND, 20, "RELAY_RATE_PER_SECOND"),
    burst: whole(env.RELAY_BURST, 120, "RELAY_BURST"),
    dailyBudget: whole(env.RELAY_DAILY_BUDGET, 500_000, "RELAY_DAILY_BUDGET"),
    cacheMs: whole(env.RELAY_CACHE_MS, 1_500, "RELAY_CACHE_MS"),
    upstreamTimeoutMs: whole(env.RELAY_UPSTREAM_TIMEOUT_MS, 10_000, "RELAY_UPSTREAM_TIMEOUT_MS"),
    geoBlock: countries(env.GEO_BLOCK_COUNTRIES),
  };
}

/** "BR, us" → {"BR", "US"}; anything but two letters stops the start, so a typo is caught, not run. */
function countries(raw: string | undefined): ReadonlySet<string> {
  const list = (raw ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  for (const code of list)
    if (!/^[A-Z]{2}$/.test(code)) throw new Error(`GEO_BLOCK_COUNTRIES: "${code}" is not a country code`);
  return new Set(list);
}

function whole(raw: string | undefined, fallback: number, name: string): number {
  const text = raw?.trim();
  if (!text) return fallback;
  const value = Number(text);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${name} must be a positive whole number`);
  return value;
}
