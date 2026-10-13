/**
 * Purpose: the ingest's wake-up hint (proposal §2.7 "Latency"; TP §3.5; Sprint 08 DoD "Ingestion"): `logsSubscribe`
 *          with `mentions` the program, at `finalized`, through Kit's subscriptions over the indexer's WebSocket URL.
 *          A notification only pokes the waker, which ends the ingest's sleep early; the ingest then lists and reads at
 *          `finalized` exactly as on its timer. Nothing a notification carries is read or stored: the finalized
 *          polling stays the only source of truth for every row, money and points included. Pokes coalesce, and a
 *          refresh never follows the last one by less than `minGapMs`. A failed subscription reconnects after a
 *          backoff, 1 s doubling to 60 s (back to 1 s once one has lasted a minute or delivered a notification); a
 *          quiet one is renewed every `quietMs` (5 minutes), because Kit 8.4 never reports a socket the node closed
 *          cleanly (code 1000) and its subscription would wait forever. While it is down, the timer still polls.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { createSolanaRpcSubscriptions } from "@solana/kit";
import { PROGRAM_ID } from "@brot/sdk/read";

export type Waker = {
  /** A hint that the program has a new finalized transaction. */
  poke(): void;
  /** Resolves after `ms`, or earlier on a poke (never sooner than `minGapMs` after the call). */
  wait(ms: number): Promise<"timer" | "logs">;
};

export function createWaker(minGapMs = 1_000, now: () => number = Date.now): Waker {
  let pending = false;
  let onPoke: (() => void) | null = null;
  return {
    poke() {
      pending = true;
      onPoke?.();
    },
    wait(ms) {
      const start = now();
      return new Promise((resolve) => {
        let early: ReturnType<typeof setTimeout> | undefined;
        const finish = (why: "timer" | "logs") => {
          clearTimeout(timer);
          clearTimeout(early);
          onPoke = null;
          pending = false;
          resolve(why);
        };
        const timer = setTimeout(() => finish("timer"), ms);
        onPoke = () => {
          const left = minGapMs - (now() - start);
          if (left <= 0) finish("logs");
          else early ??= setTimeout(() => finish("logs"), left);
        };
        if (pending) onPoke();
      });
    },
  };
}

/** Opens one subscription; its iterator ends or throws when the socket drops. */
export type Subscribe = (signal: AbortSignal) => Promise<AsyncIterable<unknown>>;

/** The program's logs at `finalized` over `wsUrl` (a secret when it carries a key: never logged). */
export function logsSubscriber(wsUrl: string): Subscribe {
  const subscriptions = createSolanaRpcSubscriptions(wsUrl);
  return (signal) =>
    subscriptions
      .logsNotifications({ mentions: [PROGRAM_ID] }, { commitment: "finalized" })
      .subscribe({ abortSignal: signal });
}

export type FollowOptions = {
  signal: AbortSignal;
  log: (fields: Record<string, unknown>) => void;
  minBackoffMs?: number;
  maxBackoffMs?: number;
  /** A subscription silent this long is renewed (a cleanly closed socket says nothing). */
  quietMs?: number;
};

const nameOf = (caught: unknown) => (caught instanceof Error ? caught.name : "Error");
const pause = (ms: number, signal: AbortSignal) =>
  new Promise<void>((done) => {
    const stop = () => (clearTimeout(timer), done());
    const timer = setTimeout(() => (signal.removeEventListener("abort", stop), done()), ms);
    signal.addEventListener("abort", stop, { once: true });
  });

/** Pokes `waker` on every notification, renewing a quiet subscription and resubscribing after a failure. */
export async function followLogs(subscribe: Subscribe, waker: Waker, o: FollowOptions): Promise<void> {
  const [min, max, quietMs] = [o.minBackoffMs ?? 1_000, o.maxBackoffMs ?? 60_000, o.quietMs ?? 300_000];
  let backoff = min;
  let announce = true;
  while (!o.signal.aborted) {
    const sub = new AbortController();
    const end = () => sub.abort();
    o.signal.addEventListener("abort", end, { once: true });
    let quiet: ReturnType<typeof setTimeout> | undefined;
    let renewed = false;
    const arm = () => {
      clearTimeout(quiet);
      quiet = setTimeout(() => ((renewed = true), sub.abort()), quietMs);
    };
    const opened = Date.now();
    let [heard, live] = [false, false];
    arm(); // a node that never answers the subscribe is given up on too
    try {
      const notes = await subscribe(sub.signal);
      live = true;
      arm();
      if (announce) o.log({ event: "logs-subscribed" });
      announce = false;
      for await (const _ of notes) {
        heard = true;
        arm();
        waker.poke();
      }
      if (!sub.signal.aborted) throw Object.assign(new Error("the subscription ended"), { name: "LogsEnded" });
    } catch (caught) {
      if (!o.signal.aborted && !(renewed && live)) {
        announce = true;
        o.log({ event: "logs-error", error: renewed ? "SubscribeTimeout" : nameOf(caught) });
      }
    } finally {
      clearTimeout(quiet);
      o.signal.removeEventListener("abort", end);
      sub.abort();
    }
    if (o.signal.aborted) return;
    if (heard || (renewed && live) || Date.now() - opened >= max) backoff = min;
    if (renewed && live) continue; // a routine renewal: no pause
    await pause(backoff, o.signal);
    backoff = Math.min(backoff * 2, max);
  }
}
