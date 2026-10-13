/**
 * Purpose: the keeper's settings beyond the core ones of config.ts, read from its environment only: the settlement
 *          switch `KEEPER_SETTLE` (off unless it says "on": whether the devnet keeper pays is the founder's decision),
 *          the priority-fee floor, ceiling and lamport cap, the settle batch size, the sweep minimum, and the chain
 *          watch's thresholds. A wrong value is refused by name, never echoed. Every default marked [AC] is a working
 *          value to confirm.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: settlement and landing; Sprint 07 and 16 DoD: the alerts' thresholds)
 */
import type { FeePolicy } from "./budget";
import { DEFAULT_IDLE, type IdleLimits } from "./chain-watch";
import { DEFAULT_THRESHOLDS, type WatchThresholds } from "./watch-rules";

export type OpsConfig = {
  settle: boolean;
  fees: FeePolicy;
  /** Instructions per transaction, at most (12 `settle_entry` fit 1,232 bytes, Sprint 05; 10 leaves room). */
  batchMax: number;
  sweepMinLamports: bigint;
  thresholds: WatchThresholds;
  idle: IdleLimits;
};

type Env = Record<string, string | undefined>;

function whole(env: Env, name: string, fallback: bigint, min = 0n): bigint {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  if (!/^\d{1,20}$/.test(raw) || BigInt(raw) < min)
    throw new Error(`${name} must be a whole number of at least ${min}`);
  return BigInt(raw);
}

const small = (env: Env, name: string, fallback: number, min = 1) =>
  Number(whole(env, name, BigInt(fallback), BigInt(min)));

function settleSwitch(env: Env): boolean {
  const raw = env.KEEPER_SETTLE?.trim() ?? "";
  if (raw === "" || raw === "off") return false;
  if (raw === "on") return true;
  throw new Error("KEEPER_SETTLE must be on or off");
}

export function loadOpsConfig(env: Env = process.env): OpsConfig {
  const fees: FeePolicy = {
    floor: whole(env, "KEEPER_PRIORITY_FEE_FLOOR", 0n),
    ceiling: whole(env, "KEEPER_PRIORITY_FEE_CEILING", 1_000_000n), // [AC] micro-lamports per compute unit
    maxLamports: whole(env, "KEEPER_PRIORITY_FEE_MAX_LAMPORTS", 1_000_000n), // [AC] 0.001 SOL, the SDK's summary cap
  };
  if (fees.floor > fees.ceiling)
    throw new Error("KEEPER_PRIORITY_FEE_FLOOR must not exceed KEEPER_PRIORITY_FEE_CEILING");
  const batchMax = small(env, "KEEPER_SETTLE_BATCH", 10);
  if (batchMax > 12) throw new Error("KEEPER_SETTLE_BATCH must be at most 12");
  const openCampaignsAlertBps = small(env, "KEEPER_OPEN_CAMPAIGNS_ALERT_BPS", DEFAULT_THRESHOLDS.openCampaignsAlertBps);
  if (openCampaignsAlertBps > 10_000) throw new Error("KEEPER_OPEN_CAMPAIGNS_ALERT_BPS must be at most 10000");
  return {
    settle: settleSwitch(env),
    fees,
    batchMax,
    sweepMinLamports: whole(env, "KEEPER_SWEEP_MIN_LAMPORTS", 10_000_000n), // [AC] 0.01 SOL: no fee spent on dust
    thresholds: {
      ...DEFAULT_THRESHOLDS,
      openCampaignsAlertBps,
      exposureAlertLamports: whole(env, "KEEPER_EXPOSURE_ALERT_LAMPORTS", DEFAULT_THRESHOLDS.exposureAlertLamports, 1n),
      openingsPerHourMax: small(env, "KEEPER_OPENINGS_PER_HOUR_MAX", DEFAULT_THRESHOLDS.openingsPerHourMax),
    },
    idle: {
      resolvableMs: small(env, "KEEPER_IDLE_RESOLVABLE_MS", DEFAULT_IDLE.resolvableMs),
      settlingMs: small(env, "KEEPER_IDLE_SETTLING_MS", DEFAULT_IDLE.settlingMs),
    },
  };
}
