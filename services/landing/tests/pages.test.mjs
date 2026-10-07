/**
 * Purpose: tests what the pages of the "coming soon" site promise without a browser: every file they point at exists,
 *          the suggestion draft keeps its mention and hashtag, the mascot has its poses and the deck its eight slides.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-05
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const home = read("index.html");
const deck = read("pitch/index.html");
const deck2 = read("pitch2/index.html");
const deck3 = read("pitch3/index.html");

/** Local files a page asks for through src="" and href="", resolved from the page's own folder. */
function localFiles(html, folder) {
  const found = [...html.matchAll(/\s(?:src|href)="([^"#?]+)(?:\?v=\d+)?"/g)].map((match) => match[1]);
  return found
    .filter((ref) => !/^[a-z]+:/.test(ref) && ref !== "/" && ref !== "/privacy")
    .map((ref) => (ref.startsWith("/") ? ref.slice(1) : join(folder, ref)));
}

test("every file the landing page and the deck point at exists", () => {
  const decks = [...localFiles(deck, "pitch"), ...localFiles(deck2, "pitch2"), ...localFiles(deck3, "pitch3")];
  const files = [...localFiles(home, ""), ...decks];
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
  assert.match(home, /<script type="module" src="mascot\.js\?v=\d+"><\/script>/);
});

test("every script and style is asked for with a version, and files that are shared agree on it", () => {
  // Cloudflare tells browsers to keep these files for hours. Without the version, a returning visitor gets the new
  // page with the old script and style, which is how the mascot went missing on the day it shipped.
  const versions = new Map(); // file name -> the versions it is asked for with
  const note = (file, version) => {
    assert.ok(version, `${file} has no version`);
    const name = file.split("/").pop();
    versions.set(name, (versions.get(name) ?? new Set()).add(version));
  };
  for (const page of [home, read("privacy.html"), read("404.html"), deck, deck2, deck3]) {
    const refs = [...page.matchAll(/\s(?:src|href)="([^"]+\.(?:js|css))(\?v=(\d+))?"/g)];
    assert.ok(refs.length >= 2, "the page loads its script and its style");
    for (const [, file, , version] of refs) note(file, version);
  }
  const modules = readdirSync(join(ROOT, "pitch3")).filter((name) => name.endsWith(".js"));
  assert.ok(modules.length >= 8, "the deck's motion is split in modules");
  let imported = 0;
  for (const script of ["mascot.js", ...modules.map((name) => `pitch3/${name}`)]) {
    for (const [, file, , version] of read(script).matchAll(/from "\.\/([a-z-]+\.js)(\?v=(\d+))?"/g)) {
      note(file, version);
      imported += 1;
    }
  }
  assert.ok(imported >= 10, "the modules import one another");
  for (const [name, asked] of versions) assert.equal(asked.size, 1, `${name} is asked for with ${[...asked]}`);
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
  assert.ok(deck.indexOf('src="deck-motion.js?') < deck.indexOf('src="deck.js?'), "deck-motion.js comes first");
  assert.ok(deck.indexOf('src="deck-motion.js?') > 0);
  for (const pose of [0, 1, 2, 3]) assert.match(deck, new RegExp(`<img data-pose="${pose}" src="img/`));
  for (const part of ["data-badge", "data-arrow", "data-lid", "data-spark"]) assert.ok(deck.includes(part), part);
  assert.ok(!/src="[0-9a-f]{8}-[0-9a-f-]{27}"/.test(deck), "no image id from the original export is left");
  assert.ok(!deck.includes("data-speaker-notes"), "the speaking notes are not published");
});

test("the third version of the deck has nine slides on the same stage, and keeps what the panel asked for", () => {
  const slides = [...deck2.matchAll(/<section class="slide" data-label="([^"]+)"/g)].map((match) => match[1]);
  const labels = "Title, Problem, Solution, Markets, Sponsors, How we earn, Market, Growth, Close";
  assert.equal(slides.join(", "), labels);
  assert.match(deck2, /<span data-count aria-live="polite">1 \/ 9<\/span>/);
  assert.ok(deck2.indexOf("deck-motion.js?") > 0 && deck2.indexOf("deck-motion.js?") < deck2.indexOf("deck.js?"));
  for (const pose of [0, 1, 2, 3]) assert.match(deck2, new RegExp(`<img data-pose="${pose}" src="\\.\\./pitch/img/`));
  for (const part of ["data-badge", "data-arrow", "data-lid", "data-spark"]) assert.ok(deck2.includes(part), part);
  const text = deck2.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ");
  // From the panel of 2026-10-06: no "bet", no jargon on the cover, no token card, and no universal promise on the fee.
  for (const word of [/\bbet(s|ting)?\b/i, /parimutuel/i, /pump\.fun token/i, /never costs/i, /always profit/i]) {
    assert.ok(!word.test(text), `the deck should not say ${word}`);
  }
  assert.match(text, /not audited/, "the cover says the product is in a test phase");
  // The founder's call of 2026-10-06 for this deck: one flat fee, said plainly. The plan still says otherwise.
  assert.match(text, /3\.5%\s+of every pot/);
});

test("the fourth version of the deck has its demo, its own motion and what the founder asked for on 2026-10-07", async () => {
  const slides = [...deck3.matchAll(/<section class="slide" data-label="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(
    slides.join(", "),
    "Title, Problem, Solution, Market, How we earn, Sponsors, Creators, Growth, Team, Close",
  );
  assert.equal([...deck3.matchAll(/data-member/g)].length, 3, "the team slide has its three people");
  // A count of partners is a claim about the business. The list holds examples for now, at the founder's request:
  // every one is marked as an example, has its image, and the card has the tag that says so.
  const { PARTNERS } = await import("../public/pitch3/partners.js");
  assert.ok(PARTNERS.length > 0 && PARTNERS.every((partner) => partner.example === true), "only marked examples");
  for (const partner of PARTNERS) assert.ok(existsSync(join(ROOT, "pitch3/img/partners", partner.logo)), partner.logo);
  assert.match(deck3, /data-partners-tag hidden>example</);
  assert.ok(deck3.includes("data-lite"), "the bar has the button of the lighter setting");
  assert.match(deck3, new RegExp(`<span data-count aria-live="polite">1 / ${slides.length}</span>`));
  // motion.js is a module and deck.js is deferred: both run in document order, and the listener has to come first.
  assert.ok(deck3.indexOf('src="motion.js?') > 0 && deck3.indexOf('src="motion.js?') < deck3.indexOf("deck.js?"));
  const hooks = ["data-demo", 'data-face="a"', 'data-face="b"', "data-cursor", "data-motion", "data-tam"];
  for (const part of [...hooks, "data-sticker", "data-pointer"]) assert.ok(deck3.includes(part), `${part} is missing`);
  // Every pose the scenes name has its image, and the scenes only name poses that exist.
  const poses = Object.fromEntries(
    [...read("pitch3/sprites.js").matchAll(/^ {2}([a-zA-Z]+): "([^"]+)",$/gm)].map((match) => [match[1], match[2]]),
  );
  assert.ok(Object.keys(poses).length >= 15, "sprites.js lists the poses");
  for (const file of Object.values(poses)) assert.ok(existsSync(join(ROOT, "pitch3/img", `${file}.webp`)), file);
  for (const name of readdirSync(join(ROOT, "pitch3")).filter((file) => file.endsWith(".js"))) {
    const asked = read(`pitch3/${name}`).matchAll(/(?:url|show|sprite\([a-z]+,)\(?\s*"([a-zA-Z]+)"/g);
    for (const [, pose] of asked) assert.ok(poses[pose], `${name} asks for the pose "${pose}", which is not listed`);
  }
  const text = deck3
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ");
  for (const word of [/\bbet(s|ting)?\b/i, /parimutuel/i, /break-even/i]) {
    assert.ok(!word.test(text), `the deck should not say ${word}`);
  }
  const gap = "(?:\\s|&nbsp;)+";
  assert.match(
    text,
    new RegExp(`brot\\.markets${gap}·${gap}x\\.com/brotmarkets`),
    "the cover ends with the two addresses",
  );
  assert.match(text, /On-chain KPI markets/i, "the line of the dropped Markets slide lives on the Sponsors slide");
  assert.match(text, /RESOLVED BY THE CHAIN/, "the demo says who resolved the market before showing the result");
  // The fee is the plan's again, 10% of the losing side, and the slide and the demo use the same rule.
  assert.match(text, /10%\s+of the losing side/);
  assert.ok(!/3\.5%/.test(text), "the flat fee the founder tried is gone from this deck");
  assert.match(read("pitch3/demo.js"), /const FEE = \{ of: "losers", rate: 0\.1 \};/);
  assert.match(text, /90% becomes the prize pool\. 10% is a marketing fee\./);
});
