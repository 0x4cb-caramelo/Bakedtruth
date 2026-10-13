/**
 * Purpose: the KPIs and the partner report on a hand-built file (Sprint 08 DoD "Creator columns and KPIs", "The
 *          partner report"), no cluster: openings by team and by others, paid openings per month, two-sided, one-sided
 *          and empty campaigns and how they ended, the volume and its share, the one-sided share, the 30-day return,
 *          resolutions without error; each partner campaign's report (result, entries and wallets per side, SOL per
 *          side, one-sided or not) with no address in it, a missing campaign and one no team key opened said so; the
 *          export writes one file per partner campaign and prints the KPIs from a read-only open.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Partner } from "@brot/sdk/schemas";

import { openStore } from "../src/db/store";
import { writePartnerReports } from "../src/export";
import { computeKpis } from "../src/kpis";
import { partnerFigures, reportText } from "../src/partner-report";
import { addCampaign, addEntry, addEvent, AT, DAY, LAMPORTS, T0 } from "./rows";

const dir = mkdtempSync(join(tmpdir(), "brot-indexer-kpis-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));
const file = join(dir, "index.sqlite");
const store = openStore(file);
const W = (n: number) => AT(`W${n}`);
const at = (days: number, seconds = 0) => ({ block_time: T0 + days * DAY + seconds });
const SOL = LAMPORTS;

// A: a team key's partner campaign, two-sided, paid out (Split) and closed.
const A = addCampaign(store, { address: AT(2), id: "10", creator_is_team: 1, opening_paid_lamports: "0" });
addEntry(store, A, W(1), "Yes", SOL, at(0, 100));
addEntry(store, A, W(2), "No", 2n * SOL, at(0, 150));
addEntry(store, A, W(2), "No", SOL, at(0, 160));
addEntry(store, A, W(3), "Yes", SOL / 2n, at(0, 170));
store.db.run(
  "UPDATE campaigns SET status = 'Settled', outcome = 'No', settle_mode = 'Split', closed = 1 WHERE address = ?",
  [AT(2)],
);
// B: one-sided YES, refunded as one-sided. C: empty, finalized. D: next month, voided for a house failure.
const B = addCampaign(store, { address: AT(3), id: "11", outcome: "Yes", settle_mode: "OneSided", status: "Settling" });
addEntry(store, B, W(1), "Yes", SOL, at(0, 200));
const C = addCampaign(store, { address: AT(4), id: "12", outcome: "No", settle_mode: "Refund", status: "Settled" });
const D = addCampaign(store, { address: AT(5), id: "13", opens_at: T0 + 30 * DAY, outcome: "Void" });
store.db.run("UPDATE campaigns SET void_reason = 'TeamHouseFailure', settle_mode = 'Refund' WHERE address = ?", [
  AT(5),
]);
addEntry(store, D, W(4), "Yes", SOL, at(30, 10));
addEntry(store, D, W(1), "No", SOL, at(30, 20));
// E: two-sided, contested. F: one-sided, still open. G: two-sided, voided for a stale feed (an outside cause).
const E = addCampaign(store, { address: AT(6), id: "14", outcome: "No", status: "Contested" });
addEntry(store, E, W(5), "Yes", SOL, at(50));
addEntry(store, E, W(6), "No", SOL, at(50));
const F = addCampaign(store, { address: AT(7), id: "15" });
addEntry(store, F, W(7), "No", SOL, at(45));
const G = addCampaign(store, { address: AT(8), id: "16", outcome: "Void", settle_mode: "Refund" });
store.db.run("UPDATE campaigns SET void_reason = 'StaleFeed' WHERE address = ?", [AT(8)]);
addEntry(store, G, W(1), "Yes", SOL, at(31));
addEntry(store, G, W(2), "No", SOL, at(40));
for (const c of [A, B, C, D, E, G]) addEvent(store, c, "CampaignResolved");
addEvent(store, E, "ContestOpened");

const PARTNERS: Partner[] = [
  {
    partner: "example",
    name: "Example",
    campaigns: [
      { id: "10", opensAt: String(T0), highlightFrom: String(T0), highlightUntil: String(T0 + 3 * DAY) },
      { id: "99", opensAt: String(T0), highlightFrom: String(T0), highlightUntil: String(T0 + DAY) },
    ],
  },
  {
    partner: "paid",
    name: "Paid Project",
    campaigns: [{ id: "11", opensAt: String(T0), highlightFrom: String(T0), highlightUntil: String(T0 + DAY) }],
  },
];
const ADDRESS = /[1-9A-HJ-NP-Za-km-z]{32,44}/;

describe("the KPIs, without personal data", () => {
  const k = computeKpis(store, PARTNERS, T0 + 70 * DAY);

  test("openings by team and by others, and paid openings per UTC month", () => {
    expect(k.openings).toEqual({
      total: 7,
      by_team: 1,
      by_others: 6,
      paid_by_month: [
        { month: "2027-01", paid: 5 },
        { month: "2027-02", paid: 1 },
      ],
    });
  });

  test("two-sided, one-sided and empty; how they ended; the volume and its share; the one-sided share", () => {
    expect(k.all).toEqual({
      ...{ campaigns: 7, two_sided: 4, one_sided: 2, empty: 1 },
      ...{ ended_split: 1, ended_one_sided: 1, ended_refunded: 2, ended_empty: 1 },
      ...{ volume: String((25n * SOL) / 2n), volume_share_bps: 10_000 },
    });
    expect(k.by_others).toEqual({
      ...{ campaigns: 6, two_sided: 3, one_sided: 2, empty: 1 },
      ...{ ended_split: 0, ended_one_sided: 1, ended_refunded: 2, ended_empty: 1 },
      ...{ volume: String(8n * SOL), volume_share_bps: 6_400 },
    });
    expect(k.one_sided_share_bps).toBe(5_000);
  });

  test("the 30-day return: another campaign within 30 days of the first entry; young wallets apart", () => {
    // W1 came back (B after A); W2 only re-entered A, then G 40 days later; W3 and W4 never came back.
    expect(k.return_30d).toEqual({ measured: 4, returned: 1, return_bps: 2_500, too_recent: 3 });
  });

  test("resolved without error: never contested, not voided for a house failure", () => {
    expect(k.resolution).toEqual({
      ...{ resolved: 6, yes: 1, no: 3, void: { TeamHouseFailure: 1, StaleFeed: 1 } },
      ...{ house_failures: 1, contested: 1, without_error: 4 },
    });
  });

  test("each partner's volume and distinct wallets, and nothing in the KPIs is an address", () => {
    expect(k.partners).toEqual([
      { partner: "example", campaigns: 2, found: 1, entries: 4, wallets: 3, volume: String((9n * SOL) / 2n) },
      { partner: "paid", campaigns: 1, found: 1, entries: 1, wallets: 1, volume: String(SOL) },
    ]);
    expect(JSON.stringify(k)).not.toMatch(ADDRESS);
  });
});

describe("the partner report (4a)", () => {
  const asOf = { as_of_slot: "1234", chain_time: String(T0 + DAY) };
  const [a, missing, b] = partnerFigures(store, PARTNERS).campaigns.map((f) => reportText(f, asOf));

  test("result, entries and wallets per side, SOL per side, one-sided or not; never an address", () => {
    expect(a.split("\n").slice(0, 11)).toEqual([
      "Brot Markets: partner campaign report",
      "Partner: Example",
      "Campaign: #10, opened 2027-01-15 08:00:00 UTC",
      "Kind: PriceTouch",
      "Status: Settled (account closed after payout)",
      "Result: NO",
      "Ended one-sided: no",
      "Entries: 4 (YES 2, NO 2)",
      "Distinct wallets: 3 (YES 2, NO 1)",
      "Entered: 4.500000000 SOL (YES 1.500000000 SOL, NO 3.000000000 SOL)",
      "As of slot 1234 (chain time 2027-01-16 08:00:00 UTC), from the program's finalized events.",
    ]);
    for (const text of [a, missing, b]) expect(text).not.toMatch(ADDRESS);
  });

  test("a campaign the file does not hold, and one no team key opened, are said so", () => {
    expect(missing).toContain("Not found in the indexer's file");
    expect(b).toContain("Ended one-sided: yes");
    expect(b).toContain("Warning: no team key opened this campaign (P-3)");
  });

  test("the export writes one file per partner campaign, and prints the KPIs from a read-only open", async () => {
    const out = join(dir, "reports");
    expect(writePartnerReports(store, PARTNERS, out)).toEqual([
      `example-10-${T0}.txt`,
      `example-99-${T0}.txt`,
      `paid-11-${T0}.txt`,
    ]);
    expect(readdirSync(out).sort()).toHaveLength(3);
    expect(readFileSync(join(out, `example-10-${T0}.txt`), "utf8")).toContain("Distinct wallets: 3");
    const partnersFile = join(dir, "partners.json");
    await Bun.write(partnersFile, JSON.stringify(PARTNERS));
    const run = Bun.spawnSync([
      process.execPath,
      join(import.meta.dir, "../src/export.ts"),
      "kpis",
      file,
      partnersFile,
    ]);
    expect(run.exitCode).toBe(0);
    expect(JSON.parse(run.stdout.toString())).toMatchObject({ openings: { total: 7 }, resolution: { resolved: 6 } });
  });
});
