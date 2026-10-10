/**
 * Purpose: the keeper's entry point. Reads its settings and keypair, serves /healthz on loopback, and runs one cycle
 *          every KEEPER_CYCLE_MS (60 s by default). A cycle that throws is logged and the loop goes on.
 * Version: 0.1.0
 * Sprint:  06 (server and primary keeper), MVP happy path
 *
 * Run: KEEPER_RPC_URL=... KEEPER_KEYPAIR=/path/outside/repo.json bun services/keeper/src/main.ts
 *      KEEPER_DRY_RUN=1 simulates and never sends.
 */
import { rpcFor } from "@brot/sdk/read";

import { loadConfig } from "./config";
import { runCycle, errorText } from "./cycle";
import { startHealth, type KeeperState } from "./health";
import { log } from "./log";
import { loadKeeperSigner } from "./signer";

const config = loadConfig();
const payer = await loadKeeperSigner(config.keypairPath);
const rpc = rpcFor(config.rpcUrl);
const state: KeeperState = {
  cluster: config.cluster,
  startedAt: new Date().toISOString(),
  cycles: 0,
  last: null,
  lastError: null,
};

startHealth(config.healthHost, config.healthPort, () => state);
log("start", {
  cluster: config.cluster,
  rpcOrigin: new URL(config.rpcUrl).origin,
  keeper: payer.address,
  cycleMs: config.cycleMs,
  dryRun: config.dryRun,
  health: `${config.healthHost}:${config.healthPort}`,
});

const stop = () => {
  log("stop");
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);

for (;;) {
  const started = Date.now();
  try {
    state.last = await runCycle(rpc, payer, config.dryRun);
    state.lastError = null;
    state.cycles++;
    log("cycle", { openCampaigns: state.last.openCampaigns, counts: state.last.counts, ms: state.last.durationMs });
  } catch (error) {
    state.lastError = errorText(error);
    log("cycle-error", { detail: state.lastError });
  }
  await new Promise((done) => setTimeout(done, Math.max(0, config.cycleMs - (Date.now() - started))));
}
