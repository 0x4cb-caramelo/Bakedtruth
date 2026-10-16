/**
 * Purpose: the campaign page's head made compact (Ronaldo, 2026-10-11): the title asks the sentence ("…$150?") and a
 *          campaign outside the templates keeps its name without a mark; the rule in one line, with only the
 *          condition, the target and the deadline, for every kind, while the whole rule keeps every clause the page
 *          promised before (it is folded under "Full rules", not cut). Since 2026-10-15 the line shows the deadline as a
 *          live countdown, with the moment on its hover, and names the moment again once the deadline passes.
 *          Filter: `bun test tests/ -t "campaign head"`.
 * Version: 0.2.0 (the deadline's countdown)
 * Sprint:  11 (site: campaign page and entry), in the UI overhaul
 *
 * The rule's line is imported by a computed path, so the tests' typecheck does not follow it into the site's TSX.
 */
import { describe, expect, test } from "bun:test";

import { ruleShort, ruleShortAround, ruleText } from "../../app/features/campaign-page/copy";
import { countdownText, isoOf } from "../../app/features/campaign-page/format";
import { questionOf, sentenceOf } from "../../app/features/campaigns/sentence";

const site = (path: string) => `${import.meta.dir}/../../app/${path}`;

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

  test("the line around a countdown says what the dated line says, with the time left in the deadline's place", () => {
    const curve = { ...terms, kind: "curve" as const, name: "$BROT", target: "85.0000 SOL" };
    expect(ruleShortAround(curve)).toEqual({
      lead: "YES if the Meteora launch curve $BROT raises its full 85.0000 SOL within",
      tail: ". Otherwise NO.",
    });
    for (const kind of ["price", "burn", "lock", "curve"] as const) {
      const around = ruleShortAround({ ...terms, kind })!;
      const dated = ruleShort({ ...terms, kind });
      const word = kind === "curve" ? "by" : "before";
      expect(`${around.lead.replace(/ within$/, ` ${word}`)} ${terms.deadline}${around.tail}`).toBe(dated);
    }
    // The epoch kinds name an epoch, not a deadline: no countdown.
    expect(ruleShortAround({ ...terms, kind: "pool" })).toBeNull();
    expect(ruleShortAround({ ...terms, kind: "stake" })).toBeNull();
  });

  test("the countdown reads from its largest unit, the rest two digits wide, and never below zero", () => {
    const cases: [bigint, string][] = [
      [-5n, "0s"],
      [0n, "0s"],
      [7n, "7s"],
      [59n, "59s"],
      [60n, "1m 00s"],
      [3_599n, "59m 59s"],
      [3_600n, "1h 00m 00s"],
      [86_399n, "23h 59m 59s"],
      [86_400n, "1d 00h 00m 00s"],
      [383_587n, "4d 10h 33m 07s"],
      [40n * 86_400n + 5n, "40d 00h 00m 05s"],
    ];
    for (const [seconds, text] of cases) expect(`${seconds}: ${countdownText(seconds)}`).toBe(`${seconds}: ${text}`);
    expect(isoOf(1_792_463_580n)).toBe("2026-10-20T02:33:00.000Z");
  });

  test("the page's line counts down before the deadline and names the moment once it has passed", async () => {
    const react = await import(site("node_modules/react/index.js"));
    const server = await import(site("node_modules/react-dom/server.node.js"));
    const { RuleLine } = await import(site("features/campaign-page/rule-line.tsx"));
    const deadlineAt = 1_792_463_580n; // 2026-10-20 02:33:00 UTC
    const curve = {
      ...terms,
      kind: "curve",
      name: "$BROT",
      target: "85.0000 SOL",
      deadline: "2026-10-20 02:33:00 UTC",
    };
    const render = (chainNow: bigint, t: object = curve): string =>
      server.renderToStaticMarkup(react.createElement(RuleLine, { terms: t, deadlineAt, chainNow }));
    const before = render(deadlineAt - 383_587n);
    expect(before).toContain("raises its full 85.0000 SOL within <time");
    expect(before).toContain(`dateTime="2026-10-20T02:33:00.000Z"`);
    expect(before).toContain(`title="2026-10-20 02:33:00 UTC"`);
    expect(before).toContain('role="timer"');
    expect(before).toMatch(/4d 10h 33m 07s<\/time>\. Otherwise NO\.<\/p>$/);
    expect(before).not.toContain("by 2026-10-20");
    for (const chainNow of [deadlineAt, deadlineAt + 60n])
      expect(render(chainNow)).toBe(`<p class="cp-rule">${ruleShort(curve as Parameters<typeof ruleShort>[0])}</p>`);
    const pool = { ...terms, kind: "pool", name: "Jito…pool", target: "10,000 SOL" };
    expect(render(deadlineAt - 600n, pool)).not.toContain("<time");
  });
});
