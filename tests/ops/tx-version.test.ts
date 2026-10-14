/**
 * Purpose: the team scripts' readers of the program's transactions (Sprint 16, the review's F1): the scripts' JSON-RPC
 *          client keeps a node's error code, so -32015 is told from any other failure; `bakersOf` (the tally's and the
 *          rehearsal's list of bakers) asks for MAX_TRANSACTION_VERSION, goes past a transaction the node cannot return
 *          in it and names it on stderr, never silently, while any other failure still stops it.
 * Version: 0.1.0
 * Sprint:  16 (the review's F1)
 */
import { afterAll, describe, expect, spyOn, test } from "bun:test";
import { isUnsupportedVersion, MAX_TRANSACTION_VERSION, type RpcTransaction } from "@brot/sdk/read";

import { ADDR, entry, opened, SIG, SOL, txOf } from "../../services/indexer/tests/fake-chain";
import { bakersOf } from "../../scripts/rehearsal/settle-steps";
import { connect, type Rpc } from "../../scripts/validator/rpc";

const C = ADDR(2);
const [A, B] = [ADDR(4), ADDR(5)];
const TXS: RpcTransaction[] = [
  txOf("a", 10, [opened(C)]),
  txOf("b", 11, [entry(C, 1n, A, 0, SOL, [SOL, 0n])]),
  txOf("c", 12, [entry(C, 2n, B, 1, SOL, [SOL, SOL])]),
];

/** The scripts' client shape over TXS, newest first; `refuse` makes one signature fail with `code`. */
function scriptRpc(refuse: { signature: string; code: number }) {
  const asked: unknown[] = [];
  const rpc: Rpc = {
    url: "http://127.0.0.1:1",
    call: async (method: string, params: unknown[] = []) => {
      if (method === "getSignaturesForAddress")
        return [...TXS].reverse().map((tx) => ({ signature: tx.transaction.signatures[0], err: null })) as never;
      const [signature, options] = params as [string, { maxSupportedTransactionVersion?: number }];
      asked.push(options.maxSupportedTransactionVersion);
      if (signature === refuse.signature)
        throw Object.assign(new Error(`getTransaction: refused (${refuse.code})`), { code: refuse.code });
      return TXS.find((tx) => tx.transaction.signatures[0] === signature) as never;
    },
  };
  return { rpc, asked };
}

describe("the team scripts read every transaction version, and name what they cannot", () => {
  const node = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: async (request) => {
      const { id } = (await request.json()) as { id: number };
      const error = { code: -32015, message: "Transaction version (2) is not supported by the requesting client." };
      return Response.json({ jsonrpc: "2.0", id, error });
    },
  });
  afterAll(() => node.stop(true));

  test("the scripts' client keeps the node's error code", async () => {
    const failed = await connect(`http://127.0.0.1:${node.port}`)
      .call("getTransaction", [SIG("x")])
      .then(
        () => null,
        (error: unknown) => error,
      );
    expect((failed as { code?: number }).code).toBe(-32015);
    expect(isUnsupportedVersion(failed)).toBe(true);
  });

  test("bakersOf goes past an unreadable transaction, names it, and still stops at any other failure", async () => {
    const errors = spyOn(console, "error").mockImplementation(() => {});
    const { rpc, asked } = scriptRpc({ signature: SIG("b"), code: -32015 });
    expect((await bakersOf(rpc, C as never)).map(String)).toEqual([B]); // A's join is in the unreadable transaction
    expect(String(errors.mock.calls.at(-1)?.[0])).toContain(SIG("b"));
    expect(asked.every((v) => v === MAX_TRANSACTION_VERSION)).toBe(true);
    errors.mockRestore();
    await expect(bakersOf(scriptRpc({ signature: SIG("b"), code: -32603 }).rpc, C as never)).rejects.toThrow("-32603");
  });
});
