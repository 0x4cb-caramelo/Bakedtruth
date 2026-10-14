/**
 * Purpose: the settlement task (TP §3.5, the keeper's cycle, steps 2 to 5), behind KEEPER_SETTLE (off by default:
 *          whether the devnet keeper pays is the founder's decision). For each campaign whose review window has ended,
 *          whose contest lapsed, or that is finalized, it plans the next steps from the chain (settle-plan.ts), builds
 *          them with the SDK's builders, and lands them (landing.ts: simulated batches, a failing instruction dropped).
 *          It re-reads the campaign and plans again, up to six rounds a cycle (tally, finalize, the entries with the
 *          creator share, the prize and the sealed fees, the fee, the close), then sweeps the fee vault to the config's
 *          fee recipient. Every step is the program's to accept: a second keeper, or a retry, gets the program's
 *          refusal and nothing moves twice.
 * Version: 0.2.1 (Sprint 16: a refusal for a money invariant raises `settle_invariant`, settle-alert.ts)
 * Sprint:  07 carry-over (Sprint 06 DoD); 14 and 15 (lane L14K); 16 (lane L16P)
 */
import { address, type Address } from "@solana/kit";
import { decodeCampaign, feeVaultAddress, fetchRaw, rentExemptMinimum, type SolanaRpc } from "@brot/sdk/read";
import {
  buildCloseCampaign,
  buildCollectFee,
  buildFinalizeCampaign,
  buildSettleCreatorShare,
  buildSettleEntry,
  buildSettlePrize,
  buildSettleSealedFee,
  buildSweepFees,
  buildTallyLateJoins,
} from "@brot/sdk/tx";

import type { Backoff, DailyClock } from "./backoff";
import { withRetry } from "./backoff";
import { listEntries, listSealedFees, type OpenCampaign } from "./campaigns";
import type { ChainView } from "./chain";
import { landItems, type Item, type ItemResult, type LandingContext } from "./landing";
import { log as journal } from "./log";
import { alertInvariants, type InvariantAlerts } from "./settle-alert";
import {
  inSettlement,
  needsEntries,
  needsSealed,
  pendingOf,
  planCampaign,
  planSweep,
  stepKey,
  type Pending,
  type Step,
} from "./settle-plan";

export type SettleContext = {
  landing: LandingContext;
  /** KEEPER_SETTLE=on. Off: the pending work is reported and nothing is simulated or sent. */
  enabled: boolean;
  backoff: Backoff;
  claims: DailyClock;
  /** The fee vault is swept only once it holds at least this much above its rent. */
  sweepMinLamports: bigint;
  now?: () => number;
  log?: (event: string, fields: Record<string, unknown>) => void;
  /** `settle_invariant` once per campaign (settle-alert.ts); absent: refusals are only logged. */
  invariants?: InvariantAlerts;
};

export type SettleReport = {
  enabled: boolean;
  pending: Pending;
  landed: number;
  wouldSend: number;
  refused: number;
  failed: number;
};

const MAX_ROUNDS = 6;

/** The SDK's instruction for `step`, with the destinations the plan read from the chain. */
export async function buildStep(step: Step): Promise<Item> {
  const key = stepKey(step);
  switch (step.kind) {
    case "tally":
      return { key, kind: step.kind, ix: await buildTallyLateJoins(step) };
    case "finalize":
      return { key, kind: step.kind, ix: await buildFinalizeCampaign(step) };
    case "settleEntry":
      return { key, kind: step.kind, ix: await buildSettleEntry(step) };
    case "creatorShare":
      return { key, kind: step.kind, ix: await buildSettleCreatorShare(step) };
    case "collectFee":
      return { key, kind: step.kind, ix: await buildCollectFee(step) };
    case "settlePrize":
      return { key, kind: step.kind, ix: await buildSettlePrize(step) };
    case "sealedFee":
      return { key, kind: step.kind, ix: await buildSettleSealedFee(step) };
    case "close":
      return { key, kind: step.kind, ix: await buildCloseCampaign(step) };
    case "sweep":
      return { key, kind: step.kind, ix: await buildSweepFees(step) };
  }
}

