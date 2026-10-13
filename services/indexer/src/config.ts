/**
 * Purpose: the indexer's settings, from its environment only (Sprint 08): the RPC URL of its own account and its
 *          WebSocket URL (secrets: read from systemd credential files, `*_FILE`, as T13 asks, or from the variable on a
 *          development machine; never logged), the SQLite file (no default, so a run never writes somewhere
 *          unexpected), how often it polls (15 s by default; proposal §2.7 says 15 to 30) and reads the sponsored feeds,
 *          each RPC call's timeout, where its read routes listen (loopback only, port 4201 by default, TP §3.5) and the
 *          CORS origin they answer with, and content/partners.json. The WebSocket URL, for the `logsSubscribe` wake-up,
 *          is the RPC URL with ws(s) unless set; `off` turns the wake-up off (the timer still polls).
 * Version: 0.3.0 (slice 3: credential files, the WebSocket URL, partners, the feed poll, a loopback-only bind)
 * Sprint:  08 (indexer, API, relay and points)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export type IndexerConfig = {
  rpcUrl: string;
  /** null: no `logsSubscribe` wake-up. */
  wsUrl: string | null;
  dbPath: string;
  pollMs: number;
  feedPollMs: number;
  timeoutMs: number;
  apiHost: string;
  apiPort: number;
  corsOrigin: string;
  partnersFile: string;
};

type Env = Record<string, string | undefined>;
const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1"]);
export const DEFAULT_PARTNERS_FILE = fileURLToPath(new URL("../../../content/partners.json", import.meta.url));

function whole(raw: string | undefined, fallback: number, min: number, name: string): number {
  const text = raw?.trim();
  if (!text) return fallback;
  const value = Number(text);
  if (!Number.isInteger(value) || value < min) throw new Error(`${name} must be a whole number of at least ${min}`);
  return value;
}

/** A secret from the file `NAME_FILE` names (a systemd credential), or from `NAME` itself; the file wins. */
function secret(env: Env, name: string, read: (path: string) => string): string | undefined {
  const file = env[`${name}_FILE`]?.trim();
  return file ? read(file).trim() : env[name]?.trim();
}

/** A URL, or a named error that never quotes it (it may carry a key). */
function url(text: string, name: string, protocols: readonly string[]): string {
  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    throw new Error(`${name} is not a URL`);
  }
  if (!protocols.includes(parsed.protocol)) throw new Error(`${name} must use ${protocols.join(" or ")}`);
  return text;
}

/** The WebSocket twin of an RPC URL: the same host, path and query over ws(s). */
export const wsOf = (rpcUrl: string): string => rpcUrl.replace(/^http(s?):/i, (_, s: string) => `ws${s}:`);

export function loadIndexerConfig(
  env: Env = process.env,
  read = (path: string) => readFileSync(path, "utf8"),
): IndexerConfig {
  const rpcRaw = secret(env, "INDEXER_RPC_URL", read);
  if (!rpcRaw) throw new Error("INDEXER_RPC_URL is not set");
  const rpcUrl = url(rpcRaw, "INDEXER_RPC_URL", ["http:", "https:"]);
  const wsRaw = secret(env, "INDEXER_WS_URL", read);
  const wsUrl = wsRaw === "off" ? null : url(wsRaw || wsOf(rpcUrl), "INDEXER_WS_URL", ["ws:", "wss:"]);
  const dbPath = env.INDEXER_DB_PATH?.trim();
  if (!dbPath) throw new Error("INDEXER_DB_PATH is not set");
  const apiHost = env.INDEXER_API_HOST?.trim() || "127.0.0.1";
  if (!LOOPBACK.has(apiHost)) throw new Error("INDEXER_API_HOST must be a loopback address");
  return {
    rpcUrl,
    wsUrl,
    dbPath,
    pollMs: whole(env.INDEXER_POLL_MS, 15_000, 1_000, "INDEXER_POLL_MS"),
    feedPollMs: whole(env.INDEXER_FEED_POLL_MS, 15_000, 1_000, "INDEXER_FEED_POLL_MS"),
    timeoutMs: whole(env.INDEXER_TIMEOUT_MS, 20_000, 1_000, "INDEXER_TIMEOUT_MS"),
    apiHost,
    apiPort: whole(env.INDEXER_API_PORT, 4201, 1, "INDEXER_API_PORT"),
    corsOrigin: env.INDEXER_CORS_ORIGIN?.trim() || "*",
    partnersFile: env.INDEXER_PARTNERS_FILE?.trim() || DEFAULT_PARTNERS_FILE,
  };
}
