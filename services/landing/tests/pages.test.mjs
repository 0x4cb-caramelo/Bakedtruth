/**
 * Purpose: tests what the pages of the "coming soon" site promise without a browser: every file they point at exists,
 *          the suggestion draft keeps its mention and hashtag, the mascot has its poses, the terms and privacy pages
 *          say what the reviewed texts in docs/legal say, and the deck at /pitch keeps what the founder decided. The
 *          earlier decks live in history/ and are not served, so they are not tested.
 * Version: 0.3.0 · Sprint: out of band (landing page), 2026-10-08
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const home = read("index.html");
const terms = read("terms.html");
const privacy = read("privacy.html");
const deck = read("pitch/index.html");
const LEGAL = join(ROOT, "..", "..", "..", "docs", "legal");

/** Local files a page asks for through src="" and href="", resolved from the page's own folder. */
function localFiles(html, folder) {
  const found = [...html.matchAll(/\s(?:src|href)="([^"#?]+)(?:\?v=\d+)?"/g)].map((match) => match[1]);
  return found
    .filter((ref) => !/^[a-z]+:/.test(ref) && !["/", "/privacy", "/terms"].includes(ref))
    .map((ref) => (ref.startsWith("/") ? ref.slice(1) : join(folder, ref)));
}

test("every file the landing page and the deck point at exists", () => {
  const pages = [home, terms, privacy, read("404.html")].flatMap((page) => localFiles(page, ""));
  const files = [...pages, ...localFiles(deck, "pitch")];
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
  // Keyed by the file's path in public/.
  const versions = new Map(); // path -> the versions it is asked for with
  const note = (path, version) => {
    assert.ok(version, `${path} has no version`);
    versions.set(path, (versions.get(path) ?? new Set()).add(version));
  };
  const pages = [
    ["", home],
    ["", privacy],
    ["", terms],
    ["", read("404.html")],
    ["pitch", deck],
  ];
  for (const [folder, page] of pages) {
    const refs = [...page.matchAll(/\s(?:src|href)="([^"]+\.(?:js|css))(\?v=(\d+))?"/g)];
    assert.ok(refs.length >= 2, "the page loads its script and its style");
    for (const [, file, , version] of refs) note(posix.join(folder, file.replace(/^\//, "")), version);
  }
  let imported = 0;
  for (const folder of ["pitch"]) {
    const modules = readdirSync(join(ROOT, folder)).filter((name) => name.endsWith(".js"));
    assert.ok(modules.length >= 8, "the deck's motion is split in modules");
    for (const script of modules.map((name) => `${folder}/${name}`)) {
      for (const [, file, , version] of read(script).matchAll(/from "\.\/([a-z-]+\.js)(\?v=(\d+))?"/g)) {
        note(`${folder}/${file}`, version);
        imported += 1;
      }
    }
  }
  for (const [, file, , version] of read("mascot.js").matchAll(/from "\.\/([a-z-]+\.js)(\?v=(\d+))?"/g)) {
    note(file, version);
    imported += 1;
  }
  assert.ok(imported >= 10, "the modules import one another");
  for (const [name, asked] of versions) assert.equal(asked.size, 1, `${name} is asked for with ${[...asked]}`);
});

test("the landing page keeps to its content policy: no inline style and no inline script", () => {
  for (const page of [home, privacy, terms, read("404.html")]) {
    assert.ok(!/\sstyle="/.test(page), "no style attribute");
    assert.ok(!/<style[\s>]/.test(page), "no style tag");
    assert.ok(!/<script(?![^>]*\ssrc=)[^>]*>/.test(page), "no inline script");
  }
});
test("the terms and privacy pages say what the reviewed texts in docs/legal say, each with its Baked", () => {
  const plain = (text) =>
    text
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/\*\*/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ");
  for (const [page, file, image] of [
    [terms, "TERMS-OF-SERVICE.md", "baked-terms.webp"],
    [privacy, "PRIVACY-POLICY.md", "baked-privacy.webp"],
  ]) {
    const md = readFileSync(join(LEGAL, file), "utf8").replace(/\r/g, "");
    const shown = plain(page);
    const headings = [...md.matchAll(/^#{2,3} (.+)$/gm)].map((match) => plain(match[1]));
    assert.ok(headings.length >= 8, `${file} has its sections`);
    for (const heading of headings) assert.ok(shown.includes(heading), `${file}: "${heading}" is not on the page`);
    const crumbs = md
      .split("\n\n")
      .filter((part) => part.startsWith("> "))
      .map((part) => plain(part.replace(/^> ?/gm, "").replace("**The crumb:** ", "")));
    assert.ok(crumbs.length >= 6, `${file} has its crumbs`);
    for (const crumb of crumbs) assert.ok(shown.includes(crumb), `${file}: a crumb is not on the page: ${crumb}`);
    assert.ok(!/\[[A-Z][A-Z ,]+[\]:]/.test(md + page), `${file} still has a blank to fill`);
    assert.ok(page.includes(`src="img/${image}"`), `${file}: the page shows its Baked`);
  }
  for (const page of [home, terms, privacy]) {
    const footer = page.slice(page.indexOf("<footer"));
    assert.match(footer, /href="\/terms"/);
    assert.match(footer, /href="\/privacy"/);
  }
  assert.match(privacy, /data-leave/, "the privacy page keeps the form to leave the waitlist");
});

test("the deck at /pitch keeps what the founder decided on 2026-10-08 and, for v5.1, on 2026-10-10", async () => {
  const slides = [...deck.matchAll(/<section class="slide" data-label="([^"]+)"/g)].map((match) => match[1]);
  // v5.1: "How we earn" and "Open a market" are gone, folded into the Solution demo; Market is two slides, one chart.
  const labels = "Title, Problem, Solution, Market, Projection, Growth, Team, Close";
  assert.equal(slides.join(", "), labels);
  assert.match(deck, new RegExp(`<span data-count aria-live="polite">1 / ${slides.length}</span>`));
  // motion.js is a module and deck.js is deferred: both run in document order, and the listener has to come first.
  assert.ok(deck.indexOf('src="motion.js?') > 0 && deck.indexOf('src="motion.js?') < deck.indexOf('src="deck.js?'));
  assert.ok(!deck.includes("../pitch/"), "the deck uses its own folder's stage, fonts and images");
  assert.ok(!deck.includes("data-speaker-notes"), "the speaking notes are not published");
  const text = deck
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ");
  assert.match(
    text,
    /Permissionless prediction markets that turn\s+on-chain\s+milestones into growth campaigns, settled by\s+the chain itself\./,
  );
  assert.equal([...text.matchAll(/PROOF &gt; PROMISES/g)].length, 1, "the motto is only on the last slide");
  assert.match(text, /one market settled on an event that never happened/);
  assert.ok(!/not to scale/i.test(text), "the market slide has no 'not to scale'");
  assert.match(text, /RESOLVED BY THE CHAIN/, "the demo says who resolved the market before showing the result");
  // The fee is 10% of the losing side and the creator's share is 1% of the volume. Everything is in SOL: the platform
  // has no other currency. Where the 1% comes from is one word in pot.js, which the founder still has to settle: the
  // deck says "out of our fee" (0.30, 0.10 and 9.60 of a 10 SOL pot) and the program takes it from the pot.
  assert.match(text, /10%\s+of the losing side/);
  assert.match(text, /1%\s+of the market's volume goes to whoever opened it/);
  assert.match(text, /SOL to the winners/);
  assert.match(text, /SOL to the creator/);
  assert.ok(!/USDC/.test(text) && !/USDC/.test(read("pitch/demo.js") + read("pitch/tally.js")), "no USDC anywhere");
  assert.match(read("pitch/pot.js"), /export const FEE = \{ of: "losers", rate: 0\.1 \};/);
  assert.match(read("pitch/pot.js"), /export const CREATOR = 0\.01;/);
  assert.match(read("pitch/pot.js"), /export const CREATOR_FROM = "(fee|pot)";/);
  assert.ok(!/pump\.fun/i.test(text) && !/Share to take a side/.test(text) && !deck.includes("data-arrow"));
  assert.match(text, /Launch fees, first 3 months/);
  // The market: the measured months come from one place (chart.js), and what comes after them is called what it is.
  assert.match(read("pitch/chart.js"), /const MEASURED = \[1\.14, 13\.22, 22\.2, 15\.44\];/);
  assert.match(text, /PROJECTION\.\s+The dashed line is our own scenario, not a measured figure/);
  assert.match(text, /world\.xyz\s*, the prediction market inside the Phantom wallet/);
  const hooks = ["data-demo", 'data-face="a"', 'data-face="b"', 'data-face="c"', "data-cursor", "data-balance"];
  const more = ["data-motion", "data-lite", 'data-chart="near"', 'data-chart="far"', "data-flag", "data-mk-words"];
  for (const part of [...hooks, ...more, "data-sticker", "data-card"]) {
    assert.ok(deck.includes(part), `${part} is missing`);
  }
  // A count of partners is a claim about the business. The list holds examples for now, at the founder's request:
  // every one is marked as an example, has its image, and the card has the tag that says so.
  const { PARTNERS } = await import("../public/pitch/partners.js");
  assert.ok(PARTNERS.length > 0 && PARTNERS.every((partner) => partner.example === true), "only marked examples");
  for (const partner of PARTNERS) assert.ok(existsSync(join(ROOT, "pitch/img/partners", partner.logo)), partner.logo);
  assert.match(deck, /data-partners-tag hidden>example</);
  // Every pose the scenes name has its image, and the scenes only name poses that exist.
  const poses = Object.fromEntries(
    [...read("pitch/sprites.js").matchAll(/^ {2}([a-zA-Z]+): "([^"]+)",$/gm)].map((match) => [match[1], match[2]]),
  );
  assert.ok(Object.keys(poses).length >= 12, "sprites.js lists the poses");
  for (const file of Object.values(poses)) assert.ok(existsSync(join(ROOT, "pitch/img", `${file}.webp`)), file);
  for (const name of readdirSync(join(ROOT, "pitch")).filter((file) => file.endsWith(".js"))) {
    const asked = read(`pitch/${name}`).matchAll(/(?:url|show|sprite\([a-z]+,)\(?\s*"([a-zA-Z]+)"/g);
    for (const [, pose] of asked) assert.ok(poses[pose], `${name} asks for the pose "${pose}", which is not listed`);
  }
  // The team: the founder's lines and brands, three LinkedIn pages opened outside the deck, a photo behind each drawing.
  for (const brands of ["Vega Crypto · hōl", "Lopes Galvão Advogados · Complian.cc", "Young Market · RealSet"]) {
    assert.ok(text.includes(brands), brands);
  }
  assert.match(text, /Decides what goes in the oven\./);
  const linkedIn =
    /<a class="member-name" href="(https:\/\/www\.linkedin\.com\/in\/[a-z-]+\/)" target="_blank" rel="noopener">/g;
  assert.equal([...deck.matchAll(linkedIn)].length, 3);
  for (const id of ["bernardo", "lucas", "ronaldo"])
    assert.ok(existsSync(join(ROOT, `pitch/img/team/${id}-real.webp`)));
  for (const word of [/\bbet(s|ting)?\b/i, /parimutuel/i, /break-even/i]) assert.ok(!word.test(text), `${word}`);
});
