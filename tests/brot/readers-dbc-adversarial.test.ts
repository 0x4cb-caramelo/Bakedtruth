/**
 * Purpose: the graduation kind (`DbcGraduated`) against the two attacks of the audit of 2026-10-12, sent to the program
 *          in LiteSVM on the Meteora DBC accounts captured from mainnet. Threshold masking: a curve below the 85 SOL
 *          floor (5 SOL in memory, and the real 11 SOL one) opened with an 85 SOL or larger target is refused for its
 *          size (`CurveTooSmall`), since the floor reads the config, never the target; a real 85 SOL config the pool
 *          does not name is refused (`CurveConfigMismatch`), and so is one under another owner. Born-ready campaigns:
 *          the real migrated pool and a completed copy (`TargetAlreadyTouched`), a curve 99% or 90% and one lamport
 *          full (`TargetTooClose`). Each refusal leaves no campaign and no vault, and charges a paying opener nothing.
 * Version: 0.1.0
 * Sprint:  the sixth kind, after 05. Needs the SBF build.
 */
import { describe, expect, test } from "bun:test";
import { type Address, type KeyPairSigner } from "@solana/kit";

import type { BrotErrorName } from "./errors";
import { newId } from "./flows";
import * as I from "./instructions";
import { FREE, openingWorld, otherKind, type OpeningWorld } from "./opening";
import * as P from "./program";
import { setFixture } from "./readers";
import { balance, expectError, expectOk, now, send } from "./setup";

const SOL = P.SOL;
const T85 = 85n * SOL;
/** The pool's quote raised, its stage and its stamp; the config's threshold (readers/dbc_graduation.rs, config.rs). */
const AT = { raised: 240, stage: 308, stamp: 344, threshold: 264 } as const;

/** The captured stage-0 pool (85 SOL config, 0.019 SOL raised), with what `edit` writes over it. */
const pool = (w: OpeningWorld, edit: { raised?: bigint; stage?: number; stamp?: bigint } = {}) =>
  setFixture(w.client, "dbc-pool-stage0", {
    mutate: (_, view) => {
      if (edit.raised !== undefined) view.setBigUint64(AT.raised, edit.raised, true);
      if (edit.stage !== undefined) view.setUint8(AT.stage, edit.stage);
      if (edit.stamp !== undefined) view.setBigUint64(AT.stamp, edit.stamp, true);
    },
  }).address;

/** The stage-0 pool's own config, at its own address and under DBC, its threshold rewritten when given. */
const config85 = (w: OpeningWorld, threshold?: bigint) =>
  setFixture(w.client, "dbc-config-85sol", {
    mutate: (_, view) => threshold !== undefined && view.setBigUint64(AT.threshold, threshold, true),
  }).address;

/** One graduation opening of `metric` with `curveConfig` after the nine slots; free for the team key, else US$500. */
async function open(w: OpeningWorld, who: KeyPairSigner, metric: Address, curveConfig: Address, target: bigint) {
  const paid = who !== w.team ? { openingUsd: 500n, maxLamports: 10n * SOL } : FREE;
  const deadlineAt = now(w.client) + 7n * P.DAY;
  const args = { id: newId(), feedId: new Uint8Array(32), deadlineAt, ...otherKind(5, target), ...paid };
  const sent = await send(w, [await I.openCampaignIx(who, args as I.OpenArgs, { metric, curveConfig })]);
  return { sent, campaign: await P.campaignPda(args.id) };
}

/** The opening is refused with `error`, and nothing of it exists: no campaign, no vault. */
async function expectRefused(w: OpeningWorld, opened: Awaited<ReturnType<typeof open>>, error: BrotErrorName) {
  expectError(opened.sent, error);
  expect(w.client.svm.getAccount(opened.campaign).exists).toBe(false);
  expect(w.client.svm.getAccount(await P.vaultPda(opened.campaign)).exists).toBe(false);
}

