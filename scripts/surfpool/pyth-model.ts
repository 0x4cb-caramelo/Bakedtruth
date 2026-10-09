/**
 * Purpose: drive Surfpool's Pyth `PriceUpdateV2` model on the upgraded receiver's accounts: read an
 *          account's fields, give the model's IDL to `rec2HH…`, and schedule overrides through the
 *          scenario system, each one read back before anything relies on it.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution): the Surfpool run of the price reader
 *
 * Surfpool 1.5.0 and 1.6.0 model only the legacy generation: the template `pyth-price-feed-v2`
 * derives its account under `pythWSn…` and its IDL is keyed to `rec5EK…`. An override is applied
 * with the IDL of the account's owner; without one Surfpool logs a warning, skips the override
 * and the RPC still answers success. So the IDL is registered under `rec2HH…` (same layout and
 * discriminator), and every override is confirmed on the account's bytes, never on the reply.
 */
import { randomUUID } from "node:crypto";

import type { Address } from "@solana/kit";

import * as P from "../../tests/brot/program";
import { PRICE_OFFSETS } from "../../tests/brot/setup";
import { account, clock, type Rpc } from "./rpc";

/** The template both versions ship; the application path ignores it, Surfpool Studio shows it. */
const TEMPLATE_ID = "pyth-price-feed-v2";
const PRICE_UPDATE_V2_LEN = 134;
const PREV_PUBLISH_TIME_OFFSET = 101;

export type PriceUpdate = {
  owner: Address;
  length: number;
  verification: number;
  feedId: string;
  price: bigint;
  conf: bigint;
  exponent: number;
  publishTime: bigint;
  prevPublishTime: bigint;
  postedSlot: bigint;
};

/** The fields of a `PriceUpdateV2`, at the offsets the program reads (tests/brot/setup.ts). */
export async function readPriceUpdate(rpc: Rpc, address: Address): Promise<PriceUpdate> {
  const found = await account(rpc, address);
  if (!found) throw new Error(`${address} does not exist on the surfnet`);
  const { data } = found;
  if (data.length !== PRICE_UPDATE_V2_LEN) throw new Error(`${address} holds ${data.length} bytes, not 134`);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return {
    owner: found.owner,
    length: data.length,
    verification: data[PRICE_OFFSETS.verification],
    feedId: Buffer.from(data.subarray(PRICE_OFFSETS.feedId, PRICE_OFFSETS.feedId + 32)).toString("hex"),
    price: view.getBigInt64(PRICE_OFFSETS.price, true),
    conf: view.getBigUint64(PRICE_OFFSETS.conf, true),
    exponent: view.getInt32(PRICE_OFFSETS.exponent, true),
    publishTime: view.getBigInt64(PRICE_OFFSETS.publishTime, true),
    prevPublishTime: view.getBigInt64(PREV_PUBLISH_TIME_OFFSET, true),
    postedSlot: view.getBigUint64(PRICE_OFFSETS.postedSlot, true),
  };
}

/** Throws unless `update` is a Full `rec2HH…` account of the SOL/USD feed, 134 bytes long. */
export function expectUpgradedSolUsd(update: PriceUpdate, where: string) {
  const problems: string[] = [];
  if (update.owner !== P.PYTH_RECEIVER_ID) problems.push(`owner ${update.owner}`);
  if (update.verification !== 1) problems.push(`verification ${update.verification} (Full is 1)`);
  if (update.feedId !== Buffer.from(P.SOL_USD_FEED_ID).toString("hex")) problems.push(`feed ${update.feedId}`);
  if (problems.length) throw new Error(`${where}: not the upgraded SOL/USD account: ${problems.join(", ")}`);
}

/**
 * Gives the model's `PriceUpdateV2` IDL to the upgraded receiver unless Surfpool already has one
 * for it. Returns which path it took, for the log.
 */
export async function adoptModelForUpgradedReceiver(rpc: Rpc): Promise<"already present" | "registered"> {
  const active = async (program: Address) =>
    (await rpc.call<{ value: Record<string, any> | null }>("surfnet_getActiveIdl", [program])).value;
  if (await active(P.PYTH_RECEIVER_ID)) return "already present";
  const legacy = await active(P.PYTH_LEGACY_RECEIVER_ID);
  if (!legacy) throw new Error(`Surfpool has no Pyth model: no IDL for ${P.PYTH_LEGACY_RECEIVER_ID}`);
  const priceUpdate = (legacy.accounts ?? []).find((a: { name: string }) => a.name === "PriceUpdateV2");
  if (!priceUpdate) throw new Error("Surfpool's Pyth IDL has no PriceUpdateV2 account");
  await rpc.call("surfnet_registerIdl", [{ ...legacy, address: P.PYTH_RECEIVER_ID }]);
  if (!(await active(P.PYTH_RECEIVER_ID)))
    throw new Error(`surfnet_registerIdl did not register ${P.PYTH_RECEIVER_ID}`);
  return "registered";
}

