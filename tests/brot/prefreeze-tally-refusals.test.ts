/**
 * Purpose: G-16 of the audit package (Sprint 16): every refusal of `tally_late_joins` through the program, each with
 *          its own error and nothing tallied: a campaign not in review (`TallyNotReady`), an entry already tallied
 *          (`EntryAlreadyTallied`), the Join list wrong in each way the code names (`JoinAccountsMismatch`: none, out
 *          of order, one too many, another baker's, another campaign's), a join passed twice (`WrongOwner`: the first
 *          closes it), and a Join slot read-only (`NotWritable`) or aliased with a named slot (`DuplicateAccount`).
 *          `CutoffNotFinal` is prefreeze-partial-tally.test.ts's.
 * Version: 0.0.1
 * Sprint:  16 (lane L16P, the pre-freeze hardening). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";

import { AccountRole, type Address } from "@solana/kit";

import { initConfig, join, openedCampaign, readCampaign, readEntry } from "./flows";
import { refreshBase } from "./invariant-harness";
import * as I from "./instructions";
import { finalizeCampaignIx, tallyLateJoinsIx } from "./instructions-settlement";
import * as P from "./program";
import { createWorld, expectError, expectOk, fundedWallet, send, setTime, type World } from "./setup";

type Scene = {
  w: World;
  campaign: Address;
  ana: Address;
  entry: Address;
  joins: Address[];
  bia: Address;
  biaEntry: Address;
  biaJoin: Address;
  otherJoin: Address;
};

/** Two campaigns; Ana joins the first twice (joins 0 and 1) and the second once; Bia joins the first once. */
async function scene(): Promise<Scene> {
  const w = await createWorld();
  await initConfig(w);
  const creator = await fundedWallet(w, 1_000n);
  refreshBase(w);
  const { campaign } = await openedCampaign(w, creator);
  const { campaign: other } = await openedCampaign(w, creator);
  const [ana, bia] = [await fundedWallet(w, 100n), await fundedWallet(w, 100n)];
  expectOk(await join(w, ana, campaign, { side: P.Side.Yes, amount: P.SOL }));
  expectOk(await join(w, ana, campaign, { side: P.Side.Yes, amount: P.SOL, expectedEntryTotal: P.SOL }));
  expectOk(await join(w, bia, campaign, { side: P.Side.No, amount: P.SOL }));
  expectOk(await join(w, ana, other, { side: P.Side.Yes, amount: P.SOL }));
  return {
    w,
    campaign,
    ana: ana.address,
    entry: await P.entryPda(campaign, ana.address),
    joins: [await P.joinPda(campaign, ana.address, 0), await P.joinPda(campaign, ana.address, 1)],
    bia: bia.address,
    biaEntry: await P.entryPda(campaign, bia.address),
    biaJoin: await P.joinPda(campaign, bia.address, 0),
    otherJoin: await P.joinPda(other, ana.address, 0),
  };
}

/** NO after the deadline: a result with no cut-off to wait for. */
async function resolveNo(s: Scene) {
  setTime(s.w.client, (readCampaign(s.w, s.campaign).deadline_at as bigint) + 61n);
  refreshBase(s.w);
  expectOk(await send(s.w, [I.resolveCampaignIx(s.campaign, P.BTC_USD_ACCOUNT, P.PROGRAM_ID)]));
}

const tally = (s: Scene, joins: Address[]) => tallyLateJoinsIx(s.ana, s.campaign, s.entry, joins);
/** Ana's entry: none of its joins tallied, both still open. */
async function untallied(s: Scene) {
  expect(Number((await readEntry(s.w, s.campaign, s.ana)).joins_tallied)).toBe(0);
  for (const j of s.joins) expect(s.w.client.svm.getAccount(j).exists).toBe(true);
}

describe("tally_late_joins refuses each wrong call with its own error, through the program", () => {
  test("TallyNotReady: a campaign open, or already finalized", async () => {
    const s = await scene();
    expectError(await send(s.w, [tally(s, s.joins)]), "TallyNotReady");
    await untallied(s);
    await resolveNo(s);
    // Every entry tallied, then the snapshot once the window is over: the campaign is Settling.
    const biaTally = tallyLateJoinsIx(s.bia, s.campaign, s.biaEntry, [s.biaJoin]);
    expectOk(await send(s.w, [tally(s, s.joins), biaTally]));
    setTime(s.w.client, (readCampaign(s.w, s.campaign).review_ends_at as bigint) + 1n);
    expectOk(await send(s.w, [finalizeCampaignIx(s.campaign, await P.configPda())]));
    expect(readCampaign(s.w, s.campaign).status).toBe(P.Status.Settling);
    expectError(await send(s.w, [biaTally]), "TallyNotReady");
  });

  test("EntryAlreadyTallied: an entry whose joins are all tallied", async () => {
    const s = await scene();
    await resolveNo(s);
    expectOk(await send(s.w, [tally(s, s.joins)]));
    expectError(await send(s.w, [tally(s, s.joins)]), "EntryAlreadyTallied");
  });

  test("JoinAccountsMismatch: no join, out of order, one too many, another baker's or another campaign's", async () => {
    const s = await scene();
    await resolveNo(s);
    const [j0, j1] = s.joins;
    for (const joins of [[], [j1, j0], [j0, j1, s.biaJoin], [s.biaJoin], [s.otherJoin], [j0, s.otherJoin]]) {
      expectError(await send(s.w, [tally(s, joins)]), "JoinAccountsMismatch");
      await untallied(s);
    }
  });

  test("a join passed twice is closed by the first pass: the second is no longer the program's", async () => {
    const s = await scene();
    await resolveNo(s);
    expectError(await send(s.w, [tally(s, [s.joins[0], s.joins[0]])]), "WrongOwner");
    await untallied(s);
  });

  test("tally: a read-only Join slot, or one aliased with a named slot, is refused before any load", async () => {
    const s = await scene();
    await resolveNo(s);
    const base = tally(s, s.joins);
    expectError(await send(s.w, [I.withSlot(base, 6, { role: AccountRole.READONLY })]), "NotWritable");
    for (const named of [s.campaign, s.entry, s.ana]) {
      const aliased = I.withSlot(base, 5, { address: named, role: AccountRole.WRITABLE });
      expectError(await send(s.w, [aliased]), "DuplicateAccount");
    }
    await untallied(s);
  });
});
