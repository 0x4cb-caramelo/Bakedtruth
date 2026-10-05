"use client";

// What the ticker shows: the markets the current page has already loaded. Pages publish their
// entries here, so the tape costs no RPC calls of its own (the public devnet RPC rate-limits).

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { MarketEntry } from "@/lib/hooks";

type Tape = { entries: MarketEntry[]; publish: (entries: MarketEntry[]) => void };

const TapeContext = createContext<Tape>({ entries: [], publish: () => {} });

export function TapeProvider({ children }: { children: ReactNode }) {
  const [entries, publish] = useState<MarketEntry[]>([]);
  return <TapeContext.Provider value={{ entries, publish }}>{children}</TapeContext.Provider>;
}

export const useTape = () => useContext(TapeContext).entries;

/**
 * Publishes `entries` to the ticker. With `keepWider`, a page that only knows one market (the
 * market page) does not replace a fuller list already on the tape.
 */
export function usePublishTape(entries: MarketEntry[] | undefined, keepWider = false) {
  const { entries: current, publish } = useContext(TapeContext);
  const wider = keepWider && current.length > (entries?.length ?? 0);
  useEffect(() => {
    if (entries && entries.length > 0 && !wider) publish(entries);
  }, [entries, wider, publish]);
}