describe("the graduation kind refuses threshold masking", () => {
  test("a 5 SOL curve opened with an 85 SOL, larger or its own target: CurveTooSmall, whatever the target", async () => {
    const w = await openingWorld();
    const [metric, small] = [pool(w), config85(w, 5n * SOL)];
    for (const target of [T85, 1_000n * SOL, (1n << 127n) - 1n, 5n * SOL]) {
      await expectRefused(w, await open(w, w.team, metric, small, target), "CurveTooSmall");
    }
  });

  test("a real 85 SOL curve opened with any target but its threshold: TargetNotThreshold", async () => {
    const w = await openingWorld();
    const [metric, config] = [pool(w), config85(w)];
    for (const target of [170n * SOL, T85 + 1n, T85 - 1n, 5n * SOL, 0n, -1n]) {
      await expectRefused(w, await open(w, w.team, metric, config, target), "TargetNotThreshold");
    }
  });

  test("the real 11 SOL curve with its real config and an 85 SOL target: CurveTooSmall", async () => {
    const w = await openingWorld();
    const metric = setFixture(w.client, "dbc-pool-11sol").address;
    const own = setFixture(w.client, "dbc-config-11sol").address;
    for (const target of [T85, 11n * SOL]) {
      await expectRefused(w, await open(w, w.team, metric, own, target), "CurveTooSmall");
    }
  });

  test("the small curve with a real 85 SOL config it does not name, or a copy under another owner", async () => {
    const w = await openingWorld();
    const metric = setFixture(w.client, "dbc-pool-11sol").address;
    // The 85 SOL config of another pool, at its own address: the pool names another one.
    await expectRefused(w, await open(w, w.team, metric, config85(w), T85), "CurveConfigMismatch");
    // The 85 SOL config's bytes at the small pool's own config address, but not owned by DBC.
    const own = setFixture(w.client, "dbc-config-11sol").address;
    setFixture(w.client, "dbc-config-85sol", { at: own, owner: P.SPL_TOKEN_PROGRAM_ID });
    await expectRefused(w, await open(w, w.team, metric, own, T85), "ReaderWrongOwner");
  });

  test("a paying opener on a masked curve is charged nothing: the reader refuses before the payment", async () => {
    const w = await openingWorld();
    const [metric, small] = [pool(w), config85(w, 5n * SOL)];
    const before = balance(w, w.creator.address);
    await expectRefused(w, await open(w, w.creator, metric, small, T85), "CurveTooSmall");
    expect(balance(w, w.creator.address)).toBe(before);
  });
});

describe("the graduation kind refuses born-ready campaigns", () => {
  test("the real migrated pool (stage 3, 85 SOL raised) with its real 85 SOL config: TargetAlreadyTouched", async () => {
    const w = await openingWorld();
    const migrated = setFixture(w.client, "dbc-pool-stage3").address;
    const own = setFixture(w.client, "dbc-config-stage3").address;
    await expectRefused(w, await open(w, w.team, migrated, own, T85), "TargetAlreadyTouched");
  });

  test("the open curve once completed, at stage 1 or 2, stamped a day ago: TargetAlreadyTouched", async () => {
    const w = await openingWorld();
    const config = config85(w);
    for (const stage of [1, 2]) {
      const metric = pool(w, { stage, stamp: now(w.client) - P.DAY, raised: T85 });
      await expectRefused(w, await open(w, w.team, metric, config, T85), "TargetAlreadyTouched");
    }
  });

  test("a curve 99% full, 90% and one lamport full, or full on stage 0: TargetTooClose; exactly 90% opens", async () => {
    const w = await openingWorld();
    const config = config85(w);
    const ninety = T85 - T85 / 10n;
    for (const raised of [(T85 * 99n) / 100n, ninety + 1n, T85, (1n << 64n) - 1n]) {
      await expectRefused(w, await open(w, w.team, pool(w, { raised }), config, T85), "TargetTooClose");
    }
    const edge = await open(w, w.team, pool(w, { raised: ninety }), config, T85);
    expectOk(edge.sent);
    expect(w.client.svm.getAccount(edge.campaign).exists).toBe(true);
  });

  test("a completed small curve with a lying target reports its size first: the floor before the target and stage", async () => {
    const w = await openingWorld();
    const metric = pool(w, { stage: 2, stamp: now(w.client), raised: 5n * SOL });
    await expectRefused(w, await open(w, w.team, metric, config85(w, 5n * SOL), T85), "CurveTooSmall");
  });
});
