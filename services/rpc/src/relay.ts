/**
 * Purpose: brot-rpc's handler (TP §3.5, §6; proposal §2.6; Sprint 08): one JSON-RPC 2.0 call per POST, in this order —
 *          the body's size (8 KB), its shape (no batch), the method and its arguments (allowlist.ts), the programs a
 *          transaction holds and, for a join or an opening, the visitor's country (CF-IPCountry against the configured
 *          list, empty by default), the client's token bucket, the short cache, the daily budget — and only then the
 *          upstream, whose account answers are cut by owner (accounts.ts). Refusals are JSON-RPC errors with no detail
 *          of the upstream; no IP, key or parameter is logged or kept beyond the in-memory limits. GET /healthz.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { timingSafeEqual } from "node:crypto";

import { cacheable, isProgramDataSlice, served, servedProgramData, type AccountInfo } from "./accounts";
import { checkParams, METHODS } from "./allowlist";
import type { RelayConfig } from "./config";
import { areaKey, clientKey, type Budget, type Cache, type Limiter } from "./limits";
import { checkTransaction } from "./transaction";

export type Upstream = (body: string) => Promise<{ status: number; text: string }>;
export type RelayDeps = {
  config: RelayConfig;
  /** The program's ProgramData address, derived once at start (A-8). */
  programData: string;
  upstream: Upstream;
  limiter: Limiter;
  /** A wider bucket per IPv6 /48, so one customer's many /64s cannot each start full (the security review, M3). */
  area?: Limiter;
  budget: Budget;
  cache: Cache;
  /** Counts by outcome, for the relay's own per-minute log line; never an IP or a parameter. */
  count?: (outcome: string) => void;
};

type Id = string | number | null;
export const CODE = { parse: -32700, invalid: -32600, method: -32601, params: -32602, upstream: -32000 } as const;
export const REFUSED = { rate: -32001, budget: -32002, program: -32003, country: -32004 } as const;

/** Equal strings in a time that does not depend on where they differ. */
const same = (a: string, b: string) => {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function createRelay(d: RelayDeps) {
  const headers = (extra: Record<string, string> = {}) => ({
    "content-type": "application/json",
    "cache-control": "no-store",
    ...(d.config.corsOrigin ? { "access-control-allow-origin": d.config.corsOrigin, vary: "origin" } : {}),
    ...extra,
  });
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: headers() });
  const error = (id: Id, code: number, message: string, status = 200, outcome = "refused") => {
    d.count?.(outcome);
    return reply({ jsonrpc: "2.0", id, error: { code, message } }, status);
  };

  const relay = handler(d, reply, error, headers);
  // Any throw is a JSON-RPC error with no detail, never a stack trace (the security review, M1).
  return async function safe(request: Request): Promise<Response> {
    try {
      return await relay(request);
    } catch {
      return error(null, -32603, "internal error", 500, "internal");
    }
  };
}

