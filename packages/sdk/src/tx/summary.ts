/**
 * Purpose: the deterministic summary of a transaction before the wallet signs it (A-3). `summarizeMessage`
 *          reads the very bytes the wallet signs: the compiled message, decompiled from its static keys only,
 *          with its fee payer and its network fee; `summarizeInstructions` reads a list of instructions. Each
 *          instruction is decoded from its own bytes (never from the inputs it was built from) and said in
 *          words, with the most lamports it can take from a signer, and anything this SDK did not build is
 *          flagged.
 * Version: 0.2.1 (a contest opened earlier in the same transaction, the second review's S1)
 * Sprint:  05 (SDK); 14 (lane L14B)
 *
 * Trusted means: this program's instructions shaped as the IDL says, and compute-unit limits and prices this
 * SDK reads, with the priority fee under the cap. Untrusted: a System Program instruction or any other
 * program's, a malformed instruction, a message that loads address lookup tables or is not legacy or v0, bytes
 * past the message, or a fee payer other than the signer named. Pure code, no model and no network: the same
 * bytes always give the same text.
 */
import {
  compileTransaction,
  decompileTransactionMessage,
  getCompiledTransactionMessageDecoder,
  getCompiledTransactionMessageEncoder,
  type Address,
  type Instruction,
  type ReadonlyUint8Array,
} from "@solana/kit";

import { PROGRAM_ID, SYSTEM_PROGRAM_ID } from "../read/constants";
import { bytesEqual } from "../read/bytes";
import { formatSol } from "../read/format";
import type { ReadyMessage } from "./simulate";
import {
  COMPUTE_BUDGET_PROGRAM_ID,
  DEFAULT_PRIORITY_FEE_CAP,
  describeBudget,
  priorityFeeAtMost,
  readComputeBudget,
  type ComputeBudget,
} from "./summary-budget";
import { summarizeBrot, type SummaryContext } from "./summary-brot";
import { contestsOpened } from "./summary-contest";

export type { SummaryContext } from "./summary-brot";

export type SummaryItem = {
  index: number;
  name: string;
  text: string;
  /** This program's instruction shaped as the IDL says, or a compute-budget setting read and under the cap. */
  trusted: boolean;
  /**
   * The most lamports this instruction can take from a signer's wallet: what the program can move out of it,
   * or the priority fee a compute-unit price sets. Rents (returned later) and the base fee are apart.
   */
  lamportsAtMost: bigint;
};

export type TransactionSummary = {
  items: SummaryItem[];
  trusted: boolean;
  lamportsAtMost: bigint;
  /** The priority fee the compute-budget instructions allow, at most (already in `lamportsAtMost`). */
  priorityFeeAtMost: bigint;
  lines: string[];
};

/** The summary of the bytes a wallet signs. */
export type MessageSummary = TransactionSummary & {
  feePayer: Address | null;
  /** The signatures the message requires. */
  signatures: number;
  /** The base fee of every signature plus the priority fee, at most. */
  networkFeeAtMost: bigint;
};

export type SummaryOptions = {
  /** The highest priority fee a trusted summary accepts: 0.001 SOL unless set. */
  priorityFeeCap?: bigint;
  /** What the screen read, so the summary names it in words. */
  context?: SummaryContext;
  /** The fee payer, which may fill any slot as a writable signer (`summarizeMessage` sets it). */
  feePayer?: Address;
};

/** The base fee per signature. */
export const LAMPORTS_PER_SIGNATURE = 5_000n;

