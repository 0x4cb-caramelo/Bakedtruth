/**
 * Purpose: a node that serves the captured real v1 transaction (tests/fixtures/tx-v1, recorded read-only from devnet
 *          by scripts/capture-tx-v1.ts; Sprint 16, the review's F1 and F2): `getTransaction` answers the transaction
 *          as captured to a reader that asks for version 1 or more, and the captured -32015 to one that asks for 0;
 *          `getSignaturesForAddress` lists it. Each answer is the node's own text, with the request's id. `asked`
 *          records the `maxSupportedTransactionVersion` of every `getTransaction`.
 * Version: 0.1.0
 * Sprint:  16 (the review's F1 and F2)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(import.meta.dir, "../fixtures/tx-v1");
export const V1 = {
  index: JSON.parse(readFileSync(join(DIR, "index.json"), "utf8")) as {
    signature: string;
    slot: number;
    sha256: Record<string, string>;
  },
  tx: readFileSync(join(DIR, "tx.json"), "utf8"),
  refused: readFileSync(join(DIR, "refused-v0.json"), "utf8"),
  dir: DIR,
};

/** The node's text with the request's id in place of the captured one. */
const withId = (text: string, id: unknown) => JSON.stringify({ ...JSON.parse(text), id });

export function serveV1() {
  const asked: unknown[] = [];
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const { id, method, params } = (await request.json()) as { id: unknown; method: string; params: any[] };
      const json = (text: string) => new Response(text, { headers: { "content-type": "application/json" } });
      if (method === "getSignaturesForAddress") {
        const listed = { signature: V1.index.signature, slot: V1.index.slot, err: null, memo: null, blockTime: null };
        return json(JSON.stringify({ jsonrpc: "2.0", id, result: [listed] }));
      }
      if (method !== "getTransaction") return json(JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32601 } }));
      const version = params[1]?.maxSupportedTransactionVersion;
      asked.push(version);
      return json(withId(typeof version === "number" && version >= 1 ? V1.tx : V1.refused, id));
    },
  });
  return { url: `http://127.0.0.1:${server.port}`, asked, close: () => server.stop(true) };
}
