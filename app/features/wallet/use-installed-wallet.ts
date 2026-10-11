/**
 * Purpose: "Connect" (S1, proposal §3.4 rule 3): connect only from a person's click. Shared by the top bar's button, the
 *          entry panel and the creation box, so all three connect the same way: the click opens the "Connect a wallet"
 *          list (wallet-picker.tsx), where the person picks the wallet and sees why it did not connect if it does not.
 *          `installed` says whether the browser has any wallet to pick (an installed one, or the Mobile Wallet Adapter).
 * Version: 0.2.0 (the UI overhaul: the list instead of connecting the first installed wallet, whose errors were
 *          swallowed, so a refusal or the wrong wallet looked like a dead button; 0.1.1, the remembered wallet)
 * Sprint:  11 (site: campaign page and entry; taken out of Sprint 09's wallet button)
 */
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";

import { useWalletPicker } from "./wallet-picker";

export function useInstalledWallet() {
  const { wallets, connecting } = useWallet();
  const picker = useWalletPicker();
  const installed = wallets.some(
    (w) => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable,
  );
  return { installed, connecting, connectInstalled: picker.open };
}
