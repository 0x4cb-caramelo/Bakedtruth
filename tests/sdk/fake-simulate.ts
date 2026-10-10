/**
 * Purpose: the two RPC methods the A-3 preparation needs beyond reads, answered by a LiteSVM world:
 *          `getLatestBlockhash`, and `simulateTransaction` of an unsigned transaction (signature checks
 *          off, as `sigVerify: false` asks), returned in the RPC's JSON shape with the program's custom
 *          error, the logs, the compute units and the inner instructions.
 * Version: 0.1.1
 * Sprint:  05 (SDK)
 *
 * The inner instructions come the way a node writes them for `simulateTransaction` (Kit's type: "jsonParsed
 * where possible"): the System Program's parsed, any other program's partially decoded, with addresses. The
 * `compiled` shape (indexes, as `getTransaction` with `json` writes them) is kept for the test that both
 * decode alike.
 */
import {
  getBase58Decoder,
  getBase64Encoder,
  getCompiledTransactionMessageDecoder,
  getTransactionDecoder,
} from "@solana/kit";
import { isFailedTransaction } from "@solana/kit-plugin-litesvm";

import { SYSTEM_PROGRAM_ID } from "@brot/sdk/read";

import type { World } from "../brot/setup";

type Inner = { instruction(): { programIdIndex(): number; accounts(): Uint8Array; data(): Uint8Array } };
type Meta = { logs(): string[]; innerInstructions(): Inner[][]; computeUnitsConsumed(): bigint };
export type InnerShape = "node" | "compiled";

/** `{ InstructionError: [index, { Custom: code }] }`, the way a node reports a program's refusal. */
function rpcError(err: unknown): unknown {
  const inner = (err as { err?: () => { code?: number } })?.err?.();
  const index = (err as { index?: number })?.index ?? 0;
  if (inner && typeof inner.code === "number") return { InstructionError: [index, { Custom: inner.code }] };
  const match = /code: (\d+)/.exec(String(err));
  return match ? { InstructionError: [index, { Custom: Number(match[1]) }] } : String(err);
}

/** One inner instruction as a node writes it in `shape`. */
function written(inner: Inner, keys: readonly string[], shape: InnerShape) {
  const ix = inner.instruction();
  const data = getBase58Decoder().decode(ix.data());
  if (shape === "compiled") {
    return { programIdIndex: ix.programIdIndex(), accounts: Array.from(ix.accounts()), data, stackHeight: 2 };
  }
  const programId = keys[ix.programIdIndex()];
  if (programId === SYSTEM_PROGRAM_ID) {
    return { program: "system", programId, parsed: { type: "parsed by the node", info: {} }, stackHeight: 2 };
  }
  return { programId, accounts: Array.from(ix.accounts(), (i) => keys[i]), data, stackHeight: 2 };
}

export function simulationHandlers(w: World, shape: InnerShape = "node") {
  w.client.svm.withSigverify(false);
  return {
    getLatestBlockhash: () => ({
      context: { slot: w.client.svm.getClock().slot },
      value: { blockhash: w.client.svm.latestBlockhash(), lastValidBlockHeight: 1_000_000n },
    }),
    simulateTransaction: ([wire]: [string]) => {
      const tx = getTransactionDecoder().decode(getBase64Encoder().encode(wire));
      const keys = getCompiledTransactionMessageDecoder().decode(tx.messageBytes).staticAccounts;
      const result = w.client.svm.simulateTransaction(tx as never);
      const failed = isFailedTransaction(result as never);
      const meta = (result as unknown as { meta(): Meta }).meta();
      const innerInstructions = meta
        .innerInstructions()
        .map((list, index) => ({ index, instructions: list.map((inner) => written(inner, keys, shape)) }))
        .filter((group) => group.instructions.length > 0);
      return {
        context: { slot: w.client.svm.getClock().slot },
        value: {
          err: failed ? rpcError((result as unknown as { err(): unknown }).err()) : null,
          logs: meta.logs(),
          unitsConsumed: meta.computeUnitsConsumed(),
          innerInstructions,
          accounts: null,
          returnData: null,
        },
      };
    },
  };
}
