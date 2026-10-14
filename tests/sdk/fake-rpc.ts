/**
 * Purpose: a JSON-RPC endpoint on 127.0.0.1 backed by a LiteSVM world, so SDK functions that take an RPC
 *          URL (`recheck`, the A-3 preparation) run against the program's real state in a test: account
 *          reads, the Clock sysvar, rent, signatures by address and transactions recorded in the RPC's
 *          shape, the latest blockhash and simulation (./fake-simulate.ts). Integers are written as JSON numbers without precision loss, as a node writes them.
 *          A transaction is recorded with its version, and `getTransaction` answers as a node does: a versioned one
 *          only to a caller whose `maxSupportedTransactionVersion` reaches it (-32015 otherwise); as the relay does
 *          when `relayed` names the versions it relays (-32602 for any other). `throttle` makes one signature's
 *          `getTransaction` answer HTTP 429, as a node over its rate does.
 * Version: 0.1.3 (Sprint 16, the review's F2: a throttled transaction)
 * Sprint:  05 (SDK); 16 (lane L16P; lane R)
 */
import { getBase64Decoder, type Address } from "@solana/kit";

import { accountKeysOf, type RpcTransaction } from "@brot/sdk/read";
import type { World } from "../brot/setup";
import { simulationHandlers, type InnerShape } from "./fake-simulate";

/** JSON with bigints written as bare integers (what Kit's bigint-aware parser expects of a node). */
function stringify(value: unknown): string {
  const marked = JSON.stringify(value, (_, v) => (typeof v === "bigint" ? `__big__${v}__` : v));
  return marked.replace(/"__big__(-?\d+)__"/g, "$1");
}

export type FakeRpc = {
  url: string;
  record(tx: RpcTransaction, version?: TxVersion): void;
  /** From now on, `getTransaction` of `signature` answers HTTP 429. */
  throttle(signature: string): void;
  close(): void;
};
type TxVersion = "legacy" | 0 | 1;
/** A rate limit a handler throws: the whole answer is HTTP 429, as a node's. */
class Throttled extends Error {}
/** A JSON-RPC error a handler throws, answered as the node or the relay answers it. */
class RpcError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Starts the endpoint; `record` adds a transaction for `getSignaturesForAddress` and `getTransaction`, as version 0
 * unless told. `innerShape` is how the simulation writes inner instructions: as a node does (default), or compiled.
 * `relayed`: the `maxSupportedTransactionVersion` values the endpoint takes (a relay's allowlist); any by default.
 */
export function startFakeRpc(
  w: World,
  innerShape: InnerShape = "node",
  relayed: readonly number[] | null = null,
): FakeRpc {
  const recorded: RpcTransaction[] = [];
  const versions = new Map<string, TxVersion>();
  const throttled = new Set<string>();
  const account = (at: Address) => {
    const a = w.client.svm.getAccount(at);
    if (!a.exists) return null;
    return {
      data: [getBase64Decoder().decode(a.data), "base64"],
      executable: a.executable,
      lamports: BigInt(a.lamports),
      owner: a.programAddress,
      rentEpoch: 0n,
      space: BigInt(a.data.length),
    };
  };
  const handlers: Record<string, (params: any[]) => unknown> = {
    ...(simulationHandlers(w, innerShape) as unknown as Record<string, (params: any[]) => unknown>),
    getAccountInfo: ([at]) => ({ context: { slot: w.client.svm.getClock().slot }, value: account(at) }),
    getMultipleAccounts: ([list]) => ({ context: { slot: w.client.svm.getClock().slot }, value: list.map(account) }),
    getMinimumBalanceForRentExemption: ([size]) => w.client.svm.minimumBalanceForRentExemption(BigInt(size)),
    getSignaturesForAddress: ([at, config]) => {
      // Newest first, `limit` per page, after `before` and down to `until` (exclusive), as a node pages them.
      const list = recorded.filter((tx) => accountKeysOf(tx).includes(at)).reverse();
      const at_ = (sig: string) => list.findIndex((tx) => tx.transaction.signatures[0] === sig);
      const from = config?.before ? at_(config.before) + 1 : 0;
      const stop = config?.until && at_(config.until) >= 0 ? at_(config.until) : list.length;
      return list.slice(from, Math.min(stop, from + Number(config?.limit ?? 1_000))).map((tx) => ({
        signature: tx.transaction.signatures[0],
        slot: BigInt(tx.slot),
        err: tx.meta?.err ?? null,
        memo: null,
        blockTime: tx.blockTime ?? null,
        confirmationStatus: "confirmed",
      }));
    },
    getTransaction: ([signature, config]) => {
      const max = config?.maxSupportedTransactionVersion;
      if (relayed !== null && max !== undefined && !relayed.includes(max)) {
        throw new RpcError(-32602, `maxSupportedTransactionVersion ${relayed.join(", ")} only`);
      }
      if (throttled.has(signature)) throw new Throttled();
      const tx = recorded.find((t) => t.transaction.signatures[0] === signature);
      if (!tx) return null;
      const version = versions.get(signature) ?? 0;
      if (version !== "legacy" && (max === undefined || version > max)) {
        const ask = `Please try the request again with the following configuration parameter: "maxSupportedTransactionVersion": ${version}`;
        throw new RpcError(
          -32015,
          `Transaction version (${version}) is not supported by the requesting client. ${ask}`,
        );
      }
      return { ...tx, version, meta: { ...tx.meta, fee: 5_000n, logMessages: [], status: { Ok: null } } };
    },
  };
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const { id, method, params } = (await request.json()) as { id: number; method: string; params: any[] };
      const handler = handlers[method];
      const answer = (call: (params: any[]) => unknown) => {
        try {
          return { jsonrpc: "2.0", id, result: call(params ?? []) };
        } catch (error) {
          if (!(error instanceof RpcError)) throw error;
          return { jsonrpc: "2.0", id, error: { code: error.code, message: error.message } };
        }
      };
      let body;
      try {
        body = handler
          ? answer(handler)
          : { jsonrpc: "2.0", id, error: { code: -32601, message: `fake RPC: no ${method}` } };
      } catch (error) {
        if (error instanceof Throttled) return new Response("Too Many Requests", { status: 429 });
        throw error;
      }
      return new Response(stringify(body), { headers: { "content-type": "application/json" } });
    },
  });
  return {
    url: `http://127.0.0.1:${server.port}`,
    record: (tx, version = 0) => {
      recorded.push(tx);
      versions.set(tx.transaction.signatures[0]!, version);
    },
    throttle: (signature) => void throttled.add(signature),
    close: () => server.stop(true),
  };
}
