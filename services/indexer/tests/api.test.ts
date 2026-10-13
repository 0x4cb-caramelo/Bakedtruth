/**
 * Purpose: the indexer's read routes over a hand-built file (Sprint 08, slice 2), each answer checked against its
 *          schema in @brot/sdk/schemas (the contract): a campaign's activity in chain order, its split after each
 *          entry, the recent entries newest first, a wallet's sums and what reached it, the freshness a pending
 *          signature holds back, and every refusal (an unknown parameter, a bad address or number, an unknown campaign
 *          or opening, a write) as a JSON error that is never cached.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points), slice 2
 */
import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ApiErrorSchema,
  CampaignActivitySchema,
  ChanceSchema,
  RecentActivitySchema,
  WalletEntriesSchema,
} from "@brot/sdk/schemas";

import { handle } from "../src/api/routes";
import { openStore } from "../src/db/store";

const CAMPAIGN = "Vote111111111111111111111111111111111111111";
const BAKER = "Stake11111111111111111111111111111111111111";
const OTHER = "SysvarC1ock11111111111111111111111111111111";
const OPENER = "So11111111111111111111111111111111111111112";
const NOBODY = "SysvarRent111111111111111111111111111111111";
const sig = (c: string) => "5".repeat(87) + c;

const dir = mkdtempSync(join(tmpdir(), "brot-indexer-api-"));
const store = openStore(join(dir, "index.sqlite"));
afterAll(() => (store.close(), rmSync(dir, { recursive: true, force: true })));

const run = (sql: string, ...args: (string | number | null)[]) => store.db.query(sql).run(...args);
// Five transactions in chain order, then one listed and not read yet.
for (const [c, slot, ord, state] of [
  ["A", 100, 1, "done"],
  ["B", 110, 2, "done"],
  ["C", 110, 3, "done"],
  ["D", 120, 4, "done"],
  ["E", 130, 5, "done"],
  ["F", 140, 6, "pending"],
] as const)
  run("INSERT INTO signatures (signature, slot, ord, failed, state) VALUES (?, ?, ?, 0, ?)", sig(c), slot, ord, state);
run("INSERT INTO checkpoints (source, last_signature, last_slot) VALUES ('program', ?, 140)", sig("F"));
for (const [c, slot, ord, name, seq] of [
  ["A", 100, 1, "CampaignOpened", 0],
  ["B", 110, 2, "EntryAdded", 1],
  ["C", 110, 3, "EntryAdded", 2],
  ["D", 120, 4, "CampaignResolved", 3],
  ["E", 130, 5, "EntrySettled", 4],
] as const)
  run(
    `INSERT INTO events (signature, ix_index, inner_index, slot, ord, block_time, name, campaign, opening, seq, data, raw)
     VALUES (?, 0, 0, ?, ?, ?, ?, ?, 1, ?, '{}', 'x')`,
    sig(c),
    slot,
    ord,
    1_800_000_000 + slot,
    name,
    CAMPAIGN,
    seq,
  );
