/**
 * Purpose: the standby's rules, as pure functions with no I/O. The gate: a standby may send only while it has taken
 *          over AND the primary does not answer; while the primary is alive it refuses every send (a standby that
 *          duplicates the primary's sends is worse than none). The takeover: after `takeoverAfterMs` of silence and
 *          `restartTries` restart requests (spaced one watchdog interval apart), the standby takes over. A primary
 *          that answers again is not handed back automatically; the gate still closes at once.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import type { KeeperConfig } from "./config";

export type Probe = { ok: true } | { ok: false; reason: string };

export type WatchState = {
  silentSince: number | null;
  restarts: number;
  lastRestartAt: number | null;
  takenOver: boolean;
};

export type WatchAction =
  | { kind: "primary_down"; reason: string }
  | { kind: "restart"; attempt: number }
  | { kind: "takeover" }
  | { kind: "recovered" };

export type WatchRules = {
  takeoverAfterMs: number;
  restartTries: number;
  restartGapMs: number;
};

export const INITIAL_WATCH: WatchState = { silentSince: null, restarts: 0, lastRestartAt: null, takenOver: false };

export function rulesOf(config: KeeperConfig): WatchRules {
  return {
    takeoverAfterMs: config.takeoverAfterMs,
    restartTries: config.restartTries,
    restartGapMs: config.watchdogMs,
  };
}

/** One watchdog tick: the next state and what the caller must do. Pure; the caller performs the actions. */
export function step(
  state: WatchState,
  probe: Probe,
  now: number,
  rules: WatchRules,
): { state: WatchState; actions: WatchAction[] } {
  if (probe.ok) {
    if (state.silentSince === null) return { state, actions: [] };
    return { state: { ...INITIAL_WATCH, takenOver: state.takenOver }, actions: [{ kind: "recovered" }] };
  }
  if (state.silentSince === null) {
    const first = { ...state, silentSince: now };
    return { state: first, actions: [{ kind: "primary_down", reason: probe.reason }] };
  }
  const silentFor = now - state.silentSince;
  if (state.takenOver) return { state, actions: [] };
  if (silentFor >= rules.takeoverAfterMs && state.restarts < rules.restartTries) {
    if (state.lastRestartAt === null || now - state.lastRestartAt >= rules.restartGapMs) {
      const attempt = state.restarts + 1;
      return {
        state: { ...state, restarts: attempt, lastRestartAt: now },
        actions: [{ kind: "restart", attempt }],
      };
    }
    return { state, actions: [] };
  }
  const restartsSpent = state.restarts >= rules.restartTries;
  const waited = state.lastRestartAt !== null && now - state.lastRestartAt >= rules.restartGapMs;
  if (restartsSpent && waited) return { state: { ...state, takenOver: true }, actions: [{ kind: "takeover" }] };
  return { state, actions: [] };
}

/** The send gate. A primary always may send (its behaviour is unchanged). A standby may send only when it has taken
 *  over and the primary's latest probe failed. */
export function sendAllowed(mode: KeeperConfig["mode"], watch: WatchState, primaryAlive: boolean): boolean {
  if (mode === "primary") return true;
  return watch.takenOver && !primaryAlive;
}
