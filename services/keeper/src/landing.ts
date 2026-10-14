/**
 * Purpose: lands a list of keeper instructions (TP §3.5, "Transaction landing"): packs them in order into
 *          transactions that fit the 1,232-byte limit with the two compute-budget instructions and hold at most
 *          `batchMax` each; simulates each batch and, while it fails at an instruction, drops that instruction (the
 *          program's refusal is recorded against it by name) and simulates the rest again, so one failing instruction
 *          never sinks the others; then sets the compute limit from the simulation and the priority fee from
 *          `getRecentPrioritizationFees`, and sends through the gated path of send.ts. A dry run stops after the
 *          simulation. Each instruction gets one result.
 * Version: 0.1.1 (Sprint 16: each refused or failed item carries the program's error code)
 * Sprint:  07 carry-over (Sprint 06 DoD: transaction landing, "drop the failing instruction"); 16 (lane L16P)
 *
 * The keeper chooses no destination: every instruction comes from the SDK's builders with the addresses stored on
 * chain (settle-plan.ts). A batch the cluster then refuses fails whole (a transaction is atomic), and its items are
 * recorded as failed: the next cycle re-reads the chain and plans again, so nothing is paid twice.
 */
import { compileTransaction, getTransactionSize, type Instruction, type TransactionSigner } from "@solana/kit";
import { customErrorCode, errorName, type SolanaRpc } from "@brot/sdk/read";
import { simulate, type Simulation } from "@brot/sdk/tx";

import {
  budgetInstructions,
  mostUrgent,
  priorityPrice,
  sharedWritable,
  unitLimit,
  type FeePolicy,
  type TaskKind,
} from "./budget";
import { latestLifetime, messageWith, signAndSend, type Landed, type Lifetime, type SendTiming } from "./send";

export type LandingContext = {
  rpc: SolanaRpc;
  payer: TransactionSigner;
  dryRun: boolean;
  fees: FeePolicy;
  /** Instructions per transaction, at most. */
  batchMax: number;
  timing?: SendTiming;
};

export type Item = { key: string; kind: TaskKind; ix: Instruction };
export type Outcome = "landed" | "wouldSend" | "refused" | "failed";
export type ItemResult = {
  key: string;
  kind: TaskKind;
  outcome: Outcome;
  detail: string | null;
  signature?: string;
  /** The program's custom error of a refused or failed item, when it is one (the settlement's invariant alert). */
  code?: number | null;
};

