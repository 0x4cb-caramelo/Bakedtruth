/**
 * Purpose: one transaction read for the indexer (Sprint 16, the review's F1): `getTransaction` at `finalized`, JSON, up
 *          to the SDK's MAX_TRANSACTION_VERSION, with a timeout. The answer: the transaction; `null` when the node has
 *          none; `unreadable` when the node cannot return it in a version this client reads (-32015), which a reader
 *          counts and goes past, or, where skipping could change money, stops at and names; or the name of the call's
 *          failure (a timeout, a 429, a node down), never its message, which can carry the RPC's URL.
 * Version: 0.1.0
 * Sprint:  16 (the review's F1)
 */
import { signature as toSignature } from "@solana/kit";
import { isUnsupportedVersion, MAX_TRANSACTION_VERSION, type RpcTransaction, type SolanaRpc } from "@brot/sdk/read";

export type TxRead = RpcTransaction | null | { failed: string } | { unreadable: true };

const TX = {
  encoding: "json",
  maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION,
  commitment: "finalized",
} as const;

export async function readTransaction(rpc: SolanaRpc, signature: string, timeoutMs: number): Promise<TxRead> {
  try {
    const tx = await rpc
      .getTransaction(toSignature(signature), TX)
      .send({ abortSignal: AbortSignal.timeout(timeoutMs) });
    return (tx as unknown as RpcTransaction | null) ?? null;
  } catch (caught) {
    if (isUnsupportedVersion(caught)) return { unreadable: true };
    return { failed: caught instanceof Error ? caught.name : "Error" };
  }
}

export const isUnreadable = (r: TxRead): r is { unreadable: true } => r !== null && "unreadable" in r;
export const isFailed = (r: TxRead): r is { failed: string } => r !== null && "failed" in r;
