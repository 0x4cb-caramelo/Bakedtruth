/**
 * Purpose: "Connect" (S1, proposal §3.4 rule 3): connect only from a person's click, through the installed
 *          wallet the site found (MWA on Android, or a browser wallet). Shared by the top bar's button and the entry
 *          panel, so both connect the same way. `select()` is asynchronous: the connection starts once the chosen
 *          wallet is the selected one, never from the effect's own state; a wallet already selected (remembered from
 *          an earlier visit) connects at once.
 * Version: 0.1.1 (the web smoke found that a reload left the remembered wallet unconnectable)
 * Sprint:  11 (site: campaign page and entry; taken out of Sprint 09's wallet button)
 */
import { useEffect, useRef } from "react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";

export function useInstalledWallet() {
  const { wallets, wallet, select, connect, connected, connecting } = useWallet();
  const wantConnect = useRef(false);

  useEffect(() => {
    if (wantConnect.current && wallet && !connected && !connecting) {
      wantConnect.current = false;
      connect().catch(() => undefined);
    }
  }, [wallet, connected, connecting, connect]);

  const installed = wallets.find((candidate) => candidate.readyState === WalletReadyState.Installed);
  const connectInstalled = () => {
    if (!installed) return;
    // The adapter remembers the last wallet chosen (localStorage "walletName"): after a reload it is already the
    // selected one, so select() changes nothing and the effect above would never run. Connect it directly.
    if (wallet?.adapter.name === installed.adapter.name) {
      connect().catch(() => undefined);
      return;
    }
    wantConnect.current = true;
    select(installed.adapter.name);
  };
  return { installed: Boolean(installed), connecting, connectInstalled };
}
