/**
 * Purpose: a wallet's history with the program, read from the chain until the indexer serves it (TP §6's
 *          `/api/v1/wallets/:address/entries` is Sprint 08's and not built): the wallet's latest transactions through
 *          `getSignaturesForAddress`, each read with `getTransaction` and decoded by the SDK's event decoder, keeping the
 *          events that name this wallet in a role (baker, creator, opener). Settlement closes the `Entry`, so what a
 *          wallet received exists only in these events (`EntrySettled`, `CreatorShareSettled`, `PrizeSettled`).
 *          Also one campaign's settlement of one baker, read from the history of that baker's `Entry` address.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 * Bounded on purpose: `limit` transactions a page, read four at a time, with a cursor for older ones, so a public
 * RPC's rate limit holds. A transaction that does not read back is skipped and counted, never guessed.
 */
import { address, signature as toSignature } from "@solana/kit";
import {
  decodeTransactionEvents,
  entryAddress,
  uniqueEvents,
  type DecodedEvent,
  type RpcTransaction,
  type SolanaRpc,
} from "@brot/sdk/read";

export const HISTORY_PAGE = 50;
const AT_ONCE = 4;

/** The events a wallet appears in by role. */
const ROLE: Partial<Record<DecodedEvent["name"], string>> = {
  EntryAdded: "baker",
  LateTallied: "baker",
  EntrySettled: "baker",
  CreatorShareSettled: "creator",
  PrizeSettled: "recipient",
  CampaignOpened: "creator",
};

/** Whether `event` names `wallet` in its role (a baker's entry, a creator's share, an opener's prize). */
export function namesWallet(event: DecodedEvent, wallet: string): boolean {
  const field = ROLE[event.name];
  return field !== undefined && (event.data as Record<string, unknown>)[field] === wallet;
}

export type History = {
  /** This wallet's events, oldest first, each once. */
  events: DecodedEvent[];
  /** Transactions read so far, and how many of them could not be read back. */
  read: number;
  unreadable: number;
  /** The oldest signature read: pass it as `before` for the next page; `null` once the history is exhausted. */
  before: string | null;
};

export const EMPTY_HISTORY: History = { events: [], read: 0, unreadable: 0, before: null };

const OPTIONS = { encoding: "json", maxSupportedTransactionVersion: 0, commitment: "confirmed" } as const;

/** The program's events in one landed transaction; `null` when it cannot be read back. */
async function eventsIn(rpc: SolanaRpc, signature: string): Promise<DecodedEvent[] | null> {
  try {
    const tx = await rpc.getTransaction(toSignature(signature), OPTIONS).send();
    return tx ? decodeTransactionEvents(tx as unknown as RpcTransaction) : null;
  } catch {
    return null;
  }
}

const bySlot = (a: DecodedEvent, b: DecodedEvent) =>
  a.slot !== b.slot ? (a.slot < b.slot ? -1 : 1) : a.key.ixIndex - b.key.ixIndex || a.key.innerIndex - b.key.innerIndex;

/** One page of `wallet`'s history (the newest first page, or the page older than `before`), merged into `prior`. */
export async function readWalletHistory(
  rpc: SolanaRpc,
  wallet: string,
  prior: History = EMPTY_HISTORY,
  limit = HISTORY_PAGE,
): Promise<History> {
  const config = prior.before ? { limit, before: toSignature(prior.before) } : { limit };
  const page = await rpc.getSignaturesForAddress(address(wallet), { ...config, commitment: "confirmed" }).send();
  const landed = page.filter((s) => s.err === null).map((s) => s.signature as string);
  const found: DecodedEvent[] = [];
  let unreadable = 0;
  for (let i = 0; i < landed.length; i += AT_ONCE) {
    const batch = await Promise.all(landed.slice(i, i + AT_ONCE).map((sig) => eventsIn(rpc, sig)));
    for (const events of batch) {
      if (events === null) unreadable++;
      else found.push(...events.filter((event) => namesWallet(event, wallet)));
    }
  }
  return {
    events: uniqueEvents([...prior.events, ...found]).sort(bySlot),
    read: prior.read + page.length,
    unreadable: prior.unreadable + unreadable,
    before: page.length < limit ? null : (page[page.length - 1].signature as string),
  };
}

/** What settled `baker`'s entry in `campaign`: the `EntrySettled` event, from the history of the Entry's address. */
export async function readEntrySettlement(rpc: SolanaRpc, campaign: string, baker: string) {
  const at = await entryAddress(address(campaign), address(baker));
  const page = await rpc.getSignaturesForAddress(at, { limit: 10, commitment: "confirmed" }).send();
  // Newest first: the settlement closes the Entry, so it is the last transaction that wrote it.
  for (const s of page) {
    if (s.err !== null) continue;
    const events = await eventsIn(rpc, s.signature as string);
    const settled = events?.find(
      (e) => e.name === "EntrySettled" && e.data.campaign === campaign && e.data.baker === baker,
    );
    if (settled && settled.name === "EntrySettled") return settled;
  }
  return null;
}
