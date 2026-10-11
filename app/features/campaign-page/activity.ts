/**
 * Purpose: the campaign's recent activity and its chance history (L-23, answered yes), read from the chain until the
 *          indexer serves them (Sprint 08's activity route is not built): the campaign's latest transactions through
 *          `getSignaturesForAddress`, each read with `getTransaction` and decoded by the SDK's event decoder under its
 *          four rules, keeping the `EntryAdded` events of this campaign only. Each carries the pools after the entry,
 *          so the chance after every entry comes from the chain, not from the page.
 * Version: 0.1.1 (the UI overhaul: each landed transaction read once, so the reads after an entry stay cheap)
 * Sprint:  11 (site: campaign page and entry)
 *
 * Bounded on purpose: the last `limit` transactions, read four at a time, once per page view and after an entry, so a
 * public RPC's rate limit holds; a transaction already read is not read again. A transaction that does not read back
 * is skipped, never guessed, and asked again on the next read.
 */
import { address, signature as toSignature } from "@solana/kit";
import { decodeTransactionEvents, Side, type RpcTransaction, type SolanaRpc } from "@brot/sdk/read";

export type ActivityItem = {
  signature: string;
  slot: bigint;
  blockTime: bigint | null;
  seq: bigint;
  baker: string;
  side: "yes" | "no";
  amount: bigint;
  poolYes: bigint;
  poolNo: bigint;
};

export const ACTIVITY_LIMIT = 20;
const AT_ONCE = 4;
/** A landed transaction does not change: each is read once per page view, so a read after an entry costs one call. */
const READ = new Map<string, ActivityItem[]>();
const KEEP = 200;

async function entriesIn(rpc: SolanaRpc, signature: string, campaign: string): Promise<ActivityItem[]> {
  const known = READ.get(`${campaign}:${signature}`);
  if (known) return known;
  const items = await readEntriesIn(rpc, signature, campaign);
  if (items !== null) {
    if (READ.size >= KEEP) READ.delete(READ.keys().next().value as string);
    READ.set(`${campaign}:${signature}`, items);
  }
  return items ?? [];
}

/** The transaction's entries into this campaign; `null` when it did not read back (asked again next time). */
async function readEntriesIn(rpc: SolanaRpc, signature: string, campaign: string): Promise<ActivityItem[] | null> {
  try {
    const options = { encoding: "json", maxSupportedTransactionVersion: 0, commitment: "confirmed" } as const;
    const tx = await rpc.getTransaction(toSignature(signature), options).send();
    if (!tx) return null;
    return decodeTransactionEvents(tx as unknown as RpcTransaction).flatMap((event) =>
      event.name === "EntryAdded" && event.data.campaign === campaign
        ? [
            {
              signature,
              slot: event.slot,
              blockTime: event.blockTime,
              seq: event.data.seq,
              baker: event.data.baker,
              side: event.data.side === Side.Yes ? ("yes" as const) : ("no" as const),
              amount: event.data.amount,
              poolYes: event.data.poolYes,
              poolNo: event.data.poolNo,
            },
          ]
        : [],
    );
  } catch {
    return null;
  }
}

/** The campaign's latest entries, oldest first (by the event's `seq`). */
export async function readActivity(rpc: SolanaRpc, campaign: string, limit = ACTIVITY_LIMIT): Promise<ActivityItem[]> {
  const page = await rpc.getSignaturesForAddress(address(campaign), { limit, commitment: "confirmed" }).send();
  const landed = page.filter((s) => s.err === null).map((s) => s.signature as string);
  const items: ActivityItem[] = [];
  for (let i = 0; i < landed.length; i += AT_ONCE) {
    const batch = await Promise.all(landed.slice(i, i + AT_ONCE).map((sig) => entriesIn(rpc, sig, campaign)));
    items.push(...batch.flat());
  }
  const seen = new Set<string>();
  return items
    .filter((item) => !seen.has(`${item.seq}`) && seen.add(`${item.seq}`))
    .sort((a, b) => (a.seq < b.seq ? -1 : a.seq > b.seq ? 1 : 0));
}

/** The YES share after each entry, in percent (one decimal), for the chance history. */
export const chanceHistory = (items: readonly ActivityItem[]): number[] =>
  items.map((item) => {
    const pot = item.poolYes + item.poolNo;
    return pot === 0n ? 0 : Number((item.poolYes * 1_000n) / pot) / 10;
  });
