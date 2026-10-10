/**
 * Purpose: simulate a transaction before sending it, so an ops script shows what the program would answer
 *          (its custom error by name, the logs, the compute units) without writing anything to the ledger.
 *          Every team act runs this first and sends only with --yes.
 * Version: 0.1.1
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * The transaction is compiled and never signed: its signature slots stay empty and `sigVerify: false` lets the
 * node run it, the signer flags in the message still counting. A signed transaction handed to an RPC could be
 * broadcast by that RPC, which would make "sent only with --yes" untrue (Sprint 05 review).
 */
import {
  appendTransactionMessageInstructions,
  blockhash,
  compileTransaction,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";

import { customErrorCode, errorName } from "@brot/sdk/read";

import type { Rpc } from "./rpc";
export type Simulated = { ok: boolean; code: number | null; error: string | null; logs: string[]; units: number };

/** Simulates `ixs` paid by `payer`, unsigned: nothing lands on the ledger, and nothing signed leaves the machine. */
export async function simulate(rpc: Rpc, payer: TransactionSigner, ixs: Instruction[]): Promise<Simulated> {
  const latest = await rpc.call<any>("getLatestBlockhash", [{ commitment: "confirmed" }]);
  const lifetime = {
    blockhash: blockhash(latest.value.blockhash),
    lastValidBlockHeight: BigInt(latest.value.lastValidBlockHeight),
  };
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(payer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
    (m) => appendTransactionMessageInstructions(ixs, m),
  );
  const unsigned = compileTransaction(message);
  if (Object.values(unsigned.signatures).some((s) => s !== null)) throw new Error("a simulation must not be signed");
  const wire = getBase64EncodedWireTransaction(unsigned);
  const options = { encoding: "base64", sigVerify: false, replaceRecentBlockhash: true, commitment: "confirmed" };
  const { value } = await rpc.call<any>("simulateTransaction", [wire, options]);
  const code = customErrorCode(value.err);
  const error =
    code === null ? (value.err === null ? null : JSON.stringify(value.err)) : (errorName(code) ?? `custom ${code}`);
  return { ok: value.err === null, code, error, logs: value.logs ?? [], units: Number(value.unitsConsumed ?? 0) };
}