const entry = (
  c: string,
  slot: number,
  seq: number,
  baker: string,
  side: string,
  amount: string,
  y: string,
  n: string,
) =>
  run(
    `INSERT INTO entries (signature, ix_index, inner_index, campaign, opening, seq, baker, side, amount, is_first,
     is_creator, pool_yes_after, pool_no_after, slot, block_time) VALUES (?, 0, 0, ?, 1, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
    sig(c),
    CAMPAIGN,
    seq,
    baker,
    side,
    amount,
    seq === 1 ? 1 : 0,
    y,
    n,
    slot,
    1_800_000_000 + slot,
  );
entry("B", 110, 1, BAKER, "Yes", "3000000000", "3000000000", "0");
entry("C", 110, 2, OTHER, "No", "1000000000", "3000000000", "1000000000");
run(
  `INSERT INTO settlements (signature, ix_index, inner_index, campaign, opening, seq, recipient, role, paid, mode, slot,
   block_time) VALUES (?, 0, 0, ?, 1, 4, ?, 'baker', '3891000000', 'Split', 130, 1800000130)`,
  sig("E"),
  CAMPAIGN,
  BAKER,
);
run(
  `INSERT INTO campaigns VALUES (?, 1, '42', 'PriceTouch', 'Above', '00', ?, '150', '0', ?, 0, 100, 1, 1000, 100, '500',
   '4000000000', '11000000000', -8, '3600000000', '400000000', 'Paid', 'Yes', NULL, 'Split', '3000000000', '1000000000',
   2, 1800000100, 1800000500, 1800000600, NULL, 0, 4, 130, 1, NULL)`,
  CAMPAIGN,
  OPENER,
  OPENER,
);

const get = (path: string, method = "GET") =>
  handle(store, new Request(`http://127.0.0.1:4201${path}`, { method }), { corsOrigin: "*" });
const body = async (path: string) => {
  const res = get(path);
  expect(res.status).toBe(200);
  expect(res.headers.get("cache-control")).toContain("s-maxage=5");
  return res.json();
};

describe("the indexer's read routes", () => {
  test("a campaign's activity is every item in chain order, as the contract says", async () => {
    const a = CampaignActivitySchema.parse(await body(`/api/v1/campaigns/${CAMPAIGN}/activity`));
    expect(a.items.map((i) => (i.type === "event" ? i.name : i.type))).toEqual([
      "CampaignOpened",
      "entry",
      "entry",
      "CampaignResolved",
      "settlement",
    ]);
    expect(a).toMatchObject({ campaign: CAMPAIGN, opening: 1, as_of_slot: "139", chain_time: "1800000130" });
    expect(a.items[1]).toMatchObject({ baker: BAKER, side: "yes", amount: "3000000000", is_first: true });
  });

  test("the split after each entry, in basis points", async () => {
    const c = ChanceSchema.parse(await body(`/api/v1/campaigns/${CAMPAIGN}/chance?opening=1`));
    expect(c.points.map((p) => p.yes_bps)).toEqual([10_000, 7_500]);
  });

  test("the recent entries come newest first, as many as asked", async () => {
    const r = RecentActivitySchema.parse(await body("/api/v1/activity?limit=1"));
    expect(r.items.map((i) => i.baker)).toEqual([OTHER]);
    expect(RecentActivitySchema.parse(await body("/api/v1/activity")).items).toHaveLength(2);
  });

  test("a wallet's sides, its count and what reached it", async () => {
    const w = WalletEntriesSchema.parse(await body(`/api/v1/wallets/${BAKER}/entries`));
    expect(w.items).toEqual([
      expect.objectContaining({ id: "42", yes: "3000000000", no: "0", entries: 1, received: "3891000000" }),
    ]);
    expect(WalletEntriesSchema.parse(await body(`/api/v1/wallets/${NOBODY}/entries`)).items).toEqual([]);
  });

  test("every refusal is a JSON error, never cached", async () => {
    for (const [path, status, code] of [
      [`/api/v1/campaigns/${CAMPAIGN}/activity?page=2`, 400, "unknown_parameter"],
      ["/api/v1/campaigns/not-an-address/chance", 400, "bad_address"],
      [`/api/v1/campaigns/${CAMPAIGN}/chance?opening=0`, 400, "bad_parameter"],
      ["/api/v1/activity?limit=101", 400, "bad_parameter"],
      [`/api/v1/campaigns/${NOBODY}/activity`, 404, "not_found"],
      [`/api/v1/campaigns/${CAMPAIGN}/activity?opening=2`, 404, "not_found"],
      ["/api/v1/nothing", 404, "not_found"],
    ] as const) {
      const res = get(path);
      expect([path, res.status]).toEqual([path, status]);
      expect(res.headers.get("cache-control")).toBe("no-store");
      expect(ApiErrorSchema.parse(await res.json()).error.code).toBe(code);
    }
    expect(get("/api/v1/activity", "POST").status).toBe(405);
  });
});