function handler(
  d: RelayDeps,
  reply: (body: unknown, status?: number) => Response,
  error: (id: Id, code: number, message: string, status?: number, outcome?: string) => Response,
  headers: (extra?: Record<string, string>) => Record<string, string>,
) {
  return async function relay(request: Request): Promise<Response> {
    const url = new URL(request.url);
    // Cloudflare adds the tunnel's secret to every /rpc request; a local caller without it cannot pose as a visitor and
    // forge cf-connecting-ip or cf-ipcountry (the security review, M4). Unset on a development machine.
    if (d.config.tunnelSecret && !same(request.headers.get("x-brot-tunnel") ?? "", d.config.tunnelSecret))
      return error(null, CODE.invalid, "not through the site", 403, "untunnelled");
    if (request.method === "GET" && url.pathname === "/healthz")
      return reply({ status: "ok", budget_left: d.budget.left(), cached: d.cache.size(), clients: d.limiter.size() });
    if (request.method === "OPTIONS" && d.config.corsOrigin)
      return new Response(null, {
        status: 204,
        headers: headers({
          "access-control-allow-methods": "POST",
          "access-control-allow-headers": "content-type, solana-client",
        }),
      });
    if (request.method !== "POST") return error(null, CODE.invalid, "POST a JSON-RPC call", 405);
    if (Number(request.headers.get("content-length") ?? 0) > d.config.bodyMax)
      return error(null, CODE.invalid, "the body is too large", 413);
    const text = await request.text();
    if (new TextEncoder().encode(text).length > d.config.bodyMax)
      return error(null, CODE.invalid, "the body is too large", 413);
    let call: { jsonrpc?: unknown; id?: unknown; method?: unknown; params?: unknown };
    try {
      call = JSON.parse(text);
    } catch {
      return error(null, CODE.parse, "not JSON");
    }
    if (Array.isArray(call)) return error(null, CODE.invalid, "batches are not relayed");
    const id: Id = typeof call?.id === "string" || typeof call?.id === "number" ? call.id : null;
    if (call?.jsonrpc !== "2.0" || typeof call.method !== "string")
      return error(id, CODE.invalid, "not a JSON-RPC 2.0 call");
    const spec = Object.hasOwn(METHODS, call.method) ? METHODS[call.method] : undefined;
    if (!spec) return error(id, CODE.method, "this method is not relayed");
    const params = call.params === undefined ? [] : call.params;
    if (!Array.isArray(params)) return error(id, CODE.params, "params must be an array");
    const wrong = checkParams(call.method, spec, params);
    if (wrong) return error(id, CODE.params, wrong);
    const programData = call.method === "getAccountInfo" && params[0] === d.programData;
    if (programData && !isProgramDataSlice((params[1] as { dataSlice?: unknown } | undefined)?.dataSlice))
      return error(id, CODE.params, "ProgramData only as its first 45 bytes");
    if (spec.kind === "transaction") {
      const tx = checkTransaction(params[0] as string);
      if (!tx.ok) return error(id, REFUSED.program, tx.reason);
      const country = request.headers.get("cf-ipcountry")?.toUpperCase() ?? "";
      if (tx.joinsOrOpens && d.config.geoBlock.has(country))
        return error(id, REFUSED.country, "joining and opening campaigns is not available from this country");
    }
    const ip = request.headers.get("cf-connecting-ip");
    const area = areaKey(ip);
    if ((area !== null && d.area && !d.area.take(area, spec.weight)) || !d.limiter.take(clientKey(ip), spec.weight))
      return error(id, REFUSED.rate, "too many requests; try again in a moment", 429, "rate");
    const key = spec.kind === "account" || spec.kind === "rent" ? `${call.method}:${JSON.stringify(params)}` : null;
    const hit = key && !programData ? d.cache.get(key) : undefined;
    if (hit !== undefined) {
      d.count?.("cached");
      return reply({ jsonrpc: "2.0", id, result: hit });
    }
    if (!d.budget.spend(spec.weight, spec.signing === true))
      return error(id, REFUSED.budget, "the relay's daily budget is spent", 503, "budget");
    let up: { status: number; text: string };
    try {
      up = await d.upstream(JSON.stringify({ jsonrpc: "2.0", id, method: call.method, params }));
    } catch {
      return error(id, CODE.upstream, "the network did not answer", 502, "upstream");
    }
    if (up.status === 429)
      return error(id, CODE.upstream, "the network is busy; try again in a moment", 503, "upstream");
    let answer: { result?: unknown; error?: unknown };
    try {
      answer = JSON.parse(up.text);
    } catch {
      return error(id, CODE.upstream, "the network did not answer", 502, "upstream");
    }
    if (answer.error !== undefined) {
      d.count?.("upstream-error");
      return reply({ jsonrpc: "2.0", id, error: answer.error });
    }
    const result = spec.kind === "account" ? cut(answer.result, programData) : answer.result;
    if (key && !programData && (spec.kind === "rent" || allCacheable(result)))
      d.cache.set(key, result, spec.kind === "rent" ? 60_000 : d.config.cacheMs);
    d.count?.(call.method);
    return reply({ jsonrpc: "2.0", id, result });
  };
}

/** An account answer cut by owner: `value` is one account (getAccountInfo) or a list (getMultipleAccounts). */
function cut(result: unknown, programData: boolean): unknown {
  const r = result as { value?: unknown } | null;
  if (!r || typeof r !== "object" || !("value" in r)) return result;
  const one = (info: unknown) => (programData ? servedProgramData : served)(info as AccountInfo);
  return { ...r, value: Array.isArray(r.value) ? r.value.map(one) : one(r.value) };
}

const allCacheable = (result: unknown) => {
  const value = (result as { value?: unknown } | null)?.value;
  return Array.isArray(value) ? value.every((v) => cacheable(v as AccountInfo)) : cacheable(value as AccountInfo);
};
