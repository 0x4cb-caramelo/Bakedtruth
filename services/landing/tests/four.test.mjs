/**
 * Purpose: tests /4, the home page as the founders asked on 2026-10-09 after /3: it says exactly what /3 says (the copy
 *          they approved), keeps the original layout and fonts (the home page's own styles.css), and its colour file
 *          sets colours only, with the example and the principles as dark cards in both themes. It also stays out of
 *          search engines and has no inline style or script.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-09
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const read = (file) => readFileSync(join(ROOT, file), "utf8");
const four = read("4/index.html");
const three = read("3/index.html");
const home = read("index.html");
const colors = read("4/colors.css").replace(/\/\*[\s\S]*?\*\//g, "");
const styles = read("styles.css");

/** The body without comments, with the page's own address taken out, so /3 and /4 can be compared as they are. */
const body = (html, slug) =>
  html
    .match(/<body>([\s\S]*)<\/body>/)[1]
    .replace(/<!--[\s\S]*?-->/g, "")
    .replaceAll(`href="/${slug}/"`, 'href="/"')
    .replace(/\s+/g, " ");
const attrs = (html, name) => [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, "g"))].map((m) => m[1]);
const tokens = (css, selector) => {
  const from = css.indexOf(`${selector} {`);
  assert.ok(from >= 0, `${selector} is missing`);
  return [...css.slice(from, css.indexOf("}", from)).matchAll(/^\s*(--[a-z-]+):/gm)].map((m) => m[1]);
};
/** Every innermost rule of the colour file: [selector, [property, ...]]. */
const rules = [...colors.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, block]) => [
  selector.replace(/\s+/g, " ").trim(),
  [...block.matchAll(/^\s*([a-z-]+):/gm)].map((m) => m[1]),
]);

test("/4 says exactly what /3 says: the approved copy, the notice, the mascot and the form", () => {
  assert.equal(body(four, "4"), body(three, "3"), "copy any change of the content of /3 to /4, or the other way round");
});

test("/4 keeps the original layout and fonts: the home page's stylesheet, then its colours", () => {
  const sheets = attrs(four, "href").filter((href) => /\.css/.test(href));
  const homeSheet = attrs(home, "href").find((href) => /styles\.css/.test(href));
  assert.equal(sheets.length, 2);
  assert.equal(sheets[0], `/${homeSheet}`);
  assert.match(sheets[1], /^\/4\/colors\.css\?v=\d+$/);
  assert.doesNotMatch(colors, /font-family|@font-face|IBM Plex/, "the fonts are the original's");
});

test("the colour file of /4 sets colours only, apart from the notice", () => {
  const colourProperties = /^(--[a-z-]+|color|background|border-color|border-left)$/;
  for (const [selector, properties] of rules) {
    if (selector.startsWith(".baking")) continue;
    for (const property of properties) assert.match(property, colourProperties, `${selector} sets ${property}`);
  }
});

test("/4 replaces every colour of the original, in both themes", () => {
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

test("the example and the principles of /4 are dark cards in both themes, and the strip is dark", () => {
  const cards = colors.match(/\.read,\s*\.principle \{([^}]*)\}/)[1];
  assert.match(cards, /--panel: #171e29;/);
  assert.match(cards, /--text: #f7eedb;/);
  assert.match(colors, /:root\[data-theme="light"\] \.principle \{\s*--panel: #1b1611;/);
  const light = colors.slice(colors.indexOf(':root[data-theme="light"] {'));
  assert.match(light, /--strip-bg: #1b1611;/);
  assert.match(light, /--yes-bg: #1c3a30;/, "the YES and NO chips sit on a dark card, so they keep the dark pair");
});

test("every file /4 points at exists, with no inline style or script, out of search engines", () => {
  const refs = [...four.matchAll(/\s(?:src|href)="(\/[^"#?]*)/g)].map((m) => m[1]);
  assert.ok(refs.length > 8);
  for (const ref of refs) {
    if (["/4/", "/terms", "/privacy"].includes(ref)) continue;
    assert.ok(existsSync(join(ROOT, ref)), `${ref} is missing`);
  }
  assert.doesNotMatch(four, /\sstyle="/);
  assert.doesNotMatch(four, /<style[\s>]/);
  assert.doesNotMatch(four, /<script(?![^>]*\ssrc=)[^>]*>/);
  assert.match(four, /<meta name="robots" content="noindex, nofollow" \/>/);
});
