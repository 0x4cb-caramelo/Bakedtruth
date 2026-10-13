/**
 * Purpose: the standby's three loops: the watchdog (every 5 minutes, probes the primary and takes over by the rules
 *          in standby.ts), the continuous feed watcher for open price campaigns, and the second read of every
 *          campaign in review through RPC B (second-read-pass.ts: a price campaign against the transaction that wrote
 *          its proof, the other kinds through the SDK's `recheck`; a mismatch goes to the review queue and an alert).
 *          The send gate reads the watchdog's state: a standby sends only after it has taken over and while the
 *          primary does not answer.
 * Version: 0.2.0 (Sprint 07 carry-over: the second read of the proof transaction and of the other kinds)
 * Sprint:  07 (standby keeper and watchdog)
 */
import type { TransactionSigner } from "@solana/kit";
import { Status, recheck, type SolanaRpc } from "@brot/sdk/read";

import type { Alerter } from "./alert";
import type { KeeperConfig } from "./config";
import type { LandingContext } from "./landing";
import { listCampaignsWithStatus, listOpenCampaigns } from "./campaigns";
import { log } from "./log";
import { secondReadPass } from "./second-read-pass";
import { startWatcher } from "./watcher";
import { tryResolve } from "./resolve";
import { INITIAL_WATCH, rulesOf, sendAllowed, type WatchState } from "./standby";
import { watchdogTick } from "./watchdog";
import { errorText } from "./cycle";

export type Standby = { mayTakeOver(): boolean; stop(): void };

export type StandbyDeps = {
  config: KeeperConfig;
  rpc: SolanaRpc;
  rpcB: SolanaRpc | null;
  payer: TransactionSigner;
  secret: Uint8Array;
  alerter: Alerter;
  /** The landing path of the watcher's resolves (never a dry run: the send gate decides). */
  landing: LandingContext;
};

/** Runs `task` now and then every `ms`, never two at once; a throw is logged and the loop goes on. */
function every(ms: number, task: () => Promise<void>): () => void {
  let stopped = false;
  const loop = async () => {
    while (!stopped) {
      const started = Date.now();
      try {
        await task();
      } catch (error) {
        log("standby-error", { detail: errorText(error) });
      }
      await new Promise((done) => setTimeout(done, Math.max(0, ms - (Date.now() - started))));
    }
  };
  void loop();
  return () => {
    stopped = true;
  };
}

export function startStandby(deps: StandbyDeps): Standby {
  const { config, rpc, alerter } = deps;
  const primaryUrl = config.primaryUrl ?? "";
  const rules = rulesOf(config);
  let watch: WatchState = INITIAL_WATCH;
  let primaryAlive = false;
  const mayTakeOver = () => sendAllowed("standby", watch, primaryAlive);
  const memory = { done: new Set<string>(), unchecked: new Set<string>() };

  const watcher = startWatcher({
    intervalMs: config.watchMs,
    listOpen: () => listOpenCampaigns(rpc),
    mayResolve: mayTakeOver,
    resolveOne: (open) => tryResolve(deps.landing, open),
    onAttempt: (result) => log(result.attempt, { campaign: result.campaign, detail: result.detail }),
    onError: (detail) => log("watch-error", { detail }),
  });
  const stops: Array<() => void> = [
    every(config.watchdogMs, async () => {
      const next = await watchdogTick(watch, { primaryUrl, secret: deps.secret, rules, alerter, now: Date.now });
      watch = next.state;
      primaryAlive = next.primaryAlive;
    }),
    () => watcher.stop(),
    every(config.cycleMs, () => secondRead(deps, memory)),
  ];
  return {
    mayTakeOver,
    stop: () => stops.forEach((stop) => stop()),
  };
}

/** The second read through RPC B, when one is configured; the journal names the origin that answered. */
async function secondRead(deps: StandbyDeps, memory: { done: Set<string>; unchecked: Set<string> }): Promise<void> {
  const { config, rpc, rpcB, alerter } = deps;
  if (!rpcB || !config.rpcUrlB) return;
  const urlB = config.rpcUrlB;
  const answeredBy = new URL(urlB).origin;
  await secondReadPass({
    listInReview: () => listCampaignsWithStatus(rpc, Status.InReview),
    rpcB,
    recheck: (at) => recheck(at, urlB),
    answeredBy,
    sameProvider: answeredBy === new URL(config.rpcUrl).origin,
    queuePath: config.reviewQueuePath,
    alerter,
    memory,
  });
}
