/**
 * Purpose: what the resolution tests share: a world at a mainnet-like slot and epoch, a campaign of
 *          each kind written into it with its metric account (a synthetic mint, the DAMM v2, stake
 *          pool and vote fixtures edited in memory, a Pyth price), the resolve call, and the checks
 *          of a recorded outcome (account and event) and of a refusal (nothing written).
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution), lane D
 */
import { expect } from "bun:test";
import { generateKeyPairSigner, type Address, type Instruction } from "@solana/kit";

import { injectCampaign, type InjectedCampaign } from "./campaigns";
import type { BrotErrorName } from "./errors";
import { BTC_PRICE, readCampaign } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import * as R from "./readers";
import { START_TIME, balance, createWorld, expectError, expectOk, send, setPriceAccount, type World } from "./setup";

/** The measured epoch of the epoch kinds: JitoSOL's `last_update_epoch` in the captured fixture. */
export const EPOCH = 1_047n;
/** Every campaign here opened a day before the world's start; its deadline is three days after. */
export const OPENS_AT = START_TIME - P.DAY;
export const DEADLINE = START_TIME + 3n * P.DAY;
/** The price kind's target: BTC/USD 10% above the captured devnet price (exponent −8); its
 * `max_age`, the devnet value of `campaign_max_age`. */
export const PRICE_TARGET = (BTC_PRICE * 11n) / 10n;
export const PRICE_MAX_AGE = 120n;

export const anyAddress = async () => (await generateKeyPairSigner()).address;
export const clockSlot = (w: World) => w.client.svm.getClock().slot;

/** Moves the clock to `unixTimestamp` in `epoch`, at a slot inside that epoch (432,000 per epoch). */
export function at(w: World, unixTimestamp: bigint, epoch = EPOCH) {
  R.setClock(w.client, { unixTimestamp, epoch, slot: epoch * 432_000n + 1_000n });
}

/** A world on the mainnet epoch schedule, its clock at the start time, in `EPOCH`. */
export async function resolveWorld() {
  const w = await createWorld();
  R.setMainnetEpochSchedule(w.client);
  at(w, START_TIME);
  return w;
}

export type Injected = { campaign: Address; vault: Address; metric: Address };
let nextId = 1_000n;

/** A campaign of `kind` on `metric`: 3 SOL in its pot, two events emitted, deadline `DEADLINE`. */
export async function campaignOn(
  w: World,
  kind: number,
  metric: Address,
  target: bigint,
  more: Partial<InjectedCampaign> = {},
): Promise<Injected> {
  const injected = await injectCampaign(w.client, {
    id: nextId++,
    kind,
    metric,
    target,
    creator: await anyAddress(),
    opensAt: OPENS_AT,
    entriesCloseAt: DEADLINE - P.DAY,
    deadlineAt: DEADLINE,
    poolYes: 2n * P.SOL,
    poolNo: P.SOL,
    ...more,
    extra: { event_seq: 2n, ...more.extra },
  });
  return { ...injected, metric };
}

/** `SupplyAtMost` on a fresh classic SPL Token mint holding `supply`, both authorities revoked. */
export async function supplyCampaign(w: World, supply: bigint, target: bigint) {
  const mint = await anyAddress();
  R.setRawAccount(w.client, mint, R.mintBytes({ supply, mintAuthority: null }), P.SPL_TOKEN_PROGRAM_ID);
  return campaignOn(w, P.ReaderKind.SupplyAtMost, mint, target);
}

/** `DammV2LockedAtLeast` on the captured DAMM v2 pool, its `permanent_lock_liquidity` (u128) set. */
export async function dammCampaign(w: World, locked: bigint, target: bigint) {
  const offset = R.DAMM_OFFSETS.permanentLockLiquidity;
  const { address } = R.setFixture(w.client, "damm-ft8fd9", {
    mutate: (_, view) => {
      view.setBigUint64(offset, BigInt.asUintN(64, locked), true);
      view.setBigUint64(offset + 8, locked >> 64n, true);
    },
  });
  return campaignOn(w, P.ReaderKind.DammV2LockedAtLeast, address, target);
}

/** `StakePoolTvlAtLeast` in `EPOCH` on the captured JitoSOL pool, last updated in `updated`, whose
 * snapshot (`last_epoch_total_lamports`, written by that update) is `snapshot`. */
export async function stakePoolCampaign(w: World, a: { updated: bigint; snapshot: bigint; target: bigint }) {
  const { address } = R.setFixture(w.client, "stakepool-jitosol", {
    mutate: (_, view) => {
      view.setBigUint64(R.STAKE_POOL_OFFSETS.lastUpdateEpoch, a.updated, true);
      view.setBigUint64(R.STAKE_POOL_OFFSETS.lastEpochTotalLamports, a.snapshot, true);
    },
  });
  return campaignOn(w, P.ReaderKind.StakePoolTvlAtLeast, address, a.target, { epoch: EPOCH });
}

