/**
 * Purpose: the keeper's entry point. Reads its settings and keypair, serves /healthz on loopback (and POST /restart
 *          on the primary, when its secret is set), and runs one cycle every KEEPER_CYCLE_MS (60 s by default): the
 *          resolve task, the settlement task when KEEPER_SETTLE=on, the Pyth watch and the chain watch's alerts. A
 *          cycle that throws is logged and the loop goes on. In standby mode (KEEPER_MODE=standby) the send gate
 *          stays closed until the watchdog has taken over and the primary does not answer.
 * Version: 0.4.0 (Sprints 14 and 15: the stage-1 re-read with RPC B; the lapse and the sealed fees in the settlement)
 * Sprint:  07 (standby keeper and watchdog)
 *
 * Run: KEEPER_RPC_URL=... KEEPER_KEYPAIR=/path/outside/repo.json bun services/keeper/src/main.ts
 *      KEEPER_DRY_RUN=1 simulates and never sends. KEEPER_SETTLE=on also finalizes, settles and pays.
 */
import { rpcFor } from "@brot/sdk/read";

import { createAlerter } from "./alert";
import { Backoff, DailyClock } from "./backoff";
import { createChainWatch } from "./chain-watch";
import { loadConfig } from "./config";
import { loadOpsConfig } from "./config-ops";
import { runCycle, errorText, type CycleContext } from "./cycle";
import { startHealth, type KeeperState } from "./health";
import { log } from "./log";
import { createPythWatch } from "./pyth-watch";
import { handleRestart } from "./restart";
import { setSendGate } from "./send";
import { loadKeeperSigner } from "./signer";
import { loadRestartSecret } from "./secret";
import { startStandby } from "./standby-loop";

const config = loadConfig();
const ops = loadOpsConfig();
const payer = await loadKeeperSigner(config.keypairPath);
const rpc = rpcFor(config.rpcUrl);
const rpcB = config.rpcUrlB ? rpcFor(config.rpcUrlB) : null;
const alerter = createAlerter();
const secret = config.restartSecretFile ? await loadRestartSecret(config.restartSecretFile) : null;
const state: KeeperState = {
  cluster: config.cluster,
  startedAt: new Date().toISOString(),
  cycles: 0,
  last: null,
  lastError: null,
  mode: config.mode,
  settle: ops.settle ? "on" : "off",
};
const landing = { rpc, payer, fees: ops.fees, batchMax: ops.batchMax };
const cycle: CycleContext = {
  landing,
  settle: {
    enabled: ops.settle,
    backoff: new Backoff(config.cycleMs),
    claims: new DailyClock(),
    sweepMinLamports: ops.sweepMinLamports,
  },
  watch: createChainWatch(alerter, ops.thresholds, ops.idle),
  pyth: createPythWatch(config.cluster, alerter),
  // Sprint 14: the stage-1 re-read, simulated through RPC B first; a keeper without RPC B re-reads nothing.
  contest: rpcB ? { rpcB, alerter, waits: new Map() } : null,
};

const restart =
  secret && config.mode === "primary"
    ? (request: Request) => handleRestart(request, { secret, flagPath: config.restartFlagPath, now: Date.now })
    : undefined;
startHealth(config.healthHost, config.healthPort, () => state, restart);
log("start", {
  cluster: config.cluster,
  mode: config.mode,
  rpcOrigin: new URL(config.rpcUrl).origin,
  keeper: payer.address,
  cycleMs: config.cycleMs,
  dryRun: config.dryRun,
  settle: ops.settle,
  batchMax: ops.batchMax,
  priorityFee: { floor: ops.fees.floor.toString(), ceiling: ops.fees.ceiling.toString() },
  health: `${config.healthHost}:${config.healthPort}`,
  restartEndpoint: restart !== undefined,
  secondRead: rpcB !== null,
  secondReadOrigin: config.rpcUrlB ? new URL(config.rpcUrlB).origin : null,
});

const standby =
  config.mode === "standby" && secret
    ? startStandby({ config, rpc, rpcB, payer, secret, alerter, landing: { ...landing, dryRun: false } })
    : null;
const allowed = () => (standby ? standby.mayTakeOver() : true);
setSendGate(allowed);

const stop = () => {
  log("stop");
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);

for (;;) {
  const started = Date.now();
  try {
    state.last = await runCycle(cycle, config.dryRun || !allowed());
    state.lastError = null;
    state.cycles++;
    const { counts, settle, skipped, durationMs } = state.last;
    log("cycle", { openCampaigns: state.last.openCampaigns, counts, skipped, settle, ms: durationMs });
    if (BigInt(state.last.keeperLamports) < config.solFloorLamports) {
      alerter.alert("keeper_sol_low", "keeper", { lamports: Number(state.last.keeperLamports) });
    }
  } catch (error) {
    state.lastError = errorText(error);
    log("cycle-error", { detail: state.lastError });
  }
  await new Promise((done) => setTimeout(done, Math.max(0, config.cycleMs - (Date.now() - started))));
}
