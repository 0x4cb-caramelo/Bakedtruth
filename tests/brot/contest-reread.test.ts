/**
 * Purpose: `reread_campaign` on the binary (Sprint 14, lane L14B): a re-read forwarded by another program is refused
 *          (`checks::top_level`, rerun per mutant by scripts/checks-mutation.mjs); the same reading pays with the
 *          stored outcome (a Split, a one-sided pot, a stored void), a different one opens stage 2 and writes no
 *          result, and `CampaignReread` says which, decoded through the SDK; the price kind's documented cases;
 *          each refusal with its own error; the pause never blocks it. Filter: `bun test tests/ -t "contest reread"`.
 * Version: 0.1.0
 * Sprint:  14 (lane L14B). Needs target/deploy/brot_markets.so and target/deploy/cpi_proxy.so.
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, type Instruction } from "@solana/kit";

import { buildPauseEntries } from "@brot/sdk/tx";

import * as C from "./contest-support";
import { BTC_PRICE, readCampaign } from "./flows";
import * as IL from "./instructions-14-15";
import * as P from "./program";
import {
  anyAddress,
  campaignOn,
  DEADLINE,
  expectRefused,
  PRICE_MAX_AGE,
  PRICE_TARGET,
  setBtcPrice,
  type Injected,
} from "./resolve-support";
import { expectOk, send, type World } from "./setup";

const STAGE1_ENDS = C.NOW + C.HOUR;
const { No, Yes, Void, Unresolved } = P.Outcome;

/** `ix` forwarded by the test-only CPI proxy, loaded at a fresh address (tests/programs/cpi-proxy). */
async function forwarded(w: World, ix: Instruction): Promise<Instruction> {
  const proxy = await anyAddress();
  w.client.svm.addProgramFromFile(proxy, P.CPI_PROXY_SO);
  const target = { address: P.PROGRAM_ID, role: AccountRole.READONLY };
  return { programAddress: proxy, accounts: [target, ...(ix.accounts ?? [])], data: ix.data };
}

/** A BTC/USD price campaign (`Above` 110% of the captured price), past its deadline, contested at stage 1. */
const priceContested = (cw: C.ContestWorld, result: Record<string, unknown>) =>
  campaignOn(cw.w, P.ReaderKind.PriceTouch, P.BTC_USD_ACCOUNT, PRICE_TARGET, {
    feedId: P.BTC_USD_FEED_ID,
    priceExponent: -8,
    maxAge: Number(PRICE_MAX_AGE),
    status: P.Status.Contested,
    extra: { contest_stage: 1, contest_ends_at: STAGE1_ENDS, event_seq: C.SEQ, entries_open: 2, ...result },
  });

/** The re-read must pay: `CampaignReread` (same) then `CampaignFinalized`, the campaign `Settling` in `mode`. */
async function expectPays(cw: C.ContestWorld, c: Injected, mode: number, stored: Record<string, unknown>) {
  const sent = expectOk(await C.reread(cw, c));
  expect(sent.events.map((e) => [e.name, e.data.seq])).toEqual([
    ["CampaignReread", C.SEQ],
    ["CampaignFinalized", C.SEQ + 1n],
  ]);
  expect(sent.events[0].data).toMatchObject({ same: true, contest_stage: 1, contest_ends_at: STAGE1_ENDS, ...stored });
  const after = readCampaign(cw.w, c.campaign);
  expect([after.status, after.settle_mode, after.event_seq]).toEqual([P.Status.Settling, mode, C.SEQ + 2n]);
  expect(sent.events[1].data.settle_mode).toBe(mode);
}

