/**
 * Purpose: tests docs.brot.markets: each generated page says what its text in docs/wiki says, every page is in the
 *          menu, every link and file a page points at exists, the server answers the docs host apart from the site,
 *          and, offline (the founder, 2026-10-10, until the docs are rewritten), it answers every docs path with 410.
 * Version: 0.2.0 · Sprint: out of band (landing page), 2026-10-08; 2026-10-10 (offline)
 */
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { createServer, request } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createLeadStore } from "../lib/leads.mjs";
import { createRateLimiter } from "../lib/rate-limit.mjs";
import { createApp } from "../server.mjs";

const HERE = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(HERE, "public");
const DOCS = join(HERE, "docs-site");
const WIKI = join(HERE, "..", "..", "docs", "wiki");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Every file under a folder, as paths with forward slashes. */
const walk = (root, dir = root) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(root, join(dir, e.name)) : [relative(root, join(dir, e.name)).split("\\").join("/")],
  );
const wikiPages = walk(WIKI).filter((f) => f.endsWith(".md") && f !== "README.md");
const htmlPages = walk(DOCS).filter((f) => f.endsWith(".html"));
const html = (file) => readFileSync(join(DOCS, file), "utf8");

test("each docs page says what its text in docs/wiki says", () => {
  assert.ok(wikiPages.length >= 7, "the wiki has its pages");
  for (const md of wikiPages) {
    const page = md.replace(/\.md$/, ".html");
    assert.ok(existsSync(join(DOCS, page)), `${page} is missing: run scripts/build-docs.mjs`);
    const text = readFileSync(join(WIKI, md), "utf8").replace(/\r/g, "");
    const out = html(page);
    for (const [, level, heading] of text.matchAll(/^(#{1,3}) (.+)$/gm)) {
      const tag = `h${level.length}`;
      assert.ok(
        new RegExp(`<${tag}[^>]*>`).test(out) && out.includes(`>${esc(heading)}</${tag}>`),
        `${page}: ${heading}`,
      );
    }
    const bite = text.match(/^> \*\*In one bite:\*\* ([\s\S]*?)\n\n/m);
    assert.ok(bite, `${md} opens with "In one bite"`);
    const crumb = esc(bite[1].replace(/\n> ?/g, " "));
    assert.ok(out.includes(`<strong>In one bite:</strong> ${crumb}`), `${page} carries the bite of ${md}`);
    const description = text.match(/^description: (.+)$/m)[1];
    assert.ok(out.includes(`<meta name="description" content="${description}" />`), `${page} has its description`);
  }
});

test("every page is in the menu, and the menu marks the page you are on", () => {
  const home = html("index.html");
  for (const md of wikiPages) {
    const href = `/${md.replace(/\.md$/, "")}`;
    assert.ok(home.includes(`href="${href}"`), `the menu links to ${href}`);
    assert.ok(html(`${md.replace(/\.md$/, "")}.html`).includes(`href="${href}" aria-current="page"`));
  }
});

test("every link and file a docs page points at exists, and no link points at a .md file", () => {
  for (const page of htmlPages) {
    const refs = [...html(page).matchAll(/\s(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (/^https?:/.test(ref)) continue;
      assert.ok(ref.startsWith("/"), `${page}: ${ref} is absolute, so it works from any folder`);
      assert.ok(!/\.md(#|$)/.test(ref), `${page}: ${ref} points at Markdown`);
      const path = ref.split(/[?#]/)[0];
      const found =
        path === "/" ||
        existsSync(join(DOCS, `${path}.html`)) ||
        existsSync(join(DOCS, path)) ||
        (/^\/(img|fonts)\/|^\/(styles\.css|app\.js)$/.test(path) && existsSync(join(SITE, path)));
      assert.ok(found, `${page}: ${ref} does not exist`);
    }
  }
});

let server;
before(async () => {
  const app = createApp({
    root: SITE,
    docsRoot: DOCS,
    store: createLeadStore(join(mkdtempSync(join(tmpdir(), "brot-docs-")), "leads.jsonl")),
    limiter: createRateLimiter({ limit: 50, windowMs: 60_000 }),
    allowedOrigins: ["https://brot.markets"],
    siteOrigin: "https://brot.markets",
  });
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
});
after(() => new Promise((resolve) => server.close(resolve)));

/** One request with the Host header a visitor's browser would send. */
const ask = (host, path, method = "GET") =>
  new Promise((resolve, reject) => {
    const { port } = server.address();
    const req = request({ host: "127.0.0.1", port, path, method, headers: { Host: host } }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on("error", reject);
    req.end();
  });

test("the docs host serves the docs and borrows only the site's shared files", async () => {
  const docs = "docs.brot.markets";
  const home = await ask(docs, "/");
  assert.equal(home.status, 200);
  assert.match(home.body, /<h1>Brot Markets docs<\/h1>/);
  assert.equal(home.headers["x-robots-tag"], "noindex, nofollow", "out of search engines until approved");
  assert.match(home.headers["content-security-policy"], /script-src 'self'$/);
  assert.equal((await ask(docs, "/how-it-works/the-pot")).status, 200);
  assert.equal((await ask(docs, "/styles.css")).status, 200);
  assert.equal((await ask(docs, "/img/baked-point.webp")).status, 200);
  const missing = await ask(docs, "/privacy");
  assert.equal(missing.status, 404, "the site's pages are not served under the docs host");
  assert.match(missing.body, /Not baked yet/);
  assert.equal((await ask(docs, "/pitch/")).status, 404);
  assert.equal((await ask(docs, "/api/leads", "POST")).status, 405, "no waitlist API on the docs host");
});

test("offline, the docs host answers every path with 410 and serves nothing, while the site stays up", async () => {
  const app = createApp({
    root: SITE,
    docsRoot: DOCS,
    docsOffline: true,
    store: createLeadStore(join(mkdtempSync(join(tmpdir(), "brot-docs-")), "leads.jsonl")),
    limiter: createRateLimiter({ limit: 50, windowMs: 60_000 }),
    allowedOrigins: ["https://brot.markets"],
    siteOrigin: "https://brot.markets",
  });
  const offline = createServer(app);
  await new Promise((resolve) => offline.listen(0, "127.0.0.1", resolve));
  const askOffline = (host, path, method = "GET") =>
    new Promise((resolve, reject) => {
      const { port } = offline.address();
      const req = request({ host: "127.0.0.1", port, path, method, headers: { Host: host } }, (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
      });
      req.on("error", reject);
      req.end();
    });
  try {
    for (const path of ["/", "/how-it-works/the-pot", "/styles.css", "/404.html"]) {
      const res = await askOffline("docs.brot.markets", path);
      assert.equal(res.status, 410, `${path} is gone`);
      assert.match(res.body, /offline while we rewrite them/);
      assert.ok(!res.body.includes("<"), "no page of the old docs is served");
      assert.equal(res.headers["x-robots-tag"], "noindex, nofollow");
    }
    assert.equal((await askOffline("docs.brot.markets", "/api/leads", "POST")).status, 410);
    assert.equal((await askOffline("brot.markets", "/")).status, 200, "the site itself stays up");
    assert.equal((await askOffline("brot.markets", "/privacy")).status, 200);
  } finally {
    await new Promise((resolve) => offline.close(resolve));
  }
});

test("the site host does not serve the docs, and the docs rule leaves the site indexable", async () => {
  const site = await ask("brot.markets", "/");
  assert.equal(site.status, 200);
  assert.equal(site.headers["x-robots-tag"], undefined);
  assert.equal((await ask("brot.markets", "/docs.css")).status, 404);
  assert.equal((await ask("brot.markets", "/market-types")).status, 404);
});
