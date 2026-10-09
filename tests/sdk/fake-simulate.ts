/**
 * Purpose: the two RPC methods the A-3 preparation needs beyond reads, answered by a LiteSVM world:
 *          `getLatestBlockhash`, and `simulateTransaction` of an unsigned transaction (signature checks
 *          off, as `sigVerify: false` asks), returned in the RPC's JSON shape with the program's custom
 *          error, the logs, the compute units and the inner instructions.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { getBase58Decoder, getBase64Encoder, getTransactionDecoder } from "@solana/kit";
import { isFailedTransaction } from "@solana/kit-plugin-litesvm";

import type { World } from "../brot/setup";

type Inner = { instruction(): { programIdIndex(): number; accounts(): Uint8Array; data(): Uint8Array } };
type Meta = { logs(): string[]; innerInstructions(): Inner[][]; computeUnitsConsumed(): bigint };

/** `{ InstructionError: [index, { Custom: code }] }`, the way a node reports a program's refusal. */
function rpcError(err: unknown): unknown {
  const inner = (err as { err?: () => { code?: number } })?.err?.();
  const index = (err as { index?: number })?.index ?? 0;
  if (inner && typeof inner.code === "number") return { InstructionError: [index, { Custom: inner.code }] };
  const match = /code: (\d+)/.exec(String(err));
  return match ? { InstructionError: [index, { Custom: Number(match[1]) }] } : String(err);
}

export function simulationHandlers(w: World) {
  w.client.svm.withSigverify(false);
  return {
    getLatestBlockhash: () => ({
      context: { slot: w.client.svm.getClock().slot },
      value: { blockhash: w.client.svm.latestBlockhash(), lastValidBlockHeight: 1_000_000n },
    }),
    simulateTransaction: ([wire]: [string]) => {
      const tx = getTransactionDecoder().decode(getBase64Encoder().encode(wire));
      const result = w.client.svm.simulateTransaction(tx as never);
      const failed = isFailedTransaction(result as never);
      const meta = (
        failed ? (result as unknown as { meta(): Meta }).meta() : (result as unknown as { meta(): Meta }).meta()
      ) as Meta;
      const innerInstructions = meta
        .innerInstructions()
        .map((list, index) => ({
          index,
          instructions: list.map((inner) => {
            const ix = inner.instruction();
            return {
              programIdIndex: ix.programIdIndex(),
              accounts: Array.from(ix.accounts()),
              data: getBase58Decoder().decode(ix.data()),
              stackHeight: 2,
            };
          }),
        }))
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
