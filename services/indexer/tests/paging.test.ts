/**
 * Purpose: the paged lists of the indexer's read routes (Sprint 08: no answer may reach the read API's 1 MB cap), on a
 *          hand-built file where one transaction carries three entries and two transactions share a slot: a campaign's
 *          activity and chance walk back by `seq`, a wallet's entries by its first entry's place; every page passes its
 *          schema; an exact page and the last page end with `next_before` null; pages never repeat or skip an item,
 *          ties within one slot included; `limit` defaults to 100 and takes 1 to 500; a bad cursor is a 400.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { describe, expect, test } from "bun:test";
import { ApiErrorSchema, CampaignActivitySchema, ChanceSchema, WalletEntriesSchema } from "@brot/sdk/schemas";

import { handle } from "../src/api/routes";
import { openStore } from "../src/db/store";
import { addCampaign, AT, SIGN } from "./rows";

const store = openStore(":memory:");
const C = AT(2);
const W = AT("W");
const run = (sql: string, ...args: (string | number | null)[]) => store.db.query(sql).run(...args);
let ord = 0;
/** One event row of campaign `at`, its signature listed at `slot`. */
function event(
  at: string,
  sig: string,
  slot: number,
  ix: number,
  inner: number,
  name: string,
  seq: number,
  opening = 1,
) {
  run(
    "INSERT OR IGNORE INTO signatures (signature, slot, ord, failed, state) VALUES (?, ?, ?, 0, 'done')",
    sig,
    slot,
    ++ord,
  );
  run(
    `INSERT INTO events (signature, ix_index, inner_index, slot, ord, block_time, name, campaign, opening, seq, data, raw)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', 'x')`,
    ...[sig, ix, inner, slot, ord, 1_800_000_000 + slot, name, at, opening, seq],
  );
}
function entry(
  at: string,
  sig: string,
  slot: number,
  ix: number,
  inner: number,
  seq: number,
  baker: string,
  opening = 1,
) {
  event(at, sig, slot, ix, inner, "EntryAdded", seq, opening);
  run(
    `INSERT INTO entries (signature, ix_index, inner_index, campaign, opening, seq, baker, side, amount, is_first,
     is_creator, pool_yes_after, pool_no_after, slot, block_time) VALUES (?, ?, ?, ?, ?, ?, ?, 'Yes', '1000', 0, 0,
     ?, '0', ?, ?)`,
    ...[sig, ix, inner, at, opening, seq, baker, String(1_000 * seq), slot, 1_800_000_000 + slot],
  );
}

// Campaign C: seq 0 opens it; one transaction at slot 200 holds seq 1 to 3; another at slot 200 holds seq 4; then a
// resolution and a settlement.
addCampaign(store, { address: C, id: "2" });
event(C, SIGN("open"), 100, 0, 0, "CampaignOpened", 0);
for (const inner of [0, 1, 2]) entry(C, SIGN("three"), 200, 1, inner, 1 + inner, AT(3));
entry(C, SIGN("fourth"), 200, 0, 0, 4, AT(4));
event(C, SIGN("resolve"), 300, 0, 0, "CampaignResolved", 5);
event(C, SIGN("settle"), 400, 0, 0, "EntrySettled", 6);
run(
  `INSERT INTO settlements (signature, ix_index, inner_index, campaign, opening, seq, recipient, role, paid, mode, slot,
   block_time) VALUES (?, 0, 0, ?, 1, 6, ?, 'baker', '1900', 'Split', 400, 1800000400)`,
  ...[SIGN("settle"), C, AT(3)],
);

const get = async (path: string) => {
  const res = handle(store, new Request(`http://127.0.0.1:4201${path}`), { corsOrigin: "*" });
  return { status: res.status, body: (await res.json()) as unknown };
};
const seqs = (items: { seq: string | null }[]) => items.map((i) => Number(i.seq));

/** Every page of `path` from the newest, each parsed by `parse`; the items of each, as `pick` lists them. */
async function walk<T>(
  path: string,
  parse: (body: unknown) => T & { next_before: string | null },
  pick: (p: T) => number[],
) {
  const pages: number[][] = [];
  let before: string | null = null;
  do {
    const sep = path.includes("?") ? "&" : "?";
    const { status, body } = await get(before === null ? path : `${path}${sep}before=${before}`);
    expect(status).toBe(200);
    const page = parse(body);
    pages.push(pick(page));
    before = page.next_before;
  } while (before !== null && pages.length < 20);
  return pages;
}

