/**
 * Purpose: the watchdog's I/O. Each tick it probes the primary's GET /healthz (10 s timeout), feeds the answer to
 *          the pure rules in standby.ts, and performs what they decide: a signed POST /restart, the takeover, and
 *          the alerts. Errors are reported as values, never thrown; the URL and the secret never reach a log line.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import type { Alerter } from "./alert";
import { RESTART_PATH, signRestart } from "./restart";
import { log } from "./log";
import { step, type Probe, type WatchRules, type WatchState } from "./standby";

export type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

export async function probePrimary(primaryUrl: string, fetchFn: FetchFn = fetch): Promise<Probe> {
  try {
    const response = await fetchFn(new URL("/healthz", primaryUrl).toString(), {
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok ? { ok: true } : { ok: false, reason: `HTTP ${response.status}` };
  } catch (error) {
    return { ok: false, reason: error instanceof Error && error.name === "TimeoutError" ? "timeout" : "no answer" };
  }
}

export async function requestRestart(
  primaryUrl: string,
  secret: Uint8Array,
  now: number,
  fetchFn: FetchFn = fetch,
): Promise<{ ok: boolean; detail: string }> {
  const timestamp = String(Math.floor(now / 1000));
  const signature = signRestart(secret, timestamp, "");
  try {
    const response = await fetchFn(new URL(RESTART_PATH, primaryUrl).toString(), {
      method: "POST",
      headers: { "x-brot-timestamp": timestamp, "x-brot-signature": signature },
      signal: AbortSignal.timeout(10_000),
    });
    return response.status === 202
      ? { ok: true, detail: "accepted" }
      : { ok: false, detail: `HTTP ${response.status}` };
  } catch {
    return { ok: false, detail: "no answer" };
  }
}

export type WatchdogDeps = {
  primaryUrl: string;
  secret: Uint8Array;
  rules: WatchRules;
  alerter: Alerter;
  now: () => number;
  fetchFn?: FetchFn;
};

/** One watchdog tick. Returns the new state and whether the primary answered, which the send gate reads. */
export async function watchdogTick(
  watch: WatchState,
  deps: WatchdogDeps,
): Promise<{ state: WatchState; primaryAlive: boolean }> {
  const now = deps.now();
  const probe = await probePrimary(deps.primaryUrl, deps.fetchFn);
  const next = step(watch, probe, now, deps.rules);
  for (const action of next.actions) {
    if (action.kind === "primary_down") {
      deps.alerter.alert("primary_down", "primary", { reason: action.reason });
    } else if (action.kind === "restart") {
      const sent = await requestRestart(deps.primaryUrl, deps.secret, now, deps.fetchFn);
      deps.alerter.alert("restart_requested", `attempt-${action.attempt}`, { attempt: action.attempt });
      if (!sent.ok) deps.alerter.alert("restart_failed", `attempt-${action.attempt}`, { detail: sent.detail });
    } else if (action.kind === "takeover") {
      deps.alerter.alert("standby_took_over", "standby", { silentForMs: now - (watch.silentSince ?? now) });
    } else {
      log("primary-recovered");
    }
  }
  return { state: next.state, primaryAlive: probe.ok };
}
