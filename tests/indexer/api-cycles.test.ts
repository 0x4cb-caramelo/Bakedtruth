/**
 * Purpose: the indexer's read routes over whole cycles in LiteSVM (Sprint 08, slice 2): every answer passes its schema
 *          in @brot/sdk/schemas on real chain data; each live campaign's split ends at its account's pools and its
 *          activity opens with `CampaignOpened` and holds each entry once; each baker's wallet entries are its own
 *          entries, with what reached it equal to its settlement rows; the recent entries are the last cycle's,
 *          newest first. Since slice 3, what the indexer derives on that data: the ranking (the closed campaign has
 *          none), the KPIs, a partner report with no address, and `feed_history` from the live price account.
 *          Filter: `bun test tests/indexer`.
 * Version: 0.2.0 (slice 3: the ranking, the KPIs, the partner report, feed_history)
 * Sprint:  08 (indexer, API, relay and points), slices 2 and 3
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createSolanaRpc } from "@solana/kit";
import { decodeCampaign, readPriceUpdate } from "@brot/sdk/read";
import {
  CampaignActivitySchema,
  ChanceSchema,
  RankingSchema,
  RecentActivitySchema,
  WalletEntriesSchema,
  type EntryItem,
} from "@brot/sdk/schemas";

import { freshness } from "../../services/indexer/src/api/queries";
import { handle } from "../../services/indexer/src/api/routes";
import { createFeedRecorder } from "../../services/indexer/src/feeds";
import { computeKpis } from "../../services/indexer/src/kpis";
import { partnerFigures, reportText } from "../../services/indexer/src/partner-report";
import * as P from "../brot/program";
import { rawOf } from "../site/support";
import { indexedCycles, type CyclesWorld } from "./cycles-world";

let world: CyclesWorld;
beforeAll(async () => {
  world = await indexedCycles();
}, 180_000);
afterAll(() => world.close());

const get = async (path: string) => {
  const res = handle(world.store, new Request(`http://127.0.0.1:4201${path}`), { corsOrigin: "*" });
  expect([path, res.status]).toEqual([path, 200]);
  return res.json();
};

describe("the indexer's read routes over whole cycles", () => {
  test("each live campaign's split ends at its pools; its activity opens it and holds each entry once", async () => {
    for (const name of ["oneSided", "voided", "review"] as const) {
      const cycle = world.cycles[name];
      const account = decodeCampaign(rawOf(world.w, cycle.campaign));
      const chance = ChanceSchema.parse(await get(`/api/v1/campaigns/${cycle.campaign}/chance`));
      expect(chance.points.at(-1)).toMatchObject({
        pool_yes: account.poolYes.toString(),
        pool_no: account.poolNo.toString(),
      });
      const activity = CampaignActivitySchema.parse(await get(`/api/v1/campaigns/${cycle.campaign}/activity`));
      expect(activity.items[0]).toMatchObject({ type: "event", name: "CampaignOpened" });
      const entries = activity.items.filter((i): i is EntryItem => i.type === "entry");
      expect(entries.map((e) => e.seq)).toEqual(chance.points.map((p) => p.seq));
      expect(entries).toHaveLength(cycle.placed.length);
    }
  });

  test("each baker's wallet entries are its own entries, and what reached it is its settlements", async () => {
    const paid = world.cycles.paid;
    for (const [i, baker] of paid.bakers.slice(0, 2).entries()) {
      const mine = WalletEntriesSchema.parse(await get(`/api/v1/wallets/${baker.address}/entries`));
      const row = mine.items.find((r) => r.campaign === paid.campaign);
      const placed = paid.placed.filter((b) => b.who.address === baker.address);
      const total = placed.reduce((sum, b) => sum + b.amount, 0n).toString();
      expect(row).toMatchObject({ entries: placed.length, [i === 0 ? "yes" : "no"]: total });
      const settled = world.store.db
        .query("SELECT paid FROM settlements WHERE recipient = ? AND campaign = ? AND role = 'baker'")
        .all(baker.address, paid.campaign) as { paid: string }[];
      expect(row?.received).toBe(settled.reduce((sum, s) => sum + BigInt(s.paid), 0n).toString());
    }
  });

  test("the recent entries are the last cycle's, newest first", async () => {
    const recent = RecentActivitySchema.parse(await get("/api/v1/activity?limit=3"));
    expect(recent.items.map((e) => e.campaign)).toEqual(Array(3).fill(world.cycles.review.campaign));
    expect(recent.items.map((e) => Number(e.seq))).toEqual(
      [...recent.items.map((e) => Number(e.seq))].sort((a, b) => b - a),
    );
  });
});

describe("what the indexer derives over whole cycles (slice 3)", () => {
  const rowOf = (at: string) =>
    world.store.db.query("SELECT * FROM campaigns WHERE address = ? ORDER BY opening DESC").get(at) as Record<
      string,
      string | number | null
    >;

  test("the ranking: two-sided by entries, then one-sided; the closed campaign has no place", async () => {
    const { cycles } = world;
    const ranking = RankingSchema.parse(await get("/api/v1/ranking"));
    expect(ranking.items.map((i) => [i.campaign, i.rank, i.listed])).toEqual([
      [cycles.review.campaign, 1, true],
      [cycles.voided.campaign, 2, true],
      [cycles.oneSided.campaign, 3, true],
    ]);
    expect(rowOf(cycles.paid.campaign)).toMatchObject({ closed: 1, rank: null, listed: null });
  });

  test("the KPIs: openings, shapes, endings, volume and resolutions match the cycles", () => {
    const cycles = Object.values(world.cycles);
    const bets = cycles.flatMap((c) => c.placed);
    const k = computeKpis(world.store, [], Number(world.w.client.svm.getClock().unixTimestamp));
    expect(k.openings).toMatchObject({ total: 4, by_team: 0, by_others: 4 });
    expect(k.openings.paid_by_month.reduce((t, m) => t + m.paid, 0)).toBe(4);
    expect(k.all).toMatchObject({
      ...{ campaigns: 4, two_sided: 3, one_sided: 1, empty: 0 },
      ...{ ended_split: 1, ended_one_sided: 1, ended_refunded: 1, ended_empty: 0 },
      volume: bets.reduce((t, b) => t + b.amount, 0n).toString(),
    });
    expect(k.resolution).toEqual({
      ...{ resolved: 4, yes: 0, no: 3, void: { StaleFeed: 1 } },
      ...{ house_failures: 0, contested: 0, without_error: 4 },
    });
    const wallets = new Set(bets.map((b) => b.who.address)).size;
    expect(k.return_30d.returned).toBe(0); // each cycle has wallets of its own
    expect(k.return_30d.measured + k.return_30d.too_recent).toBe(wallets);
  });

  test("a partner report on the campaign in review: its sides, with no address", () => {
    const review = rowOf(world.cycles.review.campaign);
    const partners = [
      {
        ...{ partner: "example", name: "Example" },
        campaigns: [
          { id: String(review.id), opensAt: String(review.opens_at), highlightFrom: "0", highlightUntil: "3600" },
        ],
      },
    ];
    const text = reportText(partnerFigures(world.store, partners).campaigns[0], freshness(world.store));
    expect(text).toContain("Entries: 3 (YES 1, NO 2)");
    expect(text).toContain("Distinct wallets: 3 (YES 1, NO 2)");
    expect(text).toContain("Entered: 1.350000000 SOL (YES 0.250000000 SOL, NO 1.100000000 SOL)");
    expect(text).toContain("Ended one-sided: not finalized yet");
    expect(text).toContain("Warning: no team key opened this campaign");
    expect(text).not.toMatch(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
  });

  test("feed_history: the live BTC/USD account of the campaign in review, once per publish time", async () => {
    const recorder = createFeedRecorder(createSolanaRpc(world.chain.url), world.store, 10_000);
    expect(await recorder.record()).toEqual({ feeds: 1, written: 1, refused: [] });
    expect(await recorder.record()).toMatchObject({ written: 0 });
    const live = rawOf(world.w, P.BTC_USD_ACCOUNT);
    const reading = readPriceUpdate(live.owner, live.data, P.BTC_USD_FEED_ID);
    expect(world.store.db.query("SELECT * FROM feed_history").all()).toEqual([
      {
        ...{ feed_account: String(P.BTC_USD_ACCOUNT), publish_time: Number(reading.publishTime) },
        ...{ price: reading.price.toString(), conf: reading.conf.toString(), exponent: reading.exponent },
        posted_slot: Number(reading.postedSlot),
      },
    ]);
  });
});
