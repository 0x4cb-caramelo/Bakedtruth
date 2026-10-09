/**
 * Purpose: `user_open_campaign` for the four kinds other than the price kind (TP section 3.4.10):
 *          row 1 (`StakeAtLeast` closed in this build), the canonical arguments (D-j), rows 2 and 3
 *          through each reader on the captured mainnet accounts, the epoch kinds' part of row 5,
 *          and what a burn, a locked-liquidity and a stake-pool campaign store and announce.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution), lane F. Rows 2, 3 and 5 of these kinds need the readers of
 *          lanes A and B in the SBF build; row 1 and the canonical arguments need only this lane's.
 */
import { describe, expect, test } from "bun:test";
import { generateKeyPairSigner, type Address } from "@solana/kit";

import type { BrotErrorName } from "./errors";
import { readCampaign, SOL_PRICE } from "./flows";
import type * as I from "./instructions";
import { FREE, openingWorld, otherKind, tryOpen, type OpeningWorld } from "./opening";
import * as P from "./program";
import {
  DAMM_OFFSETS,
  fixtureBytes,
  MINT_OFFSETS,
  setClock,
  setFixture,
  setMainnetEpochSchedule,
  setRawAccount,
  STAKE_POOL_OFFSETS,
} from "./readers";
import { expectError, expectOk, type Sent } from "./setup";

const { SupplyAtMost: SUPPLY, DammV2LockedAtLeast: DAMM, StakePoolTvlAtLeast: POOL, StakeAtLeast } = P.ReaderKind;

/** A little-endian u64 or u128 of a captured account. */
const u64At = (name: string, at: number) => new DataView(fixtureBytes(name).buffer).getBigUint64(at, true);
const u128At = (name: string, at: number) => u64At(name, at) | (u64At(name, at + 8) << 64n);
const locked = (pool: string) => u128At(pool, DAMM_OFFSETS.permanentLockLiquidity);
const WIF_SUPPLY = u64At("mint-wif", MINT_OFFSETS.supply);
/** JitoSOL's pool: the epoch of its last update (1047), and the lower and higher of its two totals. */
const POOL_EPOCH = u64At("stakepool-jitosol", STAKE_POOL_OFFSETS.lastUpdateEpoch);
const POOL_TOTAL = u64At("stakepool-jitosol", STAKE_POOL_OFFSETS.totalLamports);
const POOL_LAST_TOTAL = u64At("stakepool-jitosol", STAKE_POOL_OFFSETS.lastEpochTotalLamports);
const [POOL_LOW, POOL_HIGH] =
  POOL_TOTAL < POOL_LAST_TOTAL ? [POOL_TOTAL, POOL_LAST_TOTAL] : [POOL_LAST_TOTAL, POOL_TOTAL];
const POOL_TARGET = (POOL_HIGH * 105n) / 100n;
const DAMM_POOLS = ["damm-sol-usdc", "damm-ft8fd9"];

/** A team key's free opening of `kind` on `metric`, canonical unless `over` changes an argument. */
async function open(w: OpeningWorld, kind: number, metric: Address, target: bigint, over: Partial<I.OpenArgs> = {}) {
  return (await tryOpen(w, w.team, { ...otherKind(kind, target, over), ...FREE }, { slots: { metric } })).sent;
}

/** A world on the mainnet schedule, its clock 1,000 slots into JitoSOL's last updated epoch. */
async function poolWorld(lastUpdateEpoch = POOL_EPOCH) {
  const w = await openingWorld();
  setMainnetEpochSchedule(w.client);
  setClock(w.client, { epoch: POOL_EPOCH, slot: POOL_EPOCH * 432_000n + 1_000n });
  const mutate = (_: Uint8Array, view: DataView) =>
    view.setBigUint64(STAKE_POOL_OFFSETS.lastUpdateEpoch, lastUpdateEpoch, true);
  return { w, pool: setFixture(w.client, "stakepool-jitosol", { mutate }).address };
}