describe("contest reread", () => {
  test("top_level: a re-read forwarded by another program", async () => {
    const cw = await C.contestWorld();
    const c = await C.contested(cw, 1, STAGE1_ENDS);
    const ix = await C.rereadIx(c);
    await expectRefused(cw.w, c, await forwarded(cw.w, ix), "RereadNotTopLevel");
    expectOk(await send(cw.w, [ix]));
    expect(readCampaign(cw.w, c.campaign).status).toBe(P.Status.Settling);
  });

  test("contest reread: the same reading pays a Split, a one-sided pot and a stored void", async () => {
    const cw = await C.contestWorld();
    const split = await C.contested(cw, 1, STAGE1_ENDS);
    await expectPays(cw, split, 1, { outcome: No, observed_value: C.SUPPLY, met_late: false });
    const oneSided = await C.contested(cw, 1, STAGE1_ENDS, { pool_no: 0n });
    await expectPays(cw, oneSided, 2, { outcome: No });
    // Resolved as an unreadable account: the same void, nothing read, refunds every entry.
    const unreadable = { outcome: Void, void_reason: P.VoidReason.UnreadableAccount, observed_value: 0n };
    const voided = await C.contested(cw, 1, STAGE1_ENDS, unreadable);
    C.makeUnreadable(cw.w, voided.metric);
    await expectPays(cw, voided, 3, { outcome: Void, void_reason: P.VoidReason.UnreadableAccount });
  });

  test("contest reread: a different reading opens stage 2 for 48 hours and writes no result", async () => {
    const cw = await C.contestWorld();
    const c = await C.contested(cw, 1, STAGE1_ENDS);
    C.setSupply(cw.w, c.metric, C.SUPPLY - 1n); // a burn since the resolution
    const sent = expectOk(await C.reread(cw, c));
    const stage2Ends = C.NOW + C.STAGE2_SECONDS;
    expect(sent.events).toEqual([
      {
        name: "CampaignReread",
        data: {
          campaign: c.campaign,
          seq: C.SEQ,
          same: false,
          outcome: No,
          void_reason: 0,
          met_late: false,
          observed_value: C.SUPPLY - 1n,
          publish_time: 0n,
          contest_stage: 2,
          contest_ends_at: stage2Ends,
        },
      },
    ]);
    const after = readCampaign(cw.w, c.campaign);
    expect([after.status, after.contest_stage, after.contest_ends_at, after.event_seq]).toEqual([
      P.Status.Contested,
      2,
      stage2Ends,
      C.SEQ + 1n,
    ]);
    expect([after.outcome, after.observed_value, after.met_late]).toEqual([No, C.SUPPLY, false]);
  });

  test("contest reread: a reader that refuses now reads as nothing decided, and escalates", async () => {
    const cw = await C.contestWorld();
    // A YES before the deadline (still days away at NOW): the mint unreadable now, so the reader refuses.
    const early = await C.contested(cw, 1, STAGE1_ENDS, { outcome: Yes, deadline_at: C.NOW + 86_400n });
    C.makeUnreadable(cw.w, early.metric);
    const sent = expectOk(await C.reread(cw, early));
    const nothing = { same: false, outcome: Unresolved, void_reason: 0, met_late: false, observed_value: 0n };
    expect(sent.events[0].data).toMatchObject({ ...nothing, publish_time: 0n, contest_stage: 2 });
    expect(readCampaign(cw.w, early.campaign).outcome).toBe(Yes);
  });

  test("contest reread: a price NO re-reads the same while the feed holds; a price YES re-reads as NO", async () => {
    const cw = await C.contestWorld();
    // The sponsored account's last update, ten seconds before the deadline: fresh, so the reading after it is NO.
    setBtcPrice(cw.w, P.BTC_USD_ACCOUNT, BTC_PRICE, DEADLINE - 10n);
    const no = await priceContested(cw, { outcome: No, observed_value: BTC_PRICE });
    await expectPays(cw, no, 1, { outcome: No, observed_value: BTC_PRICE, publish_time: DEADLINE - 10n });
    // A YES proven before the deadline: after the proof window the sponsored account alone is read (NO), so the
    // re-read differs and the contest escalates: the documented false escalation of a price YES.
    const yes = await priceContested(cw, {
      outcome: Yes,
      observed_value: BTC_PRICE + 1n,
      publish_time: DEADLINE - 30n,
    });
    const sent = expectOk(await C.reread(cw, yes));
    expect(sent.events[0].data).toMatchObject({
      same: false,
      outcome: No,
      observed_value: BTC_PRICE,
      contest_stage: 2,
    });
    expect(readCampaign(cw.w, yes.campaign).outcome).toBe(Yes);
  });

  test("contest reread: each refusal has its own error and writes nothing", async () => {
    const cw = await C.contestWorld();
    const config = cw.config;
    const inReview = await C.reviewed(cw);
    await expectRefused(
      cw.w,
      inReview,
      IL.rereadCampaignIx(inReview.campaign, config, inReview.metric),
      "NotContested",
    );
    const stage2 = await C.contested(cw, 2, C.NOW + C.STAGE2_SECONDS);
    await expectRefused(cw.w, stage2, IL.rereadCampaignIx(stage2.campaign, config, stage2.metric), "WrongContestStage");
    const c = await C.contested(cw, 1, STAGE1_ENDS);
    const other = await anyAddress();
    C.setSupply(cw.w, other, C.SUPPLY);
    await expectRefused(cw.w, c, IL.rereadCampaignIx(c.campaign, config, other), "MetricAccountMismatch");
  });

  test("contest reread: the pause never blocks a re-read", async () => {
    const cw = await C.contestWorld();
    expectOk(await send(cw.w, [await buildPauseEntries({ teamMember: cw.team })]));
    const c = await C.contested(cw, 1, STAGE1_ENDS);
    expectOk(await C.reread(cw, c));
    expect(readCampaign(cw.w, c.campaign).status).toBe(P.Status.Settling);
  });
});
