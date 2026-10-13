/**
 * Purpose: the read API's routes, all GET (HEAD too): /api/v1/health, /api/v1/campaigns (filtered, paged),
 *          /api/v1/campaigns/:address, since Sprint 13 /api/v1/leaderboard (leaderboard.ts), and since Sprint 08's
 *          second part /api/v1/names and /api/v1/price. Every answer is JSON with CORS for the site; errors are
 *          {"error": {"code", "message"}}, never a stack trace. Reads only what is in memory: the chain snapshot, the
 *          program's history, the names and the last display price. Health's body is health.ts's: since Sprint 08's
 *          third part it adds `program_last_deploy_slot` and `entries_allowed`; every answer keeps its fields (TP §6:
 *          change only by adding), each shaped as its schema in @brot/sdk/schemas (read-api.ts).
 * Version: 0.4.0 (health.ts: the deploy slot and entries_allowed; 0.3.2, 2b; 0.3.1, names and price)
 * Sprint:  08 (indexer and API, hackathon MVP; the third part); 13
 */
import { healthBody } from "./health";
import type { Hidden } from "./hidden";
import type { History } from "./history";
import { createBoard, leaderboardOf, parseLeaderboardQuery } from "./leaderboard";
import type { Names } from "./names";
import { MAX_SERVED_SECONDS, priceBody, type Price } from "./price";
import { BadQuery, parseListQuery } from "./query";
import { toCampaign } from "./dto";
import type { Store } from "./store";

/**
 * `history` is the program's own history for the leaderboard (without it the route answers 503); `hidden`, the wallets
 * left out of it at their owner's request.
 */
export type RouteOptions = {
  corsOrigin: string;
  cluster: string;
  history?: History;
  hidden?: Hidden;
  /** Sprint 08: the reviewed names and the listed feeds, and the display price; the server's clock for its age. */
  names?: Names;
  price?: Price;
  now?: () => bigint;
  /** K-11's switch (API_ENTRIES_ALLOWED): false turns `entries_allowed` off whatever the chain says; true if unset. */
  entriesSwitch?: boolean;
};

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
  const board = options.history ? createBoard(options.history, options.hidden) : null;
  const handle = route(store, options, board);
  // Any throw becomes the documented error shape, never a stack trace (the Sprint 08 security review, M2).
  return async function safe(request: Request): Promise<Response> {
    try {
      return await handle(request);
    } catch {
      return fail(500, "internal", "the request could not be answered", options.corsOrigin);
    }
  };
}

function route(store: Store, options: RouteOptions, board: ReturnType<typeof createBoard> | null) {
  return async function handle(request: Request): Promise<Response> {
    const cors = options.corsOrigin;
    if (request.method !== "GET" && request.method !== "HEAD") return fail(405, "method_not_allowed", "GET only", cors);
    const url = new URL(request.url);
    const snap = store.current();
    if (url.pathname === "/api/v1/health") return json(healthBody(store, options), snap ? 200 : 503, cors);
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
    if (url.pathname === "/api/v1/leaderboard") {
      const history = options.history;
      if (!snap || !history?.ready() || !board)
        return fail(503, "starting", "the program's history has not been read yet", cors);
      try {
        return json(leaderboardOf(history, snap, parseLeaderboardQuery(url), board(snap)), 200, cors);
      } catch (error) {
        if (error instanceof BadQuery) return fail(400, "bad_query", error.message, cors);
        throw error;
      }
    }
    // Sprint 08: two routes with no parameters; any query is a 400, as an unknown parameter is everywhere.
    if (url.pathname === "/api/v1/names" || url.pathname === "/api/v1/price") {
      if (url.search) return fail(400, "bad_query", "this route takes no parameters", cors);
      const chainTime = snap ? snap.chain.unixTimestamp : null;
      if (url.pathname === "/api/v1/names") {
        if (!options.names) return fail(503, "starting", "the names have not been read yet", cors);
        return json({ chain_time: chainTime, names: options.names.names(), feeds: options.names.feeds() }, 200, cors);
      }
      const price = options.price?.current();
      if (!price) return fail(503, "starting", "no price has been read yet", cors);
      const now = options.now ? options.now() : BigInt(Math.floor(Date.now() / 1_000));
      if (now - price.publishedAt > MAX_SERVED_SECONDS)
        return fail(503, "no_recent_price", "no price of the last day", cors);
      return json({ chain_time: chainTime, price: priceBody(price, now) }, 200, cors);
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