describe("open campaign refuses: the other four kinds", () => {
  test("row 1: StakeAtLeast stays closed whatever its arguments, and a kind byte past the five", async () => {
    const w = await openingWorld();
    const vote = setFixture(w.client, "vote-mainnet-top").address;
    expectError(await open(w, StakeAtLeast, vote, P.SOL, { epoch: 2n }), "ReaderKindNotOpen");
    expectError(await open(w, StakeAtLeast, vote, P.SOL, { feedId: P.BTC_USD_FEED_ID }), "ReaderKindNotOpen");
    for (const kind of [5, 255]) expectError(await open(w, kind, vote, P.SOL), "UnknownReaderKind");
  });

  test("canonical arguments: a feed, a direction or an epoch the kind does not use", async () => {
    const w = await openingWorld();
    const wif = setFixture(w.client, "mint-wif").address;
    const damm = setFixture(w.client, "damm-ft8fd9").address;
    const pool = setFixture(w.client, "stakepool-jitosol").address;
    const target = WIF_SUPPLY / 2n;
    for (const over of [{ feedId: P.BTC_USD_FEED_ID }, { direction: P.Direction.Below }, { epoch: 1n }]) {
      expectError(await open(w, SUPPLY, wif, target, over), "UnusedArgumentNotZero");
    }
    expectError(await open(w, DAMM, damm, locked("damm-ft8fd9") * 2n, { epoch: 1n }), "UnusedArgumentNotZero");
    const feed = { epoch: POOL_EPOCH + 1n, feedId: P.BTC_USD_FEED_ID };
    expectError(await open(w, POOL, pool, POOL_TARGET, feed), "UnusedArgumentNotZero");
    // Every kind reads the direction byte first; the price kind takes no epoch.
    expectError(await open(w, SUPPLY, wif, target, { direction: 2 }), "InvalidDirection");
    expectError((await tryOpen(w, w.creator, { epoch: 1n })).sent, "UnusedArgumentNotZero");
  });

  test("row 2: a Token-2022 mint, and a mint whose authority can still mint", async () => {
    const w = await openingWorld();
    expectError(await open(w, SUPPLY, setFixture(w.client, "mint-pyusd").address, 1n), "ReaderWrongOwner");
    const usdc = setFixture(w.client, "mint-usdc").address;
    expectError(await open(w, SUPPLY, usdc, u64At("mint-usdc", MINT_OFFSETS.supply) / 2n), "MintAuthorityLive");
  });

  test("row 3: a supply target already met, within 1% of the supply, or below zero", async () => {
    const w = await openingWorld();
    const wif = setFixture(w.client, "mint-wif").address;
    const refused = async (target: bigint, error: BrotErrorName) =>
      expectError(await open(w, SUPPLY, wif, target), error);
    for (const target of [WIF_SUPPLY, WIF_SUPPLY + 1n]) await refused(target, "TargetAlreadyTouched");
    for (const target of [WIF_SUPPLY - 1n, (WIF_SUPPLY * 995n) / 1_000n]) await refused(target, "TargetTooClose");
    await refused(-1n, "TargetUnreachable");
  });

  test("row 2: a DAMM v2 pool under another owner, cut short or stretched", async () => {
    const w = await openingWorld();
    const random = async () => (await generateKeyPairSigner()).address;
    for (const name of DAMM_POOLS) {
      const target = locked(name) * 2n;
      const stranger = setFixture(w.client, name, { at: await random(), owner: P.SYSTEM_PROGRAM_ID }).address;
      expectError(await open(w, DAMM, stranger, target), "ReaderWrongOwner");
      const bytes = fixtureBytes(name);
      for (const resized of [bytes.slice(0, -1), Uint8Array.of(...bytes, 0)]) {
        const at = await random();
        setRawAccount(w.client, at, resized, P.DAMM_V2_PROGRAM_ID);
        expectError(await open(w, DAMM, at, target), "ReaderBadLayout");
      }
    }
  });

  test("row 3: a DAMM target already met or within 1% of the locked liquidity", async () => {
    const w = await openingWorld();
    for (const name of DAMM_POOLS) {
      const [pool, value] = [setFixture(w.client, name).address, locked(name)];
      for (const target of [value - 1n, value]) expectError(await open(w, DAMM, pool, target), "TargetAlreadyTouched");
      for (const target of [value + 1n, value + value / 200n]) {
        expectError(await open(w, DAMM, pool, target), "TargetTooClose");
      }
    }
  });

  test("row 5: the measured epoch already started, or starts after the deadline", async () => {
    const { w, pool } = await poolWorld();
    for (const epoch of [0n, POOL_EPOCH - 1n, POOL_EPOCH]) {
      expectError(await open(w, POOL, pool, POOL_TARGET, { epoch }), "EpochAlreadyStarted");
    }
    // Ten epochs ahead start weeks after the seven-day deadline, at any slot time near today's.
    expectError(await open(w, POOL, pool, POOL_TARGET, { epoch: POOL_EPOCH + 10n }), "EpochAfterDeadline");
  });

  test("row 2: a stake pool five epochs behind can no longer write the epoch's snapshot", async () => {
    const { w, pool } = await poolWorld(POOL_EPOCH - 5n);
    expectError(await open(w, POOL, pool, POOL_TARGET, { epoch: POOL_EPOCH + 1n }), "StakePoolNotUpdating");
  });

  test("row 3: a stake pool target already met or within 1% of its totals", async () => {
    const { w, pool } = await poolWorld();
    const next = { epoch: POOL_EPOCH + 1n };
    expectError(await open(w, POOL, pool, POOL_LOW, next), "TargetAlreadyTouched");
    expectError(await open(w, POOL, pool, POOL_HIGH + 1n, next), "TargetTooClose");
  });
});

