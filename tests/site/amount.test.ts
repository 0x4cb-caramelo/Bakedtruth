/**
 * Purpose: the amount a baker types becomes lamports exactly (no floating point), with a dot or a comma and at most
 *          nine decimals; anything else is refused, never guessed. The panel's SOL figures round down for what a
 *          baker may receive and up for what leaves the wallet. Filter: `bun test tests/ -t "the amount a baker types"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { describe, expect, test } from "bun:test";

import { parseSol, sol4, solText } from "../../app/features/entry/amount";

describe("the amount a baker types", () => {
  test("decimal text becomes exact lamports", () => {
    expect(parseSol("0.5")).toBe(500_000_000n);
    expect(parseSol(" 1,25 ")).toBe(1_250_000_000n);
    expect(parseSol(".1")).toBe(100_000_000n);
    expect(parseSol("2.")).toBe(2_000_000_000n);
    expect(parseSol("0.000000001")).toBe(1n);
    expect(parseSol("0.1")! + parseSol("0.2")!).toBe(parseSol("0.3")!); // 0.1 + 0.2 is 0.3 here
    expect(parseSol("123456789012.123456789")).toBe(123_456_789_012_123_456_789n);
  });

  test("anything that is not a plain positive decimal is refused", () => {
    for (const text of [
      "",
      " ",
      "0",
      "0.0",
      "-1",
      "+1",
      "1e3",
      "1.0000000001",
      "abc",
      "1.2.3",
      "1 000",
      "0x10",
      "Infinity",
    ]) {
      expect(parseSol(text)).toBeNull();
    }
  });

  test("lamports are written back as the shortest text, and as SOL rounded down or up", () => {
    expect(solText(500_000_000n)).toBe("0.5");
    expect(solText(1_000_000_000n)).toBe("1");
    expect(solText(1n)).toBe("0.000000001");
    for (const text of ["0.5", "1", "0.000000001", "42.42"]) expect(solText(parseSol(text)!)).toBe(text);
    expect(sol4(1_234_567_890n)).toBe("1.2345");
    expect(sol4(1_234_567_890n, "up")).toBe("1.2346");
    expect(sol4(1_234_500_000n, "up")).toBe("1.2345");
    expect(sol4(0n)).toBe("0.0000");
  });
});
