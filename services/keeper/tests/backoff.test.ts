/**
 * Purpose: the keeper's retries (Sprint 06 DoD: "with retries and backoff"): a transient RPC error (rate limit, 5xx,
 *          dropped connection, timeout) is tried again with a growing wait and gives up after the last attempt; any
 *          other error is the caller's at once; a failing step waits one period, doubled per failure up to the cap,
 *          and a success clears it. No network: the calls are fakes and the waits are a millisecond.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: retries and backoff)
 */
import { describe, expect, test } from "bun:test";

import { Backoff, transient, withRetry } from "../src/backoff";

describe("withRetry and transient", () => {
  test("a transient error is retried until the call passes; the attempts are bounded", async () => {
    let calls = 0;
    const flaky = async () => {
      calls++;
      if (calls < 3) throw new Error("HTTP error (429): Too Many Requests");
      return "ok";
    };
    expect(await withRetry(flaky, 3, 1)).toBe("ok");
    expect(calls).toBe(3);
    calls = 0;
    const down = async () => {
      calls++;
      throw new Error("fetch failed");
    };
    await expect(withRetry(down, 3, 1)).rejects.toThrow("fetch failed");
    expect(calls).toBe(3);
  });

  test("any other error is the caller's at once", async () => {
    let calls = 0;
    const refused = async () => {
      calls++;
      throw new Error("not a campaign of the program: WrongOwner");
    };
    await expect(withRetry(refused, 3, 1)).rejects.toThrow("WrongOwner");
    expect(calls).toBe(1);
  });

  test("what counts as transient", () => {
    expect(transient({ context: { statusCode: 503 } })).toBe(true);
    expect(transient({ context: { statusCode: 404 } })).toBe(false);
    expect(transient(new Error("socket hang up"))).toBe(true);
    expect(transient(new Error("ECONNRESET"))).toBe(true);
    expect(transient(new Error("AlreadySettled"))).toBe(false);
  });
});

describe("Backoff", () => {
  test("a failing step waits one period, doubled per failure up to the cap; a success clears it", () => {
    const backoff = new Backoff(100, 350);
    backoff.failed("k", 0);
    expect([backoff.ready("k", 99), backoff.ready("k", 100)]).toEqual([false, true]);
    backoff.failed("k", 100);
    expect([backoff.ready("k", 299), backoff.ready("k", 300)]).toEqual([false, true]);
    backoff.failed("k", 300);
    backoff.failed("k", 300);
    expect([backoff.ready("k", 649), backoff.ready("k", 650)]).toEqual([false, true]); // capped at 350
    expect(backoff.waiting(400)).toBe(1);
    backoff.succeeded("k");
    expect(backoff.ready("k", 0)).toBe(true);
  });
});
