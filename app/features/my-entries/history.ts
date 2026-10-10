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
  /** The transactions read so far, each once; and those that could not be read back, tried again on the next read. */
  seen: string[];
  unread: string[];
  /** The oldest signature read: the next older page starts after it; `null` once the history is exhausted. */
  before: string | null;
};

export const EMPTY_HISTORY: History = { events: [], seen: [], unread: [], before: null };

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

/**
 * One page of `wallet`'s history merged into `prior`: the newest page when `prior` holds nothing yet or `newest` is
 * set (a refresh: only signatures not read before are fetched), else the page older than `prior.before`.
 */
export async function readWalletHistory(
  rpc: SolanaRpc,
  wallet: string,
  prior: History = EMPTY_HISTORY,
  options: { limit?: number; newest?: boolean } = {},
): Promise<History> {
  const limit = options.limit ?? HISTORY_PAGE;
  const newest = options.newest || prior.seen.length === 0;
  const config = newest || !prior.before ? { limit } : { limit, before: toSignature(prior.before) };
  const page = await rpc.getSignaturesForAddress(address(wallet), { ...config, commitment: "confirmed" }).send();
  const seen = new Set(prior.seen);
  // A failed transaction carries no event: it counts as read. Earlier unreadable ones are tried again.
  const fresh = page.filter((s) => !seen.has(s.signature as string));
  for (const s of fresh) if (s.err !== null) seen.add(s.signature as string);
  const toRead = [
    ...new Set([...prior.unread, ...fresh.filter((s) => s.err === null).map((s) => s.signature as string)]),
  ];
  const found: DecodedEvent[] = [];
  const unread: string[] = [];
  for (let i = 0; i < toRead.length; i += AT_ONCE) {
    const slice = toRead.slice(i, i + AT_ONCE);
    const batch = await Promise.all(slice.map((sig) => eventsIn(rpc, sig)));
    batch.forEach((events, j) => {
      if (events === null) return void unread.push(slice[j]);
      seen.add(slice[j]);
      found.push(...events.filter((event) => namesWallet(event, wallet)));
    });
  }
  const pageEnd = page.length < limit ? null : (page[page.length - 1].signature as string);
  return {
    events: uniqueEvents([...prior.events, ...found]).sort(bySlot),
    seen: [...seen],
    unread,
    // A refresh keeps the older cursor where the earlier pages left it.
    before: newest && prior.seen.length > 0 ? prior.before : pageEnd,
  };
}

type Settled = Extract<DecodedEvent, { name: "EntrySettled" }>;

/**
 * What settled `baker`'s entry in `campaign`: the `EntrySettled` event, from the history of the Entry's address, and
 * whether that address has any landed transaction (the wallet entered, even when the settlement could not be read).
 */
export async function readEntrySettlement(
  rpc: SolanaRpc,
  campaign: string,
  baker: string,
): Promise<{ event: Settled | null; touched: boolean }> {
  const at = await entryAddress(address(campaign), address(baker));
  const page = await rpc.getSignaturesForAddress(at, { limit: 10, commitment: "confirmed" }).send();
  const landed = page.filter((s) => s.err === null);
  // Newest first: the settlement closes the Entry, so it is the last transaction that wrote it.
  for (const s of landed) {
    const events = await eventsIn(rpc, s.signature as string);
    const settled = events?.find(
      (e): e is Settled => e.name === "EntrySettled" && e.data.campaign === campaign && e.data.baker === baker,
    );
    if (settled) return { event: settled, touched: true };
  }
  return { event: null, touched: landed.length > 0 };
}
