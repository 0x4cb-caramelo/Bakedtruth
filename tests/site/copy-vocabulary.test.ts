/**
 * Purpose: the site's words follow D-m (campaign, entry, baker, creator, pot, YES/NO) and never the D6 table's old copy
 *          (proposal 0.4 §5.2: "mercado", "aposta", "apostar", "escolher um lado"), nor the English words the founder
 *          ruled out with them (market, bet, wager, odds, position, taking a side, trading, buying, redeeming) or a
 *          chance written as a price in cents. Every `copy*.ts` file of the site and the brand's lines are read as text;
 *          the brand, Brot Markets, is the one exception. Sprint 13 adds P1 §4.6's "Em vez de" column and the promises
 *          the site never makes (a price, a return, a yield, an automatic payout, a time), checked in every source
 *          file of the site, and the BP-5 line held in exactly one copy entry.
 *          Filter: `bun test tests/ -t "copy uses the campaign vocabulary"`.
 * Version: 0.2.0 (Sprint 13: P1 §4.6, the promises, BP-5, the mascot's retired line)
 * Sprint:  11 (site: campaign page and entry); 13
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const scan = (pattern: string) =>
  [...new Bun.Glob(pattern).scanSync({ cwd: "." })].filter(
    (f) => !f.includes("node_modules") && !f.includes("/.next/"),
  );
const FILES = [...scan("app/**/copy*.ts"), "app/lib/brand.ts"];
/** Every source file of the site, its tests aside: a phrase ruled out is ruled out everywhere, not only in copy. */
const SOURCES = [...scan("app/**/*.ts"), ...scan("app/**/*.tsx")].filter((f) => !f.endsWith(".test.ts"));

/** The D6 copy row's old words, then their English equivalents (memory of 2026-10-08; the prototype's word list). */
const FORBIDDEN: RegExp[] = [
  /\bmercados?\b/i,
  /\bapostas?\b/i,
  /\bapostar\b/i,
  /\bescolher um lado\b/i,
  /\bmarkets?\b/i,
  /\bbet(s|ting|tor|tors)?\b/i,
  /\bwagers?\b/i,
  /\bgambl\w*/i,
  /\bodds\b/i,
  /\bpositions?\b/i,
  /\b(take|pick|choose|taking|picking|choosing) (a|your|one|either) side\b/i,
  /\btrad(e|es|ed|ing)\b/i,
  /\bbuy(s|ing)?\b/i,
  /\bredeem\w*/i,
  /¢|\bcents\b/i,
];

/**
 * P1 §4.6, the "Em vez de" column (BP v0.0.4), in English and Portuguese: what the site never says. Then the promises
 * no screen makes while the product is on devnet (Sprint 13 security gate): a guaranteed return, a yield, a profit, a
 * time for a payout. "No oracle. Just me, reading." is the mascot's line the design direction retired (conflict 7).
 */
const RULED_OUT: RegExp[] = [
  /prediction markets?/i,
  /mercados? de previs[aã]o/i,
  /no human in the loop/i,
  /nenhum humano no circuito/i,
  /only (earn|make money) from the losing side/i,
  /s[oó] ganhamos do lado perdedor/i,
  /\balways wins?\b/i,
  /sempre ganha/i,
  /\bshare to (enter|join|get in|take a side)\b/i,
  /compartilhe para entrar/i,
  /\bno oracle\b/i,
  /\bsem or[aá]culo\b/i,
  /oracle-free/i,
  /\bpaid (out )?in minutes\b/i,
  /pago em minutos/i,
  /\binstant(ly)? (payout|paid)/i,
  /\bwin \d+ ?(x|times)\b/i,
  /ganhe \d+ vezes/i,
  /\bUSDC\b/,
  /stablecoin|d[oó]lar digital/i,
  /just me, reading/i,
  /\bguarantee(d|s)?\b/i,
  /\brisk[- ]free\b/i,
  /\bcan'?t lose\b/i,
  /\byields?\b/i,
  /\bprofits?\b/i,
  /\bAPY\b|\bAPR\b/,
  /\bpaid automatically\b/i,
];

/** BP-5's recommendation (P-9, open): the line the founder may change, written once. */
const BP5 = "No human picks the winner.";

const PRODUCT_WORDS = /\b(campaigns?|entry|entries|bakers?|creator|pot|YES|NO)\b/;

describe("copy uses the campaign vocabulary", () => {
  test("the site has copy files, and none uses an old word", () => {
    expect(FILES.length).toBeGreaterThanOrEqual(8);
    const hits = FILES.flatMap((file) => {
      const text = readFileSync(file, "utf8").replace(/Brot Markets/g, "Brot");
      return FORBIDDEN.filter((word) => word.test(text)).map((word) => `${file}: ${word}`);
    });
    expect(hits).toEqual([]);
  });

  test("each copy file speaks in the product's words", () => {
    for (const file of FILES.filter((f) => f !== "app/lib/brand.ts"))
      expect(`${file}: ${PRODUCT_WORDS.test(readFileSync(file, "utf8"))}`).toBe(`${file}: true`);
  });

  test("no source file of the site says what P1 §4.6 replaces, or promises a return, a yield or a time", () => {
    expect(SOURCES.length).toBeGreaterThan(50);
    const hits = SOURCES.flatMap((file) => {
      const text = readFileSync(file, "utf8");
      return RULED_OUT.filter((phrase) => phrase.test(text)).map((phrase) => `${file}: ${phrase}`);
    });
    expect(hits).toEqual([]);
  });

  test("BP-5's line lives in exactly one copy entry, so the founder's answer changes one string", () => {
    const holders = SOURCES.filter((file) => readFileSync(file, "utf8").includes(BP5));
    expect(holders).toEqual(["app/features/how/copy.ts"]);
  });

  test("the checks themselves catch the old words and the ruled-out phrases", () => {
    const old = ["Place your bet", "Buy YES shares", "Top markets", "Escolher um lado", "Faça sua aposta", "YES 62¢"];
    for (const text of old) expect(FORBIDDEN.some((word) => word.test(text))).toBe(true);
    expect(FORBIDDEN.some((word) => word.test("Join this campaign: your entry on YES goes into the pot"))).toBe(false);
    const ruled = [
      "No human in the loop.",
      "No oracle. Just me, reading.",
      "Paid in minutes",
      "Win 3x",
      "Share to take a side",
      "Guaranteed return",
      "Pot in USDC",
    ];
    for (const text of ruled) expect(RULED_OUT.some((phrase) => phrase.test(text))).toBe(true);
    expect(RULED_OUT.some((phrase) => phrase.test("The result is read on-chain. No human picks the winner."))).toBe(
      false,
    );
  });
});
