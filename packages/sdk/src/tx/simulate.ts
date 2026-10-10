/**
 * Purpose: simulate a transaction before the wallet signs it (A-3): the cluster runs it on its current
 *          state, unsigned, with the latest blockhash, and the SDK reports the program's refusal by name
 *          and message, the logs, the compute units, and the events the program would emit, decoded by
 *          the same rules as a landed transaction.
 * Version: 0.1.1
 * Sprint:  05 (SDK)
 *
 * A node writes the simulation's inner instructions with addresses, parsed where it can (the System
 * Program's) and partially decoded otherwise (this program's); the decoder reads either shape. A custom
 * error is named as this program's only when the instruction that failed is this program's.
 */
import {
  compileTransaction,
  getBase64EncodedWireTransaction,
  getCompiledTransactionMessageDecoder,
  type TransactionMessage,
  type TransactionMessageWithFeePayer,
  type TransactionMessageWithLifetime,
} from "@solana/kit";

import { PROGRAM_ID } from "../read/constants";
import { customErrorCode, errorMessage, errorName, type BrotErrorName } from "../read/errors";
import { decodeTransactionEvents, type DecodedEvent, type RpcTransaction } from "../read/decoder";
import type { SolanaRpc } from "../read/rpc";

/** A message ready to compile: instructions, a fee payer and a lifetime. */
export type ReadyMessage = TransactionMessage & TransactionMessageWithFeePayer & TransactionMessageWithLifetime;

export type Simulation = {
  ok: boolean;
  /** The program's custom error, when the failure is one of its refusals. */
  errorCode: number | null;
  errorName: BrotErrorName | null;
  errorMessage: string | null;
  /** The raw error, for any other failure (an empty wallet, a missing account). */
  err: unknown;
  logs: readonly string[];
  unitsConsumed: bigint | null;
  /** Keyed by the signature "simulation": never mix them with landed events. */
  events: DecodedEvent[];
};

type Compiled = ReturnType<ReturnType<typeof getCompiledTransactionMessageDecoder>["decode"]>;

/**
 * The custom code of `err` when the top-level instruction that failed is this program's; else `null`. Kit's
 * RPC client parses every integer as a bigint, so the instruction's index arrives as one.
 */
function brotErrorCode(err: unknown, compiled: Compiled): number | null {
  if (err === null || typeof err !== "object" || !("instructions" in compiled)) return null;
  const raw = (err as { InstructionError?: readonly unknown[] }).InstructionError?.[0];
  const index = typeof raw === "bigint" ? Number(raw) : raw;
  const failed = typeof index === "number" ? compiled.instructions[index] : undefined;
  if (!failed || compiled.staticAccounts[failed.programAddressIndex] !== PROGRAM_ID) return null;
  return customErrorCode(err);
}

/** Runs `message` on the cluster without signatures and with its latest blockhash. */
export async function simulate(rpc: SolanaRpc, message: ReadyMessage): Promise<Simulation> {
  const transaction = compileTransaction(message);
  const wire = getBase64EncodedWireTransaction(transaction);
  const { context, value } = await rpc
    .simulateTransaction(wire, {
      encoding: "base64",
      sigVerify: false,
      replaceRecentBlockhash: true,
      innerInstructions: true,
      commitment: "confirmed",
    })
    .send();
  const compiled = getCompiledTransactionMessageDecoder().decode(transaction.messageBytes);
  const code = brotErrorCode(value.err, compiled);
  const landed: RpcTransaction = {
    slot: context.slot,
    transaction: { signatures: ["simulation"], message: { accountKeys: compiled.staticAccounts } },
    meta: { err: value.err, innerInstructions: value.innerInstructions ?? [] },
  };
  return {
    ok: value.err === null,
    errorCode: code,
    errorName: code === null ? null : (errorName(code) ?? null),
    errorMessage: code === null ? null : (errorMessage(code) ?? null),
    err: value.err,
    logs: value.logs ?? [],
    unitsConsumed: value.unitsConsumed ?? null,
    events: decodeTransactionEvents(landed),
  };
}
