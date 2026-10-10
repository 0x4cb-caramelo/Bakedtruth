/**
 * Purpose: the standby's three loops: the watchdog (every 5 minutes, probes the primary and takes over by the rules
 *          in standby.ts), the continuous feed watcher for open price campaigns, and the second read of InReview
 *          price campaigns (a mismatch goes to the review queue and an alert). The send gate reads the watchdog's
 *          state: a standby sends only after it has taken over and while the primary does not answer.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import type { TransactionSigner } from "@solana/kit";
import { Status, type SolanaRpc } from "@brot/sdk/read";

import type { Alerter } from "./alert";
import type { KeeperConfig } from "./config";
import { listCampaignsWithStatus, listOpenCampaigns } from "./campaigns";
import { log } from "./log";
import { appendReview } from "./review-queue";
import { secondRead } from "./second-read";
import { startWatcher, priceCampaigns } from "./watcher";
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
  const { config, rpc, payer, alerter } = deps;
  const primaryUrl = config.primaryUrl ?? "";
  const rules = rulesOf(config);
  let watch: WatchState = INITIAL_WATCH;
  let primaryAlive = false;
  const mayTakeOver = () => sendAllowed("standby", watch, primaryAlive);
  const checked = new Set<string>();

  const watcher = startWatcher({
    intervalMs: config.watchMs,
    listOpen: () => listOpenCampaigns(rpc),
    mayResolve: mayTakeOver,
    resolveOne: (open) => tryResolve(rpc, payer, false, open),
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
    every(config.cycleMs, () => secondReadPass(deps, checked)),
  ];
  return {
    mayTakeOver,
    stop: () => stops.forEach((stop) => stop()),
  };
}

/** The second read: every InReview price campaign once, both providers compared; a mismatch is queued and alerted. */
async function secondReadPass(deps: StandbyDeps, checked: Set<string>): Promise<void> {
  const { config, rpc, rpcB, alerter } = deps;
  if (!rpcB) return;
  const inReview = priceCampaigns(await listCampaignsWithStatus(rpc, Status.InReview));
  for (const open of inReview) {
    const key = open.address.toString();
    if (checked.has(key)) continue;
    const result = await secondRead(rpc, rpcB, open.campaign.metricAccount, new Uint8Array(open.campaign.feedId));
    if (result.match === null) continue; // not checked: retried on the next pass
    checked.add(key);
    if (result.match) continue;
    await appendReview(config.reviewQueuePath, {
      at: new Date().toISOString(),
      campaign: key,
      reason: "second_read_mismatch",
      primarySlot: null,
      detail: result.detail,
    });
    alerter.alert("second_read_mismatch", key, { detail: result.detail });
  }
}
