/**
 * Purpose: the price /api/v1/price serves (TP §3.5 "Display price", §6; D-f; Sprint 08): SOL in US$, for display only;
 *          the program never reads it. It is Pyth's SOL/USD sponsored account (price-source.ts), the account the program
 *          prices an opening with, so the site shows the price an opening is charged at. A failed refresh keeps the last
 *          good price and names the error, for a day at most; a price older than ten minutes is served as stale. No
 *          CoinGecko: Ronaldo dropped it on 2026-10-11 (2b), after the legal review of its terms.
 * Version: 0.2.0 (2b: Pyth only; 0.1.1 was the Sprint 08 legal review's)
 * Sprint:  08 (indexer, API, relay and points)
 */

export type PriceSource = "pyth";
/** A source's answer: the price as a decimal string and when the source last updated it (Unix seconds). */
export type SourcePrice = { usd: string; publishedAt: bigint };
export type DisplayPrice = SourcePrice & { source: PriceSource; fetchedAt: bigint };

/** A price older than this is served as stale. */
export const STALE_SECONDS = 600n;
/** No price older than a day is served at all: a display price that old would mislead. */
export const MAX_SERVED_SECONDS = 86_400n;

export type PriceDeps = {
  pyth: () => Promise<SourcePrice>;
  /** The server's clock in Unix seconds: for `fetched_at` and staleness only (display, never a decision of money). */
  now: () => bigint;
};

export type Price = {
  current(): DisplayPrice | null;
  lastError(): string | null;
  refresh(): Promise<void>;
};

const errorName = (caught: unknown) => (caught instanceof Error ? caught.name : "Error");

export function createPrice(deps: PriceDeps): Price {
  let current: DisplayPrice | null = null;
  let error: string | null = null;
  return {
    current: () => current,
    lastError: () => error,
    async refresh() {
      try {
        const read = await deps.pyth();
        current = { ...read, source: "pyth", fetchedAt: deps.now() };
        error = null;
      } catch (caught) {
        error = `pyth:${errorName(caught)}`; // the last good price stays
      }
    },
  };
}

/** The JSON of /api/v1/price. */
export function priceBody(p: DisplayPrice, now: bigint) {
  return {
    asset: "SOL",
    currency: "USD",
    usd: p.usd,
    source: p.source,
    published_at: p.publishedAt,
    fetched_at: p.fetchedAt,
    stale: now - p.publishedAt > STALE_SECONDS,
    attribution: "Pyth Network SOL/USD",
    use: "display only; the program charges at the Pyth price it reads on-chain",
  };
}
