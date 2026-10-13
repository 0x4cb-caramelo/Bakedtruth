/**
 * Purpose: the weekly referral routine's two steps (TP §3.4.11; Sprint 14, lane L14R), as functions the commands in
 *          scripts/referral/ call and the tests drive. Prepare: sync the ledger with what the operations wallet's
 *          history shows landed (landed.ts), read what each wallet earned from the indexer's finalized rows
 *          (earned.ts), plan the batch (batch.ts) and, unless a dry run, write it and its signing file (signing.ts).
 *          Record: sync the ledger again, so each landed transfer is recorded by its signature; then, if asked, give
 *          up what is left of an open batch. Neither holds a key nor signs anything.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import type { SolanaRpc } from "@brot/sdk/read";

import type { Store } from "../db/store";
import { BatchRefused, planBatch, writeBatch, type Plan } from "./batch";
import { standingOf } from "./earned";
import { scanLandings, type ScanReport } from "./landed";
import { batchStatus, cancelBatch } from "./ledger";
import { batchSummary, signingScript } from "./signing";

export type Prepared = { plan: Plan; summary: string; script: string | null; written: boolean; scan: ScanReport };

/** Syncs, reads and plans; writes the batch unless `dryRun` (pass a throwaway ledger copy then: the scan writes). */
export async function prepareBatch(o: {
  rpc: SolanaRpc;
  indexer: Store;
  ledger: Store;
  ops: string;
  dryRun: boolean;
  now: number;
  timeoutMs?: number;
}): Promise<Prepared> {
  const timeoutMs = o.timeoutMs ?? 20_000;
  const scan = await scanLandings(o.rpc, o.ledger, o.ops, { timeoutMs });
  if (scan.stoppedAt !== null)
    throw new BatchRefused(`the node has not returned ${scan.stoppedAt} yet: run it again later`);
  const plan = await planBatch(o.rpc, o.ledger, standingOf(o.indexer), o.ops, timeoutMs);
  const written = !o.dryRun && writeBatch(o.ledger, plan, o.now);
  const script = written && plan.send.length > 0 ? signingScript(plan) : null;
  return { plan, summary: batchSummary(plan, o.dryRun), script, written, scan };
}

/** Records every landed transfer; then cancels what is left of `cancel`, if named. */
export async function recordPayouts(o: {
  rpc: SolanaRpc;
  ledger: Store;
  ops: string;
  cancel?: number;
  timeoutMs?: number;
}): Promise<{ scan: ScanReport; cancelled: number; status: ReturnType<typeof batchStatus> }> {
  const scan = await scanLandings(o.rpc, o.ledger, o.ops, { timeoutMs: o.timeoutMs ?? 20_000 });
  if (o.cancel !== undefined && scan.stoppedAt !== null)
    throw new BatchRefused(`the node has not returned ${scan.stoppedAt} yet: record again before cancelling`);
  const cancelled = o.cancel === undefined ? 0 : cancelBatch(o.ledger, o.cancel);
  return { scan, cancelled, status: batchStatus(o.ledger) };
}
