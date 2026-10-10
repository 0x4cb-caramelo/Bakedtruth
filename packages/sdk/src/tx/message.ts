/**
 * Purpose: the transaction message a prepared instruction is simulated and signed in: one instruction, the
 *          signer paying, the cluster's latest blockhash. The network fee a debit shows is the summary's,
 *          read from the compiled message (`summarizeMessage`).
 * Version: 0.1.1
 * Sprint:  05 (SDK)
 */
import {
  appendTransactionMessageInstruction,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";

import type { SolanaRpc } from "../read/rpc";
import type { ReadyMessage } from "./simulate";

/** A message from one instruction, paid by `payer`, with the cluster's latest blockhash. */
export async function messageFor(rpc: SolanaRpc, payer: TransactionSigner, ix: Instruction): Promise<ReadyMessage> {
  const { value } = await rpc.getLatestBlockhash({ commitment: "confirmed" }).send();
  return pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(payer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(value, m),
    (m) => appendTransactionMessageInstruction(ix, m),
  );
}
