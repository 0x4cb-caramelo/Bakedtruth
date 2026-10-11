/**
 * Purpose: the price /api/v1/price serves (TP §3.5 "Display price", §6; D-e, D-f; Sprint 08): SOL in US$, for display
 *          and reports only; the program never reads it. CoinGecko first (price-sources.ts), Pyth's SOL/USD sponsored
 *          account when CoinGecko fails, is turned off or reports a price older than ten minutes. Each refresh also
 *          reads the other source when it can, so a gap between them is measured (the alert of TP §3.5 reads it from
 *          the log). A failed refresh keeps the last good price and names the error; nothing here holds a key.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */

export type PriceSource = "coingecko" | "pyth";
/** A source's answer: the price as a decimal string and when the source last updated it (Unix seconds). */
export type SourcePrice = { usd: string; publishedAt: bigint };
export type DisplayPrice = SourcePrice & { source: PriceSource; fetchedAt: bigint };

/** A price older than this is not used as CoinGecko's, and is served as stale. */
export const STALE_SECONDS = 600n;

export type PriceDeps = {
  /** null when CoinGecko is turned off (API_COINGECKO=off). */
  coingecko: (() => Promise<SourcePrice>) | null;
  pyth: () => Promise<SourcePrice>;
  /** The server's clock in Unix seconds: for `fetched_at` and staleness only (display, never a decision of money). */
  now: () => bigint;
};

export type Price = {
  current(): DisplayPrice | null;
  lastError(): string | null;
  /** The gap between the two sources at the last refresh that read both, in basis points of Pyth's price. */
  gapBps(): number | null;
  refresh(): Promise<void>;
};

const errorName = (caught: unknown) => (caught instanceof Error ? caught.name : "Error");
const gap = (a: string, b: string) => Math.round((Math.abs(Number(a) - Number(b)) / Number(b)) * 10_000);

export function createPrice(deps: PriceDeps): Price {
  let current: DisplayPrice | null = null;
  let error: string | null = null;
  let gapBps: number | null = null;
  return {
    current: () => current,
    lastError: () => error,
    gapBps: () => gapBps,
    async refresh() {
      const now = deps.now();
      const [cg, pyth] = await Promise.all([
        deps.coingecko ? deps.coingecko().catch((caught: unknown) => errorName(caught)) : "Off",
        deps.pyth().catch((caught: unknown) => errorName(caught)),
      ]);
      const cgFresh = typeof cg !== "string" && now - cg.publishedAt <= STALE_SECONDS;
      gapBps = typeof cg !== "string" && typeof pyth !== "string" ? gap(cg.usd, pyth.usd) : null;
      if (cgFresh) {
        current = { ...cg, source: "coingecko", fetchedAt: now };
        error = typeof pyth === "string" ? `pyth:${pyth}` : null;
      } else if (typeof pyth !== "string") {
        current = { ...pyth, source: "pyth", fetchedAt: now };
        error = typeof cg === "string" ? (cg === "Off" ? null : `coingecko:${cg}`) : "coingecko:Stale";
      } else {
        error = `coingecko:${typeof cg === "string" ? cg : "Stale"} pyth:${pyth}`; // the last good price stays
      }
    },
  };
}

/** The JSON of /api/v1/price; CoinGecko's API terms ask for "Powered by CoinGecko" wherever its data is shown. */
export function priceBody(p: DisplayPrice, now: bigint) {
  return {
    asset: "SOL",
    currency: "USD",
    usd: p.usd,
    source: p.source,
    published_at: p.publishedAt,
    fetched_at: p.fetchedAt,
    stale: now - p.publishedAt > STALE_SECONDS,
    attribution: p.source === "coingecko" ? "Powered by CoinGecko" : "Pyth Network SOL/USD",
    use: "display only; the program charges at the Pyth price it reads on-chain",
  };
}
