/**
 * Purpose: the creation box's pure pieces (Sprint 19): one sentence template per kind (template v1, the same function
 *          every page uses); the slots parsed exactly into the SDK's `OpeningChoice` (no float between the text and the
 *          bigint, a comma only as a thousands group, no more precision than the sentence prints); the quick deadlines
 *          inside the program's bounds; a team key's free opening; the prefill a link may carry (never the amount) and
 *          what it drops; the typeahead's search; the reviewed names file, the committed one included; the US$ split
 *          of the opening's terms. Filter: `bun test tests/ -t "open campaign box"`.
 * Version: 0.2.0 (the Sprint 19 reviews)
 * Sprint:  19 (site: open a campaign)
 */
import { describe, expect, test } from "bun:test";

import { bytesToHex, Direction, ReaderKind } from "@brot/sdk/read";

import { sentenceOf } from "../../app/features/campaigns/sentence";
import {
  choiceOf,
  daysFrom,
  EMPTY_DRAFT,
  LAND_MARGIN_SECONDS,
  parseScaled,
  parseTarget,
  resolveDeadline,
} from "../../app/features/open-campaign/draft";
import { TEMPLATES, templateById } from "../../app/features/open-campaign/kinds";
import { loadNames, parseNames } from "../../app/features/open-campaign/names";
import { prefillOf } from "../../app/features/open-campaign/prefill";
import { usdSplit, usdText } from "../../app/features/open-campaign/quote";
import { search } from "../../app/features/open-campaign/search";
import * as P from "../brot/program";

