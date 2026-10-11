/**
 * Purpose: serves the indexer's read routes (routes.ts) on its loopback port (TP §3.5; Sprint 08, slice 2), from the
 *          same SQLite handle the ingest writes: bun:sqlite answers each read between two refreshes, so a reader never
 *          sees a refresh half done. `/healthz` answers the server's own check with how fresh the file is. Never a
 *          development error page or a stack trace.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points), slice 2
 */
import type { Store } from "../db/store";
import { freshness } from "./queries";
import { handle, type RouteOptions } from "./routes";

export function serveApi(store: Store, at: { hostname: string; port: number }, options: RouteOptions) {
  return Bun.serve({
    hostname: at.hostname,
    port: at.port,
    development: false,
    fetch(request) {
      if (new URL(request.url).pathname === "/healthz")
        return Response.json({ status: "ok", ...freshness(store) }, { headers: { "cache-control": "no-store" } });
      return handle(store, request, options);
    },
    error: () =>
      Response.json({ error: { code: "internal", message: "The indexer could not answer" } }, { status: 500 }),
  });
}
