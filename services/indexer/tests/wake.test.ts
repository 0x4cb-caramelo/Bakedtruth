/**
 * Purpose: the ingest's wake-up hint (Sprint 08 DoD "Ingestion": `logsSubscribe` as a wake-up only), no cluster: the
 *          waker sleeps until its timer or a poke, coalesces pokes and keeps a minimum gap; over a real WebSocket
 *          speaking the RPC's protocol, Kit's subscription asks for the program's logs at `finalized`, each
 *          notification pokes the waker; a socket closed cleanly (which Kit never reports) is renewed, a broken one
 *          and a subscribe never answered are named and tried again; aborting stops it. The notification's content is
 *          never read.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { afterAll, describe, expect, test } from "bun:test";
import type { ServerWebSocket } from "bun";
import { PROGRAM_ID } from "@brot/sdk/read";

import { createWaker, followLogs, logsSubscriber, type Subscribe } from "../src/wake";

describe("the waker", () => {
  test("a timer, a poke, pokes that coalesce, and the minimum gap", async () => {
    const waker = createWaker(0);
    expect(await waker.wait(5)).toBe("timer");
    setTimeout(() => waker.poke(), 5);
    expect(await waker.wait(5_000)).toBe("logs");
    waker.poke();
    waker.poke();
    expect(await waker.wait(5_000)).toBe("logs"); // a poke while nobody waited ends the next wait at once
    expect(await waker.wait(5)).toBe("timer"); // the two pokes were one
    const gapped = createWaker(60);
    const start = Date.now();
    gapped.poke();
    expect(await gapped.wait(5_000)).toBe("logs");
    expect(Date.now() - start).toBeGreaterThanOrEqual(55);
  });
});

describe("the follower", () => {
  test("a subscribe the node never answers is given up on, named, and tried again", async () => {
    let calls = 0;
    const hang: Subscribe = (signal) => {
      calls += 1;
      return new Promise((_, reject) => signal.addEventListener("abort", () => reject(signal.reason)));
    };
    const stop = new AbortController();
    const events: string[] = [];
    const log = (fields: Record<string, unknown>) => events.push(`${fields.event}:${fields.error}`);
    const following = followLogs(hang, createWaker(0), {
      ...{ signal: stop.signal, log, minBackoffMs: 10, maxBackoffMs: 20, quietMs: 30 },
    });
    for (let i = 0; i < 100 && calls < 3; i++) await Bun.sleep(10);
    stop.abort();
    await following;
    expect(calls).toBeGreaterThanOrEqual(3);
    expect(events[0]).toBe("logs-error:SubscribeTimeout");
  });
});

describe("logsSubscribe over a WebSocket", () => {
  const asked: unknown[] = [];
  const sockets: ServerWebSocket<unknown>[] = [];
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: (request, s) => (s.upgrade(request) ? undefined : new Response("no", { status: 400 })),
    websocket: {
      open: (ws) => void sockets.push(ws),
      message(ws, raw) {
        const call = JSON.parse(String(raw)) as { id?: number; method?: string; params?: unknown };
        if (call.method !== "logsSubscribe") return; // a ping or anything else: ignored
        asked.push(call.params);
        ws.send(JSON.stringify({ jsonrpc: "2.0", id: call.id, result: 41 }));
        const value = { signature: "1".repeat(64), err: null, logs: ["Program log: not read"] };
        const note = { subscription: 41, result: { context: { slot: 1 }, value } };
        setTimeout(() => ws.send(JSON.stringify({ jsonrpc: "2.0", method: "logsNotification", params: note })), 10);
      },
    },
  });
  afterAll(() => server.stop(true));

  test("asks for the program's logs at finalized, pokes on each; a clean close is renewed, a broken one retried", async () => {
    const waker = createWaker(0);
    const stop = new AbortController();
    const events: string[] = [];
    const log = (fields: Record<string, unknown>) =>
      events.push(`${fields.event}${fields.error ? `:${fields.error}` : ""}`);
    const following = followLogs(logsSubscriber(`ws://127.0.0.1:${server.port}`), waker, {
      ...{ signal: stop.signal, log, minBackoffMs: 20, maxBackoffMs: 200, quietMs: 150 },
    });
    const subscribed = async (n: number) => {
      for (let i = 0; i < 150 && asked.length < n; i++) await Bun.sleep(20);
      expect(asked.length).toBeGreaterThanOrEqual(n);
    };
    expect(await waker.wait(5_000)).toBe("logs");
    // Kit leaves out a "finalized" commitment, the node's own default; anything lower would be sent.
    const [filter, config] = asked[0] as [unknown, { commitment?: string } | undefined];
    expect([filter, config?.commitment ?? "finalized"]).toEqual([{ mentions: [PROGRAM_ID] }, "finalized"]);
    // A clean close (code 1000) is never reported by Kit: the quiet subscription is renewed.
    sockets[0].close(1000);
    await subscribed(2);
    expect(await waker.wait(5_000)).toBe("logs");
    // A broken socket (no close frame) is an error: logged by name, and subscribed again.
    sockets.at(-1)!.terminate();
    await subscribed(3);
    expect(await waker.wait(5_000)).toBe("logs");
    stop.abort();
    await following;
    expect(events[0]).toBe("logs-subscribed");
    expect(events.some((e) => e.startsWith("logs-error"))).toBe(true);
    expect(JSON.stringify(events)).not.toContain("127.0.0.1");
  });
});
