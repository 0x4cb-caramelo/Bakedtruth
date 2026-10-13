/**
 * Purpose: the weekly referral routine's two steps (TP §3.4.11; Sprint 14, lane L14R), as functions the commands in
 *          scripts/referral/ call and the tests drive. Prepare: sync the ledger with what the operations wallet's
 *          history shows landed (landed.ts), read what each wallet earned from the indexer's finalized rows
 *          (earned.ts), plan the batch with the injected credit check (batch.ts), let the caller refuse the plan
 *          before anything is committed (`beforeWrite`: a stale signing file), then, unless a dry run, write it
 *          (write.ts) and its signing file (script.ts). Record: sync the ledger again, so each landed transfer is
 *          recorded by its signature; then, if asked, give up what is left of a batch, only for the operations wallet
 *          that batch was prepared for. Neither holds a key nor signs anything.
 * Version: 0.2.0 (the credit check, the guard before writing, cancel bound to the batch's own wallet)
 * Sprint:  14 (referral, lane L14R)
 */
import type { SolanaRpc } from "@brot/sdk/read";

import type { Store } from "../db/store";
import { BatchRefused, planBatch, type Plan } from "./batch";
import type { CreditCheck } from "./credit";
import { standingOf } from "./earned";
import { scanLandings, type ScanReport } from "./landed";
import { batchOps, batchStatus, cancelBatch } from "./ledger";
import { batchSummary, signingScript } from "./signing";
import { writeBatch } from "./write";

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
  canCredit?: CreditCheck;
  beforeWrite?: (plan: Plan) => void;
}): Promise<Prepared> {
  const timeoutMs = o.timeoutMs ?? 20_000;
  const scan = await scanLandings(o.rpc, o.ledger, o.ops, { timeoutMs });
  if (scan.stoppedAt !== null)
    throw new BatchRefused(`the node has not returned ${scan.stoppedAt} yet: run it again later`);
  const plan = await planBatch(o.rpc, o.ledger, standingOf(o.indexer), o.ops, { timeoutMs, canCredit: o.canCredit });
  if (!o.dryRun) o.beforeWrite?.(plan);
  const written = !o.dryRun && writeBatch(o.ledger, plan, o.now);
  const script = written && plan.send.length > 0 ? signingScript(plan) : null;
  return { plan, summary: batchSummary(plan, o.dryRun, scan), script, written, scan };
}

/** Records every landed transfer; then cancels what is left of `cancel`, scanned from that batch's own wallet. */
export async function recordPayouts(o: {
  rpc: SolanaRpc;
  ledger: Store;
  ops: string;
  cancel?: number;
  timeoutMs?: number;
}): Promise<{ scan: ScanReport; cancelled: number; status: ReturnType<typeof batchStatus> }> {
  if (o.cancel !== undefined) {
    const owner = batchOps(o.ledger, o.cancel);
    if (owner === null) throw new BatchRefused(`this ledger prepared no batch ${o.cancel}`);
    if (owner !== o.ops)
      throw new BatchRefused(`batch ${o.cancel} was prepared for ${owner}, not ${o.ops}: cancel with --ops ${owner}`);
  }
  const scan = await scanLandings(o.rpc, o.ledger, o.ops, { timeoutMs: o.timeoutMs ?? 20_000 });
  if (o.cancel !== undefined && scan.stoppedAt !== null)
    throw new BatchRefused(`the node has not returned ${scan.stoppedAt} yet: record again before cancelling`);
  const cancelled = o.cancel === undefined ? 0 : cancelBatch(o.ledger, o.cancel);
  return { scan, cancelled, status: batchStatus(o.ledger) };
}
