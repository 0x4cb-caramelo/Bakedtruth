/**
 * Purpose: A-10 / X0.7, SDK half: the cases of the program's own tests the first parity files left out
 *          (Sprint 05 closure review), each fed to `validateOpenCampaign` and to the program with the same
 *          verdict: the terms named before the duration; a team key's free opening, which reads no SOL/USD
 *          (stale, or any account in the slot) while its own SOL/USD campaign still checks its price; the
 *          stake pool under another owner, as a validator list or truncated; a DAMM v2 pool with another
 *          discriminator. Slot and data-format refusals stay out: the SDK's builders cannot produce them.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, test } from "bun:test";
import { generateKeyPairSigner, type Address } from "@solana/kit";

import { DEFAULT_PARAMS, SOL_PRICE } from "../brot/flows";
import * as I from "../brot/instructions";
import { FREE, openingWorld, otherKind, STALE } from "../brot/opening";
import * as P from "../brot/program";
import {
  DAMM_OFFSETS,
  fixtureBytes,
  setClock,
  setFixture,
  setMainnetEpochSchedule,
  setRawAccount,
  STAKE_POOL_OFFSETS,
} from "../brot/readers";
import { expectOk, now, send, setPriceAccount } from "../brot/setup";
import { expectParity } from "./open-parity";

const u64At = (name: string, at: number) => new DataView(fixtureBytes(name).buffer).getBigUint64(at, true);

describe("sdk refuses at least what the program refuses: the cases added at closure", () => {
  test("the terms the creator saw are named before the duration", async () => {
    const w = await openingWorld();
    expectOk(await send(w, [await I.setCreationParamsIx(w.admin, { ...DEFAULT_PARAMS, creator_share_bps: 40 })]));
    const short = { expectedParamsVersion: 0, deadlineAt: now(w.client) + P.DAY };
    await expectParity(w, w.creator, "CreationParamsChanged", short);
  });

  test("a team key's free opening reads no SOL/USD; its own SOL/USD campaign still checks the price", async () => {
    const w = await openingWorld();
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: STALE });
    await expectParity(w, w.team, "accepted", FREE);
    await expectParity(w, w.creator, "SolUsdStale");
    await expectParity(w, w.team, "accepted", FREE, { solUsd: P.SYSTEM_PROGRAM_ID });
    const fresh = await openingWorld();
    const below = { ...FREE, feedId: P.SOL_USD_FEED_ID, direction: P.Direction.Below, target: (SOL_PRICE * 9n) / 10n };
    await expectParity(fresh, fresh.team, "accepted", below);
    setPriceAccount(fresh.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: STALE });
    await expectParity(fresh, fresh.team, "PriceStale", below);
  });

  test("the stake pool under another owner, as a validator list, or truncated", async () => {
    const w = await openingWorld();
    const epoch = u64At("stakepool-jitosol", STAKE_POOL_OFFSETS.lastUpdateEpoch);
    setMainnetEpochSchedule(w.client);
    setClock(w.client, { epoch, slot: epoch * 432_000n + 1_000n });
    const target = u64At("stakepool-jitosol", STAKE_POOL_OFFSETS.totalLamports) * 2n;
    const args = { ...otherKind(P.ReaderKind.StakePoolTvlAtLeast, target, { epoch: epoch + 1n }), ...FREE };
    const open = (expected: "ReaderWrongOwner" | "ReaderBadLayout", metric: Address) =>
      expectParity(w, w.team, expected, args, { metric });
    await open(
      "ReaderWrongOwner",
      setFixture(w.client, "stakepool-jitosol", { owner: P.SPL_TOKEN_PROGRAM_ID }).address,
    );
    await open(
      "ReaderBadLayout",
      setFixture(w.client, "stakepool-jitosol", { mutate: (d) => void (d[0] = 2) }).address,
    );
    const truncated = (await generateKeyPairSigner()).address;
    setRawAccount(w.client, truncated, fixtureBytes("stakepool-jitosol").slice(0, 434), P.STAKE_POOL_PROGRAM_ID);
    await open("ReaderBadLayout", truncated);
  });

  test("a DAMM v2 pool with another discriminator", async () => {
    const w = await openingWorld();
    const bytes = fixtureBytes("damm-ft8fd9");
    const view = new DataView(bytes.buffer);
    const lock = view.getBigUint64(DAMM_OFFSETS.permanentLockLiquidity, true);
    const flipped = (await generateKeyPairSigner()).address;
    setRawAccount(
      w.client,
      flipped,
      Uint8Array.from(bytes, (b, i) => (i === 0 ? b ^ 1 : b)),
      P.DAMM_V2_PROGRAM_ID,
    );
    const args = { ...otherKind(P.ReaderKind.DammV2LockedAtLeast, lock * 2n), ...FREE };
    await expectParity(w, w.team, "ReaderBadLayout", args, { metric: flipped });
  });
});
