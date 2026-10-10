"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import "@solana/wallet-adapter-react-ui/styles.css";

import { ToastProvider } from "@/components/toast";
import { CLUSTER, RPC_URL } from "@/lib/config";
import { registerMwaOnce } from "@/features/wallet/register-mwa";

export function Providers({ children }: { children: ReactNode }) {
  // Phantom and Solflare are always listed (with an install link when missing); any other
  // Wallet Standard wallet (Backpack, ...) is discovered automatically.
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);
  // The MWA wallet registers once, for the site's cluster. A cluster without an MWA chain is logged, not thrown.
  useEffect(() => {
    try {
      registerMwaOnce({ cluster: CLUSTER, origin: window.location.origin });
    } catch (error) {
      console.warn("MWA not registered:", error instanceof Error ? error.message : "unknown error");
    }
  }, []);
  return (
    <ConnectionProvider endpoint={RPC_URL} config={{ commitment: "confirmed" }}>
      {/* No autoConnect: connecting happens only from the user's "Use Installed Wallet" gesture. */}
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <ToastProvider>{children}</ToastProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
