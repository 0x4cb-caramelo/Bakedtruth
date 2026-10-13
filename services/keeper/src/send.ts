/**
 * Purpose: the keeper's transaction path: a message with a fresh blockhash, signed by the keeper, sent without
 *          preflight (the simulation already ran) and `maxRetries: 0`, the same bytes rebroadcast every 2 s until a
 *          confirmed status comes back or the block height passes the blockhash's `lastValidBlockHeight` (TP §3.5,
 *          "Transaction landing"); after that it can never land, and the next cycle builds anew. Nothing is sent
 *          unless the send gate is open: a standby installs one that stays closed while the primary answers.
 * Version: 0.2.0 (Sprint 06 DoD: rebroadcast until the blockhash expires; the timing injectable for tests)
 * Sprint:  07 (standby keeper and watchdog): the send guard, checked here so no caller can skip it
 */
import {
  appendTransactionMessageInstructions,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  getSignatureFromTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Blockhash,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import type { SolanaRpc } from "@brot/sdk/read";
import type { ReadyMessage } from "@brot/sdk/tx";

/** `err` is the cluster's error object when the transaction landed and failed; absent otherwise. */
export type Landed = { ok: true; signature: string } | { ok: false; signature: string; error: string; err?: unknown };

/** How often the same bytes are sent again, and the longest the keeper waits on one transaction. */
export type SendTiming = { rebroadcastMs: number; maxWaitMs: number };
export const DEFAULT_TIMING: SendTiming = { rebroadcastMs: 2_000, maxWaitMs: 90_000 };

export type Lifetime = { blockhash: Blockhash; lastValidBlockHeight: bigint };

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
const plain = (_: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);
const text = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** A message of `instructions`, paid by `payer`, with `lifetime` (no RPC call). */
export function messageWith(payer: TransactionSigner, instructions: Instruction[], lifetime: Lifetime): ReadyMessage {
  return pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(payer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
    (m) => appendTransactionMessageInstructions(instructions, m),
  ) as ReadyMessage;
}

/** The cluster's latest blockhash and the last block height it is valid for. */
export async function latestLifetime(rpc: SolanaRpc): Promise<Lifetime> {
  const { value } = await rpc.getLatestBlockhash({ commitment: "confirmed" }).send();
  return { blockhash: value.blockhash, lastValidBlockHeight: value.lastValidBlockHeight };
}

export async function buildMessage(
  rpc: SolanaRpc,
  payer: TransactionSigner,
  instructions: Instruction[],
): Promise<ReadyMessage> {
  return messageWith(payer, instructions, await latestLifetime(rpc));
}

/** The gate every send passes through. A standby installs one that closes while the primary is alive. */
let maySend: () => boolean = () => true;

export function setSendGate(gate: () => boolean): void {
  maySend = gate;
}

const lastValidOf = (message: ReadyMessage): bigint | null => {
  const lifetime = message.lifetimeConstraint as { lastValidBlockHeight?: bigint };
  return typeof lifetime.lastValidBlockHeight === "bigint" ? lifetime.lastValidBlockHeight : null;
};

/** The transaction's status: landed (ok or failed), or `null` while unknown. Only `confirmed` or better counts. */
async function statusOf(rpc: SolanaRpc, signature: string): Promise<Landed | null> {
  const { value } = await rpc.getSignatureStatuses([signature as never]).send();
  const status = value[0];
  if (!status) return null;
  if (status.err) return { ok: false, signature, error: JSON.stringify(status.err, plain), err: status.err };
  const done = status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized";
  return done ? { ok: true, signature } : null;
}

/** The block height is past `lastValid`; an RPC error reads as "not yet", so the deadline still bounds the loop. */
async function expired(rpc: SolanaRpc, lastValid: bigint | null): Promise<boolean> {
  if (lastValid === null) return false;
  try {
    return (await rpc.getBlockHeight({ commitment: "confirmed" }).send()) > lastValid;
  } catch {
    return false;
  }
}

export async function signAndSend(
  rpc: SolanaRpc,
  message: ReadyMessage,
  timing: SendTiming = DEFAULT_TIMING,
): Promise<Landed> {
  if (!maySend()) throw new Error("send refused: this keeper is not taking over (the primary answers)");
  const tx = await signTransactionMessageWithSigners(message);
  const signature = getSignatureFromTransaction(tx);
  const wire = getBase64EncodedWireTransaction(tx);
  const lastValid = lastValidOf(message);
  const deadline = Date.now() + timing.maxWaitMs;
  let sendError: string | null = null;
  while (Date.now() < deadline) {
    try {
      await rpc.sendTransaction(wire, { encoding: "base64", skipPreflight: true, maxRetries: 0n }).send();
    } catch (error) {
      sendError = text(error); // a rebroadcast the node refuses (already processed, rate limit) is not fatal
    }
    await sleep(timing.rebroadcastMs);
    const landed = await statusOf(rpc, signature);
    if (landed) return landed;
    if (await expired(rpc, lastValid)) {
      const last = await statusOf(rpc, signature); // it may have landed in the blockhash's last block
      if (last) return last;
      const why = sendError ? `; last send error: ${sendError}` : "";
      return { ok: false, signature, error: `expired: the block height passed ${lastValid}${why}` };
    }
  }
  const why = sendError ? `; last send error: ${sendError}` : "";
  return { ok: false, signature, error: `not confirmed within ${timing.maxWaitMs} ms${why}` };
}
