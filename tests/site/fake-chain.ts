/**
 * Purpose: the SDK's LiteSVM-backed fake RPC (tests/sdk/fake-rpc.ts) with what the site's entry flow adds: the
 *          wallet's submission (`sendTransaction`, landed in LiteSVM and recorded for `getTransaction`), the
 *          signature's status (`getSignatureStatuses`), and a block height the test moves past a blockhash's
 *          `lastValidBlockHeight`. Every method a client calls is recorded in order: the trace the relay's allowlist
 *          is taken from (Sprint 11; docs/technical/relay-allowlist.md).
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import {
  getBase58Decoder,
  getBase64Encoder,
  getCompiledTransactionMessageDecoder,
  getSignatureFromTransaction,
  getTransactionDecoder,
} from "@solana/kit";
import { isFailedTransaction } from "@solana/kit-plugin-litesvm";

import type { RpcTransaction } from "@brot/sdk/read";
import type { World } from "../brot/setup";
import { startFakeRpc } from "../sdk/fake-rpc";

/** The `lastValidBlockHeight` the base fake RPC gives every blockhash. */
export const LAST_VALID = 1_000_000n;

export type FakeChain = {
  url: string;
  /** Every JSON-RPC method called, in order. */
  methods: string[];
  setBlockHeight(height: bigint): void;
  close(): void;
};

type Inner = { instruction(): { programIdIndex(): number; accounts(): Uint8Array; data(): Uint8Array } };
type Meta = { innerInstructions(): Inner[][]; logs(): string[] };

/** `{ InstructionError: [index, { Custom: code }] }`, as a node reports a program's refusal. */
function nodeError(result: unknown): unknown {
  const text = String((result as { err(): unknown }).err());
  const code = /code: (\d+)/.exec(text);
  return code ? { InstructionError: [0, { Custom: Number(code[1]) }] } : text;
}

/** Lands a wire transaction in the world; returns its signature, its status and the RPC's view of it. */
function land(w: World, wire: string) {
  const tx = getTransactionDecoder().decode(getBase64Encoder().encode(wire));
  const signature = getSignatureFromTransaction(tx as never);
  const result = w.client.svm.sendTransaction(tx as never);
  w.client.svm.expireBlockhash();
  const failed = isFailedTransaction(result as never);
  const meta = (failed ? (result as unknown as { meta(): Meta }).meta() : result) as unknown as Meta;
  const keys = getCompiledTransactionMessageDecoder().decode(tx.messageBytes).staticAccounts;
  const innerInstructions = meta
    .innerInstructions()
    .map((list, index) => ({
      index,
      instructions: list.map((inner) => {
        const ix = inner.instruction();
        const data = getBase58Decoder().decode(ix.data());
        return { programIdIndex: ix.programIdIndex(), accounts: Array.from(ix.accounts()), data };
      }),
    }))
    .filter((group) => group.instructions.length > 0);
  const err = failed ? nodeError(result) : null;
  const clock = w.client.svm.getClock();
  const view: RpcTransaction = {
    slot: clock.slot,
    blockTime: clock.unixTimestamp,
    transaction: { signatures: [signature], message: { accountKeys: keys } },
    meta: { err, innerInstructions },
  };
  return { signature, err, view };
}

const stringify = (value: unknown) =>
  JSON.stringify(value, (_, v) => (typeof v === "bigint" ? `__big__${v}__` : v)).replace(/"__big__(-?\d+)__"/g, "$1");

export function startFakeChain(w: World): FakeChain {
  const base = startFakeRpc(w);
  const methods: string[] = [];
  const statuses = new Map<string, { slot: bigint; err: unknown }>();
  let height = LAST_VALID - 150n;
  const local: Record<string, (params: any[]) => unknown> = {
    sendTransaction: ([wire]) => {
      const landed = land(w, wire);
      statuses.set(landed.signature, { slot: BigInt(landed.view.slot), err: landed.err });
      base.record(landed.view);
      return landed.signature;
    },
    getSignatureStatuses: ([signatures]) => ({
      context: { slot: w.client.svm.getClock().slot },
      value: (signatures as string[]).map((s) => {
        const found = statuses.get(s);
        return found
          ? { slot: found.slot, confirmations: null, err: found.err, confirmationStatus: "confirmed" }
          : null;
      }),
    }),
    getBlockHeight: () => height,
  };
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      // The raw text is forwarded as it came: parsing and re-writing JSON could round a large integer.
      const text = await request.text();
      const body = JSON.parse(text) as { id: number; method: string; params: any[] };
      methods.push(body.method);
      const handler = local[body.method];
      if (!handler) {
        return fetch(base.url, { method: "POST", body: text, headers: { "content-type": "application/json" } });
      }
      const answer = { jsonrpc: "2.0", id: body.id, result: handler(body.params ?? []) };
      return new Response(stringify(answer), { headers: { "content-type": "application/json" } });
    },
  });
  return {
    url: `http://127.0.0.1:${server.port}`,
    methods,
    setBlockHeight: (next) => {
      height = next;
    },
    close: () => {
      server.stop(true);
      base.close();
    },
  };
}