/** The campaign as it stands now, or `null` once it is closed. */
async function reread(rpc: SolanaRpc, at: Address): Promise<OpenCampaign | null> {
  const raw = await withRetry(() => fetchRaw(rpc, at));
  return raw ? { address: at, campaign: decodeCampaign(raw) } : null;
}

function record(ctx: SettleContext, report: SettleReport, results: readonly ItemResult[]): void {
  const now = (ctx.now ?? Date.now)();
  for (const result of results) {
    report[result.outcome]++;
    if (result.outcome === "landed" || result.outcome === "wouldSend") ctx.backoff.succeeded(result.key);
    else ctx.backoff.failed(result.key, now);
    (ctx.log ?? journal)(`settle-${result.outcome}`, {
      step: result.key,
      detail: result.detail,
      signature: result.signature ?? null,
    });
  }
}

async function settleOne(ctx: SettleContext, first: OpenCampaign, chainNow: bigint, report: SettleReport) {
  const wall = ctx.now ?? Date.now;
  const rpc = ctx.landing.rpc;
  let at: OpenCampaign | null = first;
  for (let round = 0; round < MAX_ROUNDS && at; round++) {
    const current: OpenCampaign = at;
    const entries = needsEntries(current.campaign, chainNow)
      ? await withRetry(() => listEntries(rpc, current.address))
      : null;
    const sealed = needsSealed(current.campaign) ? await withRetry(() => listSealedFees(rpc, current.address)) : null;
    const claimKey = `claim:${current.address}`;
    // The daily clock starts only once a reserve is seen (its first sighting waits a day, backoff.ts).
    const claimDue = current.campaign.creatorShareReserved > 0n && ctx.claims.due(claimKey, wall());
    const steps = planCampaign(current, entries, chainNow, claimDue, sealed);
    const eligible = steps.filter((step) => ctx.backoff.ready(stepKey(step), wall()));
    if (eligible.length === 0) return;
    if (eligible.some((step) => step.kind === "creatorShare" && step.claim)) ctx.claims.mark(claimKey, wall());
    const results = await landItems(ctx.landing, await Promise.all(eligible.map(buildStep)));
    record(ctx, report, results);
    alertInvariants(ctx.invariants, current.address, results);
    if (!results.some((result) => result.outcome === "landed")) return;
    at = await reread(rpc, current.address);
  }
}

/** The settlement work of one cycle; with the switch off, only the pending counts. */
export async function settleTask(ctx: SettleContext, view: ChainView): Promise<SettleReport> {
  const now = view.chain.unixTimestamp;
  const report: SettleReport = {
    enabled: ctx.enabled,
    pending: pendingOf(view.campaigns, now),
    landed: 0,
    wouldSend: 0,
    refused: 0,
    failed: 0,
  };
  if (!ctx.enabled) return report;
  for (const at of view.campaigns) {
    if (!inSettlement(at.campaign, now)) continue;
    try {
      await settleOne(ctx, at, now, report);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      (ctx.log ?? journal)("settle-error", { campaign: at.address, detail });
    }
  }
  if (view.config) await sweep(ctx, view.config.feeRecipient, report);
  return report;
}

async function sweep(ctx: SettleContext, feeRecipient: Address, report: SettleReport): Promise<void> {
  const rpc = ctx.landing.rpc;
  try {
    const vault = await feeVaultAddress();
    const { value } = await withRetry(() => rpc.getBalance(address(vault)).send());
    const step = planSweep(BigInt(value), await rentExemptMinimum(rpc, 0), ctx.sweepMinLamports, feeRecipient);
    if (!step || !ctx.backoff.ready(stepKey(step), (ctx.now ?? Date.now)())) return;
    record(ctx, report, await landItems(ctx.landing, [await buildStep(step)]));
  } catch (error) {
    (ctx.log ?? journal)("settle-error", { step: "sweep", detail: error instanceof Error ? error.message : error });
  }
}
