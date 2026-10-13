/**
 * Purpose: the recorded devnet answers of the second-read tests (tests/fixtures/proof-tx/, written by
 *          scripts/capture-proof-tx.ts): the BTC/USD sponsored account, the block at its `posted_slot`, the
 *          push-oracle transaction that wrote it, and a receiver `post_update` transaction; each file's SHA-256 is
 *          checked against the index before use, so a hand-edited fixture fails loudly. Also a copy of a recorded
 *          transaction with its price changed in the instruction's signed message (a forged proof).
 * Version: 0.1.0
 * Sprint:  07 carry-over (the second read of a price campaign)
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getBase58Decoder, getBase58Encoder } from "@solana/kit";

const DIR = join(import.meta.dir, "../fixtures/proof-tx");

export const INDEX = JSON.parse(readFileSync(join(DIR, "index.json"), "utf8")) as {
  account: string;
  postedSlot: number;
  publishTime: number;
  writers: string[];
  receiverTx: string;
  sha256: Record<string, string>;
};

/** A recorded file's `result`, after its hash matched the index. */
export function recorded(name: string): any {
  const text = readFileSync(join(DIR, name), "utf8");
  const hash = createHash("sha256").update(text).digest("hex");
  if (hash !== INDEX.sha256[name]) throw new Error(`fixture ${name} does not match its recorded SHA-256`);
  return JSON.parse(text).result;
}

export const ACCOUNT = () => recorded("account.json").value as { data: [string, string]; owner: string };
export const BLOCK = () => recorded("block.json");
export const WRITER_TX = () => recorded(`tx-${INDEX.writers[0]}.json`);
export const RECEIVER_TX = () => recorded(`tx-${INDEX.receiverTx}.json`);

/** The account's fields as the receiver stored them (little-endian), for comparison with the parsed message. */
export function storedReading() {
  const data = Buffer.from(ACCOUNT().data[0], "base64");
  return {
    feedId: new Uint8Array(data.subarray(41, 73)),
    price: data.readBigInt64LE(73),
    conf: data.readBigUInt64LE(81),
    exponent: data.readInt32LE(89),
    publishTime: data.readBigInt64LE(93),
    prevPublishTime: data.readBigInt64LE(101),
    postedSlot: data.readBigUInt64LE(125),
  };
}

/** The writer transaction with `price` written into its signed message (big-endian at the message's offset 33). */
export function forgedWriterTx(price: bigint) {
  const tx = structuredClone(WRITER_TX());
  const keys: string[] = tx.transaction.message.accountKeys;
  const ix = tx.transaction.message.instructions.find((i: any) => keys[i.programIdIndex]?.startsWith("pyt2F"));
  const data = new Uint8Array(getBase58Encoder().encode(ix.data));
  new DataView(data.buffer).setBigInt64(12 + 1 + 32, price, false);
  ix.data = getBase58Decoder().decode(data);
  return tx;
}
