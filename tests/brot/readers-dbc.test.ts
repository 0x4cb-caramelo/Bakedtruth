/**
 * Purpose: the graduation kind (`DbcGraduated`) in the program, on the Meteora DBC pool and config captured from
 *          mainnet (tests/fixtures/dbc-*): a team key opens a campaign on the real stage-0 pool with its 85 SOL
 *          config after the nine slots (and is refused without it); bakers join while the curve is open and are
 *          refused once it completes, written in memory as DBC's swap writes it; `resolve_campaign` waits while the
 *          curve is open, records YES by the pool's stamp before the deadline and after it, NO flagged `met_late`
 *          for a later stamp, NO for a curve still open, and voids an unreadable pool.
 * Version: 0.0.1
 * Sprint:  the sixth kind, after 05 (docs/technical/meteora-readers-plan.md). Needs the SBF build.
 */
import { describe, expect, test } from "bun:test";
import { type Address } from "@solana/kit";

import { join, newId, readCampaign } from "./flows";
import * as I from "./instructions";
import { FREE, openingWorld, otherKind, type OpeningWorld } from "./opening";
import * as P from "./program";
import { fixtureBytes, setFixture, setRawAccount } from "./readers";
import { expectError, expectOk, fundedWallet, now, send, setTime, type Sent } from "./setup";

/** The fields DBC's swap writes when it completes a curve (readers/dbc_graduation.rs). */
const AT = { quoteReserve: 240, migrationProgress: 308, finishCurveTimestamp: 344 } as const;
const THRESHOLD = 85n * P.SOL;
const RAISED = 19_457_897n;
const ENTRY = P.SOL / 10n;
type Curve = { stage?: number; stamp?: bigint; raised?: bigint };

/** The captured stage-0 pool, with what `curve` says written over it. */
function writePool(w: OpeningWorld, curve: Curve = {}): Address {
  const mutate = (_: Uint8Array, view: DataView) => {
    if (curve.stage !== undefined) view.setUint8(AT.migrationProgress, curve.stage);
    if (curve.stamp !== undefined) view.setBigUint64(AT.finishCurveTimestamp, curve.stamp, true);
    if (curve.raised !== undefined) view.setBigUint64(AT.quoteReserve, curve.raised, true);
  };
  return setFixture(w.client, "dbc-pool-stage0", { mutate }).address;
}

/** A team key's free graduation opening of the stage-0 pool, seven days long, its config after the nine slots. */
async function openGraduation(w: OpeningWorld, withConfig = true) {
  const pool = writePool(w);
  const config = setFixture(w.client, "dbc-config-85sol").address;
  const deadlineAt = now(w.client) + 7n * P.DAY;
  const args = { id: newId(), feedId: new Uint8Array(32), deadlineAt, ...otherKind(5, THRESHOLD), ...FREE };
  const slots = { metric: pool, curveConfig: withConfig ? config : undefined };
  const sent = await send(w, [await I.openCampaignIx(w.team, args as I.OpenArgs, slots)]);
  return { sent, pool, deadlineAt, campaign: await P.campaignPda(args.id) };
}

const resolve = (w: OpeningWorld, campaign: Address, pool: Address) => send(w, [I.resolveCampaignIx(campaign, pool)]);

/** The outcome as the campaign records it and as `CampaignResolved` carries it. */
function expectResolved(w: OpeningWorld, sent: Sent, campaign: Address, outcome: number, observed: bigint, more = {}) {
  const ok = expectOk(sent);
  const recorded = { outcome, met_late: false, void_reason: P.VoidReason.None, observed_value: observed, ...more };
  expect(readCampaign(w, campaign)).toMatchObject({ ...recorded, status: P.Status.InReview });
  expect(ok.events.find((e) => e.name === "CampaignResolved")?.data).toMatchObject({ ...recorded, campaign });
}

