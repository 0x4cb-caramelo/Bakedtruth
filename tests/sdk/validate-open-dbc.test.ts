/**
 * Purpose: A-10 / X0.7 for the sixth kind (`DbcGraduated`): every refusal of its rows 2 and 3, the canonical arguments
 *          and an opening that passes, fed to both the program in LiteSVM and `validateOpenCampaign`, with the same
 *          verdict, on the Meteora DBC pools and configs captured from mainnet. A missing config is refused by the
 *          program with `NotEnoughAccountKeys`, which has no code, and by the SDK as the caller's error; a build that
 *          does not open the kind (mainnet's) is refused at row 1.
 * Version: 0.1.0
 * Sprint:  the sixth kind, after 05 (docs/technical/meteora-readers-plan.md)
 */
import { describe, expect, test } from "bun:test";
import { generateKeyPairSigner, type Address } from "@solana/kit";

import type { BrotErrorName } from "../brot/errors";
import type * as I from "../brot/instructions";
import { FREE, openArgs, openingWorld, otherKind, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fixtureBytes, setFixture, setRawAccount } from "../brot/readers";
import { expectParity, sdkVerdict } from "./open-parity";

const DBC = P.ReaderKind.DbcGraduated;
const T85 = 85n * P.SOL;
/** The most an 85 SOL curve may have raised and still open: 10% of it still missing. */
const MOST_RAISED = T85 - T85 / 10n;
const RAISED_AT = 240;
const STAGE_AT = 308;

/** A team key's free graduation opening of `pool` with `config` after the nine slots, through both. */
const parity = (
  w: OpeningWorld,
  expected: BrotErrorName | "accepted",
  pool: Address,
  config: Address,
  target: bigint,
  over: Partial<I.OpenArgs> = {},
) =>
  expectParity(
    w,
    w.team,
    expected,
    { ...otherKind(DBC, target, over), ...FREE },
    { metric: pool, curveConfig: config },
  );

/** The captured fixture `name`, at its own address, with `edit` applied to its bytes. */
const fixture = (w: OpeningWorld, name: string, edit?: (view: DataView) => void) =>
  setFixture(w.client, name, { mutate: (_, view) => edit?.(view) }).address;

describe("sdk refuses at least what the program refuses: the graduation kind", () => {
  test("the pool: another owner, cut or stretched, a transfer-hook pool", async () => {
    const w = await openingWorld();
    const config = fixture(w, "dbc-config-85sol");
    const stranger = (await generateKeyPairSigner()).address;
    setFixture(w.client, "dbc-pool-stage0", { at: stranger, owner: P.SYSTEM_PROGRAM_ID });
    await parity(w, "ReaderWrongOwner", stranger, config, T85);
    const bytes = fixtureBytes("dbc-pool-stage0");
    for (const resized of [bytes.slice(0, -1), Uint8Array.of(...bytes, 0)]) {
      const at = (await generateKeyPairSigner()).address;
      setRawAccount(w.client, at, resized, P.DBC_PROGRAM_ID);
      await parity(w, "ReaderBadLayout", at, config, T85);
    }
    const hook = fixture(w, "dbc-hook-pool");
    await parity(w, "CurveHasTransferHook", hook, fixture(w, "dbc-hook-config"), T85);
  });

  test("the config: another pool's, another owner, another layout, in USDC, below the 85 SOL floor", async () => {
    const w = await openingWorld();
    const pool = fixture(w, "dbc-pool-stage0");
    await parity(w, "CurveConfigMismatch", pool, fixture(w, "dbc-config-stage3"), T85);
    const own = setFixture(w.client, "dbc-config-85sol", { owner: P.SPL_TOKEN_PROGRAM_ID }).address;
    await parity(w, "ReaderWrongOwner", pool, own, T85);
    setRawAccount(w.client, own, fixtureBytes("dbc-hook-config"), P.DBC_PROGRAM_ID);
    await parity(w, "ReaderBadLayout", pool, own, T85);
    const usdc = fixture(w, "dbc-pool-usdc");
    await parity(w, "CurveNotInSol", usdc, fixture(w, "dbc-config-usdc"), 1_000_000n);
    const small = fixture(w, "dbc-pool-11sol");
    await parity(w, "CurveTooSmall", small, fixture(w, "dbc-config-11sol"), 11n * P.SOL);
  });

  test("the target: the threshold or refused; a completed curve; 10% of the threshold still missing", async () => {
    const w = await openingWorld();
    const config = fixture(w, "dbc-config-85sol");
    const pool = fixture(w, "dbc-pool-stage0");
    for (const target of [0n, T85 - 1n, T85 + 1n]) await parity(w, "TargetNotThreshold", pool, config, target);
    const migrated = fixture(w, "dbc-pool-stage3");
    await parity(w, "TargetAlreadyTouched", migrated, fixture(w, "dbc-config-stage3"), T85);
    fixture(w, "dbc-pool-stage0", (view) => view.setUint8(STAGE_AT, 1));
    await parity(w, "TargetAlreadyTouched", pool, config, T85);
    fixture(w, "dbc-pool-stage0", (view) => view.setBigUint64(RAISED_AT, MOST_RAISED + 1n, true));
    await parity(w, "TargetTooClose", pool, config, T85);
    fixture(w, "dbc-pool-stage0", (view) => view.setBigUint64(RAISED_AT, MOST_RAISED, true));
    await parity(w, "accepted", pool, config, T85);
    fixture(w, "dbc-pool-stage0");
    await parity(w, "accepted", pool, config, T85);
  });

  test("the canonical arguments: no feed, no Below, no epoch", async () => {
    const w = await openingWorld();
    const [pool, config] = [fixture(w, "dbc-pool-stage0"), fixture(w, "dbc-config-85sol")];
    for (const over of [{ feedId: P.BTC_USD_FEED_ID }, { direction: P.Direction.Below }, { epoch: 1n }]) {
      await parity(w, "UnusedArgumentNotZero", pool, config, T85, over);
    }
  });

  test("a missing config is the caller's error in the SDK; a mainnet build does not open the kind", async () => {
    const w = await openingWorld();
    const [pool, curveConfig] = [fixture(w, "dbc-pool-stage0"), fixture(w, "dbc-config-85sol")];
    const args = openArgs(w, { ...otherKind(DBC, T85), ...FREE });
    const missing = sdkVerdict(w, w.team, args, { metric: pool });
    await expect(missing).rejects.toThrow("DbcGraduated needs the pool's config account");
    const mainnet = await sdkVerdict(w, w.team, args, { metric: pool, curveConfig }, { dbcGraduatedOpens: false });
    expect(mainnet.ok ? "accepted" : mainnet.refusal.errorName).toBe("ReaderKindNotOpen");
    const opens = await sdkVerdict(w, w.team, args, { metric: pool, curveConfig });
    expect(opens.ok).toBe(true);
  });
});
