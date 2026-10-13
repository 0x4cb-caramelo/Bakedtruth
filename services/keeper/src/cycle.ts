/**
 * Purpose: one keeper cycle: read the chain in batches (chain.ts); simulate `resolve_campaign` for each open campaign
 *          worth it (prefilter.ts) and send what the program accepts; run the settlement task (settle.ts, behind its
 *          switch); watch Pyth's programs; let the chain watch raise its alerts; and report, for /healthz, the counts,
 *          the pending work, `open_campaigns` against `max_open_campaigns`, the SOL in the vaults and the keeper's
 *          balance. A failure on one campaign is logged and does not stop the others. The backoff, the daily claim
 *          clock and the watches' memory live in the context main.ts builds; the chain is re-read every cycle.
 * Version: 0.2.0 (Sprint 07 carry-over: batched reads, settlement, the chain watch, the Pyth watch)
 * Sprint:  06 (server and primary keeper); 07 carry-over
 */
import { Status } from "@brot/sdk/read";

import type { ChainWatch } from "./chain-watch";
import { readChainView, type ChainView } from "./chain";
import type { LandingContext } from "./landing";
import { log } from "./log";
import { worthSimulating } from "./prefilter";
import type { PythReport, PythWatch } from "./pyth-watch";
import { tryResolve, type Attempt, type AttemptResult } from "./resolve";
import { settleTask, type SettleContext, type SettleReport } from "./settle";
import { exposureOf, openCampaignsUsage } from "./watch-rules";

export type CycleContext = {
  landing: Omit<LandingContext, "dryRun">;
  settle: Omit<SettleContext, "landing">;
  watch: ChainWatch | null;
  pyth: PythWatch | null;
};

export type CycleReport = {
  at: string;
  durationMs: number;
  dryRun: boolean;
  /** Campaigns with status Open (the resolve task's). */
  openCampaigns: number;
  counts: Record<Attempt, number>;
  /** Open campaigns not simulated: the batched read showed nothing to resolve yet. */
  skipped: number;
  keeperLamports: string;
  campaigns: Record<string, number>;
  /** The program's own count of paid openings against its ceiling (the 80% alert's numbers). */
  maxOpenCampaigns: ReturnType<typeof openCampaignsUsage>;
  /** The SOL held in every campaign's vault, in lamports. */
  exposureLamports: string;
  settle: SettleReport;
  pyth: PythReport | { error: string } | null;
  readBatches: number;
  alerts: number;
};

const ACTIONS: readonly Attempt[] = ["resolved", "wouldResolve", "refused", "failed"];

async function resolveOpen(landing: LandingContext, view: ChainView) {
  const counts: Record<Attempt, number> = { resolved: 0, wouldResolve: 0, notYet: 0, refused: 0, failed: 0 };
  const attempts: AttemptResult[] = [];
  let skipped = 0;
  for (const open of view.campaigns.filter((item) => item.campaign.status === Status.Open)) {
    const metric = view.metrics.get(open.campaign.metricAccount) ?? null;
    if (!worthSimulating(open.campaign, metric, view.chain).simulate) {
      skipped++;
      continue;
    }
    let result: AttemptResult;
    try {
      result = await tryResolve(landing, open);
    } catch (error) {
      result = { attempt: "failed", campaign: open.address, detail: errorText(error) };
    }
    counts[result.attempt]++;
    attempts.push(result);
    if (ACTIONS.includes(result.attempt)) log(result.attempt, { campaign: result.campaign, detail: result.detail });
  }
  return { counts, attempts, skipped };
}

async function pythReport(ctx: CycleContext, landing: LandingContext): Promise<CycleReport["pyth"]> {
  if (!ctx.pyth) return null;
  try {
    return await ctx.pyth.check(landing.rpc);
  } catch (error) {
    return { error: errorText(error) };
  }
}

export async function runCycle(ctx: CycleContext, dryRun: boolean): Promise<CycleReport> {
  const started = Date.now();
  const landing: LandingContext = { ...ctx.landing, dryRun };
  const view = await readChainView(landing.rpc, landing.payer.address);
  const { counts, attempts, skipped } = await resolveOpen(landing, view);
  const settle = await settleTask({ ...ctx.settle, landing }, view);
  const pyth = await pythReport(ctx, landing);
  const alerts = ctx.watch ? ctx.watch.observe(view, attempts, ctx.settle.enabled).length : 0;
  const byStatus: Record<string, number> = { Open: 0, InReview: 0, Contested: 0, Settling: 0, Settled: 0 };
  for (const { campaign } of view.campaigns)
    byStatus[Status[campaign.status]] = (byStatus[Status[campaign.status]] ?? 0) + 1;
  return {
    at: new Date(started).toISOString(),
    durationMs: Date.now() - started,
    dryRun,
    openCampaigns: byStatus.Open ?? 0,
    counts,
    skipped,
    keeperLamports: view.keeperLamports.toString(),
    campaigns: byStatus,
    maxOpenCampaigns: openCampaignsUsage(view.config),
    exposureLamports: exposureOf(view.vaults).toString(),
    settle,
    pyth,
    readBatches: view.batches,
    alerts,
  };
}

export const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));
