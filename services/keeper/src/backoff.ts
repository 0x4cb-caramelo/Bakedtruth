/**
 * Purpose: the keeper's two kinds of retry. Within a cycle, an RPC call that fails for a transient reason (rate
 *          limit, a 5xx, a dropped connection, a timeout) is tried again after 0.5 s, then 1 s (`withRetry`); any other
 *          error is the caller's at once. Across cycles, a step the program refused or the cluster failed waits before
 *          it is tried again: one cycle's length, doubled each time, up to an hour (`Backoff`), so a stuck step costs
 *          neither fees nor RPC credits every cycle; a success clears it. A reserved credit's claim is retried once a
 *          day (`DailyClock`, TP §3.5 step 4).
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: retries and backoff; the daily retry of reserved credits)
 */

const TRANSIENT =
  /\b(429|500|502|503|504)\b|too many requests|rate limit|fetch failed|timed? ?out|ECONNRESET|ECONNREFUSED|socket hang up|network/i;

/** True for an error worth trying again in a moment. */
export function transient(error: unknown): boolean {
  const status = (error as { context?: { statusCode?: unknown } } | null)?.context?.statusCode;
  if (typeof status === "number" && (status === 429 || status >= 500)) return true;
  return TRANSIENT.test(error instanceof Error ? `${error.name} ${error.message}` : String(error));
}

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

/** `call()`, tried `attempts` times while it fails transiently, waiting `baseMs` then twice as long each time. */
export async function withRetry<T>(call: () => Promise<T>, attempts = 3, baseMs = 500): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await call();
    } catch (error) {
      if (attempt >= attempts || !transient(error)) throw error;
      await sleep(baseMs * 2 ** (attempt - 1));
    }
  }
}

/** Per-key waits after a failure: `baseMs`, doubled per failure in a row, at most `capMs`. */
export class Backoff {
  private readonly waits = new Map<string, { failures: number; until: number }>();

  constructor(
    private readonly baseMs = 60_000,
    private readonly capMs = 3_600_000,
  ) {}

  ready(key: string, now: number): boolean {
    const wait = this.waits.get(key);
    return !wait || now >= wait.until;
  }

  failed(key: string, now: number): void {
    const failures = (this.waits.get(key)?.failures ?? 0) + 1;
    const delay = Math.min(this.baseMs * 2 ** (failures - 1), this.capMs);
    this.waits.set(key, { failures, until: now + delay });
  }

  succeeded(key: string): void {
    this.waits.delete(key);
  }

  /** Keys waiting now, for /healthz. */
  waiting(now: number): number {
    return [...this.waits.values()].filter((wait) => now < wait.until).length;
  }
}

/** Once per `periodMs` per key (a day by default): the daily retry of a reserved creator share. */
export class DailyClock {
  private readonly last = new Map<string, number>();

  constructor(private readonly periodMs = 86_400_000) {}

  due(key: string, now: number): boolean {
    const at = this.last.get(key);
    return at === undefined || now - at >= this.periodMs;
  }

  mark(key: string, now: number): void {
    this.last.set(key, now);
  }
}
