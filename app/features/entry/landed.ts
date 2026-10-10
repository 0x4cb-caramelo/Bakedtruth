/**
 * Purpose: what a landed transaction says about its own failure: the program of the instruction that failed, read from
 *          the transaction as the cluster recorded it (`getTransaction`, JSON encoding), with the accounts a lookup
 *          table loaded. A wallet may add instructions of its own (Phantom's Lighthouse assertions, a compute budget),
 *          so the failed instruction's index alone does not say whose it was. `null` when the transaction cannot be read.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry; the Sprint 11 review's finding 4)
 */
import { signature as toSignature } from "@solana/kit";
import type { SolanaRpc } from "@brot/sdk/read";

/** The index of the top-level instruction that failed, from `{ InstructionError: [index, …] }`. */
export function failedIndex(err: unknown): number | null {
  const raw = (err as { InstructionError?: readonly unknown[] } | null)?.InstructionError?.[0];
  const index = typeof raw === "bigint" ? Number(raw) : raw;
  return typeof index === "number" && Number.isInteger(index) && index >= 0 ? index : null;
}

type JsonMessage = { accountKeys: readonly string[]; instructions: readonly { programIdIndex: number | bigint }[] };
type Loaded = { writable?: readonly string[]; readonly?: readonly string[] } | null | undefined;

/** The program whose instruction failed, from a transaction as `getTransaction` returns it. */
export function programOf(
  tx: { transaction: { message: unknown }; meta?: unknown } | null,
  err: unknown,
): string | null {
  const index = failedIndex(err);
  const message = tx?.transaction.message as JsonMessage | undefined;
  if (index === null || !message?.instructions) return null;
  const loaded = (tx?.meta as { loadedAddresses?: Loaded } | undefined)?.loadedAddresses;
  const keys = [...message.accountKeys, ...(loaded?.writable ?? []), ...(loaded?.readonly ?? [])];
  const ix = message.instructions[index];
  return ix ? (keys[Number(ix.programIdIndex)] ?? null) : null;
}

/** Reads the landed transaction and returns the program whose instruction failed, or `null`. */
export async function failedProgram(rpc: SolanaRpc, signature: string, err: unknown): Promise<string | null> {
  try {
    const options = { encoding: "json", maxSupportedTransactionVersion: 0, commitment: "confirmed" } as const;
    const tx = await rpc.getTransaction(toSignature(signature), options).send();
    return programOf(tx as unknown as Parameters<typeof programOf>[0], err);
  } catch {
    return null;
  }
}
