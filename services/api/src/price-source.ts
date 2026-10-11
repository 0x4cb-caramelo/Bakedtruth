/**
 * Purpose: the display price's source (D-f; Sprint 08): Pyth's SOL/USD sponsored account, read through the API's RPC
 *          and decoded by the SDK, the account the program prices an opening with. Errors are named, never a message,
 *          so a log or /api/v1/health says what failed without a URL. The only source since 2026-10-11 (2b: no
 *          CoinGecko).
 * Version: 0.2.0 (2b: CoinGecko's source removed; 0.1.0 was price-sources.ts)
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
