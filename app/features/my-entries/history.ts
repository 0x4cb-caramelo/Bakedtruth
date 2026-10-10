/**
 * Purpose: a wallet's history with the program, read from the chain until the indexer serves it (TP §6's
 *          `/api/v1/wallets/:address/entries` is Sprint 08's and not built): the wallet's latest transactions through
 *          `getSignaturesForAddress`, each read with `getTransaction` and decoded by the SDK's event decoder, keeping the
 *          events that name this wallet in a role (baker, creator, opener, rent payer). Settlement closes the `Entry`, so
 *          what a wallet received exists only in these events (`EntrySettled`, `CreatorShareSettled`, `PrizeSettled`).
 *          Also one campaign's settlement of one baker, from the history of that baker's `Entry` address.
 * Version: 0.2.0 (the Sprint 12 security review: a refresh pages back until it meets what was read, so no gap is
 *          hidden; "entered" only from the program's own events)
 * Sprint:  12 (site: my entries and campaign states)
 *
 * Bounded on purpose: `limit` transactions a page, read four at a time, with a cursor for older ones, so a public
 * RPC's rate limit holds. A transaction that does not read back is kept aside and tried again, never guessed. The
 * history read is always contiguous from the newest transaction down to `before`.
 */
import { address, signature as toSignature } from "@solana/kit";
import { entryAddress, uniqueEvents, type DecodedEvent, type SolanaRpc } from "@brot/sdk/read";

import { eventsIn } from "./events-in";

export const HISTORY_PAGE = 50;
/** A refresh pages back at most this far to meet what was read; past it, the coverage restarts from there. */
const REFRESH_PAGES = 10;
const AT_ONCE = 4;

/** The events a wallet appears in by role. */
const ROLE: Partial<Record<DecodedEvent["name"], string>> = {
  EntryAdded: "baker",
  LateTallied: "baker",
  EntrySettled: "baker",
  CreatorShareSettled: "creator",
  PrizeSettled: "recipient",
  CampaignOpened: "creator",
  // The close returns the rents to the opener, and a still-reserved creator share with them (close-share.ts).
  CampaignClosed: "rentPayer",
};

/** Whether `event` names `wallet` in its role (a baker's entry, a creator's share, an opener's prize or rents). */
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

type Listed = { signature: string; err: unknown }[];

const bySlot = (a: DecodedEvent, b: DecodedEvent) =>
  a.slot !== b.slot ? (a.slot < b.slot ? -1 : 1) : a.key.ixIndex - b.key.ixIndex || a.key.innerIndex - b.key.innerIndex;

async function page(rpc: SolanaRpc, at: string, limit: number, before?: string): Promise<Listed> {
  const config = before ? { limit, before: toSignature(before) } : { limit };
  const sigs = await rpc.getSignaturesForAddress(address(at), { ...config, commitment: "confirmed" }).send();
  return sigs.map((s) => ({ signature: s.signature as string, err: s.err }));
}

/** A refresh: newest first, page after page, until it meets a transaction already read or the history's start. */
async function newest(rpc: SolanaRpc, wallet: string, prior: History, limit: number) {
  const seen = new Set(prior.seen);
  const listed: Listed = [];
  let cursor: string | undefined;
  for (let n = 0; n < (prior.seen.length === 0 ? 1 : REFRESH_PAGES); n++) {
    const got = await page(rpc, wallet, limit, cursor);
    listed.push(...got);
    if (got.length < limit) return { listed, before: null };
    if (prior.seen.length > 0 && got.some((s) => seen.has(s.signature))) return { listed, before: prior.before };
    cursor = got[got.length - 1].signature;
  }
  // A first read, or a refresh that did not meet what was read: the contiguous history now ends here.
  return { listed, before: cursor ?? null };
}

/**
 * One page of `wallet`'s history merged into `prior`: the newest when `prior` holds nothing yet; with `newest`, a
 * refresh (only transactions not read before are fetched); otherwise the page older than `prior.before`.
 */
export async function readWalletHistory(
  rpc: SolanaRpc,
  wallet: string,
  prior: History = EMPTY_HISTORY,
  options: { limit?: number; newest?: boolean } = {},
): Promise<History> {
  const limit = options.limit ?? HISTORY_PAGE;
  let read: { listed: Listed; before: string | null };
  if (prior.seen.length === 0 || options.newest) read = await newest(rpc, wallet, prior, limit);
  else if (!prior.before) return prior;
  else {
    const got = await page(rpc, wallet, limit, prior.before);
    read = { listed: got, before: got.length < limit ? null : got[got.length - 1].signature };
  }
  const seen = new Set(prior.seen);
  // A failed transaction carries no event: it counts as read. Earlier unreadable ones are tried again.
  const fresh = read.listed.filter((s) => !seen.has(s.signature));
  for (const s of fresh) if (s.err !== null) seen.add(s.signature);
  const toRead = [...new Set([...prior.unread, ...fresh.filter((s) => s.err === null).map((s) => s.signature)])];
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
  const events = uniqueEvents([...prior.events, ...found]).sort(bySlot);
  return { events, seen: [...seen], unread, before: read.before };
}

type Settled = Extract<DecodedEvent, { name: "EntrySettled" }>;

/**
 * What settled `baker`'s entry in `campaign`: the `EntrySettled` event, from the history of the Entry's address, and
 * whether the wallet entered at all (this program's own event for that baker and campaign was found, so a stranger's
 * transfer to the address proves nothing).
 */
export async function readEntrySettlement(
  rpc: SolanaRpc,
  campaign: string,
  baker: string,
): Promise<{ event: Settled | null; touched: boolean }> {
  const at = await entryAddress(address(campaign), address(baker));
  const landed = (await page(rpc, at, 25)).filter((s) => s.err === null);
  let touched = false;
  // Newest first: the settlement closes the Entry, so it is the last transaction of the program that wrote it.
  for (const s of landed) {
    const events = (await eventsIn(rpc, s.signature)) ?? [];
    const mine = events.filter((e) => namesWallet(e, baker) && (e.data as { campaign?: string }).campaign === campaign);
    const settled = mine.find((e): e is Settled => e.name === "EntrySettled");
    if (settled) return { event: settled, touched: true };
    touched = touched || mine.length > 0;
  }
  return { event: null, touched };
}
