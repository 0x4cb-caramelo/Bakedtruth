/**
 * Purpose: the API's settings, read from its environment only: the RPC URL (a secret, so logs show its origin only),
 *          the port and host (loopback by default), the refresh interval, the CORS origin for the site, how many
 *          program transactions a refresh reads for the leaderboard, and the file of wallets left out of it (Sprint
 *          13); the names file and the display price's interval (Sprint 08); K-11's entries switch, `on` unless set
 *          to `off` (Sprint 08's third part); the indexer the read routes forward to (`API_INDEXER_URL`, the founder's
 *          routing answer (a)): loopback only, `off` to stop forwarding.
 * Version: 0.5.0 (the indexer's URL; 0.4.0, the entries switch; 0.3.1, 2b: no CoinGecko settings)
 * Sprint:  08 (indexer and API, hackathon MVP)
 */
import { fileURLToPath } from "node:url";

export type ApiConfig = {
  rpcUrl: string;
  host: string;
  port: number;
  refreshMs: number;
  corsOrigin: string;
  cluster: "devnet" | "local";
  /** At most this many program transactions read per refresh for the leaderboard (Sprint 13). */
  historyPerRefresh: number;
  /** The file listing wallets left out of the leaderboard at their owner's request, outside the repository. */
  hiddenFile: string | null;
  /** The RPC the leaderboard's history reads through, when it should not share the snapshot's (a secret too). */
  historyRpcUrl: string | null;
  /** The reviewed account names (Sprint 08): the repository's content/account-names.json unless set. */
  namesFile: string;
  /** How often the display price, Pyth's SOL/USD, is read (Sprint 08), in milliseconds. */
  priceRefreshMs: number;
  /** K-11's switch: false turns /api/v1/health's `entries_allowed` off, whatever the chain says. */
  entriesSwitch: boolean;
  /** The indexer the five read routes forward to, on loopback; null (`off`): they answer 503. */
  indexerUrl: string | null;
};

type Env = Record<string, string | undefined>;
const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1"]);
/** The loopback names as a URL's hostname spells them (an IPv6 address keeps its brackets). */
const LOOPBACK_URL_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

export function loadApiConfig(env: Env = process.env): ApiConfig {
  const rpcUrl = env.API_RPC_URL?.trim();
  if (!rpcUrl) throw new Error("API_RPC_URL is not set");
  try {
    new URL(rpcUrl);
  } catch {
    throw new Error("API_RPC_URL is not a URL");
  }
  const host = env.API_HOST?.trim() || "127.0.0.1";
  if (!LOOPBACK.has(host)) throw new Error("API_HOST must be a loopback address");
  return {
    rpcUrl,
    host,
    port: positive(env.API_PORT, 4220, "API_PORT"),
    refreshMs: positive(env.API_REFRESH_MS, 15_000, "API_REFRESH_MS"),
    corsOrigin: env.API_CORS_ORIGIN?.trim() || "*",
    cluster: cluster(env.API_CLUSTER),
    historyPerRefresh: positive(env.API_HISTORY_PER_REFRESH, 200, "API_HISTORY_PER_REFRESH"),
    hiddenFile: env.API_LEADERBOARD_HIDDEN?.trim() || null,
    historyRpcUrl: url(env.API_HISTORY_RPC_URL, "API_HISTORY_RPC_URL"),
    namesFile:
      env.API_NAMES_FILE?.trim() || fileURLToPath(new URL("../../../content/account-names.json", import.meta.url)),
    priceRefreshMs: positive(env.API_PRICE_REFRESH_MS, 180_000, "API_PRICE_REFRESH_MS"),
    entriesSwitch: onOff(env.API_ENTRIES_ALLOWED, "API_ENTRIES_ALLOWED"),
    indexerUrl: indexer(env.API_INDEXER_URL),
  };
}

/** `http://127.0.0.1:4201` unless set; `off` is null; anything but an http URL on loopback stops the start. */
function indexer(raw: string | undefined): string | null {
  const text = raw?.trim() || "http://127.0.0.1:4201";
  if (text === "off") return null;
  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    throw new Error("API_INDEXER_URL is not a URL");
  }
  if (parsed.protocol !== "http:" || !LOOPBACK_URL_HOSTS.has(parsed.hostname) || parsed.username || parsed.password)
    throw new Error("API_INDEXER_URL must be an http URL on a loopback address, or off");
  return text;
}

/** `on` (the default) or `off`; anything else stops the start, so a typo never opens or closes entries silently. */
function onOff(raw: string | undefined, name: string): boolean {
  const value = raw?.trim() || "on";
  if (value !== "on" && value !== "off") throw new Error(`${name} must be on or off`);
  return value === "on";
}

/** An optional URL: unset or empty is null; anything else must parse. */
function url(raw: string | undefined, name: string): string | null {
  const text = raw?.trim();
  if (!text) return null;
  try {
    new URL(text);
  } catch {
    throw new Error(`${name} is not a URL`);
  }
  return text;
}

function cluster(raw: string | undefined): "devnet" | "local" {
  const value = raw?.trim() || "devnet";
  if (value !== "devnet" && value !== "local") throw new Error("API_CLUSTER must be devnet or local");
  return value;
}

function positive(raw: string | undefined, fallback: number, name: string): number {
  const text = raw?.trim();
  if (!text) return fallback;
  const value = Number(text);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${name} must be a positive whole number`);
  return value;
}
