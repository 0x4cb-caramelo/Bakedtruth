/**
 * Purpose: tests the "coming soon" site over real HTTP: waitlist API rules, static files, headers and /pitch.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-05
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { createServer, request } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createLeadStore } from "../lib/leads.mjs";
import { createRateLimiter } from "../lib/rate-limit.mjs";
import { resolveStatic } from "../lib/static.mjs";
import { createApp } from "../server.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const ORIGIN = "https://brot.markets";
const leadsFile = join(mkdtempSync(join(tmpdir(), "brot-site-")), "leads.jsonl");
const logs = [];
let server;
let base;

before(async () => {
  const app = createApp({
    root: ROOT,
    store: createLeadStore(leadsFile),
    limiter: createRateLimiter({ limit: 50, windowMs: 60_000 }),
    allowedOrigins: [ORIGIN],
    siteOrigin: ORIGIN,
    log: (line) => logs.push(line),
  });
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

const post = (path, body, headers = {}) =>
  fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const stored = () => readFileSync(leadsFile, "utf8");

test("joining stores the email; joining again answers the same and stores nothing new", async () => {
  const first = await post("/api/leads", { email: "Ana@Example.com", consent: true, company: "" });
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { ok: true });
  const again = await post("/api/leads", { email: "ana@example.com", consent: true });
  assert.equal(again.status, 200);
  assert.deepEqual(await again.json(), { ok: true });
  assert.equal(stored().trim().split("\n").length, 1);
  assert.ok(
    logs.every((line) => !line.includes("ana@")),
    "the log never carries an email",
  );
});

test("joining needs consent and a valid email", async () => {
  assert.equal((await post("/api/leads", { email: "bia@example.com" })).status, 400);
  assert.equal((await post("/api/leads", { email: "bia@example.com", consent: "yes" })).status, 400);
  assert.equal((await post("/api/leads", { email: "not-an-email", consent: true })).status, 400);
  assert.equal((await post("/api/leads", "[1,2]")).status, 400);
  assert.equal((await post("/api/leads", "{broken")).status, 400);
  assert.ok(!stored().includes("bia@example.com"));
});

test("a filled hidden field is treated as a bot: ok is answered and nothing is stored", async () => {
  const res = await post("/api/leads", { email: "bot@example.com", consent: true, company: "ACME" });
  assert.equal(res.status, 200);
  assert.ok(!stored().includes("bot@example.com"));
});

test("requests from another site, without JSON or too large are refused", async () => {
  const body = { email: "cai@example.com", consent: true };
  assert.equal((await post("/api/leads", body, { Origin: "https://evil.example" })).status, 403);
  assert.equal((await post("/api/leads", body, { "Content-Type": "text/plain" })).status, 415);
  assert.equal(
    (await post("/api/leads", { email: "cai@example.com", consent: true, pad: "x".repeat(4000) })).status,
    413,
  );
  assert.equal((await fetch(`${base}/api/leads`)).status, 405);
  assert.ok(!stored().includes("cai@example.com"));
});

test("leaving deletes the email, and answers ok even for an address that was never listed", async () => {
  await post("/api/leads", { email: "dora@example.com", consent: true });
  assert.ok(stored().includes("dora@example.com"));
  assert.equal((await post("/api/leads/remove", { email: "dora@example.com" })).status, 200);
  assert.ok(!stored().includes("dora@example.com"));
  assert.equal((await post("/api/leads/remove", { email: "nobody@example.com" })).status, 200);
});

test("the limiter answers 429 after the allowed number of calls", async () => {
  const app = createApp({
    root: ROOT,
    store: createLeadStore(join(mkdtempSync(join(tmpdir(), "brot-limit-")), "leads.jsonl")),
    limiter: createRateLimiter({ limit: 2, windowMs: 60_000 }),
    allowedOrigins: [ORIGIN],
  });
  const limited = createServer(app);
  await new Promise((resolve) => limited.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${limited.address().port}/api/leads`;
  const call = () =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"email":"x"}' });
  const statuses = [(await call()).status, (await call()).status, (await call()).status];
  await new Promise((resolve) => limited.close(resolve));
  assert.deepEqual(statuses, [400, 400, 429]);
});

test("pages are served with the security headers", async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
  const csp = res.headers.get("content-security-policy");
  assert.match(csp, /default-src 'self'/);
  assert.ok(!csp.includes("unsafe-inline"), "the landing page allows no inline style or script");
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-robots-tag"), null);
  assert.match(await res.text(), /Brot Markets/);
  assert.equal((await fetch(`${base}/privacy`)).status, 200);
  assert.equal(await (await fetch(`${base}/healthz`)).text(), "ok");
});

test("/pitch is served, is reachable by link only and is kept out of search engines", async () => {
  const bare = await fetch(`${base}/pitch`, { redirect: "manual" });
  assert.equal(bare.status, 308);
  assert.equal(bare.headers.get("location"), "/pitch/");
  const res = await fetch(`${base}/pitch/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("x-robots-tag"), /noindex/);
  assert.match(await res.text(), /<meta name="robots" content="noindex/);
  // The deck keeps its author's inline styles, and its motion is served as a script.
  assert.match(res.headers.get("content-security-policy"), /style-src 'self' 'unsafe-inline'/);
  assert.match((await fetch(`${base}/pitch/motion.js?v=6`)).headers.get("content-type"), /javascript/);
  // The earlier decks are no longer served: their addresses, and anything under them, go to the current deck.
  for (const old of ["/pitch2", "/pitch2/", "/pitch3/", "/pitch3/motion.js?v=6", "/pitch4/"]) {
    const moved = await fetch(`${base}${old}`, { redirect: "manual" });
    assert.equal(moved.status, 302, old);
    assert.equal(moved.headers.get("location"), "/pitch/", old);
  }
  assert.equal((await fetch(`${base}/pitchfork`)).status, 404, "only /pitch followed by digits is redirected");
  const home = await (await fetch(`${base}/`)).text();
  assert.ok(!home.includes("/pitch"), "the landing page does not link to the deck");
  assert.ok(!(await (await fetch(`${base}/robots.txt`)).text()).includes("pitch"), "robots.txt does not announce it");
});

test("unknown paths and attempts to leave the public folder answer 404", async () => {
  for (const path of [
    "/nope",
    "/..%2f..%2fserver.mjs",
    "/%2e%2e/server.mjs",
    "/lib/leads.mjs",
    "/%00",
    "/a%5c..%5cb",
  ]) {
    const res = await fetch(base + path);
    assert.equal(res.status, 404, path);
    assert.ok(!(await res.text()).includes("createApp"), path);
  }
  assert.equal((await fetch(`${base}/`, { method: "DELETE" })).status, 405);
});

test("a folder redirect is built from the validated path and cannot point at another host", () => {
  assert.deepEqual(resolveStatic(ROOT, "/pitch"), { redirect: "/pitch/" });
  assert.deepEqual(resolveStatic(ROOT, "//pitch"), { redirect: "/pitch/" });
  assert.deepEqual(resolveStatic(ROOT, "//evil.example/../pitch"), { redirect: "/pitch/" });
  assert.deepEqual(resolveStatic(ROOT, "/%2Fevil.example/..%2Fpitch"), { redirect: "/pitch/" });
});

test("www is sent to the bare domain, keeping path and query and nothing else", async () => {
  const ask = (path) =>
    new Promise((resolve, reject) => {
      const { port } = server.address();
      const req = request({ host: "127.0.0.1", port, path, headers: { Host: "www.brot.markets" } }, (res) => {
        res.resume();
        resolve({ status: res.statusCode, location: res.headers.location });
      });
      req.on("error", reject);
      req.end();
    });
  assert.deepEqual(await ask("/privacy?theme=dark"), {
    status: 301,
    location: "https://brot.markets/privacy?theme=dark",
  });
  assert.deepEqual(await ask("//evil.example/x"), { status: 301, location: "https://brot.markets/x" });
});
