/**
 * Purpose: the dispute's worst case on the binary (Sprint 14, lane L14B; BP v0.0.4 part 1 section 4.5; TP 3.4.7): a
 *          paid price campaign with two entries resolves NO at t0 and a team key contests in the window's last second.
 *          Stage 1 lasts 24 hours (the founder's answer to D2). Whether the re-read comes at the end of stage 1 (a
 *          different reading opens stage 2), never comes (the keeper down for a week: the unread stage 1 lapses), or
 *          comes a week late (stage 2 counts from stage 1's deadline, so it adds nothing), nobody decides, the lapse
 *          finalizes with the stored result and the winner is paid 6 + 24 + 48 = 78 hours after t0 at the latest,
 *          while one second earlier the lapse and the payout are refused (review fix F3). Every event of the
 *          campaign's life, decoded through the SDK, carries the next `seq`. Filter: `-t "contest worst case"`.
 * Version: 0.1.2 (D2: stage 1 lasts 24 hours, so the bound is 78 hours)
 * Sprint:  14 (lane L14B). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";

import { buildFinalizeCampaign, buildSettleEntry, buildTallyLateJoins } from "@brot/sdk/tx";

import * as C from "./contest-support";
import { BTC_PRICE, initConfig, join, openedCampaign, readCampaign, setTeam } from "./flows";
import * as P from "./program";
import { resolveWith } from "./price-support";
import {
  balance,
  createWorld,
  expectError,
  expectOk,
  fundedWallet,
  now,
  send,
  setPriceAccount,
  setTime,
  type Event,
  type World,
} from "./setup";

const REVIEW = 6n * C.HOUR;
const SEVENTY_EIGHT_HOURS = 78n * C.HOUR;
const WEEK = 7n * 24n * C.HOUR;

/** The sponsored BTC/USD account at `price`, published at `publishTime`, posted in the current slot. */
function btc(w: World, price: bigint, publishTime: bigint) {
  const postedSlot = w.client.svm.getClock().slot;
  setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { price, conf: 0n, publishTime, postedSlot });
}

/** A paid price campaign, two entries, resolved NO at t0, tallied, and contested in the review window's last second. */
async function contestedAtTheEdge() {
  const w = await createWorld();
  const { admin } = await initConfig(w);
  const [team] = await setTeam(w, admin, 1);
  const [creator, ana, bruno] = [await fundedWallet(w), await fundedWallet(w), await fundedWallet(w)];
  const events: Event[] = [];
  const record = (sent: Awaited<ReturnType<typeof send>>) => events.push(...expectOk(sent).events);
  const opened = await openedCampaign(w, creator);
  record(opened.sent);
  const { campaign } = opened;
  btc(w, BTC_PRICE, now(w.client) - 5n);
  record(await join(w, ana, campaign, { side: P.Side.Yes, amount: 2n * P.SOL }));
  record(await join(w, bruno, campaign, { side: P.Side.No, amount: P.SOL }));
  // t0: after the deadline's proof window the sponsored account decides; its last update, ten seconds before the
  // deadline, is below the target: NO.
  const deadline = readCampaign(w, campaign).deadline_at as bigint;
  const t0 = deadline + P.PROOF_DELAY_SECONDS + 1n;
  setTime(w.client, t0);
  btc(w, BTC_PRICE, deadline - 10n);
  record(await resolveWith(w, campaign));
  for (const baker of [ana, bruno]) {
    record(await send(w, [await buildTallyLateJoins({ campaign, baker: baker.address, from: 0, to: 1 })]));
  }
  setTime(w.client, t0 + REVIEW - 1n);
  const c = { campaign, vault: opened.vault, metric: P.BTC_USD_ACCOUNT };
  const cw = { w, admin, team, outsider: creator, config: await P.configPda() };
  record(await C.openContest(cw, c));
  const stage1Ends = t0 + REVIEW - 1n + C.STAGE1_SECONDS;
  return { w, cw, c, campaign, bruno, t0, stage1Ends, events, record };
}

type Edge = Awaited<ReturnType<typeof contestedAtTheEdge>>;

