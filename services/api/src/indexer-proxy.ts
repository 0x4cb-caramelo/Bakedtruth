/**
 * Purpose: the indexer's read routes, public through the read API (the founder's routing answer (a), 2026-10-13;
 *          Sprint 08): exactly the routes services/indexer serves (its src/api/routes.ts): `/api/v1/activity`,
 *          `/api/v1/ranking`, `/api/v1/wallets/:address/entries`, `/api/v1/campaigns/:address/activity` and `/chance`,
 *          matched by pattern, forwarded as GET or HEAD to the indexer on loopback (`API_INDEXER_URL`) with the path
 *          and query unchanged and no request header but `accept`: no cookie, authorization or client address leaves.
 *          The indexer's status, body, `content-type` and `cache-control` come back, with the API's own CORS; no other
 *          header of its answer. Failures answer in the API's error shape, never with the indexer's URL or a stack:
 *          504 `indexer_timeout` after 2.5 s, 503 `indexer_unavailable` when the forwarding is off or the indexer
 *          refuses or fails, 502 `indexer_too_large` over 1 MB.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */

const ADDRESS = "[1-9A-HJ-NP-Za-km-z]{32,44}";

/** The indexer's read routes; addresses as the API's own campaign route matches them. */
export const INDEXER_ROUTES: readonly RegExp[] = [
  /^\/api\/v1\/activity$/,
  /^\/api\/v1\/ranking$/,
  new RegExp(`^/api/v1/wallets/${ADDRESS}/entries$`),
  new RegExp(`^/api/v1/campaigns/${ADDRESS}/(?:activity|chance)$`),
];

export const isIndexerRoute = (path: string): boolean => INDEXER_ROUTES.some((route) => route.test(path));

export const INDEXER_TIMEOUT_MS = 2_500;
export const INDEXER_MAX_BYTES = 1_048_576;
/** The only headers of the indexer's answer that come back. */
const KEPT = ["content-type", "cache-control"] as const;
/** Statuses whose answer carries no body. */
const NO_BODY = new Set([204, 205, 304]);

export type IndexerProxy = (request: Request, url: URL, cors: string) => Promise<Response>;

const failure = (status: number, code: string, message: string, cors: string) =>
  new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": cors, "cache-control": "no-store" },
  });

/** The body, or `null` once it passes `max` bytes (declared or counted); the timeout's signal covers the reading. */
async function capped(answer: Response, max: number): Promise<Uint8Array<ArrayBuffer> | null> {
  if (Number(answer.headers.get("content-length")) > max) {
    await answer.body?.cancel();
    return null;
  }
  if (!answer.body) return new Uint8Array(0);
  const reader = answer.body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    parts.push(value);
  }
  const body = new Uint8Array(size);
  parts.reduce((at, part) => (body.set(part, at), at + part.byteLength), 0);
  return body;
}

/** Forwards to the indexer at `base` (a loopback URL), or answers 503 for every route when `base` is null (`off`). */
export function createIndexerProxy(
  base: string | null,
  o: { timeoutMs?: number; maxBytes?: number } = {},
): IndexerProxy {
  const [timeoutMs, maxBytes] = [o.timeoutMs ?? INDEXER_TIMEOUT_MS, o.maxBytes ?? INDEXER_MAX_BYTES];
  return async (request, url, cors) => {
    if (base === null) return failure(503, "indexer_unavailable", "the indexer is not reachable from here", cors);
    const signal = AbortSignal.timeout(timeoutMs);
    const accept = request.headers.get("accept");
    try {
      const answer = await fetch(new URL(`${url.pathname}${url.search}`, base), {
        method: request.method === "HEAD" ? "HEAD" : "GET",
        headers: accept ? { accept } : {},
        redirect: "manual",
        signal,
      });
      if (answer.status < 200 || answer.status > 599) throw new Error("not an answer");
      const head = request.method === "HEAD";
      if (head) await answer.body?.cancel();
      const body = head ? null : await capped(answer, maxBytes);
      if (!head && body === null) return failure(502, "indexer_too_large", "the indexer's answer is too large", cors);
      const headers = new Headers({ "access-control-allow-origin": cors });
      for (const name of KEPT) {
        const value = answer.headers.get(name);
        if (value !== null) headers.set(name, value);
      }
      return new Response(NO_BODY.has(answer.status) ? null : body, { status: answer.status, headers });
    } catch {
      return signal.aborted
        ? failure(504, "indexer_timeout", "the indexer did not answer in time", cors)
        : failure(503, "indexer_unavailable", "the indexer could not be reached", cors);
    }
  };
}
