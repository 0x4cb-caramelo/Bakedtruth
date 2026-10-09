/**
 * Purpose: tests /2, the home page in the pitch deck's look: it says exactly what the home page says (only the look may
 *          differ), the mascot perches and moods are the same, every file it points at exists, it has no inline style
 *          or script, and it stays out of search engines.
 * Version: 0.2.0 · Sprint: out of band (landing page), 2026-10-09 (0.1.0 tested a version with the deck's content,
 *          which was not what the founder asked for)
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const two = readFileSync(join(ROOT, "2", "index.html"), "utf8");
const home = readFileSync(join(ROOT, "index.html"), "utf8");

/** The words a visitor reads: the body without comments and tags, with spaces collapsed. */
const text = (html) =>
  html
    .match(/<body>([\s\S]*)<\/body>/)[1]
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const attrs = (html, name) => [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, "g"))].map((m) => m[1]);

test("/2 says exactly what the home page says: only the look changes", () => {
  assert.equal(text(two), text(home), "copy any change of the home page's content to /2 (and the other way round)");
  for (const name of ["data-perch", "data-perch-say", "data-perch-pose", "data-mood", "aria-label"]) {
    assert.deepEqual(attrs(two, name), attrs(home, name), `${name} differs between /2 and the home page`);
  }
  assert.equal(
    two.match(/href="https:\/\/x\.com\/intent\/post\?[^"]+"/)[0],
    home.match(/href="https:\/\/x\.com\/intent\/post\?[^"]+"/)[0],
  );
});

test("every file /2 points at exists", () => {
  const refs = [...two.matchAll(/\s(?:src|href)="(\/[^"#?]*)/g)].map((m) => m[1]);
  assert.ok(refs.length > 8);
  for (const ref of refs) {
    if (["/2/", "/terms", "/privacy"].includes(ref)) continue;
    assert.ok(existsSync(join(ROOT, ref)), `${ref} is missing`);
  }
});

test("/2 has no inline style or script, and stays out of search engines", () => {
  assert.doesNotMatch(two, /\sstyle="/);
  assert.doesNotMatch(two, /<script(?![^>]*\ssrc=)[^>]*>/);
  assert.match(two, /<meta name="robots" content="noindex, nofollow" \/>/);
});
