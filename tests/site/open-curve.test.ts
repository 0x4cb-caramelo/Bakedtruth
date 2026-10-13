/**
 * Purpose: the creation box's graduation kind (`DbcGraduated`) on the Meteora DBC accounts captured from mainnet: the
 *          account slot's check in the reader's order (a transfer-hook launch, a config not there or not DBC's, a curve
 *          priced in USDC, one below the 85 SOL floor, one completed, one more than 90% full; the real stage-0 curve
 *          accepted with its threshold, which becomes the target), then a draft built through the box, read through the
 *          site's RPC, accepted by the SDK's mirror and opened by the program in LiteSVM with the very arguments the box
 *          built, free and paid; and each refusal the box shows by the pool's slot, sent straight to the program, which
 *          refuses it with the same error. Filter: `bun test tests/ -t "the creation box's graduation kind"`.
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05 (docs/technical/meteora-readers-plan.md). Needs the SBF build.
 */
import { afterEach, describe, expect, test } from "bun:test";

import type { BrotErrorName, FetchedAccount } from "@brot/sdk/read";

import { accountState, curveTarget, curveThresholdOf } from "../../app/features/open-campaign/account-check";
import { EMPTY_DRAFT, type Draft } from "../../app/features/open-campaign/draft";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { FIXTURES, fixtureBytes, setFixture } from "../brot/readers";
import { expectError, expectOk } from "../brot/setup";
import { boxThenProgram, closeChains, expectBoxRefusal } from "./open-cases";

afterEach(closeChains);

const T85 = 85n * P.SOL;
const RAISED = 19_457_897n;
const NINETY = T85 - T85 / 10n;
/** The stage-0 pool's quote raised (readers/dbc_graduation.rs). */
const RAISED_AT = 240;

/** A captured account as an RPC returns it, the pool's quote raised rewritten when given. */
function fetched(name: string, raised?: bigint): FetchedAccount {
  const data = fixtureBytes(name);
  if (raised !== undefined) new DataView(data.buffer).setBigUint64(RAISED_AT, raised, true);
  return { address: FIXTURES[name].address, owner: FIXTURES[name].owner, data };
}
const slot = (pool: FetchedAccount, config: FetchedAccount | null) => accountState("curve", pool, 0n, config);
const refused = (refusal: BrotErrorName) => ({ state: "refused" as const, refusal });

/** A graduation draft on `pool`, seven days long; the target field stays empty, as the box leaves it. */
const curveDraft = (pool: string): Draft => ({ ...EMPTY_DRAFT, kind: "curve", account: pool, deadline: { days: 7 } });

