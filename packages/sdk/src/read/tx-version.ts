/**
 * Purpose: how every reader of the program's transactions asks for them, and what a transaction it cannot read is
 *          (Sprint 16, the red-team review's F1 and F2). `MAX_TRANSACTION_VERSION` is the newest version the cluster
 *          serves: legacy, 0 and 1 (devnet carries v1 transactions, seen 2026-10-14; Kit 8.4 types the same three).
 *          Every `getTransaction` and `getBlock` asks for it, since a node refuses a transaction newer than the version
 *          asked for. That refusal, the JSON-RPC error -32015, makes the transaction "unreadable": a reader counts it,
 *          names it and goes past it, never stops for it; where skipping it could change money or a decision, the
 *          reader says why skipping is safe there, or stops and names it. Raise the constant when the cluster serves
 *          a newer version.
 * Version: 0.1.0 (the constant moved here from recheck.ts)
 * Sprint:  16 (the review's F1 and F2)
 */
import { isSolanaError, SOLANA_ERROR__JSON_RPC__SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION } from "@solana/kit";

/** The newest transaction version the cluster serves, and every reader asks for. */
export const MAX_TRANSACTION_VERSION = 1;

/** The JSON-RPC error a node answers for a transaction newer than the version asked for. */
export const UNSUPPORTED_VERSION_CODE = -32015;

/**
 * Whether `error` is the node's -32015: from Kit (a `SolanaError`), or from a plain JSON-RPC client that keeps the
 * error's `code` on what it throws (scripts/validator/rpc.ts).
 */
export function isUnsupportedVersion(error: unknown): boolean {
  if (isSolanaError(error, SOLANA_ERROR__JSON_RPC__SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION)) return true;
  const code = (error as { code?: unknown } | null | undefined)?.code;
  return code === UNSUPPORTED_VERSION_CODE || code === BigInt(UNSUPPORTED_VERSION_CODE);
}
