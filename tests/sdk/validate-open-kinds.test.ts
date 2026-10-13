/**
 * Purpose: A-10 / X0.7, SDK half, for the four kinds other than the price kind: each case
 *          tests/brot/open-campaign-kinds.test.ts feeds to the program (row 1's closed `StakeAtLeast`, the
 *          canonical arguments, rows 2 and 3 on the captured mainnet mint, DAMM v2 pools and JitoSOL
 *          pool, the epoch rule of row 5) is fed to `validateOpenCampaign` too, with the same verdict.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, test } from "bun:test";
import { generateKeyPairSigner, type Address } from "@solana/kit";

import type { BrotErrorName } from "../brot/errors";
import type * as I from "../brot/instructions";
import { FREE, openingWorld, otherKind, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import {
  DAMM_OFFSETS,
  fixtureBytes,
  MINT_OFFSETS,
  setClock,
  setFixture,
  setMainnetEpochSchedule,
  setRawAccount,
  STAKE_POOL_OFFSETS,
} from "../brot/readers";
import { expectParity } from "./open-parity";

const { SupplyAtMost: SUPPLY, DammV2LockedAtLeast: DAMM, StakePoolTvlAtLeast: POOL, StakeAtLeast } = P.ReaderKind;
const u64At = (name: string, at: number) => new DataView(fixtureBytes(name).buffer).getBigUint64(at, true);
const locked = (pool: string) =>
  u64At(pool, DAMM_OFFSETS.permanentLockLiquidity) | (u64At(pool, DAMM_OFFSETS.permanentLockLiquidity + 8) << 64n);
const WIF_SUPPLY = u64At("mint-wif", MINT_OFFSETS.supply);
const POOL_EPOCH = u64At("stakepool-jitosol", STAKE_POOL_OFFSETS.lastUpdateEpoch);
const POOL_TOTAL = u64At("stakepool-jitosol", STAKE_POOL_OFFSETS.totalLamports);
const POOL_LAST = u64At("stakepool-jitosol", STAKE_POOL_OFFSETS.lastEpochTotalLamports);
const [POOL_LOW, POOL_HIGH] = POOL_TOTAL < POOL_LAST ? [POOL_TOTAL, POOL_LAST] : [POOL_LAST, POOL_TOTAL];
const POOL_TARGET = (POOL_HIGH * 105n) / 100n;

/** A team key's free opening of `kind` on `metric`, through both the SDK and the program. */
const parity = (
  w: OpeningWorld,
  expected: BrotErrorName | "accepted",
  kind: number,
  metric: Address,
  target: bigint,
  over: Partial<I.OpenArgs> = {},
) => expectParity(w, w.team, expected, { ...otherKind(kind, target, over), ...FREE }, { metric });

async function poolWorld(lastUpdateEpoch = POOL_EPOCH) {
  const w = await openingWorld();
  setMainnetEpochSchedule(w.client);
  setClock(w.client, { epoch: POOL_EPOCH, slot: POOL_EPOCH * 432_000n + 1_000n });
  const mutate = (_: Uint8Array, view: DataView) =>
    view.setBigUint64(STAKE_POOL_OFFSETS.lastUpdateEpoch, lastUpdateEpoch, true);
  return { w, pool: setFixture(w.client, "stakepool-jitosol", { mutate }).address };
}

describe("sdk refuses at least what the program refuses", () => {
  test("row 1 and the canonical arguments of the other kinds", async () => {
    const w = await openingWorld();
    const vote = setFixture(w.client, "vote-mainnet-top").address;
    await parity(w, "ReaderKindNotOpen", StakeAtLeast, vote, P.SOL, { epoch: 2n });
    for (const kind of [6, 255]) await parity(w, "UnknownReaderKind", kind, vote, P.SOL);
    const wif = setFixture(w.client, "mint-wif").address;
    const half = WIF_SUPPLY / 2n;
    for (const over of [{ feedId: P.BTC_USD_FEED_ID }, { direction: P.Direction.Below }, { epoch: 1n }]) {
      await parity(w, "UnusedArgumentNotZero", SUPPLY, wif, half, over);
    }
    await parity(w, "InvalidDirection", SUPPLY, wif, half, { direction: 2 });
  });

  test("the burn kind: Token-2022, a live mint authority, a target met, too close or below zero", async () => {
    const w = await openingWorld();
    await parity(w, "ReaderWrongOwner", SUPPLY, setFixture(w.client, "mint-pyusd").address, 1n);
    const usdc = setFixture(w.client, "mint-usdc").address;
    await parity(w, "MintAuthorityLive", SUPPLY, usdc, u64At("mint-usdc", MINT_OFFSETS.supply) / 2n);
    const wif = setFixture(w.client, "mint-wif").address;
    for (const target of [WIF_SUPPLY, WIF_SUPPLY + 1n]) await parity(w, "TargetAlreadyTouched", SUPPLY, wif, target);
    for (const target of [WIF_SUPPLY - 1n, (WIF_SUPPLY * 995n) / 1_000n]) {
      await parity(w, "TargetTooClose", SUPPLY, wif, target);
    }
    await parity(w, "TargetUnreachable", SUPPLY, wif, -1n);
    await parity(w, "accepted", SUPPLY, wif, WIF_SUPPLY / 2n);
  });

  test("the locked-liquidity kind: a stranger, resized pools, targets met or too close", async () => {
    const w = await openingWorld();
    for (const name of ["damm-sol-usdc", "damm-ft8fd9"]) {
      const value = locked(name);
      const stranger = (await generateKeyPairSigner()).address;
      setFixture(w.client, name, { at: stranger, owner: P.SYSTEM_PROGRAM_ID });
      await parity(w, "ReaderWrongOwner", DAMM, stranger, value * 2n);
      const bytes = fixtureBytes(name);
      for (const resized of [bytes.slice(0, -1), Uint8Array.of(...bytes, 0)]) {
        const at = (await generateKeyPairSigner()).address;
        setRawAccount(w.client, at, resized, P.DAMM_V2_PROGRAM_ID);
        await parity(w, "ReaderBadLayout", DAMM, at, value * 2n);
      }
      const pool = setFixture(w.client, name).address;
      for (const target of [value - 1n, value]) await parity(w, "TargetAlreadyTouched", DAMM, pool, target);
      for (const target of [value + 1n, value + value / 200n]) await parity(w, "TargetTooClose", DAMM, pool, target);
      await parity(w, "accepted", DAMM, pool, (value * 102n) / 100n);
    }
  });

  test("the stake-pool kind: the epoch started or too late, a pool that stopped updating, targets", async () => {
    const { w, pool } = await poolWorld();
    for (const epoch of [0n, POOL_EPOCH - 1n, POOL_EPOCH]) {
      await parity(w, "EpochAlreadyStarted", POOL, pool, POOL_TARGET, { epoch });
    }
    await parity(w, "EpochAfterDeadline", POOL, pool, POOL_TARGET, { epoch: POOL_EPOCH + 10n });
    const next = { epoch: POOL_EPOCH + 1n };
    await parity(w, "TargetAlreadyTouched", POOL, pool, POOL_LOW, next);
    await parity(w, "TargetTooClose", POOL, pool, POOL_HIGH + 1n, next);
    await parity(w, "accepted", POOL, pool, POOL_TARGET, next);
    const behind = await poolWorld(POOL_EPOCH - 5n);
    await parity(behind.w, "StakePoolNotUpdating", POOL, behind.pool, POOL_TARGET, next);
  });
});
