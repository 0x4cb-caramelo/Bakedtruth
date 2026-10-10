/**
 * Purpose: the summary's reading of compute-budget instructions (Sprint 05 review, H1): the unit limit and the
 *          unit price decoded, the priority fee they allow bounded and counted in what the signer pays, and
 *          anything else refused: an instruction kind this SDK does not read, a second one of a kind (the
 *          cluster refuses the transaction), accounts or a data size the runtime never takes, or a fee above
 *          the cap.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * The runtime charges `ceil(price × limit / 10^6)` lamports before it runs anything, whether the transaction
 * then succeeds or not. The limit is clamped to 1,400,000; with none set, 1,400,000 is an upper bound of the
 * runtime's default, so the bound never undercounts.
 */
import { address, type Instruction } from "@solana/kit";

import { formatSol } from "../read/format";

export const COMPUTE_BUDGET_PROGRAM_ID = address("ComputeBudget111111111111111111111111111111");
/** The most compute units a transaction can request, and the bound used when it sets none. */
export const MAX_COMPUTE_UNIT_LIMIT = 1_400_000n;
/** The highest priority fee a trusted summary accepts unless the caller sets another cap: 0.001 SOL. */
export const DEFAULT_PRIORITY_FEE_CAP = 1_000_000n;

const SET_COMPUTE_UNIT_LIMIT = 2;
const SET_COMPUTE_UNIT_PRICE = 3;

type Read = { kind: "limit" | "price"; value: bigint } | { kind: "refused"; text: string };

function readOne(ix: Instruction): Read {
  const data = ix.data ?? new Uint8Array();
  if ((ix.accounts ?? []).length > 0) return { kind: "refused", text: "A compute-budget instruction with accounts" };
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (data[0] === SET_COMPUTE_UNIT_LIMIT && data.length === 5) {
    return { kind: "limit", value: BigInt(view.getUint32(1, true)) };
  }
  if (data[0] === SET_COMPUTE_UNIT_PRICE && data.length === 9) {
    return { kind: "price", value: view.getBigUint64(1, true) };
  }
  return { kind: "refused", text: "A compute-budget instruction this SDK does not read" };
}

/** The transaction's compute-budget settings: each instruction's reading, the limit and the price. */
export type ComputeBudget = { reads: Map<number, Read>; limit: bigint | null; price: bigint | null };

export function readComputeBudget(instructions: readonly Instruction[]): ComputeBudget {
  const budget: ComputeBudget = { reads: new Map(), limit: null, price: null };
  instructions.forEach((ix, index) => {
    if (ix.programAddress !== COMPUTE_BUDGET_PROGRAM_ID) return;
    const read = readOne(ix);
    if (read.kind !== "refused" && budget[read.kind] !== null) {
      budget.reads.set(index, {
        kind: "refused",
        text: `A second compute-unit ${read.kind}, which the cluster refuses`,
      });
      return;
    }
    if (read.kind !== "refused") budget[read.kind] = read.value;
    budget.reads.set(index, read);
  });
  return budget;
}

/** The most lamports the compute-unit price can cost: `ceil(price × limit / 10^6)`, the limit bounded. */
export function priorityFeeAtMost(budget: ComputeBudget): bigint {
  if (budget.price === null) return 0n;
  const limit = budget.limit === null || budget.limit > MAX_COMPUTE_UNIT_LIMIT ? MAX_COMPUTE_UNIT_LIMIT : budget.limit;
  return (budget.price * limit + 999_999n) / 1_000_000n;
}

/** The summary line of compute-budget instruction `index`, with what it can cost the fee payer. */
export function describeBudget(
  budget: ComputeBudget,
  index: number,
  cap: bigint,
): { text: string; trusted: boolean; lamports: bigint } {
  const read = budget.reads.get(index);
  if (!read || read.kind === "refused") {
    return { text: `${read?.text ?? "A compute-budget instruction"}: do not sign`, trusted: false, lamports: 0n };
  }
  if (read.kind === "limit") return { text: `Compute-unit limit ${read.value}`, trusted: true, lamports: 0n };
  const fee = priorityFeeAtMost(budget);
  const text = `Priority fee of ${read.value} micro-lamports per compute unit: at most ${formatSol(fee)} SOL, charged even if the transaction fails`;
  if (fee > cap)
    return { text: `${text}; above the cap of ${formatSol(cap)} SOL: do not sign`, trusted: false, lamports: fee };
  return { text, trusted: true, lamports: fee };
}