function itemOf(ix: Instruction, index: number, budget: ComputeBudget, options: SummaryOptions): SummaryItem {
  if (ix.programAddress === PROGRAM_ID) {
    return { index, ...summarizeBrot(ix, options.context ?? {}, options.feePayer) };
  }
  if (ix.programAddress === COMPUTE_BUDGET_PROGRAM_ID) {
    const read = describeBudget(budget, index, options.priorityFeeCap ?? DEFAULT_PRIORITY_FEE_CAP);
    return { index, name: "computeBudget", text: read.text, trusted: read.trusted, lamportsAtMost: read.lamports };
  }
  const what = ix.programAddress === SYSTEM_PROGRAM_ID ? "System Program instruction" : `program ${ix.programAddress}`;
  return {
    index,
    name: "unknown",
    text: `A ${what} this SDK did not build: do not sign`,
    trusted: false,
    lamportsAtMost: 0n,
  };
}

/** The summary of `instructions`, in order. `trusted` only when there is at least one and every one is. */
export function summarizeInstructions(
  instructions: readonly Instruction[],
  options: SummaryOptions = {},
): TransactionSummary {
  const budget = readComputeBudget(instructions);
  // A contest opened by an earlier instruction of the same transaction is contested for the ones after it (S1).
  const items = instructions.map((ix, index) => {
    const opened = contestsOpened(instructions.slice(0, index));
    const context = opened.size === 0 ? options.context : { ...options.context, contestsOpenedEarlier: opened };
    return itemOf(ix, index, budget, { ...options, context });
  });
  return {
    items,
    trusted: items.length > 0 && items.every((item) => item.trusted),
    lamportsAtMost: items.reduce((sum, item) => sum + item.lamportsAtMost, 0n),
    priorityFeeAtMost: priorityFeeAtMost(budget),
    lines: items.map((item) => `${item.index + 1}. ${item.text}`),
  };
}

const refused = (text: string): MessageSummary => ({
  items: [],
  trusted: false,
  lamportsAtMost: 0n,
  priorityFeeAtMost: 0n,
  lines: [`${text}: do not sign`],
  feePayer: null,
  signatures: 0,
  networkFeeAtMost: 0n,
});

/**
 * The summary of the bytes the wallet signs: `message`'s compiled bytes, or the bytes given. Call it last,
 * just before the wallet; `signer` is the wallet that must pay the fee.
 */
export function summarizeMessage(
  message: ReadyMessage | ReadonlyUint8Array,
  options: SummaryOptions & { signer?: Address } = {},
): MessageSummary {
  const bytes = message instanceof Uint8Array ? message : compileTransaction(message as ReadyMessage).messageBytes;
  let compiled;
  let decompiled;
  try {
    compiled = getCompiledTransactionMessageDecoder().decode(bytes);
    if (!bytesEqual(getCompiledTransactionMessageEncoder().encode(compiled), bytes)) {
      return refused("These bytes are not exactly one transaction message");
    }
    if (compiled.version !== 0 && compiled.version !== "legacy") {
      return refused(`A version-${compiled.version} transaction message, which this SDK never builds`);
    }
    if ((("addressTableLookups" in compiled && compiled.addressTableLookups) || []).length > 0) {
      return refused("The message loads accounts from address lookup tables, which this SDK never builds");
    }
    decompiled = decompileTransactionMessage(compiled);
  } catch {
    return refused("These bytes do not decode as a transaction message");
  }
  const feePayer = decompiled.feePayer.address;
  const summary = summarizeInstructions(decompiled.instructions, { ...options, feePayer });
  const signatures = compiled.header.numSignerAccounts;
  const networkFeeAtMost = LAMPORTS_PER_SIGNATURE * BigInt(signatures) + summary.priorityFeeAtMost;
  const payerOk = options.signer === undefined || options.signer === feePayer;
  const fee = `network fee at most ${formatSol(networkFeeAtMost)} SOL (${signatures} signature${signatures === 1 ? "" : "s"}${summary.priorityFeeAtMost > 0n ? " and the priority fee" : ""})`;
  const payer = payerOk ? "" : `; the signing wallet is ${options.signer}: do not sign`;
  return {
    ...summary,
    trusted: summary.trusted && payerOk,
    lines: [`Paid by ${feePayer}: ${fee}${payer}`, ...summary.lines],
    feePayer,
    signatures,
    networkFeeAtMost,
  };
}
