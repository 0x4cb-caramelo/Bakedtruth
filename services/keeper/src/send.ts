/**
 * Purpose: the keeper's transaction path: a message with a fresh blockhash, signed by the keeper, sent without
 *          preflight (the simulation already ran), rebroadcast as the same bytes every 2 s until it is confirmed
 *          or 60 s pass, then its status read back. Nothing is sent unless the caller simulated it first.
 * Version: 0.1.0
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
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import type { SolanaRpc } from "@brot/sdk/read";
import type { ReadyMessage } from "@brot/sdk/tx";

export type Landed = { ok: true; signature: string } | { ok: false; signature: string; error: string };

const REBROADCAST_MS = 2_000;
const CONFIRM_WINDOW_MS = 60_000;
const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
const plain = (_: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

export async function buildMessage(
  rpc: SolanaRpc,
  payer: TransactionSigner,
  instructions: Instruction[],
): Promise<ReadyMessage> {
  const { value } = await rpc.getLatestBlockhash({ commitment: "confirmed" }).send();
  return pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(payer, m),
    (m) =>
      setTransactionMessageLifetimeUsingBlockhash(
        { blockhash: value.blockhash, lastValidBlockHeight: value.lastValidBlockHeight },
        m,
      ),
    (m) => appendTransactionMessageInstructions(instructions, m),
  ) as ReadyMessage;
}

/** The gate every send passes through. A standby installs one that closes while the primary is alive. */
let maySend: () => boolean = () => true;

export function setSendGate(gate: () => boolean): void {
  maySend = gate;
}

export async function signAndSend(rpc: SolanaRpc, message: ReadyMessage): Promise<Landed> {
  if (!maySend()) throw new Error("send refused: this keeper is not taking over (the primary answers)");
  const tx = await signTransactionMessageWithSigners(message);
  const signature = getSignatureFromTransaction(tx);
  const wire = getBase64EncodedWireTransaction(tx);
  const deadline = Date.now() + CONFIRM_WINDOW_MS;
  while (Date.now() < deadline) {
    await rpc.sendTransaction(wire, { encoding: "base64", skipPreflight: true, maxRetries: 0n }).send();
    await sleep(REBROADCAST_MS);
    const { value } = await rpc.getSignatureStatuses([signature]).send();
    const status = value[0];
    if (status) {
      return status.err ? { ok: false, signature, error: JSON.stringify(status.err, plain) } : { ok: true, signature };
    }
  }
  return { ok: false, signature, error: "not confirmed within 60 s" };
}
