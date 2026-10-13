/**
 * Purpose: a Kit RPC client served in-process by a LiteSVM world, so the keeper's own code (its batched reads, its
 *          simulations, its sends, its status checks) runs against the program's binary with no port and no cluster.
 *          Answers are written as a node writes them (integers as JSON numbers, which Kit upcasts; errors as
 *          `{ InstructionError: [index, { Custom: code }] }`), then go through Kit's own response transformers.
 *          Landed transactions are recorded in the RPC's shape for `getSignaturesForAddress` and `getTransaction`; a
 *          `beforeSend` hook lets a test hold a send (two keepers at once); every method called is counted.
 * Version: 0.1.0
 * Sprint:  07 carry-over (the keeper's settlement, tested on LiteSVM)
 */
import {
  createSolanaRpcFromTransport,
  getBase58Decoder,
  getBase58Encoder,
  getBase64Decoder,
  getBase64Encoder,
  getCompiledTransactionMessageDecoder,
  getSignatureFromTransaction,
  getTransactionDecoder,
  type Address,
} from "@solana/kit";
import { isFailedTransaction } from "@solana/kit-plugin-litesvm";
import { accountKeysOf, type RpcTransaction, type SolanaRpc } from "@brot/sdk/read";

import type { World } from "../../../../tests/brot/setup";
import { simulationHandlers } from "../../../../tests/sdk/fake-simulate";

type Handler = (params: any[]) => unknown;
export type ChainRpc = {
  rpc: SolanaRpc;
  /** Every method called, in order. */
  calls: string[];
  /** Recent prioritization fees the next calls answer (micro-lamports per unit). */
  setFees(fees: bigint[]): void;
  /** Extra answers for methods the world cannot give (a recorded `getBlock`, another program's transaction). */
  answer(method: string, handler: Handler): void;
  beforeSend?: (signature: string) => Promise<void>;
};

