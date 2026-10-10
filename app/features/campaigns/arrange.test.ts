/**
 * Purpose: the list's rules: the ranking order, the state, kind and search filters, the saved filter, the unlisted switch,
 *          the sorts, and the empty pot's chance (none).
 * Version: 0.1.0
 * Sprint:  10 (site: campaign list)
 */
import { describe, expect, test } from "bun:test";

import type { Card } from "./model";
import { arrange, DEFAULT_FILTERS, type Filters } from "./arrange";

const card = (over: Partial<Card> & { address: string }): Card => ({
  id: over.address,
  kind: "PriceTouch",
  state: "open",
  title: `campaign ${over.address}`,
  asset: "BTC/USD",
  creator: "creator",
  creatorIsTeam: true,
  potLamports: 0n,
  yesLamports: 0n,
  noLamports: 0n,
  prizeLamports: 0n,
  yesShare: null,
  entries: 0,
  group: 2,
  listed: true,
  opensAt: null,
  entriesCloseAt: null,
  deadlineAt: null,
  reviewEndsAt: null,
  chip: "open",
  stateLine: null,
  estYesBps: null,
  estNoBps: null,
  ...over,
});

const NONE = new Set<string>();
const f = (over: Partial<Filters>): Filters => ({ ...DEFAULT_FILTERS, ...over });
const addresses = (cards: Card[]) => cards.map((c) => c.address);

describe("ranking", () => {
  const cards = [
    card({ address: "empty", group: 2 }),
    card({ address: "one", group: 1, entries: 9 }),
    card({ address: "two-few", group: 0, entries: 1, entriesCloseAt: 200n }),
    card({ address: "two-many-late", group: 0, entries: 5, entriesCloseAt: 300n }),
    card({ address: "two-many-soon", group: 0, entries: 5, entriesCloseAt: 100n }),
  ];

  test("two-sided first, by entries, then by time left; one-sided next; empty last", () => {
    expect(addresses(arrange(cards, DEFAULT_FILTERS, NONE))).toEqual([
      "two-many-soon",
      "two-many-late",
      "two-few",
      "one",
      "empty",
    ]);
  });

  test("the pot sort is by pot, largest first; the close sort is by entries close, soonest first", () => {
    const pots = [card({ address: "small", potLamports: 1n }), card({ address: "big", potLamports: 9n })];
    expect(addresses(arrange(pots, f({ sort: "pot" }), NONE))).toEqual(["big", "small"]);
    expect(addresses(arrange(cards, f({ sort: "close" }), NONE))[0]).toBe("two-many-soon");
  });

  test("the chance sort puts an empty pot (no chance) last", () => {
    const sides = [
      card({ address: "none" }),
      card({ address: "yes", yesShare: 0.7 }),
      card({ address: "even", yesShare: 0.5 }),
    ];
    expect(addresses(arrange(sides, f({ sort: "chance" }), NONE))).toEqual(["yes", "even", "none"]);
  });
});

describe("filters", () => {
  const cards = [
    card({ address: "a", state: "open", kind: "PriceTouch", title: "BTC/USD reaches 90,000" }),
    card({ address: "b", state: "paid", kind: "SupplyAtMost", title: "Supply campaign bbbb" }),
    card({ address: "c", state: "in_review", kind: "PriceTouch", listed: false, asset: "SOL/USD" }),
  ];

  test("the state and kind filters", () => {
    expect(addresses(arrange(cards, f({ state: "paid" }), NONE))).toEqual(["b"]);
    expect(addresses(arrange(cards, f({ kind: "PriceTouch" }), NONE))).toEqual(["a"]);
  });

  test("search reads the title, the asset and the address", () => {
    expect(addresses(arrange(cards, f({ query: "90,000" }), NONE))).toEqual(["a"]);
    expect(addresses(arrange(cards, f({ query: "sol/usd", showUnlisted: true }), NONE))).toEqual(["c"]);
  });

  test("unlisted campaigns stay hidden until the switch is on", () => {
    expect(addresses(arrange(cards, DEFAULT_FILTERS, NONE))).not.toContain("c");
    expect(addresses(arrange(cards, f({ showUnlisted: true }), NONE))).toContain("c");
  });

  test("saved shows only the saved addresses", () => {
    expect(addresses(arrange(cards, f({ state: "saved", showUnlisted: true }), new Set(["b"])))).toEqual(["b"]);
  });
});