/** The wire limit of a version-0 transaction. */
export const TX_BYTES = 1_232;
const PLACEHOLDER: Lifetime = {
  blockhash: "11111111111111111111111111111111" as Lifetime["blockhash"],
  lastValidBlockHeight: 0n,
};
const plain = (_: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

/** The bytes a transaction of `ixs` takes on the wire with the two budget instructions (sizes do not vary). */
export function wireSize(payer: TransactionSigner, ixs: Instruction[]): number {
  const message = messageWith(payer, [...budgetInstructions(1n, 1n), ...ixs], PLACEHOLDER);
  return getTransactionSize(compileTransaction(message));
}

/** How many of `items`, from the front, fit one transaction (at least one, so an oversize item fails visibly). */
export function packCount(payer: TransactionSigner, items: readonly Item[], batchMax: number): number {
  let count = 1;
  while (count < Math.min(items.length, batchMax)) {
    const next = items.slice(0, count + 1).map((item) => item.ix);
    if (wireSize(payer, next) > TX_BYTES) break;
    count++;
  }
  return count;
}

/** The top-level instruction a failed simulation names (Kit parses the index as a bigint), or `null`. */
export function failedIndex(err: unknown): number | null {
  const raw = (err as { InstructionError?: readonly unknown[] } | null)?.InstructionError?.[0];
  const index = typeof raw === "bigint" ? Number(raw) : raw;
  return typeof index === "number" && Number.isInteger(index) ? index : null;
}

/** A landed failure, named when it is a program refusal: "AlreadySettled (6107): {...}". */
function failure(landed: Extract<Landed, { ok: false }>): string {
  const code = landed.err === undefined ? null : customErrorCode(landed.err);
  const name = code === null ? undefined : errorName(code);
  return name ? `${name} (${code}): ${landed.error}` : landed.error;
}

const why = (sim: Simulation) => sim.errorName ?? `simulation failed: ${JSON.stringify(sim.err ?? null, plain)}`;

/** Simulates `live` and drops failing instructions until the rest passes; returns the passing simulation. */
async function settleOnPassing(
  ctx: LandingContext,
  live: Item[],
  lifetime: Lifetime,
  results: ItemResult[],
): Promise<Simulation | null> {
  while (live.length > 0) {
    const sim = await simulate(
      ctx.rpc,
      messageWith(
        ctx.payer,
        live.map((item) => item.ix),
        lifetime,
      ),
    );
    if (sim.ok) return sim;
    const index = failedIndex(sim.err);
    if (index === null || index >= live.length) {
      // Not one instruction's refusal (an empty fee payer, a missing account): every item fails, nothing is sent.
      for (const item of live.splice(0)) {
        results.push({ ...meta(item), outcome: "failed", detail: why(sim), code: sim.errorCode });
      }
      return null;
    }
    const [dropped] = live.splice(index, 1);
    results.push({ ...meta(dropped!), outcome: "refused", detail: why(sim), code: sim.errorCode });
  }
  return null;
}

const meta = (item: Item) => ({ key: item.key, kind: item.kind });

/** The recent fees on what every instruction writes; an RPC error means none known, so the floor applies. */
async function recentFees(ctx: LandingContext, ixs: Instruction[]): Promise<bigint[]> {
  try {
    const shared = sharedWritable(ixs, ctx.payer.address);
    const fees = await ctx.rpc.getRecentPrioritizationFees(shared).send();
    return fees.map((fee) => BigInt(fee.prioritizationFee));
  } catch {
    return [];
  }
}

/**
 * Sends `live`, whose simulation `sim` passed, with the compute limit from that simulation and the priority fee of
 * its most urgent kind, through the gated send path. The caller has already decided to send (not a dry run).
 */
export async function sendPassing(ctx: LandingContext, live: readonly Item[], sim: Simulation): Promise<Landed> {
  const ixs = live.map((item) => item.ix);
  const limit = unitLimit(sim.unitsConsumed, ixs.length);
  const kind = mostUrgent(live.map((item) => item.kind));
  const price = priorityPrice(kind, await recentFees(ctx, ixs), limit, ctx.fees);
  const message = messageWith(ctx.payer, [...budgetInstructions(limit, price), ...ixs], await latestLifetime(ctx.rpc));
  return signAndSend(ctx.rpc, message, ctx.timing);
}

/** Lands `items` in order; one result per item. */
export async function landItems(ctx: LandingContext, items: readonly Item[]): Promise<ItemResult[]> {
  const results: ItemResult[] = [];
  let queue = [...items];
  while (queue.length > 0) {
    const live = queue.slice(0, packCount(ctx.payer, queue, ctx.batchMax));
    queue = queue.slice(live.length);
    const sim = await settleOnPassing(ctx, live, await latestLifetime(ctx.rpc), results);
    if (!sim || live.length === 0) continue;
    if (ctx.dryRun) {
      for (const item of live) results.push({ ...meta(item), outcome: "wouldSend", detail: null });
      continue;
    }
    const landed = await sendPassing(ctx, live, sim);
    for (const item of live) {
      results.push(
        landed.ok
          ? { ...meta(item), outcome: "landed", detail: null, signature: landed.signature }
          : {
              ...meta(item),
              outcome: "failed",
              detail: failure(landed),
              signature: landed.signature,
              code: landed.err === undefined ? null : customErrorCode(landed.err),
            },
      );
    }
  }
  return results;
}
