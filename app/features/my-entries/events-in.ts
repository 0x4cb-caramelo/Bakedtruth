/**
 * Purpose: the program's events in one landed transaction, as the site reads them: `getTransaction` (JSON, confirmed)
 *          decoded by the SDK under its four decoder rules (this program's inner instructions signed by its event
 *          authority only). `null` when the transaction cannot be read back: the caller tries again, never guesses.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { signature as toSignature } from "@solana/kit";
import { decodeTransactionEvents, type DecodedEvent, type RpcTransaction, type SolanaRpc } from "@brot/sdk/read";

const OPTIONS = { encoding: "json", maxSupportedTransactionVersion: 0, commitment: "confirmed" } as const;

export async function eventsIn(rpc: SolanaRpc, signature: string): Promise<DecodedEvent[] | null> {
  try {
    const tx = await rpc.getTransaction(toSignature(signature), OPTIONS).send();
    return tx ? decodeTransactionEvents(tx as unknown as RpcTransaction) : null;
  } catch {
    return null;
  }
}