/** The opening's event, and the price-only fields every other kind stores as zero (D-j). */
const openedEvent = (sent: Sent) => expectOk(sent).events.find((e) => e.name === "CampaignOpened")!.data;
const NO_PRICE = { feed_id: new Uint8Array(32), direction: 0, price_exponent: 0, max_age: 0 };

describe("opens the other four kinds", () => {
  test("a burn campaign on WIF, free for a team key and paid by any wallet", async () => {
    const w = await openingWorld();
    const wif = setFixture(w.client, "mint-wif").address;
    const target = WIF_SUPPLY / 2n;
    const free = await tryOpen(w, w.team, { ...otherKind(SUPPLY, target), ...FREE }, { slots: { metric: wif } });
    const paid = await tryOpen(w, w.creator, otherKind(SUPPLY, target), { slots: { metric: wif } });
    const stored = { kind: SUPPLY, metric_account: wif, target, epoch: 0n, ...NO_PRICE };
    for (const opened of [free, paid]) {
      expect(openedEvent(opened.sent)).toMatchObject(stored);
      expect(readCampaign(w, opened.campaign)).toMatchObject(stored);
    }
    const charged = { opening_usd: 500n, opening_price: SOL_PRICE, creator_share_bps: 100, creator_is_team: false };
    expect(readCampaign(w, paid.campaign)).toMatchObject(charged);
  });

  test("a locked-liquidity campaign on a DAMM v2 pool, 2% above what is locked", async () => {
    const w = await openingWorld();
    const pool = setFixture(w.client, "damm-ft8fd9").address;
    const target = (locked("damm-ft8fd9") * 102n) / 100n;
    const opened = await tryOpen(w, w.team, { ...otherKind(DAMM, target), ...FREE }, { slots: { metric: pool } });
    const stored = { kind: DAMM, metric_account: pool, target, epoch: 0n, ...NO_PRICE };
    expect(openedEvent(opened.sent)).toMatchObject(stored);
    expect(readCampaign(w, opened.campaign)).toMatchObject(stored);
  });

  test("a stake-pool campaign on JitoSOL for the next epoch stores and announces the epoch", async () => {
    const { w, pool } = await poolWorld();
    const args = { ...otherKind(POOL, POOL_TARGET, { epoch: POOL_EPOCH + 1n }), ...FREE };
    const opened = await tryOpen(w, w.team, args, { slots: { metric: pool } });
    const stored = { kind: POOL, metric_account: pool, target: POOL_TARGET, epoch: POOL_EPOCH + 1n, ...NO_PRICE };
    expect(openedEvent(opened.sent)).toMatchObject(stored);
    expect(readCampaign(w, opened.campaign)).toMatchObject(stored);
  });
});
