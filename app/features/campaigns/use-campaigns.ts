/**
 * Purpose: the campaign list's data (Sprint 10): every campaign the read API lists, read in pages, with each card's values
 *          computed from the chain time the API reports. A failed read is a named error, never an empty list that looks
 *          like "no campaigns".
 * Version: 0.1.0
 * Sprint:  10 (site: campaign list)
 */
import { useEffect, useState } from "react";

import { api, type Campaign } from "@/lib/api-client";
import { toCard, type Card } from "./model";

export type Loaded =
  | { status: "loading" }
  | { status: "ready"; cards: Card[]; asOfSlot: string; chainTime: bigint }
  | { status: "error"; error: string };

const PAGE = 100;

async function loadAll(): Promise<{ campaigns: Campaign[]; asOfSlot: string; chainTime: bigint }> {
  const first = await api.listCampaigns({ limit: PAGE, offset: 0 });
  const campaigns = [...first.campaigns];
  for (let offset = campaigns.length; offset < first.total; offset += PAGE) {
    const page = await api.listCampaigns({ limit: PAGE, offset });
    campaigns.push(...page.campaigns);
  }
  return { campaigns, asOfSlot: first.as_of_slot, chainTime: BigInt(first.chain_time) };
}

export function useCampaigns(): Loaded {
  const [loaded, setLoaded] = useState<Loaded>({ status: "loading" });
  useEffect(() => {
    let live = true;
    loadAll()
      .then(({ campaigns, asOfSlot, chainTime }) => {
        if (live)
          setLoaded({ status: "ready", cards: campaigns.map((c) => toCard(c, chainTime)), asOfSlot, chainTime });
      })
      .catch((error: unknown) => {
        if (live) setLoaded({ status: "error", error: error instanceof Error ? error.name : "error" });
      });
    return () => {
      live = false;
    };
  }, []);
  return loaded;
}
