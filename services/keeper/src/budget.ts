/**
 * Purpose: the compute budget of a keeper transaction (TP §3.5, "Transaction landing"; proposal §2.6), per kind of
 *          instruction: the compute-unit limit from the simulation with a margin, under 1.4M; the priority fee from
 *          the recent fees on the accounts every instruction of the batch writes, clamped between the configured floor
 *          and the lower of the configured ceiling and the kind's own, and cut so the whole fee stays under a lamport
 *          cap; and the two ComputeBudget instructions that carry them. Pure: no RPC call here.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: transaction landing)
 *
 * The runtime charges `ceil(price × limit / 10^6)` lamports before it runs anything, whether the transaction then
 * succeeds or not (the SDK's `priorityFeeAtMost` computes the same bound), so the cap is applied to that product.
 */
import { AccountRole, type Address, type Instruction } from "@solana/kit";
import { COMPUTE_BUDGET_PROGRAM_ID } from "@brot/sdk/read";
import { MAX_COMPUTE_UNIT_LIMIT, priorityFeeAtMost, readComputeBudget } from "@brot/sdk/tx";

/** Every instruction the keeper sends, by kind: each kind has its own budget below. */
export type TaskKind =
  "resolve" | "tally" | "finalize" | "settleEntry" | "creatorShare" | "collectFee" | "settlePrize" | "close" | "sweep";

/**
 * Per kind: the highest priority fee it may pay (micro-lamports per compute unit). A resolve races the 60 s proof
 * window of a price campaign, so it may pay more; the settlement steps have no deadline and pay the least. Measured
 * units (Sprint 05, devnet and LiteSVM): `settle_entry` 2,681 to 3,180 per entry; a team confirmation 4,778.
 */
export const KIND_FEE_CEILING: Record<TaskKind, bigint> = {
  resolve: 1_000_000n,
  tally: 100_000n,
  finalize: 100_000n,
  settleEntry: 100_000n,
  creatorShare: 100_000n,
  collectFee: 100_000n,
  settlePrize: 100_000n,
  close: 100_000n,
  sweep: 100_000n,
};

/** The kind with the highest fee ceiling among `kinds`: a batch that mixes kinds is priced as its most urgent. */
export function mostUrgent(kinds: readonly TaskKind[]): TaskKind {
  return kinds.reduce((best, kind) => (KIND_FEE_CEILING[kind] > KIND_FEE_CEILING[best] ? kind : best), kinds[0]!);
}

/** The runtime's default limit per non-builtin instruction, used when a simulation reports no units. */
export const DEFAULT_UNITS_PER_INSTRUCTION = 200_000n;
/** The margin over the simulated units: 30% and at least 5,000 units (the budget instructions cost ~300). */
const MARGIN_NUM = 13n;
const MARGIN_DEN = 10n;
const MARGIN_MIN = 5_000n;

export type FeePolicy = {
  /** Micro-lamports per compute unit, at least. */
  floor: bigint;
  /** Micro-lamports per compute unit, at most (the kind's own ceiling may be lower). */
  ceiling: bigint;
  /** The whole priority fee of one transaction, in lamports, at most. */
  maxLamports: bigint;
};

/** The compute-unit limit for `count` instructions: the simulated units with the margin, never above 1.4M. */
export function unitLimit(simulatedUnits: bigint | null, count: number): bigint {
  const limit =
    simulatedUnits === null || simulatedUnits <= 0n
      ? DEFAULT_UNITS_PER_INSTRUCTION * BigInt(Math.max(1, count))
      : maxOf((simulatedUnits * MARGIN_NUM + MARGIN_DEN - 1n) / MARGIN_DEN, simulatedUnits + MARGIN_MIN);
  return limit > MAX_COMPUTE_UNIT_LIMIT ? MAX_COMPUTE_UNIT_LIMIT : limit;
}

/**
 * The price per unit: the 75th percentile of the recent fees (none: zero), clamped between the floor and the lower
 * of the policy's ceiling and the kind's, then lowered until `ceil(price × limit / 10^6)` fits `maxLamports`.
 */
export function priorityPrice(kind: TaskKind, recent: readonly bigint[], limit: bigint, policy: FeePolicy): bigint {
  const sorted = [...recent].filter((fee) => fee >= 0n).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const p75 = sorted.length === 0 ? 0n : sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.75))]!;
  const ceiling = minOf(policy.ceiling, KIND_FEE_CEILING[kind]);
  let price = minOf(maxOf(p75, policy.floor), ceiling);
  const affordable = limit === 0n ? price : (policy.maxLamports * 1_000_000n) / limit;
  if (price > affordable) price = affordable;
  return price;
}

/** `SetComputeUnitLimit` (2, u32 LE) and `SetComputeUnitPrice` (3, u64 LE), as the SDK's summary reads them. */
export function budgetInstructions(limit: bigint, microLamports: bigint): Instruction[] {
  const limitData = new Uint8Array(5);
  limitData[0] = 2;
  new DataView(limitData.buffer).setUint32(1, Number(limit), true);
  const priceData = new Uint8Array(9);
  priceData[0] = 3;
  new DataView(priceData.buffer).setBigUint64(1, microLamports, true);
  return [
    { programAddress: COMPUTE_BUDGET_PROGRAM_ID, accounts: [], data: limitData },
    { programAddress: COMPUTE_BUDGET_PROGRAM_ID, accounts: [], data: priceData },
  ];
}

/** The lamports the two instructions can cost at most, read back the way the SDK's summary reads them. */
export const feeAtMost = (instructions: readonly Instruction[]): bigint =>
  priorityFeeAtMost(readComputeBudget(instructions));

/** The accounts every instruction of the batch writes (the fee payer excluded), at most 128: the fee query's key. */
export function sharedWritable(instructions: readonly Instruction[], payer: Address): Address[] {
  const writableOf = (ix: Instruction) =>
    new Set(
      (ix.accounts ?? [])
        .filter((meta) => meta.role === AccountRole.WRITABLE || meta.role === AccountRole.WRITABLE_SIGNER)
        .map((meta) => meta.address),
    );
  const [first, ...rest] = instructions.map(writableOf);
  if (!first) return [];
  return [...first].filter((at) => at !== payer && rest.every((set) => set.has(at))).slice(0, 128);
}

const maxOf = (a: bigint, b: bigint) => (a > b ? a : b);
const minOf = (a: bigint, b: bigint) => (a < b ? a : b);
