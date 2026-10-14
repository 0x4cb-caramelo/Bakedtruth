/**
 * Purpose: the chain watch (TP §3.5, "the chain watch"; Sprint 07 DoD, on-chain liveness): after each cycle it turns
 *          the view, the resolve attempts and the settlement plan into alerts. `campaign_idle` fires for a campaign the
 *          program would resolve (its simulation passed) that is still open 10 minutes later, and for a campaign with
 *          settlement work whose account has not changed for 30 minutes; the rules of watch-rules.ts give the rest.
 *          Idle time is measured on this machine's clock from the first cycle that saw the condition, so a restart
 *          starts the count again. A finding marked `once` fires once per campaign per process; the others repeat
 *          after the alerter's de-duplication window while the condition lasts.
 *          Since Sprints 14 and 15: a contest opened (each stage), a stage 2 near its deadline, and a sponsor's sealed
 *          fee still open on a finalized campaign a cycle after the keeper first saw it.
 * Version: 0.2.0 (Sprints 14 and 15: the contest's alerts; the sealed fee left open)
 * Sprint:  07 carry-over (Sprint 07 DoD: liveness alerts; Sprint 16 DoD: exposure, team openings, 80%); 14, 15
 */
import { Status, type Campaign } from "@brot/sdk/read";

import type { Alerter } from "./alert";
import type { ChainView } from "./chain";
import type { AttemptResult } from "./resolve";
import { closable, settlementDue, shareDue } from "./settle-plan";
import {
  contestsOpened,
  exposureHigh,
  exposureOf,
  metLateNo,
  openCampaignsHigh,
  openingsPerHour,
  reservedCreditsOld,
  solUsdStale,
  stage2Ending,
  teamOpenings,
  type Finding,
  type WatchThresholds,
} from "./watch-rules";

export type IdleLimits = { resolvableMs: number; settlingMs: number };
export const DEFAULT_IDLE: IdleLimits = { resolvableMs: 10 * 60_000, settlingMs: 30 * 60_000 };

/** Settlement work the keeper (or anyone) could do now; a close blocked by an unclaimed reserve is not idle. */
export function hasSettlementWork(c: Campaign, now: bigint): boolean {
  if (!settlementDue(c, now)) return false;
  if (c.status !== Status.Settled) return true; // an ended window (tally, finalize) or open entries
  return closable(c) || !c.feeCollected || !c.prizeSettled || (!c.creatorShareSettled && shareDue(c));
}

/** Everything a settlement step changes; `event_seq` alone misses a reserved share (it emits no event). */
const fingerprint = (c: Campaign) =>
  [
    c.status,
    c.eventSeq,
    c.entriesOpen,
    c.entriesUntallied,
    c.feeCollected,
    c.prizeSettled,
    c.creatorShareSettled,
    c.creatorShareReserved,
    c.sealedFeesOpen,
    c.contestStage,
  ].join(":");

export type ChainWatch = {
  observe(view: ChainView, attempts: readonly AttemptResult[], keeperSettles: boolean): Finding[];
};

export function createChainWatch(
  alerter: Alerter,
  thresholds: WatchThresholds,
  idle: IdleLimits = DEFAULT_IDLE,
  wall: () => number = Date.now,
): ChainWatch {
  const resolvableSince = new Map<string, number>();
  const settling = new Map<string, { print: string; since: number }>();
  const sealedOpen = new Map<string, number>();
  const fired = new Set<string>();

  /** A finalized campaign whose sponsors' sealed fees stay open for a second cycle: the close waits on them. */
  function sealedFindings(view: ChainView): Finding[] {
    const findings: Finding[] = [];
    const seen = new Set<string>();
    for (const { address, campaign: c } of view.campaigns) {
      const finalized = c.status === Status.Settling || c.status === Status.Settled;
      if (!finalized || c.sealedFeesOpen === 0) continue;
      seen.add(address);
      const cycles = (sealedOpen.get(address) ?? 0) + 1;
      sealedOpen.set(address, cycles);
      const detail = { sealedFeesOpen: c.sealedFeesOpen, cycles, status: Status[c.status] ?? null };
      if (cycles > 1) findings.push({ kind: "sealed_fee_open", key: address, detail });
    }
    for (const key of [...sealedOpen.keys()]) if (!seen.has(key)) sealedOpen.delete(key);
    return findings;
  }

  function idleFindings(view: ChainView, attempts: readonly AttemptResult[], keeperSettles: boolean): Finding[] {
    const now = wall();
    const findings: Finding[] = [];
    const resolvable = new Set(attempts.filter((a) => a.resolvable && a.attempt !== "resolved").map((a) => a.campaign));
    for (const key of [...resolvableSince.keys()]) if (!resolvable.has(key as never)) resolvableSince.delete(key);
    for (const campaign of resolvable) {
      const since = resolvableSince.get(campaign) ?? now;
      resolvableSince.set(campaign, since);
      if (now - since > idle.resolvableMs) {
        const idleMinutes = Math.floor((now - since) / 60_000);
        findings.push({ kind: "campaign_idle", key: campaign, detail: { phase: "resolvable", idleMinutes } });
      }
    }
    const seen = new Set<string>();
    for (const { address, campaign: c } of view.campaigns) {
      if (!hasSettlementWork(c, view.chain.unixTimestamp)) continue;
      seen.add(address);
      const print = fingerprint(c);
      const last = settling.get(address);
      if (!last || last.print !== print) settling.set(address, { print, since: now });
      const since = settling.get(address)!.since;
      if (now - since > idle.settlingMs) {
        const detail = { phase: "settling", status: Status[c.status], idleMinutes: Math.floor((now - since) / 60_000) };
        findings.push({ kind: "campaign_idle", key: address, detail: { ...detail, keeperSettles } });
      }
    }
    for (const key of [...settling.keys()]) if (!seen.has(key)) settling.delete(key);
    return findings;
  }

  return {
    observe(view, attempts, keeperSettles) {
      const now = view.chain.unixTimestamp;
      const rules: (Finding | null)[] = [
        openCampaignsHigh(view.config, thresholds),
        exposureHigh(exposureOf(view.vaults), view.campaigns.length, thresholds),
        openingsPerHour(view.campaigns, now, thresholds),
        solUsdStale(view.solUsd, view.config, now),
        ...teamOpenings(view.campaigns, now, thresholds),
        ...metLateNo(view.campaigns),
        ...reservedCreditsOld(view.campaigns, now, thresholds),
        ...contestsOpened(view.campaigns),
        ...stage2Ending(view.campaigns, now),
        ...sealedFindings(view),
        ...idleFindings(view, attempts, keeperSettles),
      ];
      const emitted: Finding[] = [];
      for (const finding of rules) {
        if (!finding) continue;
        const id = `${finding.kind}|${finding.key}`;
        if (finding.once && fired.has(id)) continue;
        if (finding.once) fired.add(id);
        if (alerter.alert(finding.kind, finding.key, finding.detail)) emitted.push(finding);
      }
      return emitted;
    },
  };
}
