/**
 * Purpose: records, read-only, the fixture of a real v1 transaction (Sprint 16, the red-team review's F1 and F2):
 *          `tx.json`, the transaction as `getTransaction` (JSON, finalized, `maxSupportedTransactionVersion` 1)
 *          returns it, and `refused-v0.json`, the same call asking for version 0, which a node answers with -32015.
 *          Each file is the RPC's answer as received; index.json records the cluster, the RPC's origin (never a key),
 *          the time, the signature, its slot and version, and each file's SHA-256. The transaction is anyone's: it
 *          only has to be a v1 one, so the readers are tested on the shape a node really serves.
 * Version: 0.1.0
 * Sprint:  16 (the review's F1 and F2)
 *
 * Usage: bun scripts/capture-tx-v1.ts [--signature <a v1 transaction>]
 *        Without one, it scans the last finalized blocks for a v1 transaction. CAPTURE_RPC_URL overrides the public
 *        devnet RPC. Reads only; sends nothing.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RPC = process.env.CAPTURE_RPC_URL ?? "https://api.devnet.solana.com";
const OUT = join(import.meta.dir, "../tests/fixtures/tx-v1");
const at = process.argv.indexOf("--signature");
let signature = at > 0 ? process.argv[at + 1]! : null;

let id = 0;
/** One JSON-RPC call, retried on a rate limit; the raw text and the parsed body. */
async function call(method: string, params: unknown[]): Promise<{ text: string; body: any }> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const body = JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params });
    const response = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body });
    if (response.status === 429) {
      await Bun.sleep(2_000 * 2 ** attempt);
      continue;
    }
    const text = await response.text();
    return { text, body: JSON.parse(text) };
  }
  throw new Error(`${method}: rate limited`);
}

const read = (version: number) => [
  signature,
  { encoding: "json", maxSupportedTransactionVersion: version, commitment: "finalized" },
];

if (!signature) {
  const slot = (await call("getSlot", [{ commitment: "finalized" }])).body.result as number;
  for (let s = slot - 1; s > slot - 200 && !signature; s--) {
    const block = await call("getBlock", [
      s,
      { encoding: "json", maxSupportedTransactionVersion: 1, transactionDetails: "accounts", rewards: false },
    ]);
    const v1 = (block.body.result?.transactions ?? []).find((t: any) => t.version === 1);
    if (v1) signature = v1.transaction.signatures[0];
    await Bun.sleep(250);
  }
  if (!signature) throw new Error("no v1 transaction in the last 200 finalized slots");
}

mkdirSync(OUT, { recursive: true });
const files: Record<string, string> = {};
const save = (name: string, text: string) => {
  writeFileSync(join(OUT, name), text);
  files[name] = createHash("sha256").update(text).digest("hex");
};
const tx = await call("getTransaction", read(1));
if (tx.body.result?.version !== 1) throw new Error(`not a v1 transaction: ${tx.text.slice(0, 200)}`);
save("tx.json", tx.text);
const refused = await call("getTransaction", read(0));
if (refused.body.error?.code !== -32015) throw new Error(`version 0 was not refused: ${refused.text.slice(0, 200)}`);
save("refused-v0.json", refused.text);
const index = {
  capturedAt: new Date().toISOString(),
  rpcOrigin: new URL(RPC).origin,
  cluster: "devnet",
  signature,
  slot: tx.body.result.slot,
  version: tx.body.result.version,
  sha256: files,
};
writeFileSync(join(OUT, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify({ signature, slot: index.slot, files: Object.keys(files) }));
