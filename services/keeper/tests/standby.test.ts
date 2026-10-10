/**
 * Purpose: the standby's rules: the send gate (a standby refuses to send while the primary is alive), the takeover
 *          timeline (restarts, then takeover, then no automatic hand-back), and recovery. Pure; no cluster, no clock.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import { describe, expect, test } from "bun:test";

import { INITIAL_WATCH, sendAllowed, step, type Probe, type WatchRules, type WatchState } from "../src/standby";

const MIN = 60_000;
const RULES: WatchRules = { takeoverAfterMs: 10 * MIN, restartTries: 3, restartGapMs: 5 * MIN };
const DOWN: Probe = { ok: false, reason: "timeout" };
const UP: Probe = { ok: true };

/** Runs the watchdog every 5 minutes from a first missed probe at t=0, with the primary down throughout. */
function timeline(ticks: number, probe: (t: number) => Probe = () => DOWN) {
  let state: WatchState = INITIAL_WATCH;
  const log: { t: number; kinds: string[] }[] = [];
  for (let i = 0; i < ticks; i++) {
    const t = i * 5 * MIN;
    const next = step(state, probe(t), t, RULES);
    state = next.state;
    log.push({ t: t / MIN, kinds: next.actions.map((a) => (a.kind === "restart" ? `restart#${a.attempt}` : a.kind)) });
  }
  return { state, log };
}

describe("send gate", () => {
  test("a primary always may send: its behaviour does not change", () => {
    expect(sendAllowed("primary", INITIAL_WATCH, true)).toBe(true);
  });

  test("a standby never sends while the primary is alive, even after a takeover", () => {
    const taken: WatchState = { ...INITIAL_WATCH, takenOver: true };
    expect(sendAllowed("standby", taken, true)).toBe(false);
    expect(sendAllowed("standby", taken, false)).toBe(true);
  });

  test("a standby that has not taken over never sends", () => {
    expect(sendAllowed("standby", INITIAL_WATCH, false)).toBe(false);
  });
});

describe("takeover timeline (primary down)", () => {
  test("alerts at the first missed probe, restarts at 10, 15 and 20 minutes, takes over at 25", () => {
    const { state, log } = timeline(7);
    expect(log.map((l) => [l.t, l.kinds])).toEqual([
      [0, ["primary_down"]],
      [5, []],
      [10, ["restart#1"]],
      [15, ["restart#2"]],
      [20, ["restart#3"]],
      [25, ["takeover"]],
      [30, []],
    ]);
    expect(state.takenOver).toBe(true);
  });

  test("a single missed probe does not start a restart before 10 minutes", () => {
    const { log } = timeline(2);
    expect(log[1]?.kinds).toEqual([]);
  });

  test("once taken over, the standby does not repeat the takeover", () => {
    const { log } = timeline(12);
    expect(log.flatMap((l) => l.kinds).filter((k) => k === "takeover")).toHaveLength(1);
  });
});

describe("recovery", () => {
  test("a primary that answers again clears the outage and closes the gate at once", () => {
    const { state } = timeline(8, (t) => (t >= 30 * MIN ? UP : DOWN));
    expect(state.silentSince).toBeNull();
    expect(state.restarts).toBe(0);
    expect(state.takenOver).toBe(true);
    expect(sendAllowed("standby", state, true)).toBe(false);
  });

  test("a primary that answers during the window resets the restart count", () => {
    const { log } = timeline(6, (t) => (t === 10 * MIN ? UP : DOWN));
    expect(log.find((l) => l.t === 10)?.kinds).toEqual(["recovered"]);
    expect(log.some((l) => l.kinds.includes("takeover"))).toBe(false);
  });
});
