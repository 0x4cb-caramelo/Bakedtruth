/**
 * Purpose: the fee page's worked example is the SDK's math, and it is P1 §1.2's case (Sprint 13 DoD; BR-32): 600 on
 *          YES and 400 on NO (here 6 and 4 SOL) give a fee of 40, a creator share of 10, 950 for the winners and 1.583
 *          per 1; with the 450 prize (4.5 SOL), 1,400 and 2.333 per 1; a partner campaign, 960 and 1.6 per 1. The
 *          one-sided pot of P1 §3.5: the first wallet pays nothing, the others 1%, and Brot keeps 5 (0.05 SOL). The
 *          numbers are also checked against a winner's own payout (`splitPayout`), and the page renders them.
 *          Filter: `bun test tests/ -t "fee page example matches sdk math"`.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { beforeAll, describe, expect, test } from "bun:test";

import { splitPayout } from "@brot/sdk/read";

import { EXAMPLE, oneSidedExample, perOne, solText, splitExamples } from "../../app/features/fees/example";

const SOL = 1_000_000_000n;
const site = (path: string) => `${import.meta.dir}/../../app/${path}`;
let html = "";

beforeAll(async () => {
  const react = await import(site("node_modules/react/index.js"));
  const server = await import(site("node_modules/react-dom/server.node.js"));
  const { FeePage } = await import(site("features/fees/fee-page.tsx"));
  html = server.renderToStaticMarkup(react.createElement(FeePage)).replace(/<[^>]+>/g, " ");
});

describe("fee page example matches sdk math", () => {
  test("P1 §1.2: fee 40, creator 10, winners 950, 1.583 per 1; with the 450 prize, 1,400 and 2.333 per 1", () => {
    const { noPrize, withPrize, partner } = splitExamples();
    expect([noPrize.fee, noPrize.creator, noPrize.winners]).toEqual([(SOL * 4n) / 10n, SOL / 10n, (SOL * 95n) / 10n]);
    expect(perOne(noPrize.perOneMilli)).toBe("1.583");
    expect([withPrize.fee, withPrize.creator, withPrize.winners]).toEqual([(SOL * 4n) / 10n, SOL / 10n, 14n * SOL]);
    expect(perOne(withPrize.perOneMilli)).toBe("2.333");
    expect([partner.fee, partner.creator, partner.winners]).toEqual([(SOL * 4n) / 10n, 0n, (SOL * 96n) / 10n]);
    expect(perOne(partner.perOneMilli)).toBe("1.6");
  });

  test("the winners' total is what each winner is paid, to the lamport", () => {
    const { withPrize } = splitExamples();
    const ana = splitPayout(4n * SOL, withPrize.winners, EXAMPLE.yes);
    const bruno = splitPayout(2n * SOL, withPrize.winners, EXAMPLE.yes);
    expect(ana + bruno).toBeLessThanOrEqual(withPrize.winners);
    expect(withPrize.winners - (ana + bruno)).toBeLessThanOrEqual(1n); // rounding down leaves at most a lamport
    expect(solText(splitPayout(SOL, withPrize.winners, EXAMPLE.yes))).toBe("2.333333333");
  });

  test("P1 §3.5: the first wallet pays no fee, the others 1%, and Brot keeps 0.05 SOL", () => {
    const rows = oneSidedExample();
    expect(rows.map((r) => [r.name, solText(r.payout), solText(r.fee)])).toEqual([
      ["Ana", "1", "0"],
      ["Bruno", "1.98", "0.02"],
      ["Carla", "2.97", "0.03"],
    ]);
    expect(solText(rows.reduce((sum, r) => sum + r.fee, 0n))).toBe("0.05");
  });

  test("the page shows the same numbers", () => {
    for (const text of ["0.4 SOL", "0.1 SOL", "9.5 SOL", "1.583 per 1", "14 SOL", "2.333 per 1", "1.6 per 1"])
      expect(html).toContain(text);
    for (const text of ["1.98 SOL", "2.97 SOL", "0.05 SOL", "90%", "10%"]) expect(html).toContain(text);
  });
});
