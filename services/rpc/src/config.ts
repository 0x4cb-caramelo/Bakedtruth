/**
 * Purpose: brot-rpc's settings, read from its environment only (TP §3.5, T14; Sprint 08): the upstream RPC of its own
 *          account (a secret: logs never show it), a loopback bind (port 4202, behind the tunnel's `/rpc` route), the
 *          body limit (8 KB), the weighted token bucket per IP and per IPv6 /64, the daily credit budget, the account
 *          cache's lifetime, an optional CORS origin (never "*"), the countries whose joins and openings are refused
 *          (`GEO_BLOCK_COUNTRIES`): empty by default, so nothing is blocked until the founder names some (K-11, C-11),
 *          and the secret header the tunnel adds. The two secrets (the upstream URL, the tunnel's value) are read from
 *          systemd credential files (`*_FILE`), as T13 asks, or from the variable itself on a development machine.
 * Version: 0.2.0 (the Sprint 08 security review: credentials from files, the tunnel's secret, no "*")
 * Sprint:  08 (indexer, API, relay and points)
 */
import { readFileSync } from "node:fs";

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
  /** The value Cloudflare adds as `x-brot-tunnel` to every /rpc request; null: any local caller is trusted. */
  tunnelSecret: string | null;
};

type Env = Record<string, string | undefined>;
const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1"]);

/**
 * A secret from the file `NAME_FILE` names (a systemd credential, root-owned, read once: T13, the security review's
 * M6), or from `NAME` itself on a development machine; the file wins.
 */
function secret(env: Env, name: string, read: (path: string) => string): string | undefined {
  const file = env[`${name}_FILE`]?.trim();
  return file ? read(file).trim() : env[name]?.trim();
}

export function loadRelayConfig(
  env: Env = process.env,
  read = (path: string) => readFileSync(path, "utf8"),
): RelayConfig {
  const upstreamUrl = secret(env, "RELAY_UPSTREAM_URL", read);
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
    corsOrigin: origin(env.RELAY_CORS_ORIGIN),
    bodyMax: whole(env.RELAY_BODY_MAX, 8_192, "RELAY_BODY_MAX"),
    ratePerSecond: whole(env.RELAY_RATE_PER_SECOND, 20, "RELAY_RATE_PER_SECOND"),
    burst: whole(env.RELAY_BURST, 120, "RELAY_BURST"),
    dailyBudget: whole(env.RELAY_DAILY_BUDGET, 500_000, "RELAY_DAILY_BUDGET"),
    cacheMs: whole(env.RELAY_CACHE_MS, 1_500, "RELAY_CACHE_MS"),
    upstreamTimeoutMs: whole(env.RELAY_UPSTREAM_TIMEOUT_MS, 10_000, "RELAY_UPSTREAM_TIMEOUT_MS"),
    geoBlock: countries(env.GEO_BLOCK_COUNTRIES),
    tunnelSecret: tunnel(secret(env, "RELAY_TUNNEL_SECRET", read)),
  };
}

/** One origin or none: "*" would let any site spend its visitors' share of the relay (the security review, L3). */
function origin(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (value === "*") throw new Error("RELAY_CORS_ORIGIN must name one origin, never *");
  return value;
}

function tunnel(value: string | undefined): string | null {
  if (!value) return null;
  if (value.length < 32) throw new Error("RELAY_TUNNEL_SECRET must be at least 32 characters");
  return value;
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
