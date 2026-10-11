/**
 * Purpose: the pinned feeds as the "What" search reads them (search.ts): each with whether it can back a campaign right
 *          now (fresh and verified, by the box's own feedState) and its price in US$ as a plain number, so the search
 *          can suggest only campaigns the program would open and never a target already met. Display only: the program
 *          checks every value again when the person signs.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign), in the UI overhaul
 */
import { feedsOf } from "@brot/sdk/read";

import { feedState } from "./account-check";
import { FEED_CLUSTER, type BoxWorld } from "./reads";
import type { FeedSource } from "./search";

/** The program's list before anything is read: names only. */
export const LISTED: readonly FeedSource[] = feedsOf(FEED_CLUSTER).map(([hex, symbol]) => ({
  hex,
  symbol: symbol.replace(/^Crypto\./, ""),
}));

export function feedSources(world: BoxWorld | null): readonly FeedSource[] {
  if (!world?.config) return LISTED;
  const maxAge = world.config.params.campaignMaxAge;
  return world.feeds.map((f) => {
    const state = feedState(f.account, f.hex, world.clock, maxAge);
    if (!state.ok) return { hex: f.hex, symbol: f.symbol, usable: false, price: null };
    const price = Number(state.reading.price) * 10 ** state.reading.exponent;
    return { hex: f.hex, symbol: f.symbol, usable: true, price };
  });
}
