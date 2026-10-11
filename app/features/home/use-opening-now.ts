/**
 * Purpose: what a US$500 opening costs right now, for the home page's top line (the approved prototype's
 *          `.home-open`): the creation box's own reads (open-campaign/reads.ts) and quote (quote.ts) at Pyth's SOL/USD
 *          price minus its confidence band, again every 30 s; or why there is no quote (paused, no fresh price).
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul; 19 (the quote)
 */
"use client";

import { useEffect, useState } from "react";
import { OperatingLevel, type OpeningQuote } from "@brot/sdk/read";

import { rpc } from "@/lib/rpc";
import { quoteNow } from "@/features/open-campaign/quote";
import { readWorld } from "@/features/open-campaign/reads";

export type OpeningNow =
  | { status: "loading" }
  | { status: "paused" }
  | { status: "stale" }
  | { status: "ready"; quote: OpeningQuote };

const EVERY_MS = 30_000;

export function useOpeningNow(): OpeningNow {
  const [now, setNow] = useState<OpeningNow>({ status: "loading" });
  useEffect(() => {
    let live = true;
    const load = async () => {
      const world = await readWorld(rpc);
      if (!live || !world.config) return;
      if (world.config.operatingLevel === OperatingLevel.EntriesHalted) return setNow({ status: "paused" });
      const q = quoteNow({ config: world.config, openingUsd: 500n, solUsd: world.solUsd, clock: world.clock });
      setNow(q.ok ? { status: "ready", quote: q.quote } : { status: "stale" });
    };
    void load().catch(() => undefined); // the line keeps what it last said
    const timer = setInterval(() => void load().catch(() => undefined), EVERY_MS);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);
  return now;
}
