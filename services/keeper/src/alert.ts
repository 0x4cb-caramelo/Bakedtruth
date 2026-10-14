/**
 * Purpose: the keeper's alerts. Each alert is one JSON line on the journal, de-duplicated per (kind, key) within a
 *          window, so a stuck condition does not flood the log. Email is not wired: the provider is a founder
 *          decision (D4), so today the only transport is the journal, and every line says so. Detail values are
 *          the caller's to choose; a detail key that names a secret, a token or a URL is refused by name, never echoed.
 *          The line's own fields (ts, event, kind, key, transports) always win: a detail key with one of those names
 *          is written as `detail_<name>` instead, so a caller can never relabel an alert, and nothing is lost.
 * Version: 0.3.0 (Sprints 14 and 15: the contest's and the sealed fee's alerts)
 * Sprint:  07 (standby keeper and watchdog)
 */

/** Each kind has its runbook in deploy/vps/runbooks/, the kind's name with dashes (tests/runbooks.test.ts checks). */
export const ALERT_KINDS = [
  "primary_down",
  "standby_took_over",
  "keeper_sol_low",
  "met_late_no",
  "second_read_mismatch",
  "second_read_unchecked",
  "campaign_idle",
  "open_campaigns_high",
  "openings_per_hour_high",
  "team_key_opening",
  "exposure_high",
  "reserved_credit_old",
  "sol_usd_stale",
  "pyth_program_changed",
  "contest_opened",
  "contest_reread_differs",
  "contest_stage2_ending",
  "sealed_fee_open",
  "restart_requested",
  "restart_failed",
] as const;

export type AlertKind = (typeof ALERT_KINDS)[number];

export type AlertDetail = Record<string, string | number | boolean | null>;

export type Alerter = {
  alert(kind: AlertKind, key: string, detail: AlertDetail): boolean;
};

/** The channels an alert reaches. Email waits for the provider decision (D4); nothing else is wired. */
export const TRANSPORTS: readonly string[] = ["journal"];

const DEFAULT_DEDUPE_MS = 15 * 60_000;
const SECRET_LIKE = /secret|token|password|keypair|private|api.?key|url|query/i;
/** The line's own fields: a detail key with one of these names is renamed, never allowed to overwrite it. */
const OWN_FIELDS = new Set(["ts", "event", "kind", "key", "transports"]);

const renamed = (detail: AlertDetail): AlertDetail =>
  Object.fromEntries(
    Object.entries(detail).map(([name, value]) => [OWN_FIELDS.has(name) ? `detail_${name}` : name, value]),
  );

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
          ...renamed(detail),
          ts: new Date(at).toISOString(),
          event: "alert",
          kind,
          key,
          transports: TRANSPORTS.join(","),
        }),
      );
      return true;
    },
  };
}