describe("the graduation kind on the captured Meteora DBC pool", () => {
  test("a team key opens on the real curve at its 85 SOL threshold, its config after the nine slots", async () => {
    const w = await openingWorld();
    const { sent, pool, campaign } = await openGraduation(w);
    const ok = expectOk(sent);
    const kind = P.ReaderKind.DbcGraduated;
    const stored = { kind, metric_account: pool, target: THRESHOLD, price_exponent: 0, direction: 0, epoch: 0n };
    expect(readCampaign(w, campaign)).toMatchObject({ ...stored, status: P.Status.Open });
    expect(ok.events.find((e) => e.name === "CampaignOpened")?.data).toMatchObject({ kind, target: THRESHOLD });
  });

  test("without the config after the nine slots the opening is refused: NotEnoughAccountKeys", async () => {
    const { sent } = await openGraduation(await openingWorld(), false);
    expect(sent.ok ? "opened" : sent.error).toContain("NotEnoughAccountKeys");
  });

  test("bakers join while the curve is open, near full included, and are refused once it completes", async () => {
    const w = await openingWorld();
    const { campaign } = expectOpened(await openGraduation(w));
    const [early, late] = [await fundedWallet(w), await fundedWallet(w)];
    expectOk(await join(w, early, campaign, { side: P.Side.Yes, amount: ENTRY }));
    // 90% raised less one lamport: still on the curve, so entries stay open (M-6).
    writePool(w, { raised: (THRESHOLD * 9n) / 10n - 1n });
    expectOk(await join(w, late, campaign, { side: P.Side.No, amount: ENTRY }));
    writePool(w, { stage: 2, stamp: now(w.client), raised: THRESHOLD });
    expectError(
      await join(w, late, campaign, { side: P.Side.No, amount: ENTRY, expectedEntryTotal: ENTRY }),
      "OutcomeKnowable",
    );
    setRawAccount(w.client, writePool(w), fixtureBytes("dbc-pool-stage0").slice(1), P.DBC_PROGRAM_ID);
    expectError(
      await join(w, early, campaign, { side: P.Side.Yes, amount: ENTRY, expectedEntryTotal: ENTRY }),
      "ReaderBadLayout",
    );
  });

  test("resolution waits while the curve is open, then records YES at the second the pool stamped", async () => {
    const w = await openingWorld();
    const { campaign, pool } = expectOpened(await openGraduation(w));
    expectError(await resolve(w, campaign, pool), "NotResolvableYet");
    writePool(w, { stage: 1, stamp: now(w.client), raised: THRESHOLD });
    expectResolved(w, await resolve(w, campaign, pool), campaign, P.Outcome.Yes, THRESHOLD);
  });

  test("after the deadline: YES by an in-time stamp, NO flagged met_late by a later one, NO on an open curve", async () => {
    const w = await openingWorld();
    const [open, inTime, late] = [await openGraduation(w), await openGraduation(w), await openGraduation(w)];
    const { pool, deadlineAt } = expectOpened(open);
    [inTime, late].forEach(expectOpened);
    setTime(w.client, deadlineAt + P.DAY);
    expectResolved(w, await resolve(w, open.campaign, pool), open.campaign, P.Outcome.No, RAISED);
    writePool(w, { stage: 2, stamp: deadlineAt, raised: THRESHOLD });
    expectResolved(w, await resolve(w, inTime.campaign, pool), inTime.campaign, P.Outcome.Yes, THRESHOLD);
    writePool(w, { stage: 2, stamp: deadlineAt + 1n, raised: THRESHOLD });
    const lateResolved = await resolve(w, late.campaign, pool);
    expectResolved(w, lateResolved, late.campaign, P.Outcome.No, THRESHOLD, { met_late: true });
  });

  test("an unreadable pool: resolution refused up to the deadline's second, void after it", async () => {
    const w = await openingWorld();
    const { campaign, pool, deadlineAt } = expectOpened(await openGraduation(w));
    setRawAccount(w.client, pool, fixtureBytes("dbc-pool-stage0"), P.SPL_TOKEN_PROGRAM_ID);
    setTime(w.client, deadlineAt);
    expectError(await resolve(w, campaign, pool), "ReaderWrongOwner");
    setTime(w.client, deadlineAt + 1n);
    const unreadable = { void_reason: P.VoidReason.UnreadableAccount };
    expectResolved(w, await resolve(w, campaign, pool), campaign, P.Outcome.Void, 0n, unreadable);
  });
});

/** Expects the opening went through, and returns it. */
function expectOpened<T extends { sent: Sent }>(opened: T): T {
  expectOk(opened.sent);
  return opened;
}
