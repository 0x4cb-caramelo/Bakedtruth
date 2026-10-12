/**
 * Purpose: tests the waitlist store and the request limiter of the "coming soon" site (node --test).
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-05
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { CONSENT_VERSION, createLeadStore, normalizeEmail } from "../lib/leads.mjs";
import { createRateLimiter } from "../lib/rate-limit.mjs";

const tempFile = () => join(mkdtempSync(join(tmpdir(), "brot-leads-")), "leads.jsonl");

test("normalizeEmail trims and lowercases a valid address", () => {
  assert.equal(normalizeEmail("  Ana.Silva+brot@Example.COM "), "ana.silva+brot@example.com");
});

test("normalizeEmail rejects what is not an email", () => {
  const bad = [undefined, null, 42, "", "a@b", "no-at.example.com", "two@@example.com", "spa ce@example.com"];
  bad.push("a@-example.com", "a@example..com", "<script>@example.com", `${"a".repeat(65)}@example.com`);
  bad.push(`a@${"b".repeat(250)}.com`, "line\nbreak@example.com");
  for (const value of bad) assert.equal(normalizeEmail(value), null, String(value));
});

test("add stores one line per lead, with consent version and time, and nothing else", () => {
  const file = tempFile();
  const store = createLeadStore(file, { now: () => new Date("2026-10-05T21:00:00.000Z") });
  assert.equal(store.add("ana@example.com"), "added");
  const lines = readFileSync(file, "utf8").trim().split("\n");
  assert.equal(lines.length, 1);
  assert.deepEqual(JSON.parse(lines[0]), {
    email: "ana@example.com",
    at: "2026-10-05T21:00:00.000Z",
    consent: CONSENT_VERSION,
    source: "landing",
  });
});

test("add does not store the same address twice", () => {
  const file = tempFile();
  const store = createLeadStore(file);
  assert.equal(store.add("ana@example.com"), "added");
  assert.equal(store.add("ana@example.com"), "exists");
  assert.equal(store.count(), 1);
  assert.equal(readFileSync(file, "utf8").trim().split("\n").length, 1);
});

test("the store reloads what is on disk and skips a torn line", () => {
  const file = tempFile();
  createLeadStore(file).add("ana@example.com");
  writeFileSync(file, `${readFileSync(file, "utf8")}{"email":"bia@exam`);
  const reopened = createLeadStore(file);
  assert.equal(reopened.count(), 1);
  assert.equal(reopened.add("ana@example.com"), "exists");
});

test("add refuses new leads once the cap is reached", () => {
  const store = createLeadStore(tempFile(), { max: 2 });
  store.add("a1@example.com");
  store.add("a2@example.com");
  assert.equal(store.add("a3@example.com"), "full");
  assert.equal(store.add("a1@example.com"), "exists");
});

test("remove deletes the lead from memory and from the file", () => {
  const file = tempFile();
  const store = createLeadStore(file);
  store.add("ana@example.com");
  store.add("bia@example.com");
  assert.equal(store.remove("ana@example.com"), true);
  assert.equal(store.remove("ana@example.com"), false);
  const text = readFileSync(file, "utf8");
  assert.ok(!text.includes("ana@example.com"));
  assert.ok(text.includes("bia@example.com"));
  assert.equal(createLeadStore(file).count(), 1);
});

test("purgeOlderThan deletes only the leads past the retention period", () => {
  const file = tempFile();
  let clock = new Date("2025-09-01T00:00:00.000Z");
  const store = createLeadStore(file, { now: () => clock });
  store.add("old@example.com");
  clock = new Date("2026-06-01T00:00:00.000Z");
  store.add("recent@example.com");
  clock = new Date("2026-10-05T00:00:00.000Z");
  const year = 365 * 24 * 60 * 60 * 1000;
  assert.equal(store.purgeOlderThan(year), 1);
  assert.equal(store.purgeOlderThan(year), 0);
  assert.ok(!readFileSync(file, "utf8").includes("old@example.com"));
  assert.equal(store.add("recent@example.com"), "exists");
  assert.equal(store.add("old@example.com"), "added", "a purged address may join again");
});

test("the limiter allows `limit` calls per window and then refuses", () => {
  const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });
  assert.deepEqual(
    [1, 2, 3, 4].map(() => limiter.allow("k", 0)),
    [true, true, true, false],
  );
  assert.equal(limiter.allow("other", 0), true);
  assert.equal(limiter.allow("k", 1000), true, "a new window opens");
});

test("the limiter bounds its memory and forgets expired keys", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
  assert.equal(limiter.allow("a", 0), true);
  assert.equal(limiter.allow("b", 0), true);
  assert.equal(limiter.allow("c", 10), false, "full: a new key is refused");
  assert.equal(limiter.allow("c", 2000), true, "expired keys were pruned");
  assert.equal(limiter.size(), 1);
});

test("the limiter forgets an address once its window has ended, as the privacy page says", () => {
  const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });
  limiter.allow("203.0.113.7", 0);
  limiter.allow("198.51.100.9", 30_000);
  limiter.sweep(59_999);
  assert.equal(limiter.size(), 2, "both windows are still open");
  limiter.sweep(60_000);
  assert.equal(limiter.size(), 1, "the first address is gone when its minute ends");
  limiter.sweep(90_000);
  assert.equal(limiter.size(), 0, "and so is the second");
});
