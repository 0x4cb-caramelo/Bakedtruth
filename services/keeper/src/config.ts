/**
 * Purpose: the keeper's settings, read from its environment only: the RPC URL (a secret, so the log shows its
 *          origin and never the path or the query), the keeper's keypair file, the cluster, the cycle length,
 *          the dry-run switch and the health address. Nothing is read from the repository.
 * Version: 0.1.0
 * Sprint:  06 (server and primary keeper), MVP happy path
 */

export type KeeperConfig = {
  rpcUrl: string;
  keypairPath: string;
  cluster: "devnet" | "local";
  cycleMs: number;
  dryRun: boolean;
  healthHost: string;
  healthPort: number;
};

type Env = Record<string, string | undefined>;

const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1"]);

function required(env: Env, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function positiveInt(env: Env, name: string, fallback: number): number {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${name} must be a positive whole number`);
  return value;
}

/** Reads the settings or throws naming the variable that is wrong; the message never echoes a value. */
export function loadConfig(env: Env = process.env): KeeperConfig {
  const rpcUrl = required(env, "KEEPER_RPC_URL");
  try {
    new URL(rpcUrl);
  } catch {
    throw new Error("KEEPER_RPC_URL is not a URL");
  }
  const cluster = env.KEEPER_CLUSTER?.trim() || "devnet";
  if (cluster !== "devnet" && cluster !== "local") throw new Error("KEEPER_CLUSTER must be devnet or local");
  const healthHost = env.KEEPER_HEALTH_HOST?.trim() || "127.0.0.1";
  if (!LOOPBACK.has(healthHost)) throw new Error("KEEPER_HEALTH_HOST must be a loopback address");
  return {
    rpcUrl,
    keypairPath: required(env, "KEEPER_KEYPAIR"),
    cluster,
    cycleMs: positiveInt(env, "KEEPER_CYCLE_MS", 60_000),
    dryRun: env.KEEPER_DRY_RUN === "1",
    healthHost,
    healthPort: positiveInt(env, "KEEPER_HEALTH_PORT", 4210),
  };
}