const BTC = bytesToHex(P.BTC_USD_FEED_ID);
const MINT = "So11111111111111111111111111111111111111112";
const FEEDS = [
  { hex: BTC, symbol: "BTC/USD" },
  { hex: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", symbol: "SOL/USD" },
];
const at = (kind: string, target: string, direction = "Above", epoch?: string | null) =>
  sentenceOf({ kind, direction, feedIdHex: BTC, target, priceExponent: -8, metricAccount: MINT, epoch });

describe("open campaign box: templates and slots", () => {
  test("one sentence template per kind, from the stored fields only", () => {
    expect(at("PriceTouch", "12000000000000")).toBe("BTC/USD reaches 120,000");
    expect(at("PriceTouch", "5000000000000", "Below")).toBe("BTC/USD falls to 50,000");
    // Burn and lock targets are raw units, said so (the copy review, M8); the epoch kinds name their epoch (S6).
    expect(at("SupplyAtMost", "812400000000000")).toBe("So11…1112 supply falls to 812,400,000,000,000 raw units");
    expect(at("DammV2LockedAtLeast", "340282366920938463463374607431768211455")).toBe(
      "Meteora pool So11…1112 reaches 340,282,366,920,938,463,463,374,607,431,768,211,455 liquidity units locked for good",
    );
    expect(at("StakePoolTvlAtLeast", "431880500000000", "Above", "812")).toBe(
      "Stake pool So11…1112 holds at least 431,880.5 SOL at the start of epoch 812",
    );
    expect(at("StakeAtLeast", "958310000000000", "Above", "812")).toBe(
      "Validator So11…1112 has at least 958,310 SOL staked in epoch 812",
    );
    // A field not filled in yet shows as its name in brackets, never a question mark (S8).
    expect(at("StakePoolTvlAtLeast", "431880500000000", "Above", null)).toBe(
      "Stake pool So11…1112 holds at least 431,880.5 SOL at the start of epoch (epoch)",
    );
    expect(TEMPLATES.map((t) => t.readerKind)).toEqual([0, 1, 2, 3, 4]);
    expect(templateById("validator-stake")?.opens).toBe("after-devnet-yes");
  });

  test("numbers are parsed as text, exactly, in the kind's unit", () => {
    expect(parseScaled("120000.12345678", 8)).toBe(12_000_012_345_678n);
    expect(parseScaled("120,000", 8)).toBe(12_000_000_000_000n);
    expect(parseScaled("0.1", 9)).toBe(100_000_000n);
    expect(parseScaled("1.0000000001", 9)).toBeNull();
    for (const bad of ["-1", "1e5", "", ".5", "0x10", "1.2.3", "Infinity"]) expect(parseScaled(bad, 9)).toBeNull();
    expect(parseTarget("usd", "110000", -8)).toBe(11_000_000_000_000n);
    expect(parseTarget("usd", "110000", null)).toBeNull(); // the feed's exponent is read first
    expect(parseTarget("raw", "1,000,000", null)).toBe(1_000_000n);
    expect(parseTarget("sol", "10000", null)).toBe(10_000_000_000_000n);
    // A comma only groups thousands (M5): "0,5" and "1,5" are refused, never read as 5 or 15.
    for (const bad of ["0,5", "1,5", "12,34", "1,0000"]) expect(parseScaled(bad, 9)).toBeNull();
    // No more precision than the sentence prints (M4); letters are refused, never thrown on.
    expect(parseTarget("usd", "120000.5", -8)).toBe(12_000_050_000_000n);
    expect(parseTarget("usd", "120000.123", -8)).toBeNull();
    expect(parseTarget("usd", "0.0001234567", -10)).toBeNull();
    expect(parseTarget("usd", "0.000123456", -10)).toBe(1_234_560n);
    expect(parseTarget("raw", "1.5", null)).toBeNull();
    expect(parseTarget("sol", "1.00001", null)).toBeNull();
    for (const junk of ["abc", "1e5", "12a", "0x10"]) expect(parseTarget("usd", junk, -8)).toBeNull();
  });

  test("the quick deadlines stay inside the program's bounds: 90 days never passes them, 3 days gets its margin", () => {
    const now = 1_000_000_123n;
    expect(daysFrom(now, 90) - now).toBeLessThanOrEqual(90n * 86_400n);
    expect(daysFrom(now, 90) % 60n).toBe(0n);
    expect(daysFrom(now, 3) - now).toBeGreaterThanOrEqual(3n * 86_400n + LAND_MARGIN_SECONDS);
  });

  test("the draft becomes the SDK's choice; a team key sends no opening_usd", () => {
    const draft = { ...EMPTY_DRAFT, feedHex: BTC, direction: "below" as const, target: "50000", usd: "750" };
    const made = choiceOf(draft, { priceExponent: -8, chainNow: 1_000n, isTeam: false });
    if (!made.ok) throw new Error(`missing ${made.missing}`);
    expect(made.choice.kind).toBe(ReaderKind.PriceTouch);
    expect(made.choice.direction).toBe(Direction.Below);
    expect(bytesToHex(made.choice.feedId as Uint8Array)).toBe(BTC);
    expect(made.choice.target).toBe(5_000_000_000_000n);
    expect(made.choice.deadlineAt).toBe(1_000n + 14n * 86_400n);
    expect(made.choice.openingUsd).toBe(750n);
    const team = choiceOf({ ...draft, usd: "" }, { priceExponent: -8, chainNow: 1_000n, isTeam: true });
    expect(team.ok && team.choice.openingUsd).toBe(0n);
    const empty = choiceOf(
      { ...EMPTY_DRAFT, kind: "pool", deadline: null },
      { priceExponent: null, chainNow: null, isTeam: false },
    );
    expect(empty).toEqual({ ok: false, missing: ["account", "target", "epoch", "deadline"] });
    expect(resolveDeadline({ days: 7 }, null)).toBeNull();
    expect(resolveDeadline({ at: 5n }, null)).toBe(5n);
  });

  test("a link prefills checked slots, drops the rest, never sets the amount, and says it came from a link", () => {
    const query = { t: "price-touch", feed: "BTC/USD", dir: "below", target: "50000", days: "7", usd: "5000" };
    const { draft, fromLink } = prefillOf(query);
    expect(fromLink).toBe(true);
    // The amount stays US$500 until the creator picks another (the adversarial review, M6).
    expect([draft.kind, draft.feedHex, draft.direction, draft.target, draft.deadline, draft.usd]).toEqual([
      "price",
      BTC,
      "below",
      "50000",
      { days: 7 },
      "500",
    ]);
    expect(prefillOf({ usd: "5000" }).fromLink).toBe(false);
    const junk = prefillOf({ kind: "burn", account: "not-an-address", target: "1;drop", days: "200", usd: "-5" });
    expect([junk.draft.kind, junk.draft.account, junk.draft.target, junk.draft.deadline, junk.draft.usd]).toEqual([
      "burn",
      "",
      "",
      EMPTY_DRAFT.deadline,
      EMPTY_DRAFT.usd,
    ]);
    expect(prefillOf({}).fromLink).toBe(false);
    expect(prefillOf({ kind: "lock", account: MINT }).draft.account).toBe(MINT);
  });

  test("the search suggests feeds, names and templates; outside the grammar, the three nearest", () => {
    const names = parseNames(JSON.stringify([{ address: MINT, kind: "burn", name: "CRMB" }]));
    const btc = search("BTC 120000", { feeds: FEEDS, names });
    expect(btc.items[0]).toEqual({ kind: "price", feedHex: BTC, feedSymbol: "BTC/USD", target: "120000" });
    expect(search("crmb", { feeds: FEEDS, names }).items[0]).toEqual({ kind: "burn", account: MINT, name: "CRMB" });
    expect(search("stake pool", { feeds: FEEDS, names }).items.map((i) => i.kind)).toContain("pool");
    const outside = search("will it rain in paris tomorrow", { feeds: FEEDS, names });
    expect(outside.outside).toBe(true);
    expect(outside.items).toHaveLength(3);
    expect(search("", { feeds: FEEDS, names }).items).toHaveLength(5);
    // A comma in the query only groups thousands, as in the target field.
    expect(search("BTC 120,000", { feeds: FEEDS, names }).items[0].target).toBe("120000");
    expect(search("BTC 0,5", { feeds: FEEDS, names }).items[0].target).toBeUndefined();
  });

  test("the names file takes plain names of non-price accounts, each once; the committed one parses", () => {
    expect(parseNames("[]")).toEqual([]);
    expect(() => loadNames()).not.toThrow();
    const bad = [
      [{ address: MINT, kind: "price", name: "SOL" }],
      [{ address: "nope", kind: "burn", name: "X" }],
      [{ address: MINT, kind: "burn", name: "see https://x.example" }],
      [{ address: MINT, kind: "burn", name: "@someone" }],
      [
        { address: MINT, kind: "burn", name: "A" },
        { address: MINT, kind: "lock", name: "B" },
      ],
      [{ address: MINT, kind: "burn", name: "A", extra: 1 }],
    ];
    for (const list of bad) expect(() => parseNames(JSON.stringify(list))).toThrow();
  });

  test("the US$ split is the opening's own terms, 90/10, in cents", () => {
    expect(usdSplit(500n, 9_000)).toEqual({ total: "US$500.00", prize: "US$450.00", fee: "US$50.00" });
    expect(usdSplit(777n, 9_000)).toEqual({ total: "US$777.00", prize: "US$699.30", fee: "US$77.70" });
    expect(usdText(10_927_000_000n, -8)).toBe("US$109.27");
  });
});
