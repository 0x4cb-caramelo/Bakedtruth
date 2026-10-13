/**
 * Purpose: serves the indexer's read routes (routes.ts) on its loopback port (TP §3.5; Sprint 08, slice 2), from the
 *          same SQLite handle the ingest writes: bun:sqlite answers each read between two refreshes, so a reader never
 *          sees a refresh half done. `/healthz` answers the server's own check with how fresh the file is and, since
 *          slice 3, what the process reports of itself (`health`: its last refresh, the wake-up, the feeds and the
 *          partners file, by error name only). Never a development error page or a stack trace.
 * Version: 0.2.0 (slice 3: the process's own health in /healthz)
 * Sprint:  08 (indexer, API, relay and points), slices 2 and 3
 */
import type { Store } from "../db/store";
import { freshness } from "./queries";
import { handle, type RouteOptions } from "./routes";

export function serveApi(
  store: Store,
  at: { hostname: string; port: number },
  options: RouteOptions & { health?: () => Record<string, unknown> },
) {
  return Bun.serve({
    hostname: at.hostname,
    port: at.port,
    development: false,
    fetch(request) {
      if (new URL(request.url).pathname === "/healthz")
        return Response.json(
          { status: "ok", ...freshness(store), ...options.health?.() },
          { headers: { "cache-control": "no-store" } },
        );
      return handle(store, request, options);
    },
    error: () =>
      Response.json({ error: { code: "internal", message: "The indexer could not answer" } }, { status: 500 }),
  });
}
