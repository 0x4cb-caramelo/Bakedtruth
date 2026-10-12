/**
 * Purpose: the live reading of every campaign a page shows (the UI overhaul; the approved prototype's "Now … / YES ≥ …"
 *          line on each card): their metric accounts in batches of 100 through the site's RPC (one getMultipleAccounts
 *          per batch, the relay's allowlist), decoded by readings.ts, again every 30 s while the page is open. A card
 *          whose account is missing or refused reads "No reading"; one not read yet waits without a number.
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchRawMany, type FetchedAccount } from "@brot/sdk/read";

import { rpc } from "@/lib/rpc";
import type { Card } from "./model";
import { readingOf, type Reading } from "./readings";

const BATCH = 100;
const EVERY_MS = 30_000;

/** Card id → its reading (null: no reading), or absent while the first read is on its way. */
export type Readings = ReadonlyMap<string, Reading | null>;

export function useReadings(cards: readonly Card[]): Readings {
  const [accounts, setAccounts] = useState<ReadonlyMap<string, FetchedAccount | null>>(new Map());
  const wanted = useMemo(() => [...new Set(cards.map((c) => c.metricAccount))].sort(), [cards]);
  const key = wanted.join(",");
  useEffect(() => {
    if (wanted.length === 0) return;
    let live = true;
    const load = async () => {
      const next = new Map<string, FetchedAccount | null>();
      for (let i = 0; i < wanted.length; i += BATCH) {
        const slice = wanted.slice(i, i + BATCH);
        const got = await fetchRawMany(rpc, slice);
        slice.forEach((address, k) => next.set(address, got[k] ?? null));
      }
      if (live) setAccounts(next);
    };
    void load().catch(() => undefined); // a failed refresh keeps the last readings
    const timer = setInterval(() => void load().catch(() => undefined), EVERY_MS);
    return () => {
      live = false;
      clearInterval(timer);
    };
    // `key` stands for `wanted`: the same addresses do not restart the loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return useMemo(() => {
    const out = new Map<string, Reading | null>();
    for (const card of cards) {
      if (!accounts.has(card.metricAccount)) continue;
      out.set(card.id, readingOf(card, accounts.get(card.metricAccount) ?? null));
    }
    return out;
  }, [cards, accounts]);
}
