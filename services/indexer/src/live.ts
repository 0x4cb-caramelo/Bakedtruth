/**
 * Purpose: the campaign accounts that still exist, read for the points rule (Sprint 08): each address whose latest
 *          opening the events do not show closed, through `getMultipleAccounts` at `finalized`, 100 a call, and the
 *          chain's own clock. Each account is decoded by the SDK (owner, length, tag and version checked; anything
 *          else is left out) and judged by `campaignNow` at chain time, exactly as the read API's leaderboard judges
 *          its snapshot, so the two give the same points. Every call has a timeout.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { address, getBase64Encoder } from "@solana/kit";
import {
  campaignNow,
  decodeCampaign,
  publicState,
  readChainTime,
  type Campaign,
  type CampaignNow,
  type ChainTime,
  type SolanaRpc,
} from "@brot/sdk/read";

import type { Store } from "./db/store";

export type Live = { chain: ChainTime; accounts: Map<string, Campaign>; now: Map<string, CampaignNow> };
export type ReadLive = (addresses: readonly string[]) => Promise<Live>;

const BATCH = 100;

/** A promise that rejects with `TimeoutError` after `ms`. */
function within<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error("timed out"), { name: "TimeoutError" })), ms);
  });
  return Promise.race([work, late]).finally(() => clearTimeout(timer));
}

/** Reads the live accounts and the clock through `rpc`. */
export function liveReader(rpc: SolanaRpc, timeoutMs: number): ReadLive {
  return async (addresses) => {
    const chain = await within(readChainTime(rpc), timeoutMs);
    const accounts = new Map<string, Campaign>();
    for (let i = 0; i < addresses.length; i += BATCH) {
      const slice = addresses.slice(i, i + BATCH);
      const { value } = await rpc
        .getMultipleAccounts(
          slice.map((a) => address(a)),
          { encoding: "base64", commitment: "finalized" },
        )
        .send({ abortSignal: AbortSignal.timeout(timeoutMs) });
      value.forEach((account, j) => {
        if (!account) return;
        try {
          const data = new Uint8Array(getBase64Encoder().encode(account.data[0]));
          accounts.set(slice[j], decodeCampaign({ owner: account.owner, data }));
        } catch {
          // not a campaign of this program: left out, never read further
        }
      });
    }
    const now = new Map([...accounts].map(([at, c]) => [at, campaignNow(c, publicState(c, chain))] as const));
    return { chain, accounts, now };
  };
}

/** The addresses whose latest opening is not closed: the accounts that may still exist. */
export const openAddresses = (store: Store): string[] =>
  (
    store.db
      .query(
        `SELECT address FROM campaigns c WHERE closed = 0
           AND opening = (SELECT max(opening) FROM campaigns WHERE address = c.address) ORDER BY address`,
      )
      .all() as { address: string }[]
  ).map((r) => r.address);
