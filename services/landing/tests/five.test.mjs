/**
 * Purpose: tests /5, the home page as the founders asked on 2026-10-09 after /4: the light theme of /3 and the dark
 *          theme of /4, token by token, the original layout and fonts (the home page's own styles.css), the headline
 *          sized to read in two lines and a shorter opening line. What must not change stays: the consent sentence,
 *          the mascot, the suggestion link. It also stays out of search engines and has no inline style or script.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-09
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const read = (file) => readFileSync(join(ROOT, file), "utf8");
const css = (file) => read(file).replace(/\/\*[\s\S]*?\*\//g, "");
const five = read("5/index.html");
const three = read("3/index.html");
const home = read("index.html");
const colors = css("5/colors.css");

const strip = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const text = (html) => strip(html.match(/<body>([\s\S]*)<\/body>/)[1]);
const words = (value) => value.split(" ").filter(Boolean).length;
const attrs = (html, name) => [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, "g"))].map((m) => m[1]);
/** The declarations of a block, as "name: value" lines. */
const declarations = (sheet, selector) => {
  const from = sheet.indexOf(`${selector} {`);
  assert.ok(from >= 0, `${selector} is missing`);
  return sheet
    .slice(sheet.indexOf("{", from) + 1, sheet.indexOf("}", from))
    .split(";")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
};
/** Every innermost rule of the colour file: [selector, [property, ...]]. */
const rules = [...colors.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, block]) => [
  selector.replace(/\s+/g, " ").trim(),
  [...block.matchAll(/^\s*([a-z-]+):/gm)].map((m) => m[1]),
]);
const LIGHT = ':root[data-theme="light"]';

test("/5 keeps the original layout and fonts: the home page's stylesheet, then its colours", () => {
  const sheets = attrs(five, "href").filter((href) => /\.css/.test(href));
  const homeSheet = attrs(home, "href").find((href) => /styles\.css/.test(href));
  assert.equal(sheets.length, 2);
  assert.equal(sheets[0], `/${homeSheet}`);
  assert.match(sheets[1], /^\/5\/colors\.css\?v=\d+$/);
  assert.doesNotMatch(colors, /font-family|@font-face|IBM Plex/, "the fonts are the original's");
});

test("the dark theme of /5 is the dark theme of /4, token by token", () => {
  const mine = declarations(colors, ":root");
  for (const line of declarations(css("4/colors.css"), ":root")) assert.ok(mine.includes(line), `dark: ${line}`);
});

test("the light theme of /5 is the light theme of /3, token by token", () => {
  const mine = declarations(colors, LIGHT);
  const theirs = declarations(css("3/colors.css"), LIGHT);
  for (const line of theirs) assert.ok(mine.includes(line), `light: ${line}`);
  // The one addition is the ink of the notice, which /3 sets once for both themes.
  const added = mine.filter((line) => !theirs.includes(line));
  assert.deepEqual(added, ["--baking-fg: #1b1611"]);
});

test("what /4 changes beyond the tokens reaches the dark theme of /5 only", () => {
  const dark = ':root:not([data-theme="light"]) ';
  const scoped = rules.filter(([selector]) => /\.(strip|joined|suggest|ghost|read|principle)/.test(selector));
  assert.ok(scoped.length >= 6);
  for (const [selector] of scoped) assert.ok(selector.startsWith(dark), `${selector} would change the light theme too`);
});

test("the colour file of /5 sets colours only, apart from the notice and the size of the headline", () => {
  const colourProperties = /^(--[a-z-]+|color|background|border-color|border-left|outline-color)$/;
  for (const [selector, properties] of rules) {
    if (selector.startsWith(".baking")) continue;
    if (selector === ".hero h1") {
      assert.deepEqual(properties, ["font-size"], "the headline changes size, nothing else");
      continue;
    }
    for (const property of properties) assert.match(property, colourProperties, `${selector} sets ${property}`);
  }
});

test("the headline of /5 is the home page's, sized to read in two lines", () => {
  const headline = (html) => strip(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]);
  assert.equal(headline(five), headline(home));
  // 80px is the most that fits "On-Chain Campaigns" in the 593px hero column (measured in the browser).
  const max = Number(colors.match(/\.hero h1 \{\s*font-size: clamp\(\d+px, [\d.]+vw, (\d+)px\);/)[1]);
  assert.ok(max <= 78, `${max}px breaks the headline into three lines on a desktop`);
});

test("/5 reads shorter than /3: the opening line fits in one line", () => {
  assert.ok(words(text(five)) < words(text(three)), `${words(text(five))} words against ${words(text(three))}`);
  const lede = strip(five.match(/<p class="lede">([\s\S]*?)<\/p>/)[1]);
  assert.ok(lede.length <= 66, `the opening line has ${lede.length} characters`);
  // Everything else is the copy of /3 the founders approved.
  const rest = (html, slug) =>
    html
      .match(/<body>([\s\S]*)<\/body>/)[1]
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<p class="lede">[\s\S]*?<\/p>/, "")
      .replaceAll(`href="/${slug}/"`, 'href="/"')
      .replace(/\s+/g, " ");
  assert.equal(rest(five, "5"), rest(three, "3"));
});

test("/5 keeps what must not change: the consent sentence, the mascot and the suggestion link", () => {
  // lib/leads.mjs stores the version of this sentence with each email: it changes only together with that version.
  const consent = (html) => strip(html.match(/<p class="fine">([\s\S]*?)<\/p>/)[1]);
  assert.equal(consent(five), consent(home));
  for (const name of ["data-perch", "data-perch-say", "data-perch-pose", "data-mood"]) {
    assert.deepEqual(attrs(five, name), attrs(home, name), `${name} differs between /5 and the home page`);
  }
  const intent = /href="https:\/\/x\.com\/intent\/post\?[^"]+"/;
  assert.equal(five.match(intent)[0], home.match(intent)[0]);
});

test("/5 uses the product's words: no 'bet', and 'market' only in the brand", () => {
  const copy = text(five).replace(/Brot Markets|brot \.markets|@brotmarkets/g, "");
  assert.doesNotMatch(copy, /\bbet(s|ting)?\b/i);
  assert.doesNotMatch(copy, /market/i);
});

test("every file /5 points at exists, with no inline style or script, out of search engines", () => {
  const refs = [...five.matchAll(/\s(?:src|href)="(\/[^"#?]*)/g)].map((m) => m[1]);
  assert.ok(refs.length > 8);
  for (const ref of refs) {
    if (["/5/", "/terms", "/privacy"].includes(ref)) continue;
    assert.ok(existsSync(join(ROOT, ref)), `${ref} is missing`);
  }
  assert.doesNotMatch(five, /\sstyle="/);
  assert.doesNotMatch(five, /<style[\s>]/);
  assert.doesNotMatch(five, /<script(?![^>]*\ssrc=)[^>]*>/);
  assert.match(five, /<meta name="robots" content="noindex, nofollow" \/>/);
});
