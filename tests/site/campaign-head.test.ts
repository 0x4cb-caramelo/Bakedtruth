/**
 * Purpose: the campaign page's head made compact (Ronaldo, 2026-10-11): the title asks the sentence ("…$150?") and a
 *          campaign outside the templates keeps its name without a mark; the rule in one line, with only the
 *          condition, the target and the deadline, for every kind, while the whole rule keeps every clause the page
 *          promised before (it is folded under "Full rules", not cut). Filter: `bun test tests/ -t "campaign head"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry), in the UI overhaul
 */
import { describe, expect, test } from "bun:test";

import { ruleShort, ruleText } from "../../app/features/campaign-page/copy";
import { questionOf, sentenceOf } from "../../app/features/campaigns/sentence";

const SOL_USD = "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
const UNLISTED = "11".repeat(32);
const MINT = "So11111111111111111111111111111111111111112";
const price = { kind: "PriceTouch", direction: "Above", target: "15000000000", priceExponent: -8, metricAccount: MINT };
const terms = { name: "SOL/USD", target: "$150", below: false, deadline: "2026-12-31 15:00:00 UTC", epoch: "812" };

describe("campaign head", () => {
  test("the title asks the template's sentence; a campaign outside the templates keeps its name", () => {
    expect(questionOf({ ...price, feedIdHex: SOL_USD })).toBe("SOL/USD reaches $150?");
    expect(sentenceOf({ ...price, feedIdHex: SOL_USD })).toBe("SOL/USD reaches $150");
    expect(questionOf({ ...price, feedIdHex: UNLISTED })).toBe("Price campaign So11…1112");
  });

  test("the rule in one line: the condition, the target and the deadline, for every kind", () => {
    expect(ruleShort({ ...terms, kind: "price" })).toBe(
      "YES if SOL/USD reaches $150 or more before 2026-12-31 15:00:00 UTC. Otherwise NO.",
    );
    expect(ruleShort({ ...terms, kind: "price", below: true, target: "$90" })).toBe(
      "YES if SOL/USD falls to $90 or less before 2026-12-31 15:00:00 UTC. Otherwise NO.",
    );
    expect(ruleShort({ ...terms, kind: "burn", name: "So11…1112", target: "900,000" })).toBe(
      "YES if the supply of So11…1112 falls to 900,000 raw units or less before 2026-12-31 15:00:00 UTC. Otherwise NO.",
    );
    expect(ruleShort({ ...terms, kind: "pool", name: "Jito…pool", target: "10,000 SOL" })).toBe(
      "YES if the stake pool Jito…pool holds at least 10,000 SOL at the start of epoch 812. Otherwise NO.",
    );
    for (const kind of ["price", "burn", "lock", "pool", "stake"] as const)
      expect(ruleShort({ ...terms, kind }).length).toBeLessThan(ruleText({ ...terms, kind }).length / 1.5);
  });

  test("the full rule, folded, still says how a price campaign resolves and voids", () => {
    const full = ruleText({ ...terms, kind: "price" });
    for (const clause of ["whole confidence band", "within 60 seconds", "stops updating", "cannot be read"])
      expect(full).toContain(clause);
  });
});
