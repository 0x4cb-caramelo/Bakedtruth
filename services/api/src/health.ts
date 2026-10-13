/**
 * Purpose: what `/api/v1/health` answers (TP §6; Sprint 08), shaped as @brot/sdk/schemas's `ReadApiHealthSchema`: the
 *          snapshot's state and freshness, the leaderboard's history, the names and the price, and since the third
 *          part the slot of the program's last deploy (`program_last_deploy_slot`, A-8; Sprints 11 and 18) and
 *          `entries_allowed` (K-11): true only while the snapshot is fresh, the program has not halted entries (its
 *          GlobalConfig, read in the snapshot) and the operator's switch (`API_ENTRIES_ALLOWED`) is on. It fails
 *          closed: a config not read, a stale or starting snapshot, or the switch off, is false. Same for every
 *          visitor: the country gate stays in the relay and the site (C9).
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import type { RouteOptions } from "./routes";
import type { Store } from "./store";

export function healthBody(store: Store, options: RouteOptions) {
  const snap = store.current();
  const status = snap ? (store.lastError() ? "stale" : "ok") : "starting";
  return {
    status,
    cluster: options.cluster,
    schema_version: 1,
    as_of_slot: snap ? snap.asOfSlot : null,
    taken_at: snap ? snap.takenAt : null,
    campaigns_total: snap ? snap.rows.length : null,
    last_refresh_error: store.lastError(),
    leaderboard_complete: options.history?.ready() ? options.history.complete() : null,
    leaderboard_skipped: options.history?.ready() ? options.history.skipped() : null,
    names_error: options.names ? options.names.lastError() : null,
    price_source: options.price?.current()?.source ?? null,
    price_error: options.price ? options.price.lastError() : null,
    program_last_deploy_slot: snap?.deploySlot ?? null,
    entries_allowed: status === "ok" && snap?.entriesHalted === false && options.entriesSwitch !== false,
  };
}
