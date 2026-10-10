/**
 * Purpose: how the campaign page writes what it read: exact grouped integers, a value in its kind's units, an age, the
 *          visitor's local time (built with options a browser accepts: a page once failed on `timeZoneName` combined
 *          with `dateStyle`), and the public state's chip. Filter: `bun test tests/ -t "how the campaign page writes"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { describe, expect, test } from "bun:test";

import { ageText, grouped, local, rawText, valueText } from "../../app/features/campaign-page/format";

describe("how the campaign page writes", () => {
  test("whole numbers, values in their units, and raw values, exactly", () => {
    expect(grouped(0n)).toBe("0");
    expect(grouped(1_234_567n)).toBe("1,234,567");
    expect(grouped(-1_000n)).toBe("-1,000");
    expect(grouped(340_282_366_920_938_463_463_374_607_431_768_211_455n)).toBe(
      "340,282,366,920,938,463,463,374,607,431,768,211,455",
    );
    expect(valueText("price", 8_521_233_806_870n, -8)).toBe("85,212.34");
    expect(valueText("price", 2_150n, -8)).toBe("0.0000215");
    expect(valueText("burn", 1_000_000n, 0)).toBe("1,000,000");
    expect(valueText("pool", 5_000_000_000n, 0)).toBe("5.0000 SOL");
    expect(rawText(8_521_233_806_870n, -8)).toBe("8,521,233,806,870 × 10^-8");
    expect(rawText(42n, null)).toBe("42");
  });

  test("ages, and local moments the browser can format", () => {
    expect(ageText(7n)).toBe("7 s");
    expect(ageText(125n)).toBe("2 min 5 s");
    expect(ageText(3_780n)).toBe("1 h 3 min");
    expect(ageText(-61n)).toBe("1 min 1 s");
    expect(local(1_791_216_180n, "en-US", "UTC")).toBe("Oct 5, 2026, 04:03 PM UTC"); // 2026-10-05T16:03:00Z
    expect(() => local(1_791_216_180n)).not.toThrow();
  });
});
