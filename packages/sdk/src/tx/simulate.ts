/**
 * Purpose: simulate a transaction before the wallet signs it (A-3): the cluster runs it on its current
 *          state, unsigned, with the latest blockhash, and the SDK reports the program's refusal by name
 *          and message, the logs, the compute units, and the events the program would emit, decoded by
 *          the same rules as a landed transaction.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import {
  compileTransaction,
  getBase64EncodedWireTransaction,
  getCompiledTransactionMessageDecoder,
  type TransactionMessage,
  type TransactionMessageWithFeePayer,
  type TransactionMessageWithLifetime,
} from "@solana/kit";

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
  events: DecodedEvent[];
};

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
  const code = value.err === null ? null : customErrorCode(value.err);
  const keys = getCompiledTransactionMessageDecoder().decode(transaction.messageBytes).staticAccounts;
  const shaped = {
    slot: context.slot,
    transaction: { signatures: ["simulation"], message: { accountKeys: keys } },
    meta: { err: value.err, innerInstructions: value.innerInstructions ?? [] },
  } as unknown as RpcTransaction;
  return {
    ok: value.err === null,
    errorCode: code,
    errorName: code === null ? null : (errorName(code) ?? null),
    errorMessage: code === null ? null : (errorMessage(code) ?? null),
    err: value.err,
    logs: value.logs ?? [],
    unitsConsumed: value.unitsConsumed ?? null,
    events: decodeTransactionEvents(shaped),
  };
}