/** Override values by the model's field paths; every value is an integer a JSON number holds exactly. */
export type PriceValues = Partial<Record<"price" | "conf" | "publishTime" | "prevPublishTime" | "postedSlot", bigint>>;

const PATHS: Record<keyof PriceValues, string> = {
  price: "price_message.price",
  conf: "price_message.conf",
  publishTime: "price_message.publish_time",
  prevPublishTime: "price_message.prev_publish_time",
  postedSlot: "posted_slot",
};

/**
 * Registers a one-override scenario on `address`: applied during the call at `relativeSlot` 0,
 * otherwise when the surfnet reaches the registration slot plus `relativeSlot`.
 */
export async function scheduleOverride(
  rpc: Rpc,
  a: { label: string; address: Address; relativeSlot: number; values: PriceValues; fetchBeforeUse?: boolean },
) {
  const values: Record<string, number> = {};
  for (const [field, value] of Object.entries(a.values) as [keyof PriceValues, bigint][]) {
    const asNumber = Number(value);
    if (!Number.isSafeInteger(asNumber)) throw new Error(`${field} ${value} is not a safe JSON integer`);
    values[PATHS[field]] = asNumber;
  }
  const scenario = {
    id: randomUUID(),
    name: a.label,
    description: `brot-markets price-touch run: ${a.label}`,
    tags: ["brot-markets", "pyth"],
    overrides: [
      {
        id: randomUUID(),
        templateId: TEMPLATE_ID,
        values,
        scenarioRelativeSlot: a.relativeSlot,
        label: a.label,
        enabled: true,
        fetchBeforeUse: a.fetchBeforeUse ?? false,
        account: { pubkey: a.address },
      },
    ],
  };
  await rpc.call("surfnet_registerScenario", [scenario]);
}

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
const shows = (read: PriceUpdate, values: PriceValues) =>
  (Object.keys(values) as (keyof PriceValues)[]).every((field) => read[field] === values[field]);

/** Polls `address` until every field in `values` reads back, or throws after `timeoutMs`. */
export async function waitForValues(rpc: Rpc, address: Address, values: PriceValues, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let last: PriceUpdate | null = null;
  while (Date.now() < deadline) {
    last = await readPriceUpdate(rpc, address);
    if (shows(last, values)) return last;
    await sleep(200);
  }
  const shown = JSON.stringify(last, (_, v) => (typeof v === "bigint" ? v.toString() : v));
  throw new Error(`the override on ${address} never showed in its bytes (Surfpool skipped it?): ${shown}`);
}

/**
 * One price through the model: `price` and `conf`, published now by the surfnet's clock and posted
 * at the slot it is scheduled for, `afterSlots` slots after registration (0: during the call). Waits
 * until the account's bytes show it; `waitedForItsSlot` says whether it was absent right after the
 * registration, which is what a timeline (not an immediate write) looks like.
 */
export async function stampPrice(
  rpc: Rpc,
  a: { label: string; address: Address; price: bigint; conf: bigint; afterSlots?: number; fetchBeforeUse?: boolean },
) {
  const afterSlots = a.afterSlots ?? 0;
  const now = await clock(rpc);
  const values: Required<PriceValues> = {
    price: a.price,
    conf: a.conf,
    publishTime: now.unixTimestamp,
    prevPublishTime: now.unixTimestamp - 1n,
    postedSlot: now.slot + BigInt(afterSlots),
  };
  const { label, address, fetchBeforeUse } = a;
  await scheduleOverride(rpc, { label, address, relativeSlot: afterSlots, values, fetchBeforeUse });
  const rightAway = await readPriceUpdate(rpc, a.address);
  const update = await waitForValues(rpc, a.address, values);
  const seenAt = (await clock(rpc)).slot;
  return { values, update, registeredAt: now.slot, seenAt, waitedForItsSlot: !shows(rightAway, values) };
}
