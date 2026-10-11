/**
 * Purpose: the creation box's search as a search bar (the UI overhaul, the approved prototype's open-slots.js): what a
 *          person types becomes campaigns the chain can check. A direction ("falls to", "reaches"), a deadline ("in 30
 *          days", "2 weeks") and a target with "k" or "m" are read; with the feeds' live prices a target already met is
 *          never offered (the program refuses one), a bare number finds the feeds priced near it, an empty box starts
 *          with examples, and a feed without a fresh price says so. Each suggestion's sentence is template v1's, with
 *          the target in the kind's unit and a reviewed name in place of the address. Filter:
 *          `bun test tests/ -t "open campaign search"`.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign), in the UI overhaul
 */
import { describe, expect, test } from "bun:test";

import { bytesToHex } from "@brot/sdk/read";

import { parseNames } from "../../app/features/open-campaign/names";
import { search, type FeedSource, type Suggestion } from "../../app/features/open-campaign/search";
import { suggestionParts } from "../../app/features/open-campaign/suggestion-text";
import * as P from "../brot/program";

const BTC = bytesToHex(P.BTC_USD_FEED_ID);
const ETH = "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
const SOL = "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
const JUP = "0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996";
const INF = "f51570985c642c49c2d6e50156390fdba80bb6d5f7fa389d2f012ced4f7d208f";
const MINT = "So11111111111111111111111111111111111111112";
const LIVE: FeedSource[] = [
  { hex: BTC, symbol: "BTC/USD", usable: true, price: 83_000 },
  { hex: ETH, symbol: "ETH/USD", usable: true, price: 2_600 },
  { hex: SOL, symbol: "SOL/USD", usable: true, price: 109 },
  { hex: JUP, symbol: "JUP/USD", usable: false, price: null },
  { hex: INF, symbol: "INF/USD", usable: true, price: 160 },
];
const names = parseNames(JSON.stringify([{ address: MINT, kind: "burn", name: "CRMB" }]));
const find = (query: string) => search(query, { feeds: LIVE, names });
const first = (query: string) => find(query).items[0];
const said = (s: Suggestion) =>
  suggestionParts(s)
    .map((p) => (typeof p === "string" ? p : (p.value ?? "…")))
    .join("");