const big = (_: string, v: unknown) => {
  if (typeof v !== "bigint") return v;
  if (v > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(`the fake RPC cannot write ${v} as a JSON number`);
  return Number(v);
};
const wire = (value: unknown) => (value === undefined ? null : JSON.parse(JSON.stringify(value, big)));

function accountOf(w: World, at: Address, slice?: { offset: number; length: number }) {
  const account = w.client.svm.getAccount(at);
  if (!account.exists) return null;
  const data = slice
    ? account.data.slice(Number(slice.offset), Number(slice.offset) + Number(slice.length))
    : account.data;
  return {
    data: [getBase64Decoder().decode(data), "base64"],
    executable: account.executable,
    lamports: BigInt(account.lamports),
    owner: account.programAddress,
    rentEpoch: 0n,
    space: BigInt(account.data.length),
  };
}

/** The node's filters: `dataSize`, and `memcmp` (the bytes equal the data at `offset`). */
function matches(data: ArrayLike<number>, filters: any[]): boolean {
  return filters.every((filter) => {
    if ("dataSize" in filter) return BigInt(data.length) === BigInt(filter.dataSize);
    const { offset, bytes, encoding } = filter.memcmp;
    const encoder = encoding === "base64" ? getBase64Encoder() : getBase58Encoder();
    const needle = new Uint8Array(encoder.encode(bytes));
    const at = Number(offset);
    return at + needle.length <= data.length && needle.every((byte, i) => data[at + i] === byte);
  });
}

/** `{ InstructionError: [index, { Custom: code }] }`, as a node reports a program's refusal, else the error's text. */
function nodeError(err: unknown): unknown {
  const inner = (err as { err?: () => { code?: number } })?.err?.();
  const index = (err as { index?: number })?.index;
  if (typeof index === "number" && inner && typeof inner.code === "number") {
    return { InstructionError: [index, { Custom: inner.code }] };
  }
  return String((err as { toString(): string })?.toString?.() ?? err);
}

export function chainRpc(w: World): ChainRpc {
  const calls: string[] = [];
  const statuses = new Map<string, { slot: bigint; err: unknown }>();
  const recorded: RpcTransaction[] = [];
  let fees: bigint[] = [];
  const extra = new Map<string, Handler>();
  const slot = () => w.client.svm.getClock().slot;
  const self: ChainRpc = {} as ChainRpc;

  const handlers: Record<string, Handler> = {
    ...(simulationHandlers(w) as unknown as Record<string, Handler>),
    getAccountInfo: ([at, config]) => ({ context: { slot: slot() }, value: accountOf(w, at, config?.dataSlice) }),
    getMultipleAccounts: ([list, config]) => ({
      context: { slot: slot() },
      value: (list as Address[]).map((at) => accountOf(w, at, config?.dataSlice)),
    }),
    getProgramAccounts: ([program, config]) =>
      w.client.svm
        .getProgramAccounts(program)
        .filter((account) => matches(account.data, config?.filters ?? []))
        .map((account) => ({ pubkey: account.address, account: accountOf(w, account.address) })),
    getBalance: ([at]) => ({ context: { slot: slot() }, value: w.client.svm.getBalance(at) ?? 0n }),
    getBlockHeight: () => 999_000n,
    getMinimumBalanceForRentExemption: ([size]) => w.client.svm.minimumBalanceForRentExemption(BigInt(size)),
    getRecentPrioritizationFees: () => fees.map((fee, i) => ({ slot: BigInt(i + 1), prioritizationFee: fee })),
    getSignatureStatuses: ([signatures]) => ({
      context: { slot: slot() },
      value: (signatures as string[]).map((s) => {
        const found = statuses.get(s);
        return found
          ? { slot: found.slot, confirmations: null, err: found.err, confirmationStatus: "finalized" }
          : null;
      }),
    }),
    getSignaturesForAddress: ([at]) =>
      recorded
        .filter((tx) => accountKeysOf(tx).includes(at))
        .reverse()
        .map((tx) => ({
          signature: tx.transaction.signatures[0],
          slot: BigInt(tx.slot),
          err: tx.meta?.err ?? null,
          memo: null,
          blockTime: null,
          confirmationStatus: "finalized",
        })),
    getTransaction: ([signature]) => {
      const tx = recorded.find((t) => t.transaction.signatures[0] === signature);
      return tx
        ? { ...tx, version: 0, meta: { ...tx.meta, fee: 5_000n, logMessages: [], status: { Ok: null } } }
        : null;
    },
  };

  async function sendTransaction([wire64]: any[]): Promise<string> {
    const tx = getTransactionDecoder().decode(getBase64Encoder().encode(wire64));
    const signature = getSignatureFromTransaction(tx as never);
    await self.beforeSend?.(signature);
    if (statuses.has(signature)) return signature; // a rebroadcast: the node drops the duplicate
    const result = w.client.svm.sendTransaction(tx as never);
    const failed = isFailedTransaction(result as never);
    const err = failed ? nodeError((result as unknown as { err(): unknown }).err()) : null;
    statuses.set(signature, { slot: slot(), err });
    const compiled = getCompiledTransactionMessageDecoder().decode(tx.messageBytes);
    if (!failed) recorded.push(landedView(signature, compiled, result));
    // The blockhash is kept, as a cluster keeps one valid for ~150 blocks: a transaction another keeper prepared
    // before this one landed still lands, or fails on the program's own checks (tests/site/fake-chain.ts does the same).
    return signature;
  }

  function landedView(signature: string, compiled: any, result: unknown): RpcTransaction {
    type Inner = { instruction(): { programIdIndex(): number; accounts(): Uint8Array; data(): Uint8Array } };
    const inner = (result as { innerInstructions(): Inner[][] }).innerInstructions();
    const innerInstructions = inner
      .map((list, index) => ({
        index,
        instructions: list.map((item) => {
          const ix = item.instruction();
          const data = getBase58Decoder().decode(ix.data());
          return { programIdIndex: ix.programIdIndex(), accounts: Array.from(ix.accounts()), data };
        }),
      }))
      .filter((group) => group.instructions.length > 0);
    return {
      slot: slot(),
      transaction: { signatures: [signature], message: { accountKeys: compiled.staticAccounts } },
      meta: { err: null, innerInstructions },
    } as RpcTransaction;
  }

  const transport = async ({ payload }: { payload: unknown }) => {
    const { id, method, params } = payload as { id: number; method: string; params: any[] };
    calls.push(method);
    const handler = extra.get(method) ?? (method === "sendTransaction" ? sendTransaction : handlers[method]);
    if (!handler) return { jsonrpc: "2.0", id, error: { code: -32601, message: `fake RPC: no ${method}` } };
    return { jsonrpc: "2.0", id, result: wire(await handler(params ?? [])) };
  };

  Object.assign(self, {
    rpc: createSolanaRpcFromTransport(transport as never) as unknown as SolanaRpc,
    calls,
    setFees: (next: bigint[]) => void (fees = next),
    answer: (method: string, handler: Handler) => void extra.set(method, handler),
  });
  return self;
}
