/**
 * Purpose: the read API's routes, all GET (HEAD too): /api/v1/health, /api/v1/campaigns (filtered, paged) and
 *          /api/v1/campaigns/:address. Every answer is JSON with CORS for the site; errors are
 *          {"error": {"code", "message"}}, never a stack trace. Reads only the in-memory snapshot.
 * Version: 0.1.0
 * Sprint:  08 (indexer and API, hackathon MVP)
 */
import { BadQuery, parseListQuery } from "./query";
import { toCampaign } from "./dto";
import type { Store } from "./store";

export type RouteOptions = { corsOrigin: string; cluster: string };

const json = (body: unknown, status: number, cors: string) =>
  new Response(
    JSON.stringify(body, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    {
      status,
      headers: { "content-type": "application/json", "access-control-allow-origin": cors, "cache-control": "no-store" },
    },
  );
const fail = (status: number, code: string, message: string, cors: string) =>
  json({ error: { code, message } }, status, cors);

export function createHandler(store: Store, options: RouteOptions) {
  return async function handle(request: Request): Promise<Response> {
    const cors = options.corsOrigin;
    if (request.method !== "GET" && request.method !== "HEAD") return fail(405, "method_not_allowed", "GET only", cors);
    const url = new URL(request.url);
    const snap = store.current();
    if (url.pathname === "/api/v1/health") {
      const status = snap ? (store.lastError() ? "stale" : "ok") : "starting";
      return json(
        {
          status,
          cluster: options.cluster,
          schema_version: 1,
          as_of_slot: snap ? snap.asOfSlot : null,
          taken_at: snap ? snap.takenAt : null,
          campaigns_total: snap ? snap.rows.length : null,
          last_refresh_error: store.lastError(),
        },
        snap ? 200 : 503,
        cors,
      );
    }
    if (url.pathname === "/api/v1/campaigns") {
      if (!snap) return fail(503, "starting", "the first chain read has not finished", cors);
      let query;
      try {
        query = parseListQuery(url);
      } catch (error) {
        if (error instanceof BadQuery) return fail(400, "bad_query", error.message, cors);
        throw error;
      }
      const matching = snap.rows.filter((row) => !query.states || query.states.has(toCampaign(row).state));
      const page = matching.slice(query.offset, query.offset + query.limit).map(toCampaign);
      return json(
        {
          as_of_slot: snap.asOfSlot,
          chain_time: snap.chain.unixTimestamp,
          total: matching.length,
          offset: query.offset,
          limit: query.limit,
          campaigns: page,
        },
        200,
        cors,
      );
    }
    const detail = url.pathname.match(/^\/api\/v1\/campaigns\/([1-9A-HJ-NP-Za-km-z]{32,44})$/);
    if (detail) {
      if (!snap) return fail(503, "starting", "the first chain read has not finished", cors);
      const row = snap.rows.find((r) => r.address.toString() === detail[1]);
      if (!row) return fail(404, "not_found", "no campaign at that address", cors);
      return json(
        { as_of_slot: snap.asOfSlot, chain_time: snap.chain.unixTimestamp, campaign: toCampaign(row) },
        200,
        cors,
      );
    }
    return fail(404, "not_found", "no such route", cors);
  };
}