/** `StakeAtLeast` in `EPOCH` on the captured vote account. */
export async function voteCampaign(w: World, target: bigint) {
  const { address } = R.setFixture(w.client, "vote-mainnet-top");
  return campaignOn(w, P.ReaderKind.StakeAtLeast, address, target, { epoch: EPOCH });
}

/** `PriceTouch` on BTC/USD's sponsored account, `Above` (the default) `PRICE_TARGET`, exponent −8. */
export async function priceCampaign(w: World) {
  const feed = { feedId: P.BTC_USD_FEED_ID, priceExponent: -8, maxAge: Number(PRICE_MAX_AGE) };
  return campaignOn(w, P.ReaderKind.PriceTouch, P.BTC_USD_ACCOUNT, PRICE_TARGET, feed);
}

/** A Full BTC/USD `PriceUpdateV2` at `address`: `price`, no confidence, posted two slots ago. */
export function setBtcPrice(w: World, address: Address, price: bigint, publishTime: bigint) {
  const postedSlot = clockSlot(w) - 2n;
  setPriceAccount(w.client, address, "pyth-btc-usd-devnet", { price, conf: 0n, publishTime, postedSlot });
  return { publishTime, postedSlot };
}

export const resolveIx = (c: Injected, proof?: Address) => I.resolveCampaignIx(c.campaign, c.metric, proof);
export const resolve = (w: World, c: Injected, proof?: Address) => send(w, [resolveIx(c, proof)]);

/** The campaign's owner and bytes, and the lamports of the campaign and its vault. */
export function snapshot(w: World, c: Injected) {
  const account = w.client.svm.getAccount(c.campaign);
  if (!account.exists) throw new Error(`no campaign at ${c.campaign}`);
  const lamports = [balance(w, c.campaign), balance(w, c.vault)];
  return { owner: account.programAddress, data: [...account.data], lamports };
}

/** Sends `ix`: refused with `name`, and the campaign and its vault exactly as they were. */
export async function expectRefused(w: World, c: Injected, ix: Instruction, name: BrotErrorName) {
  const before = snapshot(w, c);
  expectError(await send(w, [ix]), name);
  expect(snapshot(w, c)).toEqual(before);
}

/** A row of the resolution table. `read` defaults to the metric account, the publish data to 0. */
export type Row = {
  outcome: number;
  voidReason?: number;
  metLate?: boolean;
  observed?: bigint;
  read?: Address;
  publishTime?: bigint;
  postedSlot?: bigint;
};

/** What `resolve_campaign` writes; every other field of the campaign must be as it was. */
const RESULT = ["status", "outcome", "void_reason", "met_late", "observed_value", "resolved_at", "review_ends_at"];

/**
 * Resolves `c` (offering `proof`) and checks the record against `row`: `InReview`, the outcome, the
 * void reason, `met_late`, the value read, `resolved_at` now and `review_ends_at` six hours later,
 * `event_seq` one higher, no other field and no lamport moved, and one `CampaignResolved` that says
 * the same, with the reading's account and publish data and the clock's slot and epoch.
 */
export async function expectResolved(w: World, c: Injected, row: Row, proof?: Address) {
  const before = readCampaign(w, c.campaign);
  const { lamports } = snapshot(w, c);
  const sent = expectOk(await resolve(w, c, proof));
  const after = readCampaign(w, c.campaign);
  const { unixTimestamp: now, slot, epoch } = w.client.svm.getClock();
  const result = { status: P.Status.InReview, outcome: row.outcome, void_reason: row.voidReason ?? P.VoidReason.None };
  expect({ status: after.status, outcome: after.outcome, void_reason: after.void_reason }).toEqual(result);
  expect(after.met_late).toBe(row.metLate ?? false);
  if (row.observed !== undefined) expect(after.observed_value).toBe(row.observed);
  expect([after.resolved_at, after.review_ends_at]).toEqual([now, now + P.REVIEW_WINDOW_SECONDS]);
  const unchanged = Object.keys(before).filter((field) => !RESULT.includes(field) && field !== "event_seq");
  expect(unchanged.map((field) => [field, after[field]])).toEqual(unchanged.map((field) => [field, before[field]]));
  expect(after.event_seq).toBe(before.event_seq + 1n);
  expect(snapshot(w, c).lamports).toEqual(lamports);
  expect(sent.events.map((event) => event.name)).toEqual(["CampaignResolved"]);
  expect(sent.events[0].data).toEqual({
    campaign: c.campaign,
    seq: before.event_seq,
    kind: before.kind,
    outcome: row.outcome,
    void_reason: after.void_reason,
    met_late: after.met_late,
    observed_value: after.observed_value,
    read_account: row.read ?? c.metric,
    publish_time: row.publishTime ?? 0n,
    posted_slot: row.postedSlot ?? 0n,
    resolved_at: now,
    review_ends_at: after.review_ends_at,
    slot,
    epoch,
  });
}
