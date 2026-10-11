/**
 * Purpose: the indexer's read routes over whole cycles in LiteSVM (Sprint 08, slice 2): every answer passes its schema
 *          in @brot/sdk/schemas on real chain data; each live campaign's split ends at its account's pools and its
 *          activity opens with `CampaignOpened` and holds each entry once; each baker's wallet entries are its own
 *          entries, with what reached it equal to its settlement rows; the recent entries are the last cycle's,
 *          newest first. Filter: `bun test tests/indexer`.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points), slice 2
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { decodeCampaign } from "@brot/sdk/read";
import {
  CampaignActivitySchema,
  ChanceSchema,
  RecentActivitySchema,
  WalletEntriesSchema,
  type EntryItem,
} from "@brot/sdk/schemas";

import { handle } from "../../services/indexer/src/api/routes";
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
