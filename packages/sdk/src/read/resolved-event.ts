/**
 * Purpose: the search for a campaign's `CampaignResolved`, the evidence of a price resolution, shared by `recheck` and
 *          the keeper's second read (Sprint 16, the red-team review's F2): the campaign's signatures newest first, a
 *          page at a time, up to 10,000, each landed transaction read at `MAX_TRANSACTION_VERSION` and decoded by the
 *          SDK, until the first find. An RPC that refuses that option (invalid params: a relay that relays version 0
 *          only) is asked for version 0 for the rest of the search. A newer transaction the search cannot read (the
 *          node's -32015 for a newer version, a 429, a timeout, one the node does not return) ends the search as
 *          incomplete, never with an older event, since that newer one may have moved the cut-off. An answer that
 *          does not decode is skipped, as a malformed answer always was. With `publishTime`, an event whose publish
 *          time is not the campaign's is skipped as stale: it is a cut-off that has since moved.
 * Version: 0.1.0 (moved out of recheck.ts, with the incomplete search and the publish-time check)
 * Sprint:  05 (SDK); 16 (the review's F2)
 */
import {
  isSolanaError,
  SOLANA_ERROR__JSON_RPC__INVALID_PARAMS,
  SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR,
  type Address,
  type Signature,
} from "@solana/kit";

import { decodeTransactionEvents, type DecodedEvent, type RpcTransaction } from "./decoder";
import type { SolanaRpc } from "./rpc";
import { isUnsupportedVersion, MAX_TRANSACTION_VERSION } from "./tx-version";

/** How the event search pages: signatures per page, and the most it reads. */
export type EventSearch = { pageSize?: number; maxSignatures?: number };

export type ResolvedEvent = Extract<DecodedEvent, { name: "CampaignResolved" }>["data"];

export type ResolvedSearch = {
  /** The newest `CampaignResolved` of the campaign (with `publishTime`, the newest that carries it), or null. */
  found: ResolvedEvent | null;
  /** Why the search could not see every transaction newer than the ones it read, or null when it could. */
  incomplete: string | null;
  /** Events skipped because their publish time is not the one asked for. */
  stale: number;
};

type Read =
  { kind: "read"; resolved: ResolvedEvent | null } | { kind: "refused" } | { kind: "unreadable"; why: string };

/** Why a call failed, by name or HTTP status: never a message, which can carry the RPC's URL. */
function why(error: unknown, version: number): string {
  if (isUnsupportedVersion(error)) return `a version newer than ${version}, -32015`;
  if (isSolanaError(error, SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR)) return `HTTP ${error.context.statusCode}`;
  return error instanceof Error ? error.name : "an error";
}

async function readOne(rpc: SolanaRpc, signature: Signature, campaign: Address, version: 0 | 1): Promise<Read> {
  let tx: unknown;
  try {
    const options = { encoding: "json", maxSupportedTransactionVersion: version, commitment: "confirmed" } as const;
    tx = await rpc.getTransaction(signature, options).send();
  } catch (error) {
    if (isSolanaError(error, SOLANA_ERROR__JSON_RPC__INVALID_PARAMS)) return { kind: "refused" };
    return { kind: "unreadable", why: why(error, version) };
  }
  if (!tx) return { kind: "unreadable", why: "the node did not return it" };
  try {
    const found = decodeTransactionEvents(tx as RpcTransaction).find(
      (e) => e.name === "CampaignResolved" && e.data.campaign === campaign,
    );
    return { kind: "read", resolved: found?.name === "CampaignResolved" ? found.data : null };
  } catch {
    return { kind: "read", resolved: null }; // an answer that does not decode: skipped
  }
}

/** The search for `campaign`'s newest `CampaignResolved` (of `publishTime`, when given) through `rpc`. */
export async function searchResolvedEvent(
  rpc: SolanaRpc,
  campaign: Address,
  search: EventSearch & { publishTime?: bigint } = {},
): Promise<ResolvedSearch> {
  const pageSize = search.pageSize ?? 1_000;
  const most = search.maxSignatures ?? 10_000;
  let before: Signature | undefined;
  let version: 0 | 1 = MAX_TRANSACTION_VERSION;
  let stale = 0;
  const end = (found: ResolvedEvent | null, incomplete: string | null) => ({ found, incomplete, stale });
  for (let read = 0; read < most;) {
    let page: readonly { signature: Signature; err: unknown }[];
    try {
      page = await rpc.getSignaturesForAddress(campaign, { limit: pageSize, before, commitment: "confirmed" }).send();
    } catch (error) {
      return end(null, `the campaign's signatures could not be listed (${why(error, version)})`);
    }
    if (!Array.isArray(page) || page.length === 0) return end(null, null);
    for (const { signature, err } of page.slice(0, pageSize)) {
      if (err !== null) continue;
      let r = await readOne(rpc, signature, campaign, version);
      if (r.kind === "refused" && version !== 0) {
        version = 0;
        r = await readOne(rpc, signature, campaign, version);
      }
      if (r.kind === "refused") return end(null, `the RPC refused to return ${signature}`);
      if (r.kind === "unreadable") return end(null, `${signature} could not be read through this RPC (${r.why})`);
      if (!r.resolved) continue;
      if (search.publishTime !== undefined && r.resolved.publishTime !== search.publishTime) stale += 1;
      else return end(r.resolved, null);
    }
    read += Math.min(page.length, pageSize);
    if (page.length < pageSize) return end(null, null);
    before = page[pageSize - 1].signature;
  }
  return end(null, null);
}

/** The newest `CampaignResolved` of `campaign` through `rpc`; null when none was found or the search was incomplete. */
export async function findResolvedEvent(rpc: SolanaRpc, campaign: Address, search: EventSearch = {}) {
  return (await searchResolvedEvent(rpc, campaign, search)).found;
}
