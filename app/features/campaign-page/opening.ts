/**
 * Purpose: the transaction that opened a campaign, for the header's "Opened by …" link to Solscan (Ronaldo,
 *          2026-10-11). The program stores when the campaign opened, not the signature, so the address's history is
 *          read newest first, a page of up to 1,000 at a time, and only the transactions of the opening's own seconds
 *          are decoded: the one whose `CampaignOpened` names this campaign and this `opens_at` is it (a closed
 *          campaign's address can carry a new campaign later, and anyone can send to an address, so a time alone
 *          proves nothing). At most three pages, so a busy campaign costs a bounded read; `null` when it is not found,
 *          and the line stays plain text.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry), in the UI overhaul
 */
import { address, signature as toSignature } from "@solana/kit";
import type { SolanaRpc } from "@brot/sdk/read";

import { eventsIn } from "../my-entries/events-in";

const PAGE = 1_000;
const PAGES = 3;
/** The opening's block time is the campaign's `opens_at`, read from the same clock; a little slack, in seconds. */
const SLACK = 2n;

export async function openingSignature(rpc: SolanaRpc, campaign: string, opensAt: bigint): Promise<string | null> {
  let before: string | undefined;
  for (let n = 0; n < PAGES; n++) {
    const options = {
      limit: PAGE,
      commitment: "confirmed" as const,
      ...(before ? { before: toSignature(before) } : {}),
    };
    const page = await rpc.getSignaturesForAddress(address(campaign), options).send();
    const near = page.filter(
      (s) =>
        s.err === null && (s.blockTime === null || (s.blockTime >= opensAt - SLACK && s.blockTime <= opensAt + SLACK)),
    );
    for (const s of near) {
      const events = await eventsIn(rpc, s.signature as string);
      const opened = events?.some(
        (e) => e.name === "CampaignOpened" && e.data.campaign === campaign && e.data.opensAt === opensAt,
      );
      if (opened) return s.signature as string;
    }
    const last = page.at(-1);
    if (!last || page.length < PAGE || (last.blockTime !== null && last.blockTime < opensAt - SLACK)) return null;
    before = last.signature as string;
  }
  return null;
}
