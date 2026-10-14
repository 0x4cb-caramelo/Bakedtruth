/**
 * Purpose: the SDK on a real v1 transaction (Sprint 16, the review's F1 and F2), captured read-only from devnet: the
 *          fixture is the one its index records; read through Kit at MAX_TRANSACTION_VERSION it decodes (its account
 *          keys; no event of this program), while a reader asking for version 0 gets the node's -32015, which
 *          `isUnsupportedVersion` recognises (the search's incomplete answer is tests/sdk/recheck-versions.test.ts).
 * Version: 0.1.0
 * Sprint:  16 (the review's F1 and F2)
 */
import { afterAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createSolanaRpc, signature as toSignature } from "@solana/kit";
import {
  accountKeysOf,
  decodeTransactionEvents,
  isUnsupportedVersion,
  MAX_TRANSACTION_VERSION,
  type RpcTransaction,
} from "@brot/sdk/read";

import { serveV1, V1 } from "./tx-v1-node";

const node = serveV1();
afterAll(() => node.close());
const rpc = createSolanaRpc(node.url);
const sig = toSignature(V1.index.signature);

describe("a real v1 transaction", () => {
  test("the fixture is the one its index records, captured from devnet", () => {
    for (const [file, sha] of Object.entries(V1.index.sha256))
      expect([
        file,
        createHash("sha256")
          .update(readFileSync(join(V1.dir, file)))
          .digest("hex"),
      ]).toEqual([file, sha]);
    expect(JSON.parse(V1.tx).result.version).toBe(1);
  });

  test("read at MAX_TRANSACTION_VERSION it decodes; asked for version 0, the node's -32015 is recognised", async () => {
    const options = { encoding: "json", maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION } as const;
    const tx = (await rpc.getTransaction(sig, options).send()) as unknown as RpcTransaction;
    expect(accountKeysOf(tx)).toHaveLength(6);
    expect(decodeTransactionEvents(tx)).toEqual([]); // not this program's: no event, and no throw
    const refused = await rpc
      .getTransaction(sig, { encoding: "json", maxSupportedTransactionVersion: 0 })
      .send()
      .then(
        () => null,
        (error: unknown) => error,
      );
    expect(isUnsupportedVersion(refused)).toBe(true);
    expect(isUnsupportedVersion(new Error("503"))).toBe(false);
    expect(isUnsupportedVersion({ code: -32015 })).toBe(true); // a plain client keeping the code (scripts)
  });
});
