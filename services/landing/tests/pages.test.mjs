/**
 * Purpose: tests what the pages of the "coming soon" site promise without a browser: every file they point at exists,
 *          the suggestion draft keeps its mention and hashtag, the mascot has its poses and the deck its eight slides.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-05
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const home = read("index.html");
const deck = read("pitch/index.html");

/** Local files a page asks for through src="" and href="", resolved from the page's own folder. */
function localFiles(html, folder) {
  const found = [...html.matchAll(/\s(?:src|href)="([^"#?]+)"/g)].map((match) => match[1]);
  return found
    .filter((ref) => !/^[a-z]+:/.test(ref) && ref !== "/" && ref !== "/privacy")
    .map((ref) => (ref.startsWith("/") ? ref.slice(1) : join(folder, ref)));
}

test("every file the landing page and the deck point at exists", () => {
  const files = [...localFiles(home, ""), ...localFiles(deck, "pitch")];
  assert.ok(files.length > 15, "the pages reference their scripts, styles, fonts and images");
  for (const file of files) assert.ok(existsSync(join(ROOT, file)), `${file} is missing`);
});

test("the suggestion button opens a draft that mentions the account and carries the hashtag", () => {
  const href = home.match(/href="(https:\/\/x\.com\/intent\/post\?[^"]+)"/)?.[1];
  assert.ok(href, "the landing page links to a post draft on X");
  const text = new URL(href).searchParams.get("text");
  assert.match(text, /@brotmarkets/);
  assert.match(text, /#BrotMarkets/);
  assert.match(text, /\?"/, "the draft carries an example question, in quotes");
  assert.ok(text.length <= 200, "the draft leaves room for the visitor's own question");
});

test("the mascot has an image for every pose the page and the scripts ask for", () => {
  const body = read("mascot-body.js");
  const poses = body.match(/POSES = \[([^\]]+)\]/)[1].match(/[a-z]+/g);
  assert.equal(poses.length, 8);
  for (const pose of poses) assert.ok(existsSync(join(ROOT, "img", `baked-${pose}.webp`)), `pose ${pose} has no image`);
  const asked = [...home.matchAll(/data-(?:perch-pose|mood)="([a-z]+)"/g)].map((match) => match[1]);
  assert.ok(asked.length >= 6, "the page sets poses on its perches and moods");
  for (const pose of asked) assert.ok(poses.includes(pose), `the page asks for an unknown pose: ${pose}`);
  assert.ok([...home.matchAll(/data-perch="/g)].length >= 3, "the page gives the mascot places to stand");
  assert.match(home, /<script type="module" src="mascot\.js"><\/script>/);
});

test("the landing page keeps to its content policy: no inline style and no inline script", () => {
  for (const page of [home, read("privacy.html"), read("404.html")]) {
    assert.ok(!/\sstyle="/.test(page), "no style attribute");
    assert.ok(!/<style[\s>]/.test(page), "no style tag");
    assert.ok(!/<script(?![^>]*\ssrc=)[^>]*>/.test(page), "no inline script");
  }
});

test("the deck has eight slides, its motion script loads before the stage and the finale has its parts", () => {
  const slides = [...deck.matchAll(/<section class="slide" data-label="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(slides, [
    "Title",
    "Problem",
    "Solution",
    "Sponsors",
    "Fee model",
    "Market",
    "Go-to-market",
    "Close",
  ]);
  assert.match(deck, /<span data-count aria-live="polite">1 \/ 8<\/span>/);
  // deck.js announces the opening slide as it runs: the listener in deck-motion.js has to exist by then.
  assert.ok(deck.indexOf('src="deck-motion.js"') < deck.indexOf('src="deck.js"'), "deck-motion.js comes first");
  assert.ok(deck.indexOf('src="deck-motion.js"') > 0);
  for (const pose of [0, 1, 2, 3]) assert.match(deck, new RegExp(`<img data-pose="${pose}" src="img/`));
  for (const part of ["data-badge", "data-arrow", "data-lid", "data-spark"]) assert.ok(deck.includes(part), part);
  assert.ok(!/src="[0-9a-f]{8}-[0-9a-f-]{27}"/.test(deck), "no image id from the original export is left");
  assert.ok(!deck.includes("data-speaker-notes"), "the speaking notes are not published");
});
