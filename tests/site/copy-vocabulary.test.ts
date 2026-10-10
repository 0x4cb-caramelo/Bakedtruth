/**
 * Purpose: the site's words follow D-m (campaign, entry, baker, creator, pot, YES/NO) and never the D6 table's old copy
 *          (proposal 0.4 §5.2: "mercado", "aposta", "apostar", "escolher um lado"), nor the English words the founder
 *          ruled out with them (market, bet, wager, odds, position, taking a side, trading, buying, redeeming) or a
 *          chance written as a price in cents. Every `copy*.ts` file of the site is read as text. The brand, Brot
 *          Markets, is the one exception. Filter: `bun test tests/ -t "copy uses the campaign vocabulary"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const FILES = [...new Bun.Glob("app/**/copy*.ts").scanSync({ cwd: "." })].filter((f) => !f.includes("node_modules"));

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

const PRODUCT_WORDS = /\b(campaigns?|entry|entries|bakers?|creator|pot|YES|NO)\b/;

describe("copy uses the campaign vocabulary", () => {
  test("the site has copy files, and none uses an old word", () => {
    expect(FILES.length).toBeGreaterThanOrEqual(3);
    const hits = FILES.flatMap((file) => {
      const text = readFileSync(file, "utf8").replace(/Brot Markets/g, "Brot");
      return FORBIDDEN.filter((word) => word.test(text)).map((word) => `${file}: ${word}`);
    });
    expect(hits).toEqual([]);
  });

  test("each copy file speaks in the product's words", () => {
    for (const file of FILES)
      expect(`${file}: ${PRODUCT_WORDS.test(readFileSync(file, "utf8"))}`).toBe(`${file}: true`);
  });

  test("the check itself catches the old words", () => {
    const old = ["Place your bet", "Buy YES shares", "Top markets", "Escolher um lado", "Faça sua aposta", "YES 62¢"];
    for (const text of old) expect(FORBIDDEN.some((word) => word.test(text))).toBe(true);
    expect(FORBIDDEN.some((word) => word.test("Join this campaign: your entry on YES goes into the pot"))).toBe(false);
  });
});
