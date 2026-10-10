/**
 * Purpose: tests the unlisted campaign preview under /dev0x/ over real HTTP: redirects, noindex, its CSP, the files it
 *          needs, the refusal of paths out of its folder, and that the site, /pitch and robots.txt are unchanged.
 * Version: 0.1.0 · Sprint: -1 (design system preview for the team), 2026-10-10
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createServer, request } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createLeadStore } from "../lib/leads.mjs";
import { createRateLimiter } from "../lib/rate-limit.mjs";
import { createApp } from "../server.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "public");
const CAMPAIGNS = join(HERE, "..", "..", "..", "prototype-lab", "campaigns");
const ORIGIN = "https://brot.markets";
// The site's policies, pinned: a change to them is a change to every page, so it must show up here.
const CSP_BASE = "default-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
const CSP_SITE = `${CSP_BASE}; style-src 'self'; script-src 'self'`;
const CSP_PITCH = `${CSP_BASE}; style-src 'self' 'unsafe-inline'; script-src 'self'`;
const leadsFile = join(mkdtempSync(join(tmpdir(), "brot-dev0x-")), "leads.jsonl");
let server;
let base;

before(async () => {
  const app = createApp({
    root: ROOT,
    campaignsRoot: CAMPAIGNS,
    store: createLeadStore(leadsFile),
    limiter: createRateLimiter({ limit: 50, windowMs: 60_000 }),
    allowedOrigins: [ORIGIN],
    siteOrigin: ORIGIN,
  });
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

/** A request whose path is sent as written, without the URL parser's normalisation that fetch applies. */
const raw = (path) =>
  new Promise((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port: server.address().port, path, method: "GET" }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.end();
  });

const get = (path) => fetch(base + path, { redirect: "manual" });

/** Every file in the prototype's folder, as URL paths under /dev0x/. */
function files(dir = CAMPAIGNS) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return files(full);
    return [`/dev0x/${relative(CAMPAIGNS, full).split("\\").join("/")}`];
  });
}

test("/dev0x answers 302 to /dev0x/, the prototype's links are relative", async () => {
  const res = await get("/dev0x");
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "/dev0x/");
});

test("/dev0x/ serves the prototype, out of search engines and archives", async () => {
  const res = await get("/dev0x/");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  assert.match(await res.text(), /Brot Markets · On-Chain Campaigns/);
});

test("the CSP allows the prototype's one inline script by its hash, and no other script or remote host", async () => {
  const res = await get("/dev0x/");
  const csp = res.headers.get("content-security-policy");
  const html = await res.text();
  const inline = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(inline, "the prototype keeps its inline theme script in index.html");
  const hash = createHash("sha256").update(inline[1]).digest("base64");
  assert.ok(csp.includes(`script-src 'self' 'sha256-${hash}'`), csp);
  assert.ok(!/script-src[^;]*unsafe-inline/.test(csp), "no inline scripts beyond that hash");
  assert.ok(!/script-src[^;]*unsafe-eval/.test(csp), "no eval");
  assert.ok(csp.includes("style-src 'self'; style-src-attr 'unsafe-inline'"), "stylesheets from the origin only");
  assert.ok(csp.includes("connect-src 'self'"), "nothing fetched from another host");
  assert.ok(csp.includes("default-src 'self'"));
  // The screens index and the share card frame the prototype's own pages: only this origin may frame it.
  assert.ok(csp.includes("frame-ancestors 'self'"), csp);
});

test("every file the prototype's index references exists under /dev0x/", async () => {
  const html = readFileSync(join(CAMPAIGNS, "index.html"), "utf8");
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((ref) => !/^(#|https?:|mailto:|\/\/)/.test(ref));
  assert.ok(refs.length >= 10, "the index references its stylesheets, scripts, fonts and icon");
  for (const ref of refs) {
    const res = await get(`/dev0x/${ref}`);
    assert.equal(res.status, 200, ref);
    await res.arrayBuffer();
  }
});

test("every file in the prototype's folder answers 200, its fonts and images included", async () => {
  for (const path of files()) {
    const res = await get(path);
    assert.equal(res.status, 200, path);
    await res.arrayBuffer();
  }
});

test("a path out of the prototype's folder is refused", async () => {
  for (const path of ["/dev0x/%2e%2e%2fserver.mjs", "/dev0x/%2e%2e%2f%2e%2e%2fpackage.json", "/dev0x/..%2flib%2fstatic.mjs"]) {
    const res = await raw(path);
    assert.equal(res.status, 404, path);
    assert.equal(res.body, "Not found", path);
  }
});

test("an unknown file under /dev0x answers 404", async () => {
  const res = await get("/dev0x/no-such-screen.js");
  assert.equal(res.status, 404);
});

test("the home page and /pitch do not link to /dev0x, and robots.txt says nothing about it", async () => {
  for (const path of ["/", "/pitch/"]) {
    const body = await (await get(path)).text();
    assert.ok(!body.includes("dev0x"), `${path} must not link to the preview`);
  }
  const robots = readFileSync(join(ROOT, "robots.txt"), "utf8");
  assert.ok(!robots.includes("dev0x"));
});

test("the home page and /pitch keep their headers", async () => {
  const home = await get("/");
  assert.equal(home.headers.get("content-security-policy"), CSP_SITE);
  assert.equal(home.headers.get("x-robots-tag"), null);
  const pitch = await get("/pitch/");
  assert.equal(pitch.headers.get("content-security-policy"), CSP_PITCH);
  assert.equal(pitch.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
});
