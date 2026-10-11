/**
 * Purpose: the API's settings, read from its environment only: the RPC URL (a secret, so logs show its origin only),
 *          the port and host (loopback by default), the refresh interval, the CORS origin for the site, how many
 *          program transactions a refresh reads for the leaderboard, and the file of wallets left out of it (Sprint
 *          13); the names file, and the display price's interval and CoinGecko settings, its key a secret (Sprint 08).
 * Version: 0.3.0
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
  /** How often the display price is read (Sprint 08), in milliseconds. */
  priceRefreshMs: number;
  /** CoinGecko for the display price, or Pyth only (Sprint 08, D-e; off while its terms are checked). */
  coingecko: boolean;
  /** The CoinGecko key (a secret; null: the keyless API) and the plan it belongs to. */
  coingeckoKey: string | null;
  coingeckoPlan: "demo" | "pro";
};

type Env = Record<string, string | undefined>;
const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1"]);

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
    coingecko: onOff(env.API_COINGECKO, true, "API_COINGECKO"),
    coingeckoKey: env.API_COINGECKO_KEY?.trim() || null,
    coingeckoPlan: plan(env.API_COINGECKO_PLAN),
  };
}

function onOff(raw: string | undefined, fallback: boolean, name: string): boolean {
  const value = raw?.trim();
  if (!value) return fallback;
  if (value !== "on" && value !== "off") throw new Error(`${name} must be on or off`);
  return value === "on";
}

function plan(raw: string | undefined): "demo" | "pro" {
  const value = raw?.trim() || "demo";
  if (value !== "demo" && value !== "pro") throw new Error("API_COINGECKO_PLAN must be demo or pro");
  return value;
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
