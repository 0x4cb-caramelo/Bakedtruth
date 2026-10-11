/**
 * Purpose: the retry guard's second witness, for a browser whose storage was cleared between the hand-off and the
 *          return, or another browser of the same wallet (T17, A-9 [INF]): before a paid opening with no record in
 *          flight, the box looks for a `CampaignOpened` by this wallet in its own transactions of the last half hour
 *          of chain time, so a creator whose first opening landed is shown it instead of paying again. The plan names
 *          the indexer for this; it does not exist yet (Sprint 08), so the box reads the chain the way "My entries"
 *          does. It fails closed: when it cannot read what it needs (a 429, a transaction that does not read back, more
 *          transactions than it reads), it says it does not know, and the creator chooses.
 * Version: 0.2.0 (the Sprint 19 adversarial review: closed on errors, paged to the half hour, a missing time counts)
 * Sprint:  19 (site: open a campaign)
 */
import { address, signature as toSignature } from "@solana/kit";
import { campaignAddress, type SolanaRpc } from "@brot/sdk/read";

import { eventsIn } from "../my-entries/events-in";

/** How far back an opening counts as "recent", in chain seconds. */
export const RECENT_SECONDS = 30n * 60n;
/** Signatures listed per page, pages listed at most, transactions read at most. */
const PAGE = 25;
const PAGES = 4;
const READS = 20;

export type RecentOpening = { id: bigint; campaign: string; at: bigint | null };
export type RecentCheck = { status: "found"; opening: RecentOpening } | { status: "none" } | { status: "unknown" };

type Listed = { signature: string; err: unknown; blockTime: bigint | number | null };

/** The wallet's signatures since `cutoff` (a missing block time counts as recent), newest first; `null` when too many. */
async function recentSignatures(rpc: SolanaRpc, wallet: string, cutoff: bigint): Promise<Listed[] | null> {
  const out: Listed[] = [];
  let before: string | undefined;
  for (let page = 0; page < PAGES; page++) {
    const listed = (await rpc
      .getSignaturesForAddress(address(wallet), {
        limit: PAGE,
        commitment: "confirmed",
        ...(before ? { before: toSignature(before) } : {}),
      })
      .send()) as readonly Listed[];
    for (const s of listed) {
      if (s.blockTime !== null && BigInt(s.blockTime) < cutoff) return out;
      out.push(s);
    }
    if (listed.length < PAGE) return out;
    before = listed[listed.length - 1].signature;
  }
  return null; // more than PAGES × PAGE transactions in half an hour: too many to read here
}

/** The wallet's newest opening of the last half hour by the chain's clock, none, or unknown (never a guess). */
export async function recentOpening(rpc: SolanaRpc, wallet: string, chainNow: bigint): Promise<RecentCheck> {
  try {
    const listed = await recentSignatures(rpc, wallet, chainNow - RECENT_SECONDS);
    if (listed === null) return { status: "unknown" };
    const landed = listed.filter((s) => s.err === null);
    if (landed.length > READS) return { status: "unknown" };
    for (const s of landed) {
      const events = await eventsIn(rpc, s.signature);
      if (events === null) return { status: "unknown" }; // a transaction that does not read back: it may be the one
      const opened = events.find((e) => e.name === "CampaignOpened" && e.data.creator === wallet);
      if (opened?.name === "CampaignOpened") {
        const id = opened.data.id;
        const at = s.blockTime === null ? null : BigInt(s.blockTime);
        return { status: "found", opening: { id, campaign: await campaignAddress(id), at } };
      }
    }
    return { status: "none" };
  } catch {
    return { status: "unknown" };
  }
}
