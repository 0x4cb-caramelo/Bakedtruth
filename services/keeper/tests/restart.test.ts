/**
 * Purpose: POST /restart's refusals and its one acceptance: an unsigned, wrongly signed, stale, future or
 *          re-bodied request is refused with 401 and writes nothing; a valid one writes the flag. Also the
 *          health router: /healthz still answers, /restart exists only with a handler, other paths are 404.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import { describe, expect, test } from "bun:test";

import { startHealth, type KeeperState } from "../src/health";
import { RESTART_PATH, handleRestart, signRestart, verifyRestart } from "../src/restart";

const SECRET = new TextEncoder().encode("test-secret-test-secret-test-secret-32");
const NOW = 1_800_000_000_000;
const TS = String(NOW / 1000);
const BODY = '{"reason":"watchdog"}';
const FLAG = "/run/test/restart.flag";

function request(opts: { method?: string; timestamp?: string | null; signature?: string | null; body?: string }) {
  const headers = new Headers();
  if (opts.timestamp) headers.set("x-brot-timestamp", opts.timestamp);
  if (opts.signature) headers.set("x-brot-signature", opts.signature);
  return new Request(`http://127.0.0.1/restart`, {
    method: opts.method ?? "POST",
    headers,
    body: opts.body ?? BODY,
  });
}

function spy() {
  const writes: Array<[string, string]> = [];
  const write = async (path: string, text: string) => {
    writes.push([path, text]);
  };
  return { writes, write };
}

const deps = (write: ReturnType<typeof spy>["write"]) => ({ secret: SECRET, flagPath: FLAG, now: () => NOW, write });

describe("signRestart and verifyRestart", () => {
  test("a signature over timestamp and body is lowercase hex and verifies", () => {
    const sig = signRestart(SECRET, TS, BODY);
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
    expect(verifyRestart({ secret: SECRET, timestamp: TS, signature: sig, body: BODY, now: NOW })).toEqual({
      ok: true,
    });
  });

  test("the timestamp is bound: 60 s either side is accepted, 61 s is refused", () => {
    const sig = signRestart(SECRET, TS, BODY);
    const at = (seconds: number) =>
      verifyRestart({ secret: SECRET, timestamp: TS, signature: sig, body: BODY, now: NOW + seconds * 1000 });
    expect(at(60)).toEqual({ ok: true });
    expect(at(-60)).toEqual({ ok: true });
    expect(at(61)).toEqual({ ok: false, reason: "stale or future timestamp" });
    expect(at(-61)).toEqual({ ok: false, reason: "stale or future timestamp" });
  });

  test("a non-numeric timestamp is refused as stale", () => {
    expect(verifyRestart({ secret: SECRET, timestamp: "12e3", signature: "x", body: BODY, now: NOW })).toEqual({
      ok: false,
      reason: "stale or future timestamp",
    });
  });
});

describe("handleRestart", () => {
  test("a valid signed request is accepted and writes the flag once", async () => {
    const { writes, write } = spy();
    const sig = signRestart(SECRET, TS, BODY);
    const response = await handleRestart(request({ timestamp: TS, signature: sig }), deps(write));
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ accepted: true });
    expect(writes).toEqual([[FLAG, TS]]);
  });

  test.each([
    ["an unsigned request", { timestamp: TS, signature: null }, "missing headers"],
    ["no timestamp", { timestamp: null, signature: "ab" }, "missing headers"],
    ["a wrong signature", { timestamp: TS, signature: "0".repeat(64) }, "bad signature"],
    ["a signature of the wrong length", { timestamp: TS, signature: "abc" }, "bad signature"],
    [
      "a stale timestamp",
      { timestamp: String(NOW / 1000 - 61), signature: signRestart(SECRET, String(NOW / 1000 - 61), BODY) },
      "stale or future timestamp",
    ],
    [
      "a future timestamp",
      { timestamp: String(NOW / 1000 + 61), signature: signRestart(SECRET, String(NOW / 1000 + 61), BODY) },
      "stale or future timestamp",
    ],
  ])("%s is refused with 401 and writes nothing", async (_label, headers, reason) => {
    const { writes, write } = spy();
    const response = await handleRestart(request(headers), deps(write));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: reason });
    expect(writes).toEqual([]);
  });

  test("a changed body is refused: the signature covers the body", async () => {
    const { writes, write } = spy();
    const sig = signRestart(SECRET, TS, BODY);
    const response = await handleRestart(
      request({ timestamp: TS, signature: sig, body: '{"reason":"x"}' }),
      deps(write),
    );
    expect(response.status).toBe(401);
    expect(writes).toEqual([]);
  });

  test("a signature made with another secret is refused", async () => {
    const { writes, write } = spy();
    const other = new TextEncoder().encode("another-secret-another-secret-32-bytes");
    const response = await handleRestart(
      request({ timestamp: TS, signature: signRestart(other, TS, BODY) }),
      deps(write),
    );
    expect(response.status).toBe(401);
    expect(writes).toEqual([]);
  });

  test("a refusal never echoes the signature or the secret", async () => {
    const { write } = spy();
    const sig = "f".repeat(64);
    const response = await handleRestart(request({ timestamp: TS, signature: sig }), deps(write));
    const text = await response.text();
    expect(text).not.toContain(sig);
    expect(text).not.toContain(new TextDecoder().decode(SECRET));
  });

  test("GET is refused with 405 and writes nothing", async () => {
    const { writes, write } = spy();
    const response = await handleRestart(request({ method: "GET", timestamp: TS, signature: "x" }), deps(write));
    expect(response.status).toBe(405);
    expect(writes).toEqual([]);
  });
});

describe("startHealth routing", () => {
  const state: KeeperState = { cluster: "devnet", startedAt: "t0", cycles: 1, last: null, lastError: null };

  test("/healthz answers with the state; /restart and other paths are 404 without a handler", async () => {
    const server = startHealth("127.0.0.1", 0, () => state);
    try {
      const ok = await fetch(`http://127.0.0.1:${server.port}/healthz`);
      expect(ok.status).toBe(200);
      expect(await ok.json()).toEqual(state);
      expect((await fetch(`http://127.0.0.1:${server.port}${RESTART_PATH}`, { method: "POST" })).status).toBe(404);
      expect((await fetch(`http://127.0.0.1:${server.port}/other`)).status).toBe(404);
    } finally {
      server.stop(true);
    }
  });

  test("with a handler, POST /restart is routed to it and other paths stay 404", async () => {
    const server = startHealth(
      "127.0.0.1",
      0,
      () => state,
      async () => new Response("routed", { status: 202 }),
    );
    try {
      const routed = await fetch(`http://127.0.0.1:${server.port}${RESTART_PATH}`, { method: "POST" });
      expect(routed.status).toBe(202);
      expect(await routed.text()).toBe("routed");
      expect((await fetch(`http://127.0.0.1:${server.port}/restart/extra`, { method: "POST" })).status).toBe(404);
    } finally {
      server.stop(true);
    }
  });
});