describe("open campaign search", () => {
  test("a direction, a deadline and a target with k or m are read from what is typed", () => {
    const sol = { kind: "price" as const, feedHex: SOL, feedSymbol: "SOL/USD" };
    expect(first("SOL falls to 90")).toEqual({ ...sol, target: "90", direction: "below" });
    expect(first("BTC 120k in 30 days")).toEqual({
      kind: "price",
      feedHex: BTC,
      feedSymbol: "BTC/USD",
      target: "120000",
      direction: "above",
      days: 30,
    });
    expect(first("bitcoin 1.5m").target).toBe("1500000");
    expect(first("solana 2 weeks").days).toBe(14);
    // The deadline stays inside the program's 3 to 90 days.
    expect(first("SOL 150 in 1 day").days).toBe(3);
    expect(first("SOL 150 in 6 months").days).toBe(90);
    // "in" and "to" join the sentence: they find neither INF/USD nor the burn kind's "token".
    expect(find("BTC 120k in 30 days").items.map((s) => s.feedSymbol ?? s.kind)).toEqual(["BTC/USD"]);
    expect(find("SOL falls to 90").items.map((s) => s.feedSymbol ?? s.kind)).toEqual(["SOL/USD"]);
  });

  test("with a live price, a target already met is never offered: the far side of the price reads one way", () => {
    // BTC is at 83,000: "reaches 50,000" is met already, so the only campaign at 50,000 is a fall to it.
    expect(first("BTC reaches 50000").direction).toBe("below");
    expect(first("SOL falls to 150").direction).toBe("above");
    expect(first("BTC 120000").direction).toBe("above");
    // Without a price read yet, the person's own direction stands, and no direction when none was said.
    const unread = search("SOL falls to 90", { feeds: [{ hex: SOL, symbol: "SOL/USD" }], names });
    expect(unread.items[0].direction).toBe("below");
    expect(
      search("BTC 120000", { feeds: [{ hex: BTC, symbol: "BTC/USD" }], names }).items[0].direction,
    ).toBeUndefined();
  });

  test("a bare number, or a price word, finds the fresh feeds priced near it, closest first", () => {
    expect(find("120000").items.map((s) => s.feedSymbol)).toEqual(["BTC/USD"]);
    expect(find("120000").items[0]).toMatchObject({ target: "120000", direction: "above" });
    // SOL (109) and INF (160) are both within three times 100; SOL is closer.
    expect(find("falls to 100").items.map((s) => [s.feedSymbol, s.direction])).toEqual([
      ["SOL/USD", "below"],
      ["INF/USD", "below"],
    ]);
    // A price word alone offers the fresh feeds with example targets, never the stale JUP.
    expect(find("price").items.map((s) => s.feedSymbol)).toEqual(["BTC/USD", "SOL/USD", "ETH/USD"]);
  });

  test("an empty box starts with examples a fair way off the price, best-known assets first, then every kind", () => {
    const { outside, items } = find("");
    expect(outside).toBe(false);
    expect(items.slice(0, 3).map((s) => [s.feedSymbol, s.target, s.direction, s.example])).toEqual([
      ["BTC/USD", "100000", "above", true],
      ["SOL/USD", "140", "above", true],
      ["ETH/USD", "3300", "above", true],
    ]);
    expect(items.slice(3).map((s) => s.kind)).toEqual(["price", "burn", "lock", "pool", "stake"]);
    expect(first("SOL falls").target).toBe("93");
    // A tiny price is written out, never as "1.5e-7", which the target field refuses.
    const tiny = search("BONK", { feeds: [{ hex: JUP, symbol: "BONK/USD", usable: true, price: 1.2e-7 }], names });
    expect(tiny.items[0].target).toBe("0.00000015");
  });

  test("a feed without a fresh price is still found, and flagged", () => {
    expect(first("JUP 2")).toEqual({ kind: "price", feedHex: JUP, feedSymbol: "JUP/USD", target: "2", stale: true });
    expect(find("").items.some((s) => s.feedHex === JUP)).toBe(false);
  });

  test("the suggestions come grouped by kind, the order the list shows and the arrows walk", () => {
    const kinds = find("pool").items.map((s) => s.kind);
    expect(kinds).toEqual(["lock", "pool"]);
    const mixed = find("burn 1m").items;
    expect(mixed.map((s) => [s.kind, s.target])).toEqual([["burn", "1000000"]]);
    const named = find("crmb 5000").items[0];
    expect(named).toEqual({ kind: "burn", account: MINT, name: "CRMB", target: "5000" });
  });

  test("each suggestion says the campaign it would start, in template v1, the target in the kind's unit", () => {
    expect(said(first("SOL falls to 90"))).toBe("SOL/USD falls to $90");
    expect(said(first("BTC 120k"))).toBe("BTC/USD reaches $120,000");
    expect(said({ kind: "price", feedHex: SOL, target: "0.85", direction: "above" })).toBe("SOL/USD reaches $0.85");
    expect(said({ kind: "burn", account: MINT, name: "CRMB", target: "1000000" })).toBe(
      "CRMB supply falls to 1,000,000 raw units",
    );
    // The SOL kinds take SOL and store lamports; the empty slots are "…".
    expect(said({ kind: "pool", target: "1.5" })).toBe("Stake pool … holds at least 1.5 SOL at the start of epoch …");
    // Raw units are whole: a fraction leaves the target empty rather than rounding it.
    expect(said({ kind: "burn", target: "1.5" })).toBe("… supply falls to … raw units");
    expect(said({ kind: "price" })).toBe("… reaches …");
  });
});
