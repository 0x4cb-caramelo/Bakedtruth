/**
 * Purpose: one keeper cycle: read the open campaigns, try the resolve task on each, and report the counts and the
 *          keeper's SOL balance. A failure on one campaign is logged and does not stop the others. Keeps no state.
 * Version: 0.1.0
 * Sprint:  06 (server and primary keeper), MVP happy path
 */
import type { TransactionSigner } from "@solana/kit";
import type { SolanaRpc } from "@brot/sdk/read";

import { listOpenCampaigns } from "./campaigns";
import { log } from "./log";
import { tryResolve, type Attempt, type AttemptResult } from "./resolve";

export type CycleReport = {
  at: string;
  durationMs: number;
  dryRun: boolean;
  openCampaigns: number;
  counts: Record<Attempt, number>;
  keeperLamports: string;
};

const ACTIONS: readonly Attempt[] = ["resolved", "wouldResolve", "refused", "failed"];

export async function runCycle(rpc: SolanaRpc, payer: TransactionSigner, dryRun: boolean): Promise<CycleReport> {
  const started = Date.now();
  const counts: Record<Attempt, number> = { resolved: 0, wouldResolve: 0, notYet: 0, refused: 0, failed: 0 };
  const open = await listOpenCampaigns(rpc);
  for (const campaign of open) {
    let result: AttemptResult;
    try {
      result = await tryResolve(rpc, payer, dryRun, campaign);
    } catch (error) {
      result = { attempt: "failed", campaign: campaign.address, detail: errorText(error) };
    }
    counts[result.attempt]++;
    if (ACTIONS.includes(result.attempt)) log(result.attempt, { campaign: result.campaign, detail: result.detail });
  }
  const { value: lamports } = await rpc.getBalance(payer.address).send();
  return {
    at: new Date(started).toISOString(),
    durationMs: Date.now() - started,
    dryRun,
    openCampaigns: open.length,
    counts,
    keeperLamports: lamports.toString(),
  };
}

export const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));
