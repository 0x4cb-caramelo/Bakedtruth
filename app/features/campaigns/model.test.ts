/**
 * Purpose: the card values: the chance (none for an empty pot), the estimated return from the SDK's math, the 24-hour
 *          listing rule, the sentence of a price campaign from a pinned feed, and "$" on a price in US$.
 * Version: 0.1.1 (the UI overhaul: "$")
 * Sprint:  10 (site: campaign list)
 */
import { describe, expect, test } from "bun:test";

import type { Campaign } from "@/lib/api-client";
import { toCard } from "./model";
import { valueText } from "../campaign-page/format";
import { formatTarget, priceText, sentenceOf } from "./sentence";

const BTC = "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
const NOW = 1_800_000_000n;
const SOL = 1_000_000_000n;

function campaign(over: Partial<Campaign> = {}): Campaign {
  return {
    address: "FmDoXD1qx2ZfLr71WjrHHxFhLqDRkA6s24je1YfCj1Ho",
    id: "1",
    state: "open",
    kind: "PriceTouch",
    status: "Open",
    outcome: "Unresolved",
    creator: "creator",
    creator_is_team: true,
    pool_yes: "0",
    pool_no: "0",
    prize_lamports: "0",
    entries_close_at: "1800500000",
    deadline_at: "1800900000",
    review_ends_at: null,
    resolved_at: "0",
    target: "8366041574000",
    metric_account: "APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5",
    feed_id: BTC,
    direction: "Above",
    price_exponent: -8,
    opens_at: "1799000000",
    entries_count: 0,
    fee_bps: 1000,
    one_sided_fee_bps: 100,
    creator_share_bps: 100,
    ...over,
  };
}

describe("the card's values", () => {
  test("an empty pot shows no chance, but still has an estimate for each side", () => {
    const card = toCard(campaign(), NOW);
    expect(card.yesShare).toBeNull();
    expect(card.potLamports).toBe(0n);
    expect(card.estYesBps).not.toBeNull();
  });

  test("the chance is the YES share of the pot", () => {
    const card = toCard(campaign({ pool_yes: String(1 * Number(SOL)), pool_no: String(3 * Number(SOL)) }), NOW);
    expect(card.yesShare).toBe(0.25);
    expect(card.potLamports).toBe(4n * SOL);
  });

  test("the estimate of a two-sided pot is a positive return, in bps of the stake", () => {
    const card = toCard(campaign({ pool_yes: String(SOL), pool_no: String(SOL) }), NOW);
    expect(card.estYesBps).not.toBeNull();
    expect(card.estYesBps! > 0n).toBe(true);
  });

  test("a campaign with no entry 24 hours after opening is unlisted; one with an entry stays listed", () => {
    expect(toCard(campaign({ entries_count: 0 }), NOW).listed).toBe(false);
    expect(toCard(campaign({ entries_count: 1 }), NOW).listed).toBe(true);
    expect(toCard(campaign({ entries_count: 0, opens_at: String(NOW - 3600n) }), NOW).listed).toBe(true);
  });
});

describe("the sentence", () => {
  test("a price campaign names its feed and target in the feed's units", () => {
    const card = toCard(campaign(), NOW);
    expect(card.asset).toBe("BTC/USD");
    expect(card.title).toBe("BTC/USD reaches $83,660.42");
  });

  test("a below campaign reads as a fall", () => {
    expect(
      sentenceOf({
        kind: "PriceTouch",
        direction: "Below",
        feedIdHex: BTC,
        target: "8366041574000",
        priceExponent: -8,
        metricAccount: "APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5",
      }),
    ).toBe("BTC/USD falls to $83,660.42");
  });

  test("an unknown feed falls back to the kind's name and the shortened account", () => {
    expect(
      sentenceOf({
        kind: "PriceTouch",
        direction: "Above",
        feedIdHex: "00".repeat(32),
        target: "1",
        priceExponent: 0,
        metricAccount: "APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5",
      }),
    ).toBe("Price campaign APgz…mtf5");
  });

  test("the target keeps at most two decimals and thousands separators", () => {
    expect(formatTarget(1234567n, -2)).toBe("12,345.67");
  });

  test("a target below 1 keeps six significant digits instead of rounding to 0 (Sprint 11)", () => {
    expect(formatTarget(2_150n, -8)).toBe("0.0000215");
    expect(formatTarget(123_456_789n, -9)).toBe("0.123457");
  });

  test('a price in US$ reads with "$" on the cards and the page; a ratio feed\'s value stays a plain number', () => {
    expect(priceText(15_000_000_000n, -8, "SOL/USD")).toBe("$150");
    expect(priceText(125_000_000n, -8, "SSOL/SOL.RR")).toBe("1.25");
    expect(valueText("price", 11_175_000_000n, -8, "SOL/USD")).toBe("$111.75");
    // Before the feed is known nothing says it is in dollars.
    expect(valueText("price", 11_175_000_000n, -8)).toBe("111.75");
    expect(valueText("burn", 900_000n, 0, "SOL/USD")).toBe("900,000");
  });
});
