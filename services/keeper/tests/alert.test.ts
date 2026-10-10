/**
 * Purpose: the alerter's rules: a repeat of the same (kind, key) inside the window is suppressed, a new key or a
 *          later time emits again, each emitted line is one JSON object naming the journal transport, and a detail
 *          key that looks like a secret is refused. An injected clock and emitter; no network.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import { describe, expect, test } from "bun:test";

import { createAlerter, TRANSPORTS } from "../src/alert";

function harness(dedupeMs = 1_000) {
  const lines: string[] = [];
  let clock = 0;
  const alerter = createAlerter({ now: () => clock, emit: (line) => lines.push(line), dedupeMs });
  return {
    alerter,
    lines,
    at: (ms: number) => (clock = ms),
  };
}

describe("createAlerter", () => {
  test("suppresses a repeat of the same kind and key inside the window, and emits again after it", () => {
    const { alerter, lines, at } = harness(1_000);
    at(0);
    expect(alerter.alert("primary_down", "primary", { misses: 2 })).toBe(true);
    at(999);
    expect(alerter.alert("primary_down", "primary", { misses: 3 })).toBe(false);
    at(1_000);
    expect(alerter.alert("primary_down", "primary", { misses: 4 })).toBe(true);
    expect(lines).toHaveLength(2);
  });

  test("different keys of the same kind are not de-duplicated", () => {
    const { alerter, lines } = harness();
    expect(alerter.alert("campaign_idle", "campaign-a", {})).toBe(true);
    expect(alerter.alert("campaign_idle", "campaign-b", {})).toBe(true);
    expect(lines).toHaveLength(2);
  });

  test("each emitted line is one JSON object with event, kind, key and the journal transport", () => {
    const { alerter, lines } = harness();
    alerter.alert("keeper_sol_low", "keeper", { lamports: 120_000_000, floor: 500_000_000 });
    expect(lines).toHaveLength(1);
    expect(lines[0].includes("\n")).toBe(false);
    const parsed = JSON.parse(lines[0]);
    expect(parsed).toMatchObject({
      event: "alert",
      kind: "keeper_sol_low",
      key: "keeper",
      transports: "journal",
      lamports: 120_000_000,
      floor: 500_000_000,
    });
    expect(typeof parsed.ts).toBe("string");
    expect(TRANSPORTS).toEqual(["journal"]);
  });

  test("a detail key that looks like a secret, a token or a URL is refused and nothing is emitted", () => {
    const { alerter, lines } = harness();
    expect(() => alerter.alert("restart_failed", "primary", { apiKey: "x" })).toThrow('"apiKey"');
    expect(() => alerter.alert("restart_failed", "primary", { rpcUrl: "https://x" })).toThrow('"rpcUrl"');
    expect(() => alerter.alert("restart_failed", "primary", { hmacSecret: "x" })).toThrow('"hmacSecret"');
    expect(() => alerter.alert("restart_failed", "primary", { token: "x" })).toThrow('"token"');
    expect(lines).toHaveLength(0);
  });
});