describe("the creation box's graduation kind", () => {
  test("the account slot checks a launch curve in the reader's order, and accepts the real one", () => {
    const accepted = slot(fetched("dbc-pool-stage0"), fetched("dbc-config-85sol"));
    expect(accepted).toEqual({ state: "ok", value: RAISED, measured: "now", curve: { threshold: T85, stage: 0 } });
    expect(curveTarget({ status: "read", state: accepted })).toBe(T85);
    expect(curveTarget({ status: "checking" })).toBeNull();
    const wrongOwner = { ...fetched("dbc-pool-stage0"), owner: P.SPL_TOKEN_PROGRAM_ID };
    expect(slot(wrongOwner, fetched("dbc-config-85sol"))).toEqual(refused("ReaderWrongOwner"));
    expect(slot(fetched("dbc-hook-pool"), fetched("dbc-hook-config"))).toEqual(refused("CurveHasTransferHook"));
    // A config that is not there reads as the System Program's, empty; one under another owner is refused the same.
    expect(slot(fetched("dbc-pool-stage0"), null)).toEqual(refused("ReaderWrongOwner"));
    const foreign = { ...fetched("dbc-config-85sol"), owner: P.SPL_TOKEN_PROGRAM_ID };
    expect(slot(fetched("dbc-pool-stage0"), foreign)).toEqual(refused("ReaderWrongOwner"));
    expect(slot(fetched("dbc-pool-usdc"), fetched("dbc-config-usdc"))).toEqual(refused("CurveNotInSol"));
    expect(slot(fetched("dbc-pool-11sol"), fetched("dbc-config-11sol"))).toEqual(refused("CurveTooSmall"));
    expect(slot(fetched("dbc-pool-stage3"), fetched("dbc-config-stage3"))).toEqual(refused("TargetAlreadyTouched"));
    const config = fetched("dbc-config-85sol");
    expect(slot(fetched("dbc-pool-stage0", NINETY + 1n), config)).toEqual(refused("TargetTooClose"));
    expect(slot(fetched("dbc-pool-stage0", NINETY), config).state).toBe("ok");
  });

  test("the threshold is read from the config alone: a pool, or nothing, gives none", () => {
    expect(curveThresholdOf(fetched("dbc-config-85sol"))).toBe(T85);
    expect(curveThresholdOf(fetched("dbc-config-11sol"))).toBe(11n * P.SOL);
    expect(curveThresholdOf(fetched("dbc-pool-stage0"))).toBeNull();
    expect(curveThresholdOf(null)).toBeNull();
  });

  test("built through the box, a team key's graduation opening is the program's: its target the threshold", async () => {
    const w = await openingWorld();
    const pool = setFixture(w.client, "dbc-pool-stage0").address;
    setFixture(w.client, "dbc-config-85sol");
    const { check, program } = await boxThenProgram(w, w.team, curveDraft(pool));
    expect(check.verdict?.ok).toBe(true);
    expect(check.issues.filter((i) => i.place !== "wallet")).toEqual([]);
    expect([check.args?.kind, check.args?.target, check.args?.epoch, check.args?.direction]).toEqual([5, T85, 0n, 0]);
    const ok = expectOk(await program());
    expect(ok.events.find((e) => e.name === "CampaignOpened")?.data).toMatchObject({ kind: 5, target: T85 });
  });

  test("a paying creator's graduation opening goes through the box and the program the same way", async () => {
    const w = await openingWorld();
    const pool = setFixture(w.client, "dbc-pool-stage0").address;
    setFixture(w.client, "dbc-config-85sol");
    const { check, program } = await boxThenProgram(w, w.creator, curveDraft(pool));
    expect([check.isTeam, check.verdict?.ok, check.args?.target]).toEqual([false, true, T85]);
    expect(check.quote?.openingUsd).toBe(500n);
    expectOk(await program());
  });

  const REFUSED = [
    {
      name: "a curve below the 85 SOL floor",
      pool: "dbc-pool-11sol",
      config: "dbc-config-11sol",
      error: "CurveTooSmall",
    },
    { name: "a curve priced in USDC", pool: "dbc-pool-usdc", config: "dbc-config-usdc", error: "CurveNotInSol" },
    { name: "a completed curve", pool: "dbc-pool-stage3", config: "dbc-config-stage3", error: "TargetAlreadyTouched" },
  ] as const;
  for (const c of REFUSED) {
    test(`${c.name}: the box shows ${c.error} by the pool, and the program refuses the same arguments`, async () => {
      const w = await openingWorld();
      const pool = setFixture(w.client, c.pool).address;
      setFixture(w.client, c.config);
      const { check, program } = await boxThenProgram(w, w.creator, curveDraft(pool));
      expectBoxRefusal(check, c.error);
      expect(check.issues.find((i) => i.refusal === c.error)?.place).toBe("account");
      expectError(await program(), c.error);
    });
  }

  test("a curve more than 90% full: TargetTooClose by the pool, in the box and in the program", async () => {
    const w = await openingWorld();
    const mutate = (_: Uint8Array, view: DataView) => view.setBigUint64(RAISED_AT, NINETY + 1n, true);
    const pool = setFixture(w.client, "dbc-pool-stage0", { mutate }).address;
    setFixture(w.client, "dbc-config-85sol");
    const { check, program } = await boxThenProgram(w, w.team, curveDraft(pool));
    expectBoxRefusal(check, "TargetTooClose");
    expect(check.issues.find((i) => i.refusal === "TargetTooClose")?.text).toContain("90% full");
    expectError(await program(), "TargetTooClose");
  });
});
