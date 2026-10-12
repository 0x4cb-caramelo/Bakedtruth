/**
 * Purpose: tests what the home page gained on 2026-10-12, at the founder's request: the plain loaf as the mark in the
 *          top bar, the "Still baking" notice that is one link to the devnet site, and the four example campaigns that
 *          play in the hero (examples.js), whose arithmetic is the program's rule and whose words are the site's.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-12
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { settle, share, STAKE } from "../public/examples.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const home = read("index.html");
const two = read("2/index.html");
const words = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("the mark in the top bar is the plain loaf, not the mascot", () => {
  assert.ok(existsSync(join(ROOT, "img", "brot-loaf.webp")));
  for (const page of [home, two]) {
    const brand = page.match(/<a class="brand"[\s\S]*?<\/a>/)[0];
    assert.match(brand, /<img src="\/?img\/brot-loaf\.webp" alt="" width="58" height="35" \/>/);
    assert.ok(!brand.includes("baked-"), "Baked walks the page; the mark is the loaf (BRAND.md)");
  }
});

test("the notice under the top bar is one link to the devnet site and says what devnet is", () => {
  for (const page of [home, two]) {
    const after = page.slice(page.indexOf("</header>"), page.indexOf("<main>"));
    const notice = after.match(/<a class="baking" href="\/dev0x"[^>]*>([\s\S]*?)<\/a>/);
    assert.ok(notice, "the whole notice is the link, between the top bar and the page");
    const text = words(notice[1]);
    assert.match(text, /Still baking\./);
    assert.match(text, /test SOL, which has no real value/, "a link to devnet says the SOL there is worth nothing");
    assert.ok(!/<a[\s>]/.test(notice[1]), "no link inside the link");
  }
  assert.match(read("live.css"), /\.baking \{[^}]*background: #eea546;/, "the loaf's crust colour");
});

test("the hero plays four example campaigns, each marked as an example, with the shares its numbers give", () => {
  const box = home.match(/<aside[^>]*data-examples[\s\S]*?<\/aside>/)[0];
  const cards = [...box.matchAll(/<article class="ex ex-([a-d])( is-on)?" data-ex ([^>]+)>([\s\S]*?)<\/article>/g)];
  assert.equal(cards.length, 4);
  assert.deepEqual(
    cards.map((card) => Boolean(card[2])),
    [true, false, false, false],
    "only the first card shows before the script runs",
  );
  const css = read("live.css");
  const kinds = new Set();
  const deck = words(read("pitch/index.html"));
  for (const [, letter, , attributes, body] of cards) {
    const value = (name) => attributes.match(new RegExp(`data-${name}="([^"]+)"`))[1];
    const example = { yes: Number(value("yes")), no: Number(value("no")), pick: value("pick"), outcome: value("outcome") };
    const [, number, kind] = body.match(/<p class="kicker">Example (\d) of 4 · ([A-Za-z ]+) · not a live campaign<\/p>/);
    assert.equal(Number(number), kinds.size + 1);
    kinds.add(kind);
    const question = body.match(/<h2>([^<]+)<\/h2>/)[1];
    assert.match(question, /^Does .+\?$/);
    assert.ok(!deck.includes(question), `"${question}" is one of the deck's examples`);
    // What the card shows before the script runs is what the script would write.
    const percent = share(example.yes, example.no);
    assert.match(body, new RegExp(`data-side="yes"[^>]*>Yes <b>${percent}%</b>`));
    assert.match(body, new RegExp(`data-side="no"[^>]*>No <b>${100 - percent}%</b>`));
    assert.match(css, new RegExp(`\\.ex-${letter} \\.bar i \\{\\s*width: ${percent}%;`));
    // The pot shares out in whole hundredths of a SOL, so the line on the card adds up to the pot it names.
    const result = settle(example);
    for (const amount of [result.pot, result.brot, result.creator, result.winners]) {
      assert.ok(Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-9, `${amount} is not in hundredths`);
    }
    assert.ok(Math.abs(result.brot + result.creator + result.winners - result.pot) < 1e-9);
    assert.match(body, /<span class="ex-stamp">Resolved by the chain · /, "the card says who resolved it");
    for (const hook of ["data-ex-line", "data-ex-face", "data-ex-amount", "data-ex-pot"]) assert.ok(body.includes(hook));
  }
  assert.equal(kinds.size, 4, "four kinds the program reads, one each");
  assert.ok(box.includes("data-ex-cursor"));
  assert.match(words(box), /Made-up examples, in test SOL\./);
  for (const word of [/\bbets?\b/i, /\bmarkets?\b/i, /\bvotes?\b/i, /USDC/]) {
    assert.ok(!word.test(words(box).replace("It's a read. Not a vote.", "")), `${word} in the examples`);
  }
  assert.match(home, /<script type="module" src="examples\.js\?v=\d+"><\/script>/);
  assert.match(two, /<script type="module" src="\/examples\.js\?v=\d+"><\/script>/);
});

test("the examples share a pot as the program does: 10% of the losing side, 1% of the entries, from the pot", () => {
  // The fee page's worked example: 6 SOL on YES against 4 on NO, YES wins.
  const result = settle({ yes: 6 - STAKE, no: 4, pick: "yes", outcome: "yes" });
  assert.equal(result.pot, 10);
  assert.ok(Math.abs(result.brot - 0.4) < 1e-9 && Math.abs(result.creator - 0.1) < 1e-9);
  assert.ok(Math.abs(result.winners - 9.5) < 1e-9, "the winners split 9.50, not the deck's 9.60");
  assert.ok(Math.abs(result.net - ((STAKE / 6) * 9.5 - STAKE)) < 1e-9);
  assert.equal(settle({ yes: 6, no: 4 - STAKE, pick: "no", outcome: "yes" }).net, -STAKE, "a wrong side loses its entry");
});
