/**
 * Purpose: the connected wallet's SOL balance in lamports, read from the site's connection. `null` while it loads or
 *          when nothing is connected. A failed read leaves `null` (shown as unknown), never a zero. The value is kept
 *          with the address it was read for, so a stale balance is never shown for another wallet.
 * Version: 0.1.1
 * Sprint:  09 (site shell, theme and wallet)
 */
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

type Reading = { address: string; lamports: bigint | null };

export function useSolBalance(): bigint | null {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [reading, setReading] = useState<Reading | null>(null);
  useEffect(() => {
    if (!publicKey) return;
    let live = true;
    const address = publicKey.toBase58();
    connection
      .getBalance(publicKey)
      .then((value) => live && setReading({ address, lamports: BigInt(value) }))
      .catch(() => live && setReading({ address, lamports: null }));
    return () => {
      live = false;
    };
  }, [connection, publicKey]);
  const address = publicKey?.toBase58() ?? null;
  return address !== null && reading?.address === address ? reading.lamports : null;
}
