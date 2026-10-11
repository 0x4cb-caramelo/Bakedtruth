/**
 * Purpose: the retry guard's second witness, for a browser whose storage was cleared between the hand-off and the
 *          return (T17, A-9 [INF]): before a paid opening with no saved record, the box looks for a `CampaignOpened` by
 *          this wallet in its own recent transactions, so a creator whose first opening landed is shown it instead of
 *          paying again. The plan names the indexer for this; it does not exist yet (Sprint 08), so the box reads the
 *          chain the way "My entries" does: the wallet's latest signatures, then the program's events in the ones from
 *          the last half hour of chain time, decoded by the SDK. Bounded: at most 20 signatures, 5 transactions read.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { address } from "@solana/kit";
import { campaignAddress, type SolanaRpc } from "@brot/sdk/read";

import { eventsIn } from "../my-entries/events-in";

/** How far back an opening counts as "recent", in chain seconds. */
export const RECENT_SECONDS = 30n * 60n;
const LIST = 20;
const READ = 5;

export type RecentOpening = { id: bigint; campaign: string; at: bigint };

/** The wallet's newest opening of the last half hour, by the chain's clock (`chainNow`), or `null`. */
export async function recentOpening(rpc: SolanaRpc, wallet: string, chainNow: bigint): Promise<RecentOpening | null> {
  const listed = await rpc.getSignaturesForAddress(address(wallet), { limit: LIST, commitment: "confirmed" }).send();
  const fresh = listed
    .filter((s) => s.err === null && s.blockTime !== null && BigInt(s.blockTime) >= chainNow - RECENT_SECONDS)
    .slice(0, READ);
  for (const s of fresh) {
    const events = await eventsIn(rpc, s.signature);
    const opened = events?.find((e) => e.name === "CampaignOpened" && e.data.creator === wallet);
    if (opened?.name === "CampaignOpened") {
      const id = opened.data.id;
      return { id, campaign: await campaignAddress(id), at: BigInt(s.blockTime ?? 0) };
    }
  }
  return null;
}
