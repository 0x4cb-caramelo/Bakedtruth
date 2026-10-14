/**
 * Purpose: the program's events in one landed transaction, as the site reads them: `getTransaction` (JSON, confirmed,
 *          up to the SDK's MAX_TRANSACTION_VERSION, so a v1 transaction reads too) decoded by the SDK under its four
 *          decoder rules (this program's inner instructions signed by its event authority only). `null` when the
 *          transaction cannot be read back, a version newer than this client reads (-32015) included: the caller
 *          keeps it as unread and never guesses (Sprint 16, the review's F1).
 * Version: 0.2.0 (Sprint 16: every transaction version the cluster serves)
 * Sprint:  12 (site: my entries and campaign states); 16
 */
import { signature as toSignature } from "@solana/kit";
import {
  decodeTransactionEvents,
  MAX_TRANSACTION_VERSION,
  type DecodedEvent,
  type RpcTransaction,
  type SolanaRpc,
} from "@brot/sdk/read";

const OPTIONS = {
  encoding: "json",
  maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION,
  commitment: "confirmed",
} as const;

export async function eventsIn(rpc: SolanaRpc, signature: string): Promise<DecodedEvent[] | null> {
  try {
    const tx = await rpc.getTransaction(toSignature(signature), OPTIONS).send();
    return tx ? decodeTransactionEvents(tx as unknown as RpcTransaction) : null;
  } catch {
    return null;
  }
}
