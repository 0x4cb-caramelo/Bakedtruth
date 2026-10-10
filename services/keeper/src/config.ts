/**
 * Purpose: the keeper's settings, read from its environment only: the RPC URL (a secret, so the log shows its
 *          origin and never the path or the query), the keeper's keypair file, the cluster, the cycle length,
 *          the dry-run switch, the health address, and (Sprint 07) the mode (primary or standby), the watchdog,
 *          the second RPC, the restart secret's file and the review queue. Nothing is read from the repository.
 * Version: 0.2.0
 * Sprint:  07 (standby keeper and watchdog)
 */

export type KeeperMode = "primary" | "standby";

export type KeeperConfig = {
  rpcUrl: string;
  keypairPath: string;
  cluster: "devnet" | "local";
  cycleMs: number;
  dryRun: boolean;
  healthHost: string;
  healthPort: number;
  mode: KeeperMode;
  /** Standby only: the primary's ops address (GET /healthz, POST /restart). A URL, so it is never logged whole. */
  primaryUrl: string | null;
  /** Standby only: the second RPC company (the second read). Absent: the second read is off, and logged as off. */
  rpcUrlB: string | null;
  /** The HMAC secret of POST /restart, read from this file (a credential), never from the environment. */
  restartSecretFile: string | null;
  /** Primary: the flag file that POST /restart writes; a root-owned path unit restarts the keeper when it appears. */
  restartFlagPath: string;
  /** Standby: the review queue (JSON lines) that second-read mismatches are appended to. */
  reviewQueuePath: string;
  /** Standby: the continuous feed watcher's interval for price campaigns. */
  watchMs: number;
  /** Standby: how often the watchdog probes the primary (5 minutes). */
  watchdogMs: number;
  /** Standby: silence after which the watchdog asks for a restart (10 minutes). */
  takeoverAfterMs: number;
  /** Standby: restart requests before the standby takes over (3). */
  restartTries: number;
  /** The SOL floor of the keeper wallet; below it an alert fires. Default 0.5 SOL, an assumption to confirm. */
  solFloorLamports: bigint;
};

type Env = Record<string, string | undefined>;

const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1"]);

function required(env: Env, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function optional(env: Env, name: string): string | null {
  return env[name]?.trim() || null;
}

function positiveInt(env: Env, name: string, fallback: number): number {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${name} must be a positive whole number`);
  return value;
}

function url(env: Env, name: string): string | null {
  const value = optional(env, name);
  if (value === null) return null;
  try {
    new URL(value);
  } catch {
    throw new Error(`${name} is not a URL`);
  }
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
  const mode = env.KEEPER_MODE?.trim() || "primary";
  if (mode !== "primary" && mode !== "standby") throw new Error("KEEPER_MODE must be primary or standby");
  const config: KeeperConfig = {
    rpcUrl,
    keypairPath: required(env, "KEEPER_KEYPAIR"),
    cluster,
    cycleMs: positiveInt(env, "KEEPER_CYCLE_MS", 60_000),
    dryRun: env.KEEPER_DRY_RUN === "1",
    healthHost,
    healthPort: positiveInt(env, "KEEPER_HEALTH_PORT", 4210),
    mode,
    primaryUrl: url(env, "KEEPER_PRIMARY_URL"),
    rpcUrlB: url(env, "KEEPER_RPC_URL_B"),
    restartSecretFile: optional(env, "KEEPER_RESTART_SECRET_FILE"),
    restartFlagPath: optional(env, "KEEPER_RESTART_FLAG") ?? "/run/brot-markets/restart.flag",
    reviewQueuePath: optional(env, "KEEPER_REVIEW_QUEUE") ?? "/var/lib/brot-markets/review-queue.jsonl",
    watchMs: positiveInt(env, "KEEPER_WATCH_MS", 5_000),
    watchdogMs: positiveInt(env, "KEEPER_WATCHDOG_MS", 300_000),
    takeoverAfterMs: positiveInt(env, "KEEPER_TAKEOVER_AFTER_MS", 600_000),
    restartTries: positiveInt(env, "KEEPER_RESTART_TRIES", 3),
    solFloorLamports: BigInt(positiveInt(env, "KEEPER_SOL_FLOOR_LAMPORTS", 500_000_000)),
  };
  if (mode === "standby") {
    if (!config.primaryUrl) throw new Error("KEEPER_PRIMARY_URL is not set (standby mode)");
    if (!config.restartSecretFile) throw new Error("KEEPER_RESTART_SECRET_FILE is not set (standby mode)");
  }
  return config;
}
