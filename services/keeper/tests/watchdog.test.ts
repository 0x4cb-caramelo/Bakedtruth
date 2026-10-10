/**
 * Purpose: the standby's rule at the send itself (a standby refuses to send while the primary answers, checked in
 *          signAndSend before any RPC call), the watchdog's probe and signed restart (verified by the primary's own
 *          verifier), the takeover timeline with the primary down, and a refused restart. No cluster; fake fetch.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { generateKeyPairSigner } from "@solana/kit";
import type { SolanaRpc } from "@brot/sdk/read";
import type { ReadyMessage } from "@brot/sdk/tx";

import type { Alerter, AlertKind } from "../src/alert";
import { buildMessage, setSendGate, signAndSend } from "../src/send";
import { verifyRestart } from "../src/restart";
import { INITIAL_WATCH, sendAllowed, type WatchRules, type WatchState } from "../src/standby";
import { watchdogTick, type FetchFn } from "../src/watchdog";

const SECRET = new TextEncoder().encode("0123456789abcdef0123456789abcdef");
const RULES: WatchRules = { takeoverAfterMs: 600_000, restartTries: 3, restartGapMs: 300_000 };
const T0 = 1_800_000_000_000;

afterEach(() => setSendGate(() => true));

function fakeRpc() {
  let sends = 0;
  const rpc = {
    getLatestBlockhash: () => ({
      send: async () => ({ value: { blockhash: "11111111111111111111111111111111", lastValidBlockHeight: 100n } }),
    }),
    sendTransaction: () => ({
      send: async () => {
        sends++;
        return "sig";
      },
    }),
  } as unknown as SolanaRpc;
  return { rpc, sends: () => sends };
}

function spyAlerter() {
  const kinds: AlertKind[] = [];
  const alerter: Alerter = {
    alert: (kind) => {
      kinds.push(kind);
      return true;
    },
  };
  return { alerter, kinds };
}

describe("the standby refuses to send while the primary is alive", () => {
  test("signAndSend throws before any RPC call when the gate is closed", async () => {
    const payer = await generateKeyPairSigner();
    const { rpc, sends } = fakeRpc();
    const message: ReadyMessage = await buildMessage(rpc, payer, []);
    setSendGate(() => sendAllowed("standby", { ...INITIAL_WATCH, takenOver: true }, true));
    await expect(signAndSend(rpc, message)).rejects.toThrow("not taking over");
    expect(sends()).toBe(0);
  });

  test("the same standby sends once the primary has stopped answering", async () => {
    const payer = await generateKeyPairSigner();
    const { rpc } = fakeRpc();
    const message: ReadyMessage = await buildMessage(rpc, payer, []);
    setSendGate(() => sendAllowed("standby", { ...INITIAL_WATCH, takenOver: true }, false));
    // The gate is open, so the send proceeds past the guard (it then fails on this fake RPC, which has no status).
    await expect(signAndSend(rpc, message)).rejects.not.toThrow("not taking over");
  });
});

describe("the watchdog with the primary down", () => {
  test("probes, restarts with a signature the primary accepts, then takes over at 25 minutes", async () => {
    const posts: { headers: Record<string, string> }[] = [];
    const fetchFn: FetchFn = async (input, init) => {
      if (init?.method === "POST") {
        posts.push({ headers: init.headers as Record<string, string> });
        return new Response("", { status: 202 });
      }
      throw new TypeError("connection refused");
    };
    const { alerter, kinds } = spyAlerter();
    let watch: WatchState = INITIAL_WATCH;
    let alive = true;
    for (let i = 0; i < 7; i++) {
      const now = T0 + i * 300_000;
      const next = await watchdogTick(watch, {
        primaryUrl: "https://ops.example.test",
        secret: SECRET,
        rules: RULES,
        alerter,
        now: () => now,
        fetchFn,
      });
      watch = next.state;
      alive = next.primaryAlive;
    }
    expect(alive).toBe(false);
    expect(kinds).toEqual([
      "primary_down",
      "restart_requested",
      "restart_requested",
      "restart_requested",
      "standby_took_over",
    ]);
    expect(posts).toHaveLength(3);
    const first = posts[0]!.headers;
    const verdict = verifyRestart({
      secret: SECRET,
      timestamp: first["x-brot-timestamp"] ?? null,
      signature: first["x-brot-signature"] ?? null,
      body: "",
      now: T0 + 600_000,
    });
    expect(verdict).toEqual({ ok: true });
    expect(sendAllowed("standby", watch, alive)).toBe(true);
  });

  test("a refused restart is alerted, and the count still moves on", async () => {
    const fetchFn: FetchFn = async (_input, init) =>
      init?.method === "POST" ? new Response("{}", { status: 401 }) : Promise.reject(new TypeError("down"));
    const { alerter, kinds } = spyAlerter();
    const watch: WatchState = { silentSince: T0, restarts: 0, lastRestartAt: null, takenOver: false };
    const next = await watchdogTick(watch, {
      primaryUrl: "https://ops.example.test",
      secret: SECRET,
      rules: RULES,
      alerter,
      now: () => T0 + 600_000,
      fetchFn,
    });
    expect(kinds).toEqual(["restart_requested", "restart_failed"]);
    expect(next.state.restarts).toBe(1);
  });

  test("a live primary raises no alert and keeps the gate closed", async () => {
    const fetchFn: FetchFn = async () => new Response("{}", { status: 200 });
    const { alerter, kinds } = spyAlerter();
    const next = await watchdogTick(INITIAL_WATCH, {
      primaryUrl: "https://ops.example.test",
      secret: SECRET,
      rules: RULES,
      alerter,
      now: () => T0,
      fetchFn,
    });
    expect(kinds).toEqual([]);
    expect(next.primaryAlive).toBe(true);
    expect(sendAllowed("standby", next.state, next.primaryAlive)).toBe(false);
  });
});
