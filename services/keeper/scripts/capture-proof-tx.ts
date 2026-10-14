/**
 * Purpose: records, read-only, the fixtures of the keeper's second-read tests (services/keeper/tests/fixtures/
 *          proof-tx/): a Pyth sponsored price account as `getAccountInfo` returns it; the block at its `posted_slot`
 *          as `getBlock` returns it with `transactionDetails: "accounts"`; each transaction of that block that writes
 *          the account, as `getTransaction` (`json`) returns it; and, given its signature, one transaction that
 *          calls the receiver's `post_update` at the top level. Each file is the RPC's answer as received; index.json
 *          records the cluster, the RPC's origin (never a key), the time and each file's SHA-256.
 * Version: 0.1.0
 * Sprint:  07 carry-over (the second read of a price campaign)
 *
 * Usage: bun services/keeper/scripts/capture-proof-tx.ts [--account <sponsored account>] [--receiver-tx <signature>]
 *        CAPTURE_RPC_URL overrides the public devnet RPC. Reads only; sends nothing.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MAX_TRANSACTION_VERSION } from "@brot/sdk/read";

const RPC = process.env.CAPTURE_RPC_URL ?? "https://api.devnet.solana.com";
const OUT = join(import.meta.dir, "../tests/fixtures/proof-tx");
const arg = (name: string, fallback: string | null) => {
  const at = process.argv.indexOf(`--${name}`);
  return at > 0 ? process.argv[at + 1]! : fallback;
};
const ACCOUNT = arg("account", "APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5")!;
const RECEIVER_TX = arg("receiver-tx", null);
const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

let id = 0;
/** One JSON-RPC call, retried on a rate limit; returns the raw text and the parsed result. */
async function call(method: string, params: unknown[]): Promise<{ text: string; result: any }> {
  for (let attempt = 0; attempt < 7; attempt++) {
    const body = JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params });
    const response = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body });
    if (response.status === 429) {
      await sleep(2_000 * 2 ** attempt);
      continue;
    }
    const text = await response.text();
    const json = JSON.parse(text);
    if (json.error) throw new Error(`${method}: ${JSON.stringify(json.error)}`);
    return { text, result: json.result };
  }
  throw new Error(`${method}: rate limited`);
}

const files: Record<string, string> = {};
function save(name: string, text: string) {
  writeFileSync(join(OUT, name), text);
  files[name] = createHash("sha256").update(text).digest("hex");
}

mkdirSync(OUT, { recursive: true });
const tx = { encoding: "json", maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION, commitment: "confirmed" };
const account = await call("getAccountInfo", [ACCOUNT, { encoding: "base64", commitment: "confirmed" }]);
const data = Buffer.from(account.result.value.data[0], "base64");
const postedSlot = Number(data.readBigUInt64LE(125));
save("account.json", account.text);
const block = await call("getBlock", [postedSlot, { ...tx, transactionDetails: "accounts", rewards: false }]);
save("block.json", block.text);
const writers = (block.result.transactions as any[]).filter((t) =>
  t.transaction.accountKeys.some((k: { pubkey: string; writable: boolean }) => k.pubkey === ACCOUNT && k.writable),
);
const signatures: string[] = [];
for (const writer of writers) {
  const signature = writer.transaction.signatures[0] as string;
  save(`tx-${signature}.json`, (await call("getTransaction", [signature, tx])).text);
  signatures.push(signature);
}
if (RECEIVER_TX) save(`tx-${RECEIVER_TX}.json`, (await call("getTransaction", [RECEIVER_TX, tx])).text);
const index = {
  capturedAt: new Date().toISOString(),
  rpcOrigin: new URL(RPC).origin,
  account: ACCOUNT,
  postedSlot,
  publishTime: Number(data.readBigInt64LE(93)),
  writers: signatures,
  receiverTx: RECEIVER_TX,
  sha256: files,
};
writeFileSync(join(OUT, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify({ postedSlot, writers: signatures.length, receiverTx: RECEIVER_TX !== null }));
