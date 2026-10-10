/**
 * Purpose: the rents an entry opens, from the cluster (`getMinimumBalanceForRentExemption`), read once per page: a
 *          `Join` record on every entry and the `Entry` account on a wallet's first one in a campaign. Both come back
 *          when the campaign settles. The panel uses them to say what leaves the wallet before anything is prepared,
 *          and to offer the faucet when the balance cannot cover it. Also the browser's store for the retry guard.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { useEffect, useState } from "react";

import { ACCOUNT_LEN, rentExemptMinimum } from "@brot/sdk/read";

import { rpc } from "@/lib/rpc";
import type { KeyValueStore } from "./retry-guard";

export type Rents = { join: bigint; entry: bigint };

let cached: Promise<Rents> | null = null;

export function useRents(): Rents | null {
  const [rents, setRents] = useState<Rents | null>(null);
  useEffect(() => {
    let live = true;
    cached ??= Promise.all([rentExemptMinimum(rpc, ACCOUNT_LEN.join), rentExemptMinimum(rpc, ACCOUNT_LEN.entry)]).then(
      ([join, entry]) => ({ join, entry }),
    );
    cached
      .then((value) => live && setRents(value))
      .catch(() => {
        cached = null; // a failed read is asked again on the next page, never remembered
      });
    return () => {
      live = false;
    };
  }, []);
  return rents;
}

/** The base fee of one signature: what a join's network fee is, with no priority fee set (the SDK sets none). */
export const BASE_FEE = 5_000n;

/** The browser's localStorage, or `null` where reading it throws (private modes, blocked storage). */
export function browserStore(): KeyValueStore | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}
