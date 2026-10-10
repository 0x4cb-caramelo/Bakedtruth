/**
 * Purpose: the API's settings, read from its environment only: the RPC URL (a secret, so logs show its origin only),
 *          the port and host (loopback by default), the refresh interval, and the CORS origin for the site.
 * Version: 0.1.0
 * Sprint:  08 (indexer and API, hackathon MVP)
 */

export type ApiConfig = {
  rpcUrl: string;
  host: string;
  port: number;
  refreshMs: number;
  corsOrigin: string;
  cluster: "devnet" | "local";
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
  };
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
