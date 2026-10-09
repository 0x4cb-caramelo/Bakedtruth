/**
 * Purpose: tests /3, the home page as the founders asked on 2026-10-09: the original's layout (it loads the home page's
 *          own styles.css), the pitch deck's colours (every colour token replaced, in both themes), shorter copy, the
 *          orange "we are baking" notice, and the parts that must not change (the consent sentence, the mascot, the
 *          suggestion link). It also stays out of search engines and has no inline style or script.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-09
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const read = (file) => readFileSync(join(ROOT, file), "utf8");
const three = read("3/index.html");
const home = read("index.html");
const colors = read("3/colors.css");
const styles = read("styles.css");

const strip = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const text = (html) => strip(html.match(/<body>([\s\S]*)<\/body>/)[1]);
const words = (value) => value.split(" ").filter(Boolean).length;
const attrs = (html, name) => [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, "g"))].map((m) => m[1]);
/** The custom properties a block declares: tokens(styles, ":root") gives the names set in the dark default. */
const tokens = (css, selector) => {
  const from = css.indexOf(`${selector} {`);
  assert.ok(from >= 0, `${selector} is missing`);
  return [...css.slice(from, css.indexOf("}", from)).matchAll(/^\s*(--[a-z-]+):/gm)].map((m) => m[1]);
};

test("/3 keeps the original layout: the home page's stylesheet, then only the colours", () => {
  const sheets = attrs(three, "href").filter((href) => /\.css/.test(href));
  const homeSheet = attrs(home, "href").find((href) => /styles\.css/.test(href));
  assert.deepEqual(sheets, [`/${homeSheet}`, sheets[1]]);
  assert.match(sheets[1], /^\/3\/colors\.css\?v=\d+$/);
  // colors.css sets colours and the notice; the one layout rule it may touch is the room above the hero.
  const rules = colors
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .match(/[^{}]+(?=\{)/g)
    .map((rule) => rule.trim());
  for (const rule of rules) {
    assert.match(rule, /^(:root(\[data-theme="light"\])?|\.baking( b| \+ \.hero)?|@media \(max-width: 860px\))$/, rule);
  }
});

test("/3 replaces every colour of the original, in both themes", () => {
  const notColours = ["--r", "--r-sm", "--r-lg", "--display", "--body"];
  const dark = tokens(colors, ":root");
  const light = tokens(colors, ':root[data-theme="light"]');
  for (const name of tokens(styles, ":root").filter((token) => !notColours.includes(token))) {
    assert.ok(dark.includes(name), `${name} keeps the original's dark colour`);
  }
  // A token the original sets again in light would win over the dark value of colors.css, so it needs its own.
  for (const name of tokens(styles, ':root[data-theme="light"]')) {
    assert.ok(light.includes(name), `${name} keeps the original's light colour`);
  }
  assert.doesNotMatch(colors, /#(4f7dff|2f5fe6|a8beff|5d7fe0|6f93ff)/i, "none of the original's blues");
});

test("/3 reads shorter than the home page, one or two lines per block", () => {
  assert.ok(words(text(three)) < words(text(home)) * 0.85, `${words(text(three))} words against ${words(text(home))}`);
  const blocks = (html, pattern) => [...html.matchAll(pattern)].map((m) => words(strip(m[1])));
  assert.ok(blocks(three, /<p class="lede">([\s\S]*?)<\/p>/g)[0] <= 22, "the lede");
  const principles = blocks(three, /<h3>[\s\S]*?<\/h3>\s*<p>([\s\S]*?)<\/p>/g);
  assert.equal(principles.length, 3);
  for (const count of principles) assert.ok(count <= 12, "a principle is one line");
});

test("/3 carries the orange notice that the site is being baked", () => {
  assert.match(three, /<p class="baking" role="note"><b>We are baking this website\.<\/b>/);
  assert.match(colors, /--baking-bg: #eea546;/);
  assert.match(colors, /\.baking \{[^}]*background: var\(--baking-bg\);/);
});

test("/3 keeps what must not change: the consent sentence, the mascot and the suggestion link", () => {
  // lib/leads.mjs stores the version of this sentence with each email: it changes only together with that version.
  const consent = (html) => strip(html.match(/<p class="fine">([\s\S]*?)<\/p>/)[1]);
  assert.equal(consent(three), consent(home));
  for (const name of ["data-perch", "data-perch-say", "data-perch-pose", "data-mood"]) {
    assert.deepEqual(attrs(three, name), attrs(home, name), `${name} differs between /3 and the home page`);
  }
  const intent = /href="https:\/\/x\.com\/intent\/post\?[^"]+"/;
  assert.equal(three.match(intent)[0], home.match(intent)[0]);
});

test("/3 uses the product's words: no 'bet', and 'market' only in the brand", () => {
  const copy = text(three).replace(/Brot Markets|brot \.markets|@brotmarkets/g, "");
  assert.doesNotMatch(copy, /\bbet(s|ting)?\b/i);
  assert.doesNotMatch(copy, /market/i);
});

test("every file /3 points at exists, with no inline style or script, out of search engines", () => {
  const refs = [...three.matchAll(/\s(?:src|href)="(\/[^"#?]*)/g)].map((m) => m[1]);
  assert.ok(refs.length > 8);
  for (const ref of refs) {
    if (["/3/", "/terms", "/privacy"].includes(ref)) continue;
    assert.ok(existsSync(join(ROOT, ref)), `${ref} is missing`);
  }
  assert.doesNotMatch(three, /\sstyle="/);
  assert.doesNotMatch(three, /<style[\s>]/);
  assert.doesNotMatch(three, /<script(?![^>]*\ssrc=)[^>]*>/);
  assert.match(three, /<meta name="robots" content="noindex, nofollow" \/>/);
});
