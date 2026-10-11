/**
 * Purpose: the two sources of the display price (D-e, D-f; Sprint 08). CoinGecko's `simple/price` for SOL in US$, with
 *          the time CoinGecko last updated it: the paid plan's root and header (`pro-api.coingecko.com`,
 *          `x-cg-pro-api-key`), the Demo plan's (`api.coingecko.com`, `x-cg-demo-api-key`), or the keyless API with no
 *          header, as CoinGecko's documentation gives them (read 2026-10-11). The key travels in a header, never in the
 *          URL, so no log or error carries it. And Pyth's SOL/USD sponsored account, read through the API's RPC and
 *          decoded by the SDK, the account the program prices an opening with. Errors are named, never a message.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { getBase64Encoder } from "@solana/kit";
import { formatScaled, readPriceUpdate, SOL_USD_ACCOUNT, SOL_USD_FEED_HEX, type SolanaRpc } from "@brot/sdk/read";

import type { SourcePrice } from "./price";

/** A failed read, named so a log or /api/v1/health can say what failed without a URL or a key. */
export class PriceSourceError extends Error {
  constructor(name: string) {
    super(name);
    this.name = name;
  }
}

export type CoinGeckoPlan = "demo" | "pro";

/** The request for SOL in US$ under `plan` with `key` (null: the keyless API). */
export function coingeckoRequest(
  key: string | null,
  plan: CoinGeckoPlan,
): { url: string; headers: Record<string, string> } {
  const root = key && plan === "pro" ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3";
  const headers: Record<string, string> = { accept: "application/json" };
  if (key) headers[plan === "pro" ? "x-cg-pro-api-key" : "x-cg-demo-api-key"] = key;
  return { url: `${root}/simple/price?ids=solana&vs_currencies=usd&include_last_updated_at=true`, headers };
}

/** A number CoinGecko sent, as a plain decimal string (never an exponent). */
const decimal = (n: number) => {
  const text = String(n);
  return /e/i.test(text) ? n.toFixed(8) : text;
};

export function coingeckoSource(o: {
  key: string | null;
  plan: CoinGeckoPlan;
  fetch?: typeof fetch;
  timeoutMs?: number;
}): () => Promise<SourcePrice> {
  const { url, headers } = coingeckoRequest(o.key, o.plan);
  return async () => {
    const response = await (o.fetch ?? fetch)(url, { headers, signal: AbortSignal.timeout(o.timeoutMs ?? 10_000) });
    if (!response.ok) throw new PriceSourceError(`Status${response.status}`);
    const text = await response.text();
    if (text.length > 4_096) throw new PriceSourceError("TooLarge"); // one price; never a big body (security review, L4)
    const body = JSON.parse(text) as { solana?: { usd?: unknown; last_updated_at?: unknown } };
    const usd = body?.solana?.usd;
    const at = body?.solana?.last_updated_at;
    if (typeof usd !== "number" || !Number.isFinite(usd) || usd <= 0) throw new PriceSourceError("BadPrice");
    if (typeof at !== "number" || !Number.isInteger(at) || at <= 0) throw new PriceSourceError("BadTime");
    return { usd: decimal(usd), publishedAt: BigInt(at) };
  };
}

/** Pyth's SOL/USD sponsored account, decoded by the SDK (owner, layout, feed and verification checked). */
export function pythSource(rpc: SolanaRpc): () => Promise<SourcePrice> {
  return async () => {
    const { value } = await rpc.getAccountInfo(SOL_USD_ACCOUNT, { encoding: "base64" }).send();
    if (!value) throw new PriceSourceError("NoAccount");
    const data = new Uint8Array(getBase64Encoder().encode(value.data[0]));
    const reading = readPriceUpdate(value.owner, data, SOL_USD_FEED_HEX);
    if (reading.price <= 0n) throw new PriceSourceError("BadPrice");
    return { usd: formatScaled(reading.price, reading.exponent), publishedAt: reading.publishTime };
  };
}
