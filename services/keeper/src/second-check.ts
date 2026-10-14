/**
 * Purpose: the second read of one resolved campaign, every read through RPC B (Sprint 07 DoD; proposal §2.11; T22).
 *          A price campaign: the campaign and its newest `CampaignResolved` (the SDK's `findResolvedEvent`) are read
 *          through RPC B, then the transaction that wrote the price account at the event's `posted_slot`
 *          (proof-tx.ts), and its signed message is compared with what the campaign recorded: the feed, the price
 *          (`observed_value`), the exponent and the publish time. Any other kind: the SDK's `recheck` re-reads the
 *          metric account through RPC B and says whether it agrees with `observed_value`, given the only way that
 *          field can move. A disagreement is a mismatch; a read that could not be made is "not checked", final when
 *          nothing can ever be compared (a void that read nothing, the epoch stake read by syscall). An event search that
 *          could not read every newer transaction is "not checked" too, never a mismatch (Sprint 16, the review's F2).
 * Version: 0.1.1 (an incomplete event search retries)
 * Sprint:  07 carry-over (the second read: the proof transaction and the other kinds)
 */
import type { Address } from "@solana/kit";
import {
  Outcome,
  ReaderKind,
  VoidReason,
  bytesToHex,
  decodeCampaign,
  fetchRaw,
  searchResolvedEvent,
  type Recheck,
  type SolanaRpc,
} from "@brot/sdk/read";

import { findProofUpdate } from "./proof-tx";

export type Check =
  | { match: true; detail: string; postedSlot?: bigint }
  | { match: false; detail: string; postedSlot?: bigint }
  | { match: null; detail: string; final: boolean };

const retry = (detail: string): Check => ({ match: null, detail, final: false });

/** The price campaign `at` against the transaction that wrote its proof, all read through `rpcB`. */
export async function checkPrice(rpcB: SolanaRpc, at: Address): Promise<Check> {
  const raw = await fetchRaw(rpcB, at);
  if (!raw) return retry("the campaign is not found through RPC B");
  const c = decodeCampaign(raw);
  if (c.outcome === Outcome.Unresolved) return retry("not resolved yet, as RPC B sees it");
  if (c.outcome === Outcome.Void && c.voidReason !== VoidReason.StaleFeed) {
    return { match: null, detail: `voided (${VoidReason[c.voidReason]}): nothing was read`, final: true };
  }
  const search = await searchResolvedEvent(rpcB, at);
  // A newer transaction RPC B could not return may hold a newer event: never compare an older one (the review's F2).
  if (search.incomplete) return retry(`the event search through RPC B is incomplete: ${search.incomplete}`);
  const event = search.found;
  if (!event) return retry("no CampaignResolved event found through RPC B");
  const observed = (event as { observedValue?: unknown }).observedValue;
  if (event.publishTime !== c.publishTime || (typeof observed === "bigint" && observed !== c.observedValue)) {
    const said = `the newest CampaignResolved says price ${String(observed)} published ${event.publishTime}`;
    return { match: false, detail: `${said}; the campaign holds ${c.observedValue} published ${c.publishTime}` };
  }
  const found = await findProofUpdate(rpcB, event.postedSlot, event.readAccount as Address);
  if ("error" in found) return retry(found.error);
  const m = found.message;
  const agree =
    bytesToHex(m.feedId) === bytesToHex(c.feedId) &&
    m.price === c.observedValue &&
    m.exponent === c.priceExponent &&
    m.publishTime === c.publishTime;
  const posted = `proof ${found.signature} at slot ${event.postedSlot} wrote price ${m.price}e${m.exponent} published ${m.publishTime}`;
  if (agree) return { match: true, detail: posted, postedSlot: event.postedSlot };
  const recorded = `the campaign recorded price ${c.observedValue}e${c.priceExponent} published ${c.publishTime}`;
  return { match: false, detail: `${posted}; ${recorded}`, postedSlot: event.postedSlot };
}

/** Any other kind, through the SDK's `recheck` (bound to RPC B by the caller). */
export async function checkOther(recheck: (at: Address) => Promise<Recheck>, at: Address): Promise<Check> {
  const r = await recheck(at);
  const values = `${r.field} recorded ${r.recorded}, re-read ${r.reread ?? "nothing"} at ${r.account}`;
  if (r.consistent === true) return { match: true, detail: `${values}: ${r.note}` };
  if (r.consistent === false) return { match: false, detail: `${values}: ${r.note}` };
  const final = r.field === "none" || r.kind === ReaderKind.StakeAtLeast;
  return { match: null, detail: `${values}: ${r.note}`, final };
}

/** The check of a campaign of `kind`. */
export function checkCampaign(
  kind: ReaderKind,
  at: Address,
  deps: { rpcB: SolanaRpc; recheck: (at: Address) => Promise<Recheck> },
): Promise<Check> {
  return kind === ReaderKind.PriceTouch ? checkPrice(deps.rpcB, at) : checkOther(deps.recheck, at);
}
