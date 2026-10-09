/**
 * Purpose: the transaction message a prepared instruction is simulated and signed in (one instruction,
 *          the signer paying, the cluster's latest blockhash) and the base network fee shown in a debit.
 * Version: 0.1.0
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

/** The network fee of a transaction with `signatures` signatures, at the base 5,000 lamports each. */
export const networkFee = (signatures = 1) => 5_000n * BigInt(signatures);

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
