/**
 * Purpose: the indexer's read routes (TP §6; Sprint 08, slice 2), all GET (HEAD too): a campaign's activity and the
 *          history of its split (`/api/v1/campaigns/:address/activity` and `/chance`, the latest opening unless
 *          `?opening=` names one), the recent entries across campaigns (`/api/v1/activity?limit=`), and a wallet's
 *          entries (`/api/v1/wallets/:address/entries`). Every answer carries `as_of_slot` and `chain_time`; an unknown
 *          query parameter, a bad address or a bad number is a 400, an unknown campaign or opening a 404, any throw a
 *          JSON 500; errors are `{ error: { code, message } }`, never a stack trace. Cached a few seconds at the edge.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points), slice 2
 */
import { isAddress } from "@solana/kit";

import type { Store } from "../db/store";
import { campaignActivity, campaignChance, freshness, latestOpening, recentEntries, walletEntries } from "./queries";

export type RouteOptions = { corsOrigin: string };

/** The recent entries' page size: 20 unless `?limit=` asks for 1 to 100. */
const RECENT_DEFAULT = 20;
const RECENT_MAX = 100;

class Refusal extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const json = (body: unknown, status: number, o: RouteOptions, cache: boolean) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": o.corsOrigin,
      "cache-control": cache ? "public, max-age=0, s-maxage=5" : "no-store",
    },
  });

/** Only the parameters a route knows; anything else is a 400, so a typo is not a silent default. */
function params(url: URL, known: readonly string[]): Map<string, string> {
  for (const key of url.searchParams.keys())
    if (!known.includes(key)) throw new Refusal(400, "unknown_parameter", `Unknown query parameter: ${key}`);
  return new Map([...url.searchParams.entries()]);
}

function whole(text: string | undefined, name: string, min: number, max: number): number | undefined {
  if (text === undefined) return undefined;
  if (!/^\d{1,9}$/.test(text) || Number(text) < min || Number(text) > max)
    throw new Refusal(400, "bad_parameter", `${name} must be a whole number from ${min} to ${max}`);
  return Number(text);
}

function addressOf(text: string): string {
  if (!isAddress(text)) throw new Refusal(400, "bad_address", "Not a base58 address of 32 bytes");
  return text;
}

/** The opening asked for, or the latest; a 404 when the address never had a campaign or not that opening. */
function openingOf(store: Store, address: string, asked: number | undefined): number {
  const latest = latestOpening(store, address);
  if (latest === null) throw new Refusal(404, "not_found", "No campaign was opened at this address");
  if (asked !== undefined && asked > latest) throw new Refusal(404, "not_found", "No such opening at this address");
  return asked ?? latest;
}

function route(store: Store, url: URL): unknown {
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "api" || parts[1] !== "v1") throw new Refusal(404, "not_found", "No such route");
  const [, , head, id, tail] = parts;
  if (head === "campaigns" && id && (tail === "activity" || tail === "chance") && parts.length === 5) {
    const q = params(url, ["opening"]);
    const campaign = addressOf(id);
    const opening = openingOf(store, campaign, whole(q.get("opening"), "opening", 1, 1_000_000));
    return tail === "activity"
      ? { ...freshness(store), campaign, opening, items: campaignActivity(store, campaign, opening) }
      : { ...freshness(store), campaign, opening, points: campaignChance(store, campaign, opening) };
  }
  if (head === "activity" && parts.length === 3) {
    const q = params(url, ["limit"]);
    const limit = whole(q.get("limit"), "limit", 1, RECENT_MAX) ?? RECENT_DEFAULT;
    return { ...freshness(store), items: recentEntries(store, limit) };
  }
  if (head === "wallets" && id && tail === "entries" && parts.length === 5) {
    params(url, []);
    const wallet = addressOf(id);
    return { ...freshness(store), wallet, items: walletEntries(store, wallet) };
  }
  throw new Refusal(404, "not_found", "No such route");
}

/** One request in, one JSON answer out; never throws. */
export function handle(store: Store, request: Request, options: RouteOptions): Response {
  if (request.method !== "GET" && request.method !== "HEAD")
    return json({ error: { code: "method_not_allowed", message: "Read-only: GET or HEAD" } }, 405, options, false);
  try {
    return json(route(store, new URL(request.url)), 200, options, true);
  } catch (caught) {
    if (caught instanceof Refusal)
      return json({ error: { code: caught.code, message: caught.message } }, caught.status, options, false);
    return json({ error: { code: "internal", message: "The indexer could not answer" } }, 500, options, false);
  }
}