/** Nobody decides: one second before `lapse` nothing pays; at it the stored NO stands and Bruno is paid. */
async function paidAtTheLapse(e: Edge, lapse: bigint) {
  const finalize = await buildFinalizeCampaign({ campaign: e.campaign });
  const settleBruno = await buildSettleEntry({ campaign: e.campaign, baker: e.bruno.address });
  setTime(e.w.client, lapse - 1n);
  expectError(await send(e.w, [finalize]), "ContestNotLapsed");
  expectError(await send(e.w, [settleBruno]), "NotFinalized");
  setTime(e.w.client, lapse);
  e.record(await send(e.w, [finalize]));
  expect(readCampaign(e.w, e.campaign)).toMatchObject({ status: P.Status.Settling, outcome: P.Outcome.No });
  const before = balance(e.w, e.bruno.address);
  e.record(await send(e.w, [settleBruno]));
  expect(balance(e.w, e.bruno.address) - before).toBeGreaterThan(P.SOL); // his entry back and a share of the losers'
  const paidAt = now(e.w.client);
  expect(paidAt - e.t0).toBe(SEVENTY_EIGHT_HOURS - 1n);
  expect(paidAt <= e.t0 + SEVENTY_EIGHT_HOURS).toBe(true);
}

/** Every event of the campaign's life takes the next number, in this order of names. */
function expectLife(e: Edge, middle: string[]) {
  const mine = e.events.filter((x) => x.data.campaign === e.campaign);
  expect(mine.map((x) => x.data.seq)).toEqual(mine.map((_, i) => BigInt(i)));
  const opening = ["CampaignOpened", "EntryAdded", "EntryAdded", "CampaignResolved", "LateTallied", "LateTallied"];
  expect(mine.map((x) => x.name)).toEqual([
    ...opening,
    "ContestOpened",
    ...middle,
    "CampaignFinalized",
    "EntrySettled",
  ]);
}

describe("contest worst case", () => {
  test("contest worst case is 78 hours: resolution to payout, and refused one second earlier", async () => {
    const e = await contestedAtTheEdge();
    // The re-read at the end of stage 1, after a newer update: a different reading, stage 2 for 48 hours.
    setTime(e.w.client, e.stage1Ends);
    btc(e.w, BTC_PRICE + 1n, e.stage1Ends - 5n);
    e.record(await C.reread(e.cw, e.c));
    const stage2Ends = e.stage1Ends + C.STAGE2_SECONDS;
    expect(readCampaign(e.w, e.campaign)).toMatchObject({ status: P.Status.Contested, contest_ends_at: stage2Ends });
    await paidAtTheLapse(e, stage2Ends);
    expectLife(e, ["CampaignReread"]);
  });

  test("contest worst case is 78 hours with the keeper down for a week: the unread stage 1 lapses", async () => {
    const e = await contestedAtTheEdge();
    // Nobody re-reads: stage 1 lapses 48 hours after its own deadline, 78 hours after t0 less the window's last second.
    await paidAtTheLapse(e, e.stage1Ends + C.STAGE2_SECONDS);
    expectLife(e, []);
  });

  test("contest worst case is 78 hours when the keeper re-reads a week late: stage 2 adds nothing", async () => {
    const e = await contestedAtTheEdge();
    const lapse = e.stage1Ends + C.STAGE2_SECONDS;
    // A week later a different reading opens stage 2 that ended long ago: its deadline counts from stage 1's.
    const late = e.t0 + WEEK;
    setTime(e.w.client, late);
    btc(e.w, BTC_PRICE + 1n, late - 5n);
    e.record(await C.reread(e.cw, e.c));
    expect(readCampaign(e.w, e.campaign)).toMatchObject({ contest_stage: 2, contest_ends_at: lapse });
    const finalize = await buildFinalizeCampaign({ campaign: e.campaign });
    e.record(await send(e.w, [finalize]));
    expect(readCampaign(e.w, e.campaign)).toMatchObject({ status: P.Status.Settling, outcome: P.Outcome.No });
  });
});
