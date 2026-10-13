/**
 * Purpose: the home page's order (Sprint 08 DoD "Ranking and listing", X1.9) with no cluster: a partner campaign
 *          first during its highlight, only when a team key opened it, and listed while it lasts; then two-sided,
 *          one-sided and empty campaigns, more entries first, then the sooner close; no entry 24 hours after opening
 *          unlists a campaign, which ranks after every listed one; no input a creator can pay for moves a campaign (the
 *          prize, the opening payment, the amounts, the creator's own entries); a closed campaign has no rank; and the
 *          `/api/v1/ranking` route over the written rows, with its filters, its contract and its refusals.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { describe, expect, test } from "bun:test";
import type { Partner } from "@brot/sdk/schemas";
import { ApiErrorSchema, RankingSchema } from "@brot/sdk/schemas";

import { handle } from "../src/api/routes";
import { openStore } from "../src/db/store";
import { orderCampaigns, writeRanking, type RankRow } from "../src/ranking";
import { addCampaign, addEntry, AT, DAY, LAMPORTS, T0 } from "./rows";

const row = (n: number, over: Partial<RankRow> = {}): RankRow => ({
  ...{ address: AT(n), opening: 1, id: String(n), opens_at: T0, entries_close_at: T0 + 10 * DAY },
  ...{ creator_is_team: 0, yes: 0, no: 0 },
  ...over,
});
const partner = (id: string, from = T0, until = T0 + 3 * DAY): Partner => ({
  partner: "example",
  name: "Example",
  campaigns: [{ id, opensAt: String(T0), highlightFrom: String(from), highlightUntil: String(until) }],
});
const order = (rows: RankRow[], partners: Partner[], now: number) =>
  orderCampaigns(rows, partners, now).map((p) => [p.address, p.group, p.listed]);

describe("the ranking (X1.9)", () => {
  test("a partner campaign leads during its highlight, empty and listed, only when a team key opened it", () => {
    const rows = [row(2, { yes: 5, no: 5 }), row(3, { creator_is_team: 1 }), row(4, { yes: 1 })];
    const during = T0 + 2 * DAY;
    expect(order(rows, [partner("3")], during)).toEqual([
      [AT(3), "highlight", true],
      [AT(2), "two_sided", true],
      [AT(4), "one_sided", true],
    ]);
    expect(orderCampaigns(rows, [partner("3")], during)[0]).toMatchObject({
      partner: "example",
      highlightUntil: T0 + 3 * DAY,
    });
    // After the 72 hours it is an empty campaign like any other, and unlisted (no entry after 24 hours).
    expect(order(rows, [partner("3")], T0 + 3 * DAY).at(-1)).toEqual([AT(3), "empty", false]);
    // A paid creator's campaign named in the partners file is never highlighted.
    const paid = [row(2, { yes: 5, no: 5 }), row(3)];
    expect(order(paid, [partner("3")], during)[0]).toEqual([AT(2), "two_sided", true]);
    // Before its window, nothing either.
    expect(order(rows, [partner("3", T0 + DAY)], T0 + 100)[0]).toEqual([AT(2), "two_sided", true]);
  });

  test("two-sided, then one-sided, then empty; more entries first, then the sooner its entries close", () => {
    const rows = [
      row(2),
      row(3, { yes: 2 }),
      row(4, { yes: 1, no: 1 }),
      row(5, { yes: 3, no: 2 }),
      row(6, { yes: 1, no: 1, entries_close_at: T0 + DAY }),
      row(7, { no: 4 }),
    ];
    expect(orderCampaigns(rows, [], T0 + 60).map((p) => [p.address, p.rank])).toEqual([
      [AT(5), 1],
      [AT(6), 2],
      [AT(4), 3],
      [AT(7), 4],
      [AT(3), 5],
      [AT(2), 6],
    ]);
  });

  test("no entry 24 hours after opening unlists a campaign; it ranks after every listed one", () => {
    const rows = [row(2, { opens_at: T0 - DAY }), row(3, { opens_at: T0 }), row(4, { yes: 1, opens_at: T0 - DAY })];
    expect(order(rows, [], T0 - 1).map((r) => r[2])).toEqual([true, true, true]);
    expect(order(rows, [], T0)).toEqual([
      [AT(4), "one_sided", true],
      [AT(3), "empty", true],
      [AT(2), "empty", false],
    ]);
    expect(order(rows, [], T0 + DAY).map((r) => r[2])).toEqual([true, false, false]);
  });

  test("nothing a creator can pay for moves a campaign: the prize, the payment, the amounts, its own entries", () => {
    const build = (rich: boolean) => {
      const store = openStore(":memory:");
      const big = rich ? { prize_lamports: "900000000000", opening_paid_lamports: "1000000000000" } : {};
      const a = addCampaign(store, { address: AT(2), id: "2", opens_at: T0 - 2 * DAY, ...big });
      const b = addCampaign(store, { address: AT(3), id: "3", opens_at: T0 - 2 * DAY });
      addEntry(store, b, AT(5), "Yes", LAMPORTS);
      addEntry(store, a, AT(6), "Yes", rich ? 100n * LAMPORTS : LAMPORTS);
      if (rich) {
        // The creator's own wallet enters both sides of its campaign, many times: still one-sided, one entry.
        for (const side of ["Yes", "No", "No"] as const)
          addEntry(store, a, a.creator, side, LAMPORTS, { is_creator: 1 });
        // And its own entry does not keep an empty campaign listed.
        const c = addCampaign(store, { address: AT(4), id: "4", opens_at: T0 - 2 * DAY });
        addEntry(store, c, c.creator, "Yes", LAMPORTS, { is_creator: 1 });
      }
      const placed = writeRanking(store, [], T0);
      store.close();
      return placed.filter((p) => p.address !== AT(4)).map((p) => [p.address, p.rank, p.group, p.listed]);
    };
    expect(build(true)).toEqual(build(false));
    const store = openStore(":memory:");
    const c = addCampaign(store, { address: AT(4), id: "4", opens_at: T0 - 2 * DAY });
    addEntry(store, c, c.creator, "Yes", LAMPORTS, { is_creator: 1 });
    expect(writeRanking(store, [], T0)[0]).toMatchObject({ group: "empty", listed: false });
  });

  test("written to the rows: a closed campaign has no rank; the route pages, filters and refuses", async () => {
    const store = openStore(":memory:");
    const a = addCampaign(store, { address: AT(2), id: "2" });
    addCampaign(store, { address: AT(3), id: "3", opens_at: T0 - 2 * DAY });
    addCampaign(store, { address: AT(4), id: "4", closed: 1, status: "Settled" });
    addEntry(store, a, AT(6), "No", LAMPORTS);
    writeRanking(store, [], T0 + 60);
    const ranks = store.db.query("SELECT address, rank, listed FROM campaigns ORDER BY address").all();
    expect(ranks).toEqual([
      { address: AT(2), rank: 1, listed: 1 },
      { address: AT(3), rank: 2, listed: 0 },
      { address: AT(4), rank: null, listed: null },
    ]);
    const get = (path: string) => handle(store, new Request(`http://127.0.0.1:4201${path}`), { corsOrigin: "*" });
    const all = RankingSchema.parse(await get("/api/v1/ranking").json());
    expect(all).toMatchObject({ total: 2, offset: 0, limit: 50 });
    expect(all.items.map((i) => [i.campaign, i.rank, i.listed])).toEqual([
      [AT(2), 1, true],
      [AT(3), 2, false],
    ]);
    const unlisted = RankingSchema.parse(await get("/api/v1/ranking?listed=false&limit=1").json());
    expect([unlisted.total, unlisted.items.map((i) => i.id)]).toEqual([1, ["3"]]);
    expect(RankingSchema.parse(await get("/api/v1/ranking?offset=1").json()).items.map((i) => i.id)).toEqual(["3"]);
    for (const [path, code] of [
      ["/api/v1/ranking?listed=yes", "bad_parameter"],
      ["/api/v1/ranking?limit=0", "bad_parameter"],
      ["/api/v1/ranking?sort=pot", "unknown_parameter"],
    ] as const) {
      const res = get(path);
      expect([path, res.status, ApiErrorSchema.parse(await res.json()).error.code]).toEqual([path, 400, code]);
    }
    store.close();
  });
});
