/**
 * Purpose: the keeper's alerts. Each alert is one JSON line on the journal, de-duplicated per (kind, key) within a
 *          window, so a stuck condition does not flood the log. Email is not wired: the provider is a founder
 *          decision (D4), so today the only transport is the journal, and every line says so. Detail values are
 *          the caller's to choose; a detail key that names a secret, a token or a URL is refused by name, never echoed.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */

export type AlertKind =
  | "primary_down"
  | "standby_took_over"
  | "keeper_sol_low"
  | "met_late_no"
  | "second_read_mismatch"
  | "campaign_idle"
  | "open_campaigns_high"
  | "restart_requested"
  | "restart_failed";

export type AlertDetail = Record<string, string | number | boolean | null>;

export type Alerter = {
  alert(kind: AlertKind, key: string, detail: AlertDetail): boolean;
};

/** The channels an alert reaches. Email waits for the provider decision (D4); nothing else is wired. */
export const TRANSPORTS: readonly string[] = ["journal"];

const DEFAULT_DEDUPE_MS = 15 * 60_000;
const SECRET_LIKE = /secret|token|password|keypair|private|api.?key|url|query/i;

export function createAlerter(
  options: { now?: () => number; emit?: (line: string) => void; dedupeMs?: number } = {},
): Alerter {
  const now = options.now ?? Date.now;
  const emit = options.emit ?? ((line: string) => console.log(line));
  const dedupeMs = options.dedupeMs ?? DEFAULT_DEDUPE_MS;
  const lastEmitted = new Map<string, number>();

  return {
    alert(kind, key, detail) {
      for (const name of Object.keys(detail)) {
        if (SECRET_LIKE.test(name)) throw new Error(`alert detail "${name}" looks like a secret and is refused`);
      }
      const id = `${kind}|${key}`;
      const at = now();
      const previous = lastEmitted.get(id);
      if (previous !== undefined && at - previous < dedupeMs) return false;
      lastEmitted.set(id, at);
      emit(
        JSON.stringify({
          ts: new Date(at).toISOString(),
          event: "alert",
          kind,
          key,
          transports: TRANSPORTS.join(","),
          ...detail,
        }),
      );
      return true;
    },
  };
}
