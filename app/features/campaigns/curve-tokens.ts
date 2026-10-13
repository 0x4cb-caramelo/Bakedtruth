/**
 * Purpose: what the site reads to name a graduation campaign's curve (curve-name.ts), without React: each pool, for its
 *          base mint; then each mint with its Metaplex metadata account, for the symbol. Two getMultipleAccounts per
 *          batch of pools, in batches of 100 accounts, through the site's RPC, decoded by the SDK's readers (owner
 *          first). A pool's answer is kept for the page's life, as a promise, so the list, a card, the campaign page and
 *          the creation box share one read; a read that fails is forgotten, and the next asks again.
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05
 */
import {
  fetchRawMany,
  isRefusal,
  readCurveBaseMint,
  tokenMetadataAddress,
  tokenSymbolOf,
  type FetchedAccount,
  type SolanaRpc,
} from "@brot/sdk/read";

/** A curve's token: its base mint and the symbol its metadata stores (raw bytes; `null` when it stores none). */
export type CurveToken = { mint: string; symbol: Uint8Array | null };
/** Pool → its token, or `null` for a pool the reader refuses or that does not exist. */
export type CurveTokens = ReadonlyMap<string, CurveToken | null>;
export type CurveCache = { pending: Map<string, Promise<CurveToken | null>>; settled: Map<string, CurveToken | null> };

const BATCH = 100;
/** The page's one cache: what the list read, the campaign page finds. */
export const pageCache: CurveCache = { pending: new Map(), settled: new Map() };

async function fetchAll(rpc: SolanaRpc, addresses: readonly string[]): Promise<(FetchedAccount | null)[]> {
  const out: (FetchedAccount | null)[] = [];
  for (let i = 0; i < addresses.length; i += BATCH) {
    out.push(...(await fetchRawMany(rpc, addresses.slice(i, i + BATCH))));
  }
  return out;
}

/** The pool's base mint, or `null` when the bytes are not a pool the graduation reader accepts. */
function baseMintOf(pool: FetchedAccount | null): string | null {
  if (!pool) return null;
  try {
    return readCurveBaseMint(pool.owner, pool.data);
  } catch (error) {
    if (isRefusal(error)) return null;
    throw error;
  }
}

async function readBatch(rpc: SolanaRpc, pools: readonly string[]): Promise<Map<string, CurveToken | null>> {
  const mints = (await fetchAll(rpc, pools)).map(baseMintOf);
  const named = [...new Set(mints.filter((m): m is string => m !== null))];
  const metadata = await Promise.all(named.map((mint) => tokenMetadataAddress(mint)));
  const accounts = await fetchAll(rpc, [...named, ...metadata]);
  const symbols = new Map(
    named.map((mint, i) => [mint, tokenSymbolOf(mint, { mint: accounts[i], metadata: accounts[named.length + i] })]),
  );
  return new Map(
    pools.map((pool, i) => {
      const mint = mints[i];
      return [pool, mint === null ? null : { mint, symbol: symbols.get(mint) ?? null }];
    }),
  );
}

/** Each pool's token, from the cache or read once; throws when a read it waits on failed. */
export async function readCurveTokens(
  rpc: SolanaRpc,
  pools: readonly string[],
  cache: CurveCache = pageCache,
): Promise<CurveTokens> {
  const fresh = [...new Set(pools)].filter((pool) => !cache.settled.has(pool) && !cache.pending.has(pool));
  if (fresh.length > 0) {
    const batch = readBatch(rpc, fresh);
    for (const pool of fresh) {
      const one = batch.then((read) => read.get(pool) ?? null);
      cache.pending.set(pool, one);
      one.then(
        (token) => cache.settled.set(pool, token),
        () => undefined,
      );
      one.finally(() => cache.pending.delete(pool)).catch(() => undefined);
    }
  }
  // Every answer is taken now, before any wait, so a read that settles meanwhile cannot slip between the two maps.
  const waits = pools.map((pool) =>
    cache.settled.has(pool)
      ? Promise.resolve(cache.settled.get(pool) ?? null)
      : (cache.pending.get(pool) ?? Promise.resolve(null)),
  );
  const tokens = await Promise.all(waits);
  return new Map(pools.map((pool, i) => [pool, tokens[i]]));
}
