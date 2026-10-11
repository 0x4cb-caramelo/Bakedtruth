/**
 * Purpose: the connected wallet's SOL balance, one reading for the whole site, so the top bar's chip, the entry panel
 *          and the creation box always show the same number. It is read when a wallet connects; again when any of
 *          them reports a landed entry or opening; every 20 s while the page is visible; and when the visitor comes
 *          back to the tab (from the wallet's own window, say). Reads are at the connection's "confirmed", so a landed
 *          transaction shows at once. A first read that fails leaves the balance unknown, never a zero; a later one
 *          keeps the last balance read, rather than blinking to unknown. A reading is kept with the address it was read
 *          for, so one wallet's balance is never shown for another. Before, each component read once on its own, and
 *          the top bar kept the balance from before an entry.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet), in the UI overhaul
 */
"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

type Reading = { address: string; lamports: bigint | null };

export const SolBalance = createContext<{ reading: Reading | null; refresh: () => void }>({
  reading: null,
  refresh: () => undefined,
});

/** How often the balance is read again while the page is visible. */
const EVERY_MS = 20_000;

export function SolBalanceProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [reading, setReading] = useState<Reading | null>(null);
  const [reads, setReads] = useState(0);
  const refresh = useCallback(() => setReads((n) => n + 1), []);

  useEffect(() => {
    if (!publicKey) return;
    let live = true;
    const address = publicKey.toBase58();
    connection.getBalance(publicKey).then(
      (value) => live && setReading({ address, lamports: BigInt(value) }),
      () => live && setReading((last) => (last?.address === address ? last : { address, lamports: null })),
    );
    return () => {
      live = false;
    };
  }, [connection, publicKey, reads]);

  useEffect(() => {
    if (!publicKey) return;
    const visible = () => document.visibilityState === "visible";
    const timer = window.setInterval(() => visible() && refresh(), EVERY_MS);
    const back = () => visible() && refresh();
    document.addEventListener("visibilitychange", back);
    window.addEventListener("focus", back);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", back);
      window.removeEventListener("focus", back);
    };
  }, [publicKey, refresh]);

  const value = useMemo(() => ({ reading, refresh }), [reading, refresh]);
  return <SolBalance.Provider value={value}>{children}</SolBalance.Provider>;
}
