/**
 * Purpose: a JSON-RPC endpoint on 127.0.0.1 backed by a LiteSVM world, so SDK functions that take an RPC
 *          URL (`recheck`, the A-3 preparation) run against the program's real state in a test: account
 *          reads, the Clock sysvar, rent, signatures by address and transactions recorded in the RPC's
 *          shape, the latest blockhash and simulation (./fake-simulate.ts). Integers are written as JSON numbers without precision loss, as a node writes them.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
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

export type FakeRpc = { url: string; record(tx: RpcTransaction): void; close(): void };

/**
 * Starts the endpoint; `record` adds a transaction for `getSignaturesForAddress` and `getTransaction`.
 * `innerShape` is how the simulation writes inner instructions: as a node does (default), or compiled.
 */
export function startFakeRpc(w: World, innerShape: InnerShape = "node"): FakeRpc {
  const recorded: RpcTransaction[] = [];
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
      // Newest first, `limit` per page, after `before`, as a node pages them.
      const list = recorded.filter((tx) => accountKeysOf(tx).includes(at)).reverse();
      const from = config?.before ? list.findIndex((tx) => tx.transaction.signatures[0] === config.before) + 1 : 0;
      return list.slice(from, from + Number(config?.limit ?? 1_000)).map((tx) => ({
        signature: tx.transaction.signatures[0],
        slot: BigInt(tx.slot),
        err: tx.meta?.err ?? null,
        memo: null,
        blockTime: tx.blockTime ?? null,
        confirmationStatus: "confirmed",
      }));
    },
    getTransaction: ([signature]) => {
      const tx = recorded.find((t) => t.transaction.signatures[0] === signature);
      return tx
        ? { ...tx, version: 0, meta: { ...tx.meta, fee: 5_000n, logMessages: [], status: { Ok: null } } }
        : null;
    },
  };
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const { id, method, params } = (await request.json()) as { id: number; method: string; params: any[] };
      const handler = handlers[method];
      const body = handler
        ? { jsonrpc: "2.0", id, result: handler(params ?? []) }
        : { jsonrpc: "2.0", id, error: { code: -32601, message: `fake RPC: no ${method}` } };
      return new Response(stringify(body), { headers: { "content-type": "application/json" } });
    },
  });
  return {
    url: `http://127.0.0.1:${server.port}`,
    record: (tx) => recorded.push(tx),
    close: () => server.stop(true),
  };
}
