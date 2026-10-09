/**
 * Purpose: tests the /2 draft (the home page in the deck's look): every file it points at exists, it has no inline
 *          style or script, it stays out of search engines, its waitlist form keeps the home page's consent sentence
 *          word for word, and its copy uses the words of BP v0.0.4.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-09
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const two = readFileSync(join(ROOT, "2", "index.html"), "utf8");
const home = readFileSync(join(ROOT, "index.html"), "utf8");
const words = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("every file the /2 page points at exists", () => {
  const refs = [...two.matchAll(/\s(?:src|href)="(\/[^"#?]*)/g)].map((m) => m[1]);
  assert.ok(refs.length > 10);
  for (const ref of refs) {
    if (["/2/", "/terms", "/privacy"].includes(ref)) continue;
    assert.ok(existsSync(join(ROOT, ref)), `${ref} is missing`);
  }
});

test("the /2 page has no inline style or script, and stays out of search engines", () => {
  assert.doesNotMatch(two, /\sstyle="/);
  assert.doesNotMatch(two, /<script(?![^>]*\ssrc=)[^>]*>/);
  assert.match(two, /<meta name="robots" content="noindex, nofollow" \/>/);
});

test("the /2 waitlist form keeps the home page's consent sentence word for word", () => {
  const consent = (html) => words(html.match(/<p class="fine">\s*By sending[\s\S]*?<\/p>/)[0]).trim();
  assert.equal(consent(two), consent(home));
  assert.match(two, /<form class="join" id="join" data-join novalidate>/);
});

test("the /2 copy uses the words of BP v0.0.4: campaigns and SOL, no bets, no USDC", () => {
  const text = words(two);
  assert.match(text, /On-Chain Campaigns/);
  assert.doesNotMatch(text, /\bbet(s|ting)?\b|USDC/i);
});
