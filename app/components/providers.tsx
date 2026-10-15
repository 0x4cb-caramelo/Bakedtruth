"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import type { AccountName } from "@brot/sdk/schemas";
import "@solana/wallet-adapter-react-ui/styles.css";

import { ToastProvider } from "@/components/toast";
import { CLUSTER, RPC_URL } from "@/lib/config";
import { CurveNamesProvider } from "@/features/campaigns/curve-names";
import { registerMwaOnce } from "@/features/wallet/register-mwa";
import { SolBalanceProvider } from "@/features/wallet/sol-balance-provider";
import { WalletPickerProvider } from "@/features/wallet/wallet-picker";
import { isWebShell, solflareNetworkOf } from "@/features/wallet/web-shell";

/** `curveNames`: the reviewed names of graduation curves, read by the root layout on the server. */
export function Providers({ children, curveNames }: { children: ReactNode; curveNames: readonly AccountName[] }) {
  // Phantom and Solflare are listed (with an install link when missing), Solflare on the site's network; any other
  // Wallet Standard wallet (Backpack, ...) is discovered automatically. Inside the Android app only MWA connects.
  const wallets = useMemo(
    () =>
      typeof navigator !== "undefined" && isWebShell(navigator.userAgent)
        ? []
        : [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network: solflareNetworkOf(CLUSTER) })],
    [],
  );
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
      {/* No autoConnect: connecting happens only from the user's "Connect" gesture. */}
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <WalletPickerProvider>
            {/* One balance for the whole site, refreshed after a landing, on a timer and on return to the tab. */}
            <SolBalanceProvider>
              <CurveNamesProvider names={curveNames}>
                <ToastProvider>{children}</ToastProvider>
              </CurveNamesProvider>
            </SolBalanceProvider>
          </WalletPickerProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
