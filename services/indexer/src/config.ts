/**
 * Purpose: the indexer's settings, from its environment only (Sprint 08): the RPC URL of its own account (a secret,
 *          never logged), the SQLite file (no default, so a run never writes somewhere unexpected), how often it polls
 *          (15 s by default; proposal §2.7 says 15 to 30), each RPC call's timeout, and since slice 2 where its read
 *          routes listen (loopback port 4201 by default, TP §3.5) and the CORS origin they answer with.
 * Version: 0.2.0 (slice 2: the read routes)
 * Sprint:  08 (indexer, API, relay and points)
 */
export type IndexerConfig = {
  rpcUrl: string;
  dbPath: string;
  pollMs: number;
  timeoutMs: number;
  apiHost: string;
  apiPort: number;
  corsOrigin: string;
};

type Env = Record<string, string | undefined>;

function whole(raw: string | undefined, fallback: number, min: number, name: string): number {
  const text = raw?.trim();
  if (!text) return fallback;
  const value = Number(text);
  if (!Number.isInteger(value) || value < min) throw new Error(`${name} must be a whole number of at least ${min}`);
  return value;
}

export function loadIndexerConfig(env: Env = process.env): IndexerConfig {
  const rpcUrl = env.INDEXER_RPC_URL?.trim();
  if (!rpcUrl) throw new Error("INDEXER_RPC_URL is not set");
  try {
    new URL(rpcUrl);
  } catch {
    throw new Error("INDEXER_RPC_URL is not a URL");
  }
  const dbPath = env.INDEXER_DB_PATH?.trim();
  if (!dbPath) throw new Error("INDEXER_DB_PATH is not set");
  return {
    rpcUrl,
    dbPath,
    pollMs: whole(env.INDEXER_POLL_MS, 15_000, 1_000, "INDEXER_POLL_MS"),
    timeoutMs: whole(env.INDEXER_TIMEOUT_MS, 20_000, 1_000, "INDEXER_TIMEOUT_MS"),
    apiHost: env.INDEXER_API_HOST?.trim() || "127.0.0.1",
    apiPort: whole(env.INDEXER_API_PORT, 4201, 1, "INDEXER_API_PORT"),
    corsOrigin: env.INDEXER_CORS_ORIGIN?.trim() || "*",
  };
}
