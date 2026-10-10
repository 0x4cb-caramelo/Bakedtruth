/**
 * Purpose: the keeper's entry point. Reads its settings and keypair, serves /healthz on loopback (and POST /restart
 *          on the primary, when its secret is set), and runs one cycle every KEEPER_CYCLE_MS (60 s by default). A
 *          cycle that throws is logged and the loop goes on. In standby mode (KEEPER_MODE=standby) the send gate
 *          stays closed until the watchdog has taken over and the primary does not answer.
 * Version: 0.2.0
 * Sprint:  07 (standby keeper and watchdog)
 *
 * Run: KEEPER_RPC_URL=... KEEPER_KEYPAIR=/path/outside/repo.json bun services/keeper/src/main.ts
 *      KEEPER_DRY_RUN=1 simulates and never sends.
 */
import { rpcFor } from "@brot/sdk/read";

import { createAlerter } from "./alert";
import { loadConfig } from "./config";
import { runCycle, errorText } from "./cycle";
import { startHealth, type KeeperState } from "./health";
import { log } from "./log";
import { handleRestart } from "./restart";
import { setSendGate } from "./send";
import { loadKeeperSigner } from "./signer";
import { loadRestartSecret } from "./secret";
import { startStandby } from "./standby-loop";

const config = loadConfig();
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
  health: `${config.healthHost}:${config.healthPort}`,
  restartEndpoint: restart !== undefined,
  secondRead: rpcB !== null,
});

const standby =
  config.mode === "standby" && secret ? startStandby({ config, rpc, rpcB, payer, secret, alerter }) : null;
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
    state.last = await runCycle(rpc, payer, config.dryRun || !allowed());
    state.lastError = null;
    state.cycles++;
    log("cycle", { openCampaigns: state.last.openCampaigns, counts: state.last.counts, ms: state.last.durationMs });
    if (BigInt(state.last.keeperLamports) < config.solFloorLamports) {
      alerter.alert("keeper_sol_low", "keeper", { lamports: Number(state.last.keeperLamports) });
    }
  } catch (error) {
    state.lastError = errorText(error);
    log("cycle-error", { detail: state.lastError });
  }
  await new Promise((done) => setTimeout(done, Math.max(0, config.cycleMs - (Date.now() - started))));
}