describe("a campaign's activity and chance, by seq", () => {
  test("pages walk back to the opening; each oldest first; ties within one slot never repeat or skip", async () => {
    const activity = (p: string) =>
      walk(
        p,
        (b) => CampaignActivitySchema.parse(b),
        (a) => seqs(a.items),
      );
    expect(await activity(`/api/v1/campaigns/${C}/activity?limit=3`)).toEqual([[4, 5, 6], [1, 2, 3], [0]]);
    expect(await activity(`/api/v1/campaigns/${C}/activity?limit=2`)).toEqual([[5, 6], [3, 4], [1, 2], [0]]);
    // An exact page: everything, and no page before it. The default page holds 100.
    expect(await activity(`/api/v1/campaigns/${C}/activity?limit=7`)).toEqual([[0, 1, 2, 3, 4, 5, 6]]);
    expect(await activity(`/api/v1/campaigns/${C}/activity`)).toEqual([[0, 1, 2, 3, 4, 5, 6]]);
    const chance = (p: string) =>
      walk(
        p,
        (b) => ChanceSchema.parse(b),
        (c) => seqs(c.points),
      );
    expect(await chance(`/api/v1/campaigns/${C}/chance?limit=3`)).toEqual([[2, 3, 4], [1]]);
    expect(await chance(`/api/v1/campaigns/${C}/chance?limit=4`)).toEqual([[1, 2, 3, 4]]);
    const one = ChanceSchema.parse((await get(`/api/v1/campaigns/${C}/chance?limit=1&opening=1&before=3`)).body);
    expect([seqs(one.points), one.next_before]).toEqual([[2], "2"]);
  });

  test("a cursor past the start gives an empty last page; limit takes 1 to 500; a bad cursor is a 400", async () => {
    const empty = CampaignActivitySchema.parse((await get(`/api/v1/campaigns/${C}/activity?before=0`)).body);
    expect([empty.items, empty.next_before]).toEqual([[], null]);
    expect((await get(`/api/v1/campaigns/${C}/chance?limit=500`)).status).toBe(200);
    for (const query of [
      "limit=0",
      "limit=501",
      "before=abc",
      "before=-1",
      "before=1.5",
      "before=",
      "limit=10&cursor=1",
    ]) {
      for (const tail of ["activity", "chance"]) {
        const { status, body } = await get(`/api/v1/campaigns/${C}/${tail}?${query}`);
        expect([query, tail, status]).toEqual([query, tail, 400]);
        ApiErrorSchema.parse(body);
      }
    }
  });
});

describe("a wallet's entries, by its first entry's place", () => {
  // Five openings: one at slot 100, three whose first entries share slot 200 (two in one transaction), one at 300.
  const [low, high] = [SIGN("wa"), SIGN("wb")].sort();
  const campaigns = [AT(5), AT(6), AT(7), AT(8), AT(9)];
  campaigns.forEach((at, i) => addCampaign(store, { address: at, id: String(10 + i) }));
  entry(AT(5), SIGN("w1"), 100, 0, 0, 1, W);
  entry(AT(6), low, 200, 0, 0, 1, W);
  entry(AT(7), low, 200, 1, 0, 1, W);
  entry(AT(8), high, 200, 0, 0, 1, W);
  entry(AT(9), SIGN("w5"), 300, 0, 0, 1, W);
  entry(AT(6), SIGN("w6"), 500, 0, 0, 2, W); // a later entry keeps its opening's place

  test("newest first; ties in one slot by signature, then instruction; the last page ends with null", async () => {
    const pages = (p: string) =>
      walk(
        p,
        (b) => WalletEntriesSchema.parse(b),
        (w) => w.items.map((i) => campaigns.indexOf(i.campaign)),
      );
    const order = [4, 3, 2, 1, 0]; // AT(9), AT(8) (the higher signature), AT(7) (instruction 1), AT(6), AT(5)
    expect(await pages(`/api/v1/wallets/${W}/entries?limit=2`)).toEqual([order.slice(0, 2), order.slice(2, 4), [0]]);
    expect(await pages(`/api/v1/wallets/${W}/entries?limit=5`)).toEqual([order]);
    expect(await pages(`/api/v1/wallets/${W}/entries`)).toEqual([order]);
    const first = WalletEntriesSchema.parse((await get(`/api/v1/wallets/${W}/entries?limit=4`)).body);
    expect(first.next_before).toBe(`200:${low}:0:0`);
    expect(first.items.find((i) => i.campaign === AT(6))).toMatchObject({
      entries: 2,
      first_slot: "200",
      last_slot: "500",
    });
  });

  test("a bad cursor or limit is a 400", async () => {
    for (const query of ["before=123", "before=200:short:0:0", `before=200:${low}:0`, "limit=0", "limit=501"]) {
      const { status, body } = await get(`/api/v1/wallets/${W}/entries?${query}`);
      expect([query, status]).toEqual([query, 400]);
      ApiErrorSchema.parse(body);
    }
  });
});
