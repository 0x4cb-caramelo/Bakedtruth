/**
 * Purpose: the connected wallet's SOL balance in lamports, from the site's one reading (sol-balance-provider.tsx).
 *          `null` while it loads, when nothing is connected or when it could not be read (shown as unknown), never a
 *          zero; and only for the address it was read for. A new `refreshKey` reads it again for the whole site: the
 *          entry panel and the creation box pass one after an entry or an opening lands, so the top bar's chip
 *          follows too.
 * Version: 0.2.0 (the UI overhaul: one shared reading, refreshed; 0.1.2, the address kept with the reading)
 * Sprint:  09 (site shell, theme and wallet)
 */
import { useContext, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { SolBalance } from "./sol-balance-provider";

export function useSolBalance(refreshKey = 0): bigint | null {
  const { reading, refresh } = useContext(SolBalance);
  const { publicKey } = useWallet();
  useEffect(() => {
    if (refreshKey > 0) refresh();
  }, [refreshKey, refresh]);
  const address = publicKey?.toBase58() ?? null;
  return address !== null && reading?.address === address ? reading.lamports : null;
}
