/**
 * Purpose: rewrite a sponsored Pyth account on the surfnet with one field changed, from the captured devnet bytes
 *          (the .bin files are never edited): price, confidence, exponent, publish time, verification, feed id,
 *          owner or length, for the rule refusals the negative run reproduces (row 4, row 7, the join lock).
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 */
import { readFileSync } from "node:fs";

import { hexToBytes } from "@brot/sdk/read";

import { clock, type Rpc } from "./rpc";
import { setAccount } from "./surfnet";
import { FIXTURES, SOL } from "./world";

/** Byte offsets of a `PriceUpdateV2`'s fields (tests/brot/setup.ts PRICE_OFFSETS). */
const AT = { verification: 40, feedId: 41, price: 73, conf: 81, exponent: 89, publishTime: 93, postedSlot: 125 };

export type PriceChange = {
  price?: bigint;
  conf?: bigint;
  exponent?: number;
  /** Seconds before the cluster's clock (default 0: fresh). */
  age?: bigint;
  verification?: number;
  feedHex?: string;
  owner?: string;
  length?: number;
};

const NAMES = { sol: "pyth-sol-usd-devnet", btc: "pyth-btc-usd-devnet" } as const;

/** The captured price and confidence of `which`, as stored. */
export function captured(which: keyof typeof NAMES) {
  const data = new Uint8Array(readFileSync(`tests/fixtures/${NAMES[which]}.bin`));
  const view = new DataView(data.buffer);
  return { price: view.getBigInt64(AT.price, true), conf: view.getBigUint64(AT.conf, true) };
}

/** Writes `which`'s sponsored account fresh, with `change` applied. */
export async function writePrice(rpc: Rpc, which: keyof typeof NAMES, change: PriceChange = {}) {
  const [address, owner] = FIXTURES[NAMES[which]];
  const data = new Uint8Array(readFileSync(`tests/fixtures/${NAMES[which]}.bin`));
  const view = new DataView(data.buffer);
  const now = (await clock(rpc)).unixTimestamp;
  view.setBigInt64(AT.publishTime, now - (change.age ?? 0n), true);
  view.setBigUint64(AT.postedSlot, 1n << 60n, true);
  if (change.price !== undefined) view.setBigInt64(AT.price, change.price, true);
  if (change.conf !== undefined) view.setBigUint64(AT.conf, change.conf, true);
  if (change.exponent !== undefined) view.setInt32(AT.exponent, change.exponent, true);
  if (change.verification !== undefined) data[AT.verification] = change.verification;
  if (change.feedHex !== undefined) data.set(hexToBytes(change.feedHex), AT.feedId);
  const bytes = change.length === undefined ? data : data.slice(0, change.length);
  await setAccount(rpc, address, { lamports: SOL, data: bytes, owner: change.owner ?? owner });
}
